import type { EncuestaInput } from "@/features/encuestas/types/encuesta.types";
import * as repository from "@/server/encuestas/encuesta.repository";

export const obtenerEncuestas = repository.obtenerEncuestas;
export const obtenerEncuesta = repository.obtenerEncuesta;
export const eliminarEncuesta = repository.eliminarEncuesta;

export function crearEncuesta(input: EncuestaInput) {
  return repository.crearEncuesta(input);
}

export function actualizarEncuesta(id: string, input: EncuestaInput) {
  return repository.actualizarEncuesta(id, input);
}