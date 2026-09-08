export type TipoPregunta =
  | "ESCALA"
  | "SELECCION"
  | "SELECCION_MULTIPLE"
  | "TEXTO";

export interface PreguntaInput {
  texto: string;
  tipo: TipoPregunta;
  respuestas: string[];
}

export interface EncuestaInput {
  titulo: string;
  preguntas: PreguntaInput[];
}