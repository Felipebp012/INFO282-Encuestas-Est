import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { obtenerEncuesta } from "@/lib/actions/encuestas";
import { verificarParticipante } from "@/lib/actions/participantes";
import { ResponderClient } from "@/components/responder-client";

export default async function ResponderPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email ?? "";

  const encuesta = await obtenerEncuesta(params.id);

  if (!encuesta) {
    return <MensajeSimple titulo="Encuesta no encontrada" />;
  }

  if (encuesta.estado !== "activa") {
    return (
      <MensajeSimple
        titulo={encuesta.titulo}
        mensaje="Esta encuesta no está disponible para responder en este momento."
      />
    );
  }

  // Verificar si la fecha de cierre ya pasó
  if (encuesta.fechaFin && new Date() > new Date(encuesta.fechaFin)) {
    return (
      <MensajeSimple
        titulo={encuesta.titulo}
        mensaje={`Esta encuesta se cerró el ${new Date(encuesta.fechaFin).toLocaleDateString("es-CL", { weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}. Ya no se aceptan respuestas.`}
      />
    );
  }

  // HU-0201 — verificar que quien responde pertenece al grupo objetivo.
  const participante = await verificarParticipante(params.id, email);
  if (!participante) {
    return (
      <MensajeSimple
        titulo={encuesta.titulo}
        mensaje="Tu cuenta no está habilitada para responder esta encuesta. Si crees que es un error, contacta al docente que la creó."
      />
    );
  }

  // HU-0203 — una sola respuesta por estudiante.
  if (participante.respondido) {
    return (
      <MensajeSimple
        titulo={encuesta.titulo}
        mensaje="Ya registraste tu respuesta para esta encuesta. Gracias por participar."
      />
    );
  }

  return (
    <ResponderClient
      encuestaId={encuesta.id}
      titulo={encuesta.titulo}
      mensajeCierre={encuesta.mensajeCierre}
      email={email}
      preguntas={encuesta.preguntas.map((p) => ({
        id: p.id,
        tipo: p.tipo,
        texto: p.texto,
        obligatoria: p.obligatoria,
        minSelecciones: p.minSelecciones,
        maxSelecciones: p.maxSelecciones,
        mostrarSiPreguntaId: p.mostrarSiPreguntaId,
        mostrarSiOpcionId: p.mostrarSiOpcionId,
        opciones: p.opciones.map((o) => ({ id: o.id, texto: o.texto })),
      }))}
    />
  );
}

function MensajeSimple({ titulo, mensaje }: { titulo: string; mensaje?: string }) {
  return (
    <div className="mx-auto mt-16 max-w-md space-y-3 text-center">
      <h1 className="text-xl font-semibold">{titulo}</h1>
      {mensaje && <p className="text-sm text-slate-500">{mensaje}</p>}
    </div>
  );
}
