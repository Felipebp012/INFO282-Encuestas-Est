"use server";

import { prisma } from "@/lib/prisma";

interface RespuestaPregunta {
  preguntaId: string;
  valorTexto?: string;
  opcionIds?: string[]; // varias filas si es opción múltiple
}

// HU-0201 (verificar habilitación) + HU-0203 (una sola vez) + HU-0301
// (anonimato: dos escrituras separadas, ninguna FK entre ellas).
export async function enviarRespuesta(
  encuestaId: string,
  email: string,
  respuestas: RespuestaPregunta[]
) {
  const correo = email.trim().toLowerCase();

  const encuesta = await prisma.encuesta.findUnique({ where: { id: encuestaId } });
  if (!encuesta || encuesta.estado !== "activa") {
    throw new Error("Esta encuesta no está disponible para responder.");
  }
  // Verificar si la fecha de cierre ya pasó (protección server-side)
  if (encuesta.fechaFin && new Date() > new Date(encuesta.fechaFin)) {
    throw new Error("Esta encuesta ya está cerrada. La fecha de cierre ha pasado.");
  }

  const participante = await prisma.encuestaParticipanteLibre.findFirst({
    where: { encuestaId, email: { equals: correo } },
  });
  if (!participante) {
    throw new Error("Tu correo no está habilitado para responder esta encuesta.");
  }
  if (participante.respondido) {
    throw new Error("Ya registraste una respuesta para esta encuesta.");
  }

  // 1) Escritura anónima: la Respuesta no lleva ninguna referencia a quién la envió.
  const detalles: { preguntaId: string; opcionId?: string; valorTexto?: string }[] =
    respuestas.flatMap(
      (r): { preguntaId: string; opcionId?: string; valorTexto?: string }[] => {
        if (r.opcionIds && r.opcionIds.length > 0) {
          return r.opcionIds.map((opcionId) => ({ preguntaId: r.preguntaId, opcionId }));
        }
        return [{ preguntaId: r.preguntaId, valorTexto: r.valorTexto ?? "" }];
      }
    );

  await prisma.respuesta.create({
    data: {
      encuestaId,
      detalles: { create: detalles },
    },
  });

  // 2) Escritura separada: solo marca que ESE participante ya respondió,
  //    sin decir cuál fue su respuesta.
  await prisma.encuestaParticipanteLibre.update({
    where: { id: participante.id },
    data: { respondido: true, fechaRespuesta: new Date() },
  });

  return { ok: true };
}
