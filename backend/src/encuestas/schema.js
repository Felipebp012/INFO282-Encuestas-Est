import { z } from "zod";

export const encuestaSchema = z.object({
  titulo: z.string().min(1, "El título es obligatorio"),
  preguntas: z
    .array(
      z
        .object({
          texto: z.string().min(1, "La pregunta no puede estar vacía"),
          tipo: z.enum(["ESCALA", "SELECCION", "SELECCION_MULTIPLE", "TEXTO"]),
          respuestas: z.array(
            z.string().min(1, "Las respuestas no pueden estar vacías")
          ),
        })
        .superRefine((pregunta, contexto) => {
          if (
            (pregunta.tipo === "SELECCION" ||
              pregunta.tipo === "SELECCION_MULTIPLE") &&
            pregunta.respuestas.length === 0
          ) {
            contexto.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["respuestas"],
              message: "Agrega al menos una respuesta",
            });
          }
        })
    )
    .min(1, "Agrega al menos una pregunta"),
});