"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const preguntaSchema = z.object({
  texto: z.string().min(1, "La pregunta no puede estar vacía"),
  tipo: z.enum(["ESCALA", "SELECCION", "TEXTO"]),
});

const encuestaSchema = z.object({
  titulo: z.string().min(1, "El título es obligatorio"),
  preguntas: z.array(preguntaSchema).min(1, "Agrega al menos una pregunta"),
});

export async function crearEncuesta(formData: FormData) {
  const titulo = formData.get("titulo") as string;
  const preguntasRaw = formData.get("preguntas") as string;
  const preguntas = JSON.parse(preguntasRaw || "[]");

  const parsed = encuestaSchema.safeParse({ titulo, preguntas });
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((i) => i.message).join(", "));
  }

  const encuesta = await prisma.encuesta.create({
    data: {
      titulo: parsed.data.titulo,
      preguntas: {
        create: parsed.data.preguntas.map((p, index) => ({
          texto: p.texto,
          tipo: p.tipo,
          orden: index,
        })),
      },
    },
  });

  revalidatePath("/encuestas");
  redirect(`/encuestas/${encuesta.id}`);
}

export async function actualizarEncuesta(formData: FormData) {
  const id = formData.get("id") as string;
  const titulo = formData.get("titulo") as string;
  const preguntasRaw = formData.get("preguntas") as string;
  const preguntas = JSON.parse(preguntasRaw || "[]");

  const parsed = encuestaSchema.safeParse({ titulo, preguntas });
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((i) => i.message).join(", "));
  }

  await prisma.encuesta.update({
    where: { id },
    data: {
      titulo: parsed.data.titulo,
      preguntas: {
        deleteMany: {},
        create: parsed.data.preguntas.map((p, index) => ({
          texto: p.texto,
          tipo: p.tipo,
          orden: index,
        })),
      },
    },
  });

  revalidatePath("/encuestas");
  revalidatePath(`/encuestas/${id}`);
  redirect(`/encuestas/${id}`);
}

export async function eliminarEncuesta(formData: FormData) {
  const id = formData.get("id") as string;

  await prisma.encuesta.delete({ where: { id } });
  revalidatePath("/encuestas");
  redirect("/encuestas");
}

export async function obtenerEncuestas() {
  return prisma.encuesta.findMany({
    orderBy: { creadoEn: "desc" },
    include: { preguntas: true },
  });
}

export async function obtenerEncuesta(id: string) {
  return prisma.encuesta.findUnique({
    where: { id },
    include: { preguntas: { orderBy: { orden: "asc" } } },
  });
}
