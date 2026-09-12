"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const preguntaSchema = z.object({
  id: z.string().min(1),
  tipo: z.enum(["texto_libre", "opcion_unica", "opcion_multiple", "escala", "si_no"]), // HU-0501
  texto: z.string().min(1, "La pregunta no puede estar vacía"),
  obligatoria: z.boolean(),
  minSelecciones: z.number().nullable().optional(),
  maxSelecciones: z.number().nullable().optional(),
  mostrarSiPreguntaId: z.string().nullable().optional(), // HU-0502
  mostrarSiOpcionId: z.string().nullable().optional(),
  opciones: z
    .array(
      z.object({
        id: z.string().min(1),
        texto: z.string().min(1),
        valorNumerico: z.number().nullable().optional(), // HU-0503
      })
    )
    .optional(),
});

const encuestaSchema = z.object({
  titulo: z.string().min(1, "El título es obligatorio"),
  asignatura: z.string().optional(),
  fechaFin: z.string().min(1, "La fecha de cierre es obligatoria"),
  mensajeCierre: z.string().optional(),
  preguntas: z.array(preguntaSchema).min(1, "Agrega al menos una pregunta"),
});

export type EncuestaInput = z.infer<typeof encuestaSchema>;

async function usuarioActual() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("No hay sesión activa.");
  return session.user.id;
}

// Creación mínima ("plomería"): sin plantillas (HU-0401/0402, fuera de
// alcance esta vuelta) y con estado "activa" desde el inicio, sin flujo
// borrador/publicar/cerrar (HU-0701-0704, también fuera de alcance).
export async function crearEncuesta(input: EncuestaInput) {
  const usuarioId = await usuarioActual();
  const parsed = encuestaSchema.parse(input);

  const encuesta = await prisma.encuesta.create({
    data: {
      titulo: parsed.titulo,
      asignatura: parsed.asignatura || null,
      fechaFin: new Date(parsed.fechaFin),
      mensajeCierre: parsed.mensajeCierre || null,
      usuarioCreadorId: usuarioId,
      estado: "activa",
      preguntas: {
        create: parsed.preguntas.map((p, index) => ({
          id: p.id,
          tipo: p.tipo,
          texto: p.texto,
          orden: index,
          obligatoria: p.obligatoria,
          minSelecciones: p.minSelecciones ?? null,
          maxSelecciones: p.maxSelecciones ?? null,
          mostrarSiPreguntaId: p.mostrarSiPreguntaId ?? null,
          mostrarSiOpcionId: p.mostrarSiOpcionId ?? null,
          opciones: p.opciones
            ? {
                create: p.opciones.map((o, i) => ({
                  id: o.id,
                  texto: o.texto,
                  orden: i,
                  valorNumerico: o.valorNumerico ?? null,
                })),
              }
            : undefined,
        })),
      },
    },
  });

  revalidatePath("/encuestas");
  redirect(`/encuestas/${encuesta.id}`);
}

export async function listarMisEncuestas() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return [];

  return prisma.encuesta.findMany({
    where: { usuarioCreadorId: session.user.id },
    include: {
      _count: { select: { respuestas: true, participantesLibre: true } },
    },
    orderBy: { creadoEn: "desc" },
  });
}

export async function obtenerEncuesta(id: string) {
  return prisma.encuesta.findUnique({
    where: { id },
    include: {
      preguntas: { include: { opciones: true }, orderBy: { orden: "asc" } },
      _count: { select: { respuestas: true, participantesLibre: true } },
    },
  });
}

export async function cambiarEstadoEncuesta(
  id: string,
  nuevoEstado: "activa" | "cerrada",
  nuevaFechaFin?: string
) {
  const usuarioId = await usuarioActual();
  const encuesta = await prisma.encuesta.findUnique({ where: { id } });

  if (!encuesta || encuesta.usuarioCreadorId !== usuarioId) {
    throw new Error("No tienes permisos para modificar esta encuesta.");
  }

  const updateData: { estado: string; fechaFin?: Date } = {
    estado: nuevoEstado,
  };

  if (nuevoEstado === "activa" && nuevaFechaFin) {
    const fechaObj = new Date(nuevaFechaFin);
    if (isNaN(fechaObj.getTime())) {
      throw new Error("La fecha de cierre ingresada no es válida.");
    }
    if (fechaObj <= new Date()) {
      throw new Error("La nueva fecha de cierre debe ser en el futuro.");
    }
    updateData.fechaFin = fechaObj;
  }

  await prisma.encuesta.update({
    where: { id },
    data: updateData,
  });

  revalidatePath(`/encuestas/${id}`);
  revalidatePath("/encuestas");
}



