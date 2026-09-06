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

export function SurveyBuilderForm({
  encuestaId,
  initialTitulo = "",
  initialPreguntas,
}: SurveyBuilderFormProps) {
  const [titulo, setTitulo] = useState(initialTitulo);
  const [preguntas, setPreguntas] = useState<PreguntaBorrador[]>(
    initialPreguntas?.length ? initialPreguntas : [{ texto: "", tipo: "ESCALA" }]
  );
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  function agregarPregunta() {
    setPreguntas((prev) => [...prev, { texto: "", tipo: "ESCALA" }]);
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
                  actualizarPregunta(index, "tipo", e.target.value)
                }
                className="h-9 rounded-md border border-slate-300 bg-white px-2 text-sm text-slate-700"
              >
                {TIPOS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
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
