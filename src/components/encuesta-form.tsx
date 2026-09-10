"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import {
  TIPOS_PREGUNTA,
  opcionesPorDefecto,
  tipoTieneOpciones,
  puedeSerCondicion,
  type TipoPregunta,
} from "@/lib/tipos-pregunta";

function idTemporal() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

interface OpcionDraft {
  id: string;
  texto: string;
  valorNumerico: number | null;
}

interface PreguntaDraft {
  id: string;
  tipo: TipoPregunta;
  texto: string;
  obligatoria: boolean;
  minSelecciones: number | null;
  maxSelecciones: number | null;
  mostrarSiPreguntaId: string | null;
  mostrarSiOpcionId: string | null;
  opciones: OpcionDraft[];
}

export interface EncuestaDraft {
  titulo: string;
  asignatura: string;
  fechaFin: string;
  mensajeCierre: string;
  preguntas: PreguntaDraft[];
}

interface Props {
  draftInicial?: EncuestaDraft;
  onGuardar: (draft: EncuestaDraft) => Promise<void>;
  textoBoton?: string;
}

export function EncuestaForm({
  draftInicial,
  onGuardar,
  textoBoton = "Crear encuesta",
}: Props) {
  const [titulo, setTitulo] = useState(draftInicial?.titulo ?? "");
  const [asignatura, setAsignatura] = useState(draftInicial?.asignatura ?? "");
  const [fechaFin, setFechaFin] = useState(draftInicial?.fechaFin ?? "");
  const [mensajeCierre, setMensajeCierre] = useState(draftInicial?.mensajeCierre ?? "");
  const [preguntas, setPreguntas] = useState<PreguntaDraft[]>(
    draftInicial?.preguntas ?? [
      {
        id: idTemporal(),
        tipo: "escala",
        texto: "",
        obligatoria: true,
        minSelecciones: null,
        maxSelecciones: null,
        mostrarSiPreguntaId: null,
        mostrarSiOpcionId: null,
        opciones: opcionesPorDefecto("escala").map((o) => ({ id: idTemporal(), ...o })),
      },
    ]
  );
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  function agregarPregunta() {
    setPreguntas((prev) => [
      ...prev,
      {
        id: idTemporal(),
        tipo: "escala",
        texto: "",
        obligatoria: true,
        minSelecciones: null,
        maxSelecciones: null,
        mostrarSiPreguntaId: null,
        mostrarSiOpcionId: null,
        opciones: opcionesPorDefecto("escala").map((o) => ({ id: idTemporal(), ...o })),
      },
    ]);
  }

  function quitarPregunta(id: string) {
    setPreguntas((prev) =>
      prev
        .filter((p) => p.id !== id)
        // limpiar condiciones que apuntaban a la pregunta eliminada
        .map((p) => (p.mostrarSiPreguntaId === id ? { ...p, mostrarSiPreguntaId: null, mostrarSiOpcionId: null } : p))
    );
  }

  function actualizarPregunta(id: string, cambios: Partial<PreguntaDraft>) {
    setPreguntas((prev) => prev.map((p) => (p.id === id ? { ...p, ...cambios } : p)));
  }

  function cambiarTipo(id: string, tipo: TipoPregunta) {
    actualizarPregunta(id, {
      tipo,
      opciones: tipoTieneOpciones(tipo)
        ? opcionesPorDefecto(tipo).map((o) => ({ id: idTemporal(), ...o }))
        : [],
      mostrarSiPreguntaId: null,
      mostrarSiOpcionId: null,
    });
  }

  function agregarOpcion(preguntaId: string) {
    setPreguntas((prev) =>
      prev.map((p) =>
        p.id === preguntaId
          ? { ...p, opciones: [...p.opciones, { id: idTemporal(), texto: "", valorNumerico: null }] }
          : p
      )
    );
  }

  function quitarOpcion(preguntaId: string, opcionId: string) {
    setPreguntas((prev) =>
      prev.map((p) =>
        p.id === preguntaId
          ? { ...p, opciones: p.opciones.filter((o) => o.id !== opcionId) }
          : p
      )
    );
  }

  function actualizarOpcion(
    preguntaId: string,
    opcionId: string,
    cambios: Partial<OpcionDraft>
  ) {
    setPreguntas((prev) =>
      prev.map((p) =>
        p.id === preguntaId
          ? {
              ...p,
              opciones: p.opciones.map((o) => (o.id === opcionId ? { ...o, ...cambios } : o)),
            }
          : p
      )
    );
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!titulo.trim()) return setError("Ponle un título a la encuesta.");
    if (!fechaFin) return setError("Define la fecha de cierre.");
    if (preguntas.some((p) => !p.texto.trim())) return setError("Todas las preguntas necesitan texto.");
    if (
      preguntas.some(
        (p) => tipoTieneOpciones(p.tipo) && p.opciones.some((o) => !o.texto.trim())
      )
    )
      return setError("Todas las opciones necesitan texto.");

    setEnviando(true);
    try {
      await onGuardar({
        titulo,
        asignatura,
        fechaFin,
        mensajeCierre,
        preguntas,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar.");
      setEnviando(false);
    }
  }

  // preguntas disponibles como origen de una condición: las que van ANTES
  // en el orden y son de un tipo con opciones fijas de marca única.
  function preguntasCondicionDisponibles(indexActual: number) {
    return preguntas.slice(0, indexActual).filter((p) => puedeSerCondicion(p.tipo));
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="titulo">Título de la encuesta</Label>
          <Input id="titulo" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="asignatura">Asignatura</Label>
          <Input
            id="asignatura"
            value={asignatura}
            onChange={(e) => setAsignatura(e.target.value)}
            placeholder="Ej. Taller de Ingeniería de Software"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="fechaFin">Fecha y hora de cierre</Label>
          <Input
            id="fechaFin"
            type="datetime-local"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="mensajeCierre">Mensaje de cierre para el estudiante</Label>
          <Textarea
            id="mensajeCierre"
            value={mensajeCierre}
            onChange={(e) => setMensajeCierre(e.target.value)}
            placeholder="¡Gracias por tu participación!"
          />
        </div>
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
          <div key={pregunta.id} className="space-y-3 rounded-md border border-slate-200 p-4">
            <div className="flex items-start gap-3">
              <span className="mt-2 text-sm text-slate-400">{index + 1}</span>
              <div className="flex-1 space-y-2">
                <Input
                  value={pregunta.texto}
                  onChange={(e) => actualizarPregunta(pregunta.id, { texto: e.target.value })}
                  placeholder="Enunciado de la pregunta"
                />
                <div className="flex flex-wrap gap-2">
                  <Select
                    value={pregunta.tipo}
                    onValueChange={(v) => cambiarTipo(pregunta.id, v as TipoPregunta)}
                  >
                    <SelectTrigger className="w-52">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIPOS_PREGUNTA.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <label className="flex items-center gap-2 text-sm text-slate-600">
                    <input
                      type="checkbox"
                      checked={pregunta.obligatoria}
                      onChange={(e) =>
                        actualizarPregunta(pregunta.id, { obligatoria: e.target.checked })
                      }
                    />
                    Obligatoria
                  </label>
                </div>

                {pregunta.tipo === "opcion_multiple" && (
                  <div className="flex gap-3 text-sm text-slate-600">
                    <label className="flex items-center gap-1">
                      Mín.
                      <Input
                        type="number"
                        className="w-16"
                        value={pregunta.minSelecciones ?? ""}
                        onChange={(e) =>
                          actualizarPregunta(pregunta.id, {
                            minSelecciones: e.target.value ? Number(e.target.value) : null,
                          })
                        }
                      />
                    </label>
                    <label className="flex items-center gap-1">
                      Máx.
                      <Input
                        type="number"
                        className="w-16"
                        value={pregunta.maxSelecciones ?? ""}
                        onChange={(e) =>
                          actualizarPregunta(pregunta.id, {
                            maxSelecciones: e.target.value ? Number(e.target.value) : null,
                          })
                        }
                      />
                    </label>
                  </div>
                )}

                {tipoTieneOpciones(pregunta.tipo) && (
                  <div className="space-y-2 pl-2">
                    {pregunta.opciones.map((opcion) => (
                      <div key={opcion.id} className="flex items-center gap-2">
                        <Input
                          value={opcion.texto}
                          onChange={(e) =>
                            actualizarOpcion(pregunta.id, opcion.id, { texto: e.target.value })
                          }
                          placeholder="Texto de la opción"
                        />
                        <Input
                          type="number"
                          className="w-24"
                          value={opcion.valorNumerico ?? ""}
                          onChange={(e) =>
                            actualizarOpcion(pregunta.id, opcion.id, {
                              valorNumerico: e.target.value ? Number(e.target.value) : null,
                            })
                          }
                          placeholder="Valor"
                          title="Valor numérico para análisis (HU-0503)"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => quitarOpcion(pregunta.id, opcion.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => agregarOpcion(pregunta.id)}
                    >
                      <Plus className="h-3 w-3" />
                      Agregar opción
                    </Button>
                  </div>
                )}

                {preguntasCondicionDisponibles(index).length > 0 && (
                  <div className="rounded-md bg-slate-50 p-3 text-sm">
                    <p className="mb-2 text-slate-500">
                      Mostrar esta pregunta solo si (opcional, HU-0502):
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Select
                        value={pregunta.mostrarSiPreguntaId ?? "__ninguna__"}
                        onValueChange={(v) =>
                          actualizarPregunta(pregunta.id, {
                            mostrarSiPreguntaId: v === "__ninguna__" ? null : v,
                            mostrarSiOpcionId: null,
                          })
                        }
                      >
                        <SelectTrigger className="w-64">
                          <SelectValue placeholder="Sin condición" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__ninguna__">Sin condición</SelectItem>
                          {preguntasCondicionDisponibles(index).map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.texto || "(sin texto)"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {pregunta.mostrarSiPreguntaId && (
                        <Select
                          value={pregunta.mostrarSiOpcionId ?? ""}
                          onValueChange={(v) =>
                            actualizarPregunta(pregunta.id, { mostrarSiOpcionId: v })
                          }
                        >
                          <SelectTrigger className="w-64">
                            <SelectValue placeholder="respondió..." />
                          </SelectTrigger>
                          <SelectContent>
                            {preguntas
                              .find((p) => p.id === pregunta.mostrarSiPreguntaId)
                              ?.opciones.map((o) => (
                                <SelectItem key={o.id} value={o.id}>
                                  {o.texto || "(sin texto)"}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>
                )}
              </div>
              {preguntas.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => quitarPregunta(pregunta.id)}
                  aria-label="Quitar pregunta"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" disabled={enviando}>
        {enviando ? "Guardando..." : textoBoton}
      </Button>
    </form>
  );
}
