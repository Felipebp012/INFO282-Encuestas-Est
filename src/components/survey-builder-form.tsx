"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { actualizarEncuesta, crearEncuesta } from "@/lib/actions";
import { Plus, Trash2 } from "lucide-react";

type TipoPregunta = "ESCALA" | "SELECCION" | "TEXTO";

interface PreguntaBorrador {
  texto: string;
  tipo: TipoPregunta;
  respuestas: string[];
}

interface SurveyBuilderFormProps {
  encuestaId?: string;
  initialTitulo?: string;
  initialPreguntas?: PreguntaBorrador[];
}

const TIPOS: { value: TipoPregunta; label: string }[] = [
  { value: "ESCALA", label: "Escala (1-5)" },
  { value: "SELECCION", label: "Selección única" },
  { value: "TEXTO", label: "Texto abierto" },
];

function nuevaPregunta(tipo: TipoPregunta = "ESCALA"): PreguntaBorrador {
  return {
    texto: "",
    tipo,
    respuestas: tipo === "SELECCION" ? ["Respuesta 1"] : [],
  };
}

export function SurveyBuilderForm({
  encuestaId,
  initialTitulo = "",
  initialPreguntas,
}: SurveyBuilderFormProps) {
  const [titulo, setTitulo] = useState(initialTitulo);
  const [preguntas, setPreguntas] = useState<PreguntaBorrador[]>(
    initialPreguntas?.length
      ? initialPreguntas.map((pregunta) => ({
          ...pregunta,
          respuestas:
            pregunta.tipo === "SELECCION" && pregunta.respuestas.length === 0
              ? ["Respuesta 1"]
              : pregunta.respuestas,
        }))
      : [nuevaPregunta()]
  );
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  function agregarPregunta() {
    setPreguntas((prev) => [...prev, nuevaPregunta()]);
  }

  function quitarPregunta(index: number) {
    setPreguntas((prev) => prev.filter((_, i) => i !== index));
  }

  function actualizarPregunta(
    index: number,
    campo: keyof PreguntaBorrador,
    valor: string
  ) {
    setPreguntas((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [campo]: valor } : p))
    );
  }

  function cambiarTipoPregunta(index: number, tipo: TipoPregunta) {
    setPreguntas((prev) =>
      prev.map((pregunta, i) =>
        i === index
          ? {
              ...pregunta,
              tipo,
              respuestas:
                tipo === "SELECCION"
                  ? pregunta.respuestas.length
                    ? pregunta.respuestas
                    : ["Respuesta 1"]
                  : pregunta.respuestas,
            }
          : pregunta
      )
    );
  }

  function agregarRespuesta(index: number) {
    setPreguntas((prev) =>
      prev.map((pregunta, i) =>
        i === index
          ? {
              ...pregunta,
              respuestas: [
                ...pregunta.respuestas,
                `Respuesta ${pregunta.respuestas.length + 1}`,
              ],
            }
          : pregunta
      )
    );
  }

  function actualizarRespuesta(
    preguntaIndex: number,
    respuestaIndex: number,
    texto: string
  ) {
    setPreguntas((prev) =>
      prev.map((pregunta, i) =>
        i === preguntaIndex
          ? {
              ...pregunta,
              respuestas: pregunta.respuestas.map((respuesta, j) =>
                j === respuestaIndex ? texto : respuesta
              ),
            }
          : pregunta
      )
    );
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!titulo.trim()) {
      setError("Ponle un título a la encuesta.");
      return;
    }
    if (preguntas.some((p) => !p.texto.trim())) {
      setError("Todas las preguntas necesitan texto.");
      return;
    }
    if (
      preguntas.some(
        (p) => p.tipo === "SELECCION" && p.respuestas.some((respuesta) => !respuesta.trim())
      )
    ) {
      setError("Todas las respuestas necesitan texto.");
      return;
    }

    const formData = new FormData();
    if (encuestaId) formData.set("id", encuestaId);
    formData.set("titulo", titulo);
    formData.set("preguntas", JSON.stringify(preguntas));

    setEnviando(true);
    try {
      await (encuestaId ? actualizarEncuesta(formData) : crearEncuesta(formData));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo guardar la encuesta."
      );
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <div className="space-y-2">
        <Label htmlFor="titulo">Título de la encuesta</Label>
        <Input
          id="titulo"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Satisfacción con la asignatura - INFO 282"
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Preguntas</Label>
          <Button type="button" variant="outline" onClick={agregarPregunta}>
            <Plus className="h-4 w-4" />
            Agregar pregunta
          </Button>
        </div>

        {preguntas.map((pregunta, index) => (
          <div
            key={index}
            className="flex items-start gap-3 rounded-md border border-slate-200 p-4"
          >
            <span className="mt-2 text-sm text-slate-400">{index + 1}</span>
            <div className="flex-1 space-y-2">
              <Input
                value={pregunta.texto}
                onChange={(e) =>
                  actualizarPregunta(index, "texto", e.target.value)
                }
                placeholder="¿Qué tan satisfecho/a estás con...?"
              />
              <select
                value={pregunta.tipo}
                onChange={(e) =>
                  cambiarTipoPregunta(index, e.target.value as TipoPregunta)
                }
                className="h-9 rounded-md border border-slate-300 bg-white px-2 text-sm text-slate-700"
              >
                {TIPOS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
              {pregunta.tipo === "SELECCION" && (
                <div className="space-y-2 pt-2">
                  {pregunta.respuestas.map((respuesta, respuestaIndex) => (
                    <div key={respuestaIndex} className="flex items-center gap-2">
                      <Input
                        value={respuesta}
                        onChange={(e) =>
                          actualizarRespuesta(index, respuestaIndex, e.target.value)
                        }
                        placeholder={`Respuesta ${respuestaIndex + 1}`}
                      />
                      <span
                        aria-hidden="true"
                        className="h-4 w-4 shrink-0 rounded-full border border-slate-400"
                      />
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    className="px-3 py-1.5"
                    onClick={() => agregarRespuesta(index)}
                  >
                    <Plus className="h-4 w-4" />
                    Agregar respuesta
                  </Button>
                </div>
              )}
            </div>
            {preguntas.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => quitarPregunta(index)}
                aria-label="Quitar pregunta"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" disabled={enviando}>
        {enviando
          ? "Guardando..."
          : encuestaId
            ? "Guardar cambios"
            : "Guardar encuesta"}
      </Button>
    </form>
  );
}
