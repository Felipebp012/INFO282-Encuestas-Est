"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { encuestaSchema } from "@/features/encuestas/schemas/encuesta.schema";
import * as api from "@/lib/api/encuestas";

function obtenerTexto(formData: FormData, campo: string) {
  const valor = formData.get(campo);
  if (typeof valor !== "string") {
    throw new Error(`El campo ${campo} es obligatorio`);
  }
  return valor;
}

function obtenerEncuestaFormData(formData: FormData) {
  const preguntasRaw = obtenerTexto(formData, "preguntas");
  let preguntas: unknown;

  try {
    preguntas = JSON.parse(preguntasRaw);
  } catch {
    throw new Error("El formato de las preguntas no es válido");
  }

  const parsed = encuestaSchema.safeParse({
    titulo: obtenerTexto(formData, "titulo"),
    preguntas,
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((issue) => issue.message).join(", "));
  }

  return parsed.data;
}

export async function crearEncuesta(formData: FormData) {
  const encuesta = await api.crearEncuesta(obtenerEncuestaFormData(formData));

  revalidatePath("/encuestas");
  redirect(`/encuestas/${encuesta.id}`);
}

export async function actualizarEncuesta(formData: FormData) {
  const id = obtenerTexto(formData, "id");
  const encuesta = await api.actualizarEncuesta(
    id,
    obtenerEncuestaFormData(formData)
  );

  revalidatePath("/encuestas");
  revalidatePath(`/encuestas/${id}`);
  redirect(`/encuestas/${encuesta.id}`);
}

export async function eliminarEncuesta(formData: FormData) {
  const id = obtenerTexto(formData, "id");

  await api.eliminarEncuesta(id);
  revalidatePath("/encuestas");
  redirect("/encuestas");
}