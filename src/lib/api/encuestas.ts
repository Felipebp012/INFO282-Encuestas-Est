import type { EncuestaInput } from "@/features/encuestas/types/encuesta.types";

const backendUrl = process.env.BACKEND_URL ?? "http://localhost:4000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${backendUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error ?? "No se pudo conectar con el backend");
  }

  if (response.status === 204) return undefined as T;
  return response.json();
}

export function obtenerEncuestas() {
  return request<Encuesta[]>("/encuestas");
}

export function obtenerEncuesta(id: string) {
  return request<Encuesta>(`/encuestas/${id}`);
}

export function crearEncuesta(input: EncuestaInput) {
  return request<Encuesta>("/encuestas", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function actualizarEncuesta(id: string, input: EncuestaInput) {
  return request<Encuesta>(`/encuestas/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export function eliminarEncuesta(id: string) {
  return request<void>(`/encuestas/${id}`, { method: "DELETE" });
}

export interface Encuesta {
  id: string;
  titulo: string;
  creadoEn: string;
  preguntas: Pregunta[];
}

export interface Pregunta {
  id: string;
  texto: string;
  tipo: "ESCALA" | "SELECCION" | "SELECCION_MULTIPLE" | "TEXTO";
  orden: number;
  respuestas: Respuesta[];
}

export interface Respuesta {
  id: string;
  texto: string;
  orden: number;
}