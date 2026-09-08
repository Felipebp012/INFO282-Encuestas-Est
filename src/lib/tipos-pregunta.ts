export type TipoPregunta =
  | "texto_libre"
  | "opcion_unica"
  | "opcion_multiple"
  | "escala"
  | "si_no";

export const TIPOS_PREGUNTA: { value: TipoPregunta; label: string }[] = [
  { value: "escala", label: "Escala" },
  { value: "opcion_unica", label: "Selección única" },
  { value: "opcion_multiple", label: "Selección múltiple" },
  { value: "si_no", label: "Sí / No" },
  { value: "texto_libre", label: "Texto abierto" },
];

// HU-0503 — mapeo numérico por defecto al cambiar a un tipo con opciones
// fijas; el docente lo puede editar antes de publicar.
export function opcionesPorDefecto(tipo: TipoPregunta) {
  if (tipo === "si_no") {
    return [
      { texto: "Sí", valorNumerico: 1 as number | null },
      { texto: "No", valorNumerico: 0 as number | null },
    ];
  }
  if (tipo === "escala") {
    return [
      { texto: "Muy en desacuerdo", valorNumerico: 1 },
      { texto: "En desacuerdo", valorNumerico: 2 },
      { texto: "De acuerdo", valorNumerico: 3 },
      { texto: "Muy de acuerdo", valorNumerico: 4 },
    ];
  }
  return [];
}

export function tipoTieneOpciones(tipo: TipoPregunta) {
  return tipo !== "texto_libre";
}

// Solo preguntas con opciones fijas de una sola marca sirven como origen
// de una condición (HU-0502) — de selección múltiple queda fuera para no
// complicar la evaluación ("si marcó AL MENOS una de N") en esta base.
export function puedeSerCondicion(tipo: TipoPregunta) {
  return tipo === "opcion_unica" || tipo === "escala" || tipo === "si_no";
}
