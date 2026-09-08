import { prisma } from "../db/prisma.js";

export function obtenerEncuestas() {
  return prisma.encuesta.findMany({
    orderBy: { creadoEn: "desc" },
    include: { preguntas: { include: { respuestas: true } } },
  });
}

export function obtenerEncuesta(id) {
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

export function crearEncuesta({ titulo, preguntas }) {
  return prisma.encuesta.create({
    data: {
      titulo,
      preguntas: {
        create: preguntas.map((pregunta, index) => ({
          texto: pregunta.texto,
          tipo: pregunta.tipo,
          orden: index,
          respuestas:
            (pregunta.tipo === "SELECCION" ||
              pregunta.tipo === "SELECCION_MULTIPLE")
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

export function actualizarEncuesta(id, { titulo, preguntas }) {
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
            (pregunta.tipo === "SELECCION" ||
              pregunta.tipo === "SELECCION_MULTIPLE")
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

export function eliminarEncuesta(id) {
  return prisma.encuesta.delete({ where: { id } });
}