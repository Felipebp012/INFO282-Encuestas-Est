import { prisma } from "@/server/db/prisma";
import type { EncuestaInput } from "@/features/encuestas/types/encuesta.types";

export function obtenerEncuestas() {
  return prisma.encuesta.findMany({
    orderBy: { creadoEn: "desc" },
    include: { preguntas: { include: { respuestas: true } } },
  });
}

export function obtenerEncuesta(id: string) {
  return prisma.encuesta.findUnique({
    where: { id },
    include: {
      preguntas: {
        orderBy: { orden: "asc" },
        include: { respuestas: { orderBy: { orden: "asc" } } },
      },
    },
  });
}

export function crearEncuesta({ titulo, preguntas }: EncuestaInput) {
  return prisma.encuesta.create({
    data: {
      titulo,
      preguntas: {
        create: preguntas.map((pregunta, index) => ({
          texto: pregunta.texto,
          tipo: pregunta.tipo,
          orden: index,
          respuestas:
            pregunta.tipo === "SELECCION"
              ? {
                  create: pregunta.respuestas.map((texto, respuestaIndex) => ({
                    texto,
                    orden: respuestaIndex,
                  })),
                }
              : undefined,
        })),
      },
    },
  });
}

export function actualizarEncuesta(id: string, { titulo, preguntas }: EncuestaInput) {
  return prisma.encuesta.update({
    where: { id },
    data: {
      titulo,
      preguntas: {
        deleteMany: {},
        create: preguntas.map((pregunta, index) => ({
          texto: pregunta.texto,
          tipo: pregunta.tipo,
          orden: index,
          respuestas:
            pregunta.tipo === "SELECCION"
              ? {
                  create: pregunta.respuestas.map((texto, respuestaIndex) => ({
                    texto,
                    orden: respuestaIndex,
                  })),
                }
              : undefined,
        })),
      },
    },
  });
}

export function eliminarEncuesta(id: string) {
  return prisma.encuesta.delete({ where: { id } });
}