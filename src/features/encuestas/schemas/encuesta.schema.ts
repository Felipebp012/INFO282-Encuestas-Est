import { z } from "zod";

const respuestasSchema = z.array(
  z.string().min(1, "Las respuestas no pueden estar vacías")
);

export const preguntaSchema = z
  .object({
    texto: z.string().min(1, "La pregunta no puede estar vacía"),
    tipo: z.enum(["ESCALA", "SELECCION", "SELECCION_MULTIPLE", "TEXTO"]),
    respuestas: respuestasSchema,
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
  });

export const encuestaSchema = z.object({
  titulo: z.string().min(1, "El título es obligatorio"),
  preguntas: z.array(preguntaSchema).min(1, "Agrega al menos una pregunta"),
});

export type EncuestaFormData = z.infer<typeof encuestaSchema>;