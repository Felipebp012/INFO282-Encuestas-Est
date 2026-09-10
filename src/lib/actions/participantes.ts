"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import Papa from "papaparse";

// HU-0202 — importar listado de estudiantes habilitados desde CSV.
// Formato esperado: columnas "email" y "rut" (rut obligatorio, ver
// docs/MODELO_DATOS.md 3.1 — es lo que permite resolver/crear Persona).
export async function importarParticipantesCsv(encuestaId: string, csvTexto: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("No hay sesión activa.");

  const encuesta = await prisma.encuesta.findUnique({ where: { id: encuestaId } });
  if (!encuesta || encuesta.usuarioCreadorId !== session.user.id) {
    throw new Error("Encuesta no encontrada.");
  }

  const parsed = Papa.parse<{ email: string; rut: string }>(csvTexto, {
    header: true,
    skipEmptyLines: true,
  });

  let agregados = 0;
  for (const fila of parsed.data) {
    const email = fila.email?.trim();
    const rut = fila.rut?.trim();
    if (!email) continue;

    let personaId: string | undefined;
    if (rut) {
      const persona = await prisma.persona.upsert({
        where: { rut },
        update: {},
        create: { rut, nombre: email },
      });
      personaId = persona.id;
    }

    await prisma.encuestaParticipanteLibre.upsert({
      where: { encuestaId_email: { encuestaId, email } },
      update: { rut, personaId },
      create: { encuestaId, email, rut, personaId },
    });
    agregados += 1;
  }

  revalidatePath(`/encuestas/${encuestaId}/participantes`);
  return { agregados };
}

export async function listarParticipantes(encuestaId: string) {
  return prisma.encuestaParticipanteLibre.findMany({
    where: { encuestaId },
    orderBy: { email: "asc" },
  });
}

// HU-0201 — verificar que el correo pertenece al grupo objetivo.
export async function verificarParticipante(encuestaId: string, email: string) {
  return prisma.encuestaParticipanteLibre.findUnique({
    where: { encuestaId_email: { encuestaId, email: email.trim() } },
  });
}
