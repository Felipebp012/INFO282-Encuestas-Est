"use client";

import { useState, useRef, type FormEvent } from "react";
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
import { FechaHoraPicker } from "@/components/fecha-hora-picker";
import {
  TIPOS_PREGUNTA,
  opcionesPorDefecto,
  tipoTieneOpciones,
  puedeSerCondicion,
  type TipoPregunta,
} from "@/lib/tipos-pregunta";
import {
  CondicionBuilder,
  serializarCondiciones,
  deserializarCondiciones,
  type CondicionesConfig,
} from "@/components/condicion-builder";

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
  condiciones: CondicionesConfig | null;
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

const ID_PREGUNTA_INICIAL = "pregunta-base-1";

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
        id: ID_PREGUNTA_INICIAL,
        tipo: "escala",
        texto: "",
        obligatoria: true,
        minSelecciones: null,
        maxSelecciones: null,
        condiciones: null,
        opciones: opcionesPorDefecto("escala").map((o, i) => ({
          id: `opcion-base-${i + 1}`,
          ...o,
        })),
      },
    ]
  );
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [dragState, setDragState] = useState<{
    id: string;
    grabOffsetY: number;
    currentY: number;
    left: number;
    width: number;
  } | null>(null);

  function handlePointerDown(e: React.PointerEvent, id: string) {
    if (e.button !== 0) return; // Solo clic principal
    e.preventDefault();

    const targetElement = e.currentTarget as HTMLElement;
    const cardEl =
      targetElement.closest<HTMLElement>("[data-pregunta-card]") ||
      document.querySelector<HTMLElement>(`[data-id="${id}"]`) ||
      document.getElementById(`pregunta-${id}`);

    if (!cardEl) return;
    const rect = cardEl.getBoundingClientRect();
    const grabOffsetY = e.clientY - rect.top;

    setDragState({
      id,
      grabOffsetY,
      currentY: e.clientY,
      left: rect.left,
      width: rect.width,
    });

    const onPointerMove = (moveEvent: PointerEvent) => {
      // Auto-scroll si el cursor se acerca al borde de la pantalla
      const margen = 100;
      const vel = 14;
      if (moveEvent.clientY < margen) {
        window.scrollBy({ top: -vel, behavior: "auto" });
      } else if (moveEvent.clientY > window.innerHeight - margen) {
        window.scrollBy({ top: vel, behavior: "auto" });
      }

      setDragState((prev) => (prev ? { ...prev, currentY: moveEvent.clientY } : null));

      // Reordenar en vivo basado en la mitad de la pregunta (cero tiriteos)
      setPreguntas((prevPreguntas) => {
        const fromIdx = prevPreguntas.findIndex((p) => p.id === id);
        if (fromIdx === -1) return prevPreguntas;

        const cardElements = Array.from(document.querySelectorAll<HTMLElement>("[data-pregunta-card]"));
        if (cardElements.length !== prevPreguntas.length) return prevPreguntas;

        let targetIdx = -1;

        // Si el cursor va hacia abajo, comprobar si pasó la mitad de las siguientes preguntas
        for (let i = fromIdx + 1; i < cardElements.length; i++) {
          const el = cardElements[i];
          const r = el.getBoundingClientRect();
          const mitad = r.top + r.height / 2;
          if (moveEvent.clientY > mitad) {
            targetIdx = i;
          }
        }

        // Si el cursor va hacia arriba, comprobar si pasó la mitad de las preguntas anteriores
        if (targetIdx === -1) {
          for (let i = fromIdx - 1; i >= 0; i--) {
            const el = cardElements[i];
            const r = el.getBoundingClientRect();
            const mitad = r.top + r.height / 2;
            if (moveEvent.clientY < mitad) {
              targetIdx = i;
            }
          }
        }

        if (targetIdx === -1 || targetIdx === fromIdx || targetIdx >= prevPreguntas.length) {
          return prevPreguntas;
        }

        const next = [...prevPreguntas];
        const [moved] = next.splice(fromIdx, 1);
        next.splice(targetIdx, 0, moved);

        return next.map((p, idx) => {
          if (!p.condiciones || p.condiciones.reglas.length === 0) return p;
          // Filtrar reglas cuya pregunta origen ya no está antes en el orden
          const reglasValidas = p.condiciones.reglas.filter((regla) => {
            const originIdx = next.findIndex((item) => item.id === regla.preguntaId);
            return originIdx !== -1 && originIdx < idx;
          });
          if (reglasValidas.length === 0) {
            return { ...p, condiciones: null };
          }
          if (reglasValidas.length !== p.condiciones.reglas.length) {
            return { ...p, condiciones: { ...p.condiciones, reglas: reglasValidas } };
          }
          return p;
        });
      });
    };

    const onPointerUp = () => {
      setDragState(null);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  }

  function agregarPregunta(despuesDeIndex?: number) {
    // Si se presionó el botón en una pregunta existente, hereda su mismo tipo
    const tipoOrigen: TipoPregunta =
      typeof despuesDeIndex === "number" && preguntas[despuesDeIndex]
        ? preguntas[despuesDeIndex].tipo
        : "escala";

    const nuevaPregunta: PreguntaDraft = {
      id: idTemporal(),
      tipo: tipoOrigen,
      texto: "",
      obligatoria: true,
      minSelecciones: null,
      maxSelecciones: null,
      condiciones: null,
      opciones: tipoTieneOpciones(tipoOrigen)
        ? opcionesPorDefecto(tipoOrigen).map((o) => ({ id: idTemporal(), ...o }))
        : [],
    };

    setPreguntas((prev) => {
      const next = [...prev];
      if (
        typeof despuesDeIndex === "number" &&
        despuesDeIndex >= 0 &&
        despuesDeIndex < next.length
      ) {
        next.splice(despuesDeIndex + 1, 0, nuevaPregunta);
      } else {
        next.push(nuevaPregunta);
      }
      return next;
    });

    // Desplazar la pantalla proporcionalmente al espacio de la nueva pregunta creada
    setTimeout(() => {
      const el = document.getElementById(`pregunta-${nuevaPregunta.id}`);
      if (el) {
        const rect = el.getBoundingClientRect();
        const desplazamiento = rect.height > 0 ? rect.height + 24 : 340;
        window.scrollBy({ top: desplazamiento, behavior: "smooth" });
      }
    }, 60);
  }

  function quitarPregunta(id: string) {
    setPreguntas((prev) =>
      prev
        .filter((p) => p.id !== id)
        // limpiar condiciones que apuntaban a la pregunta eliminada
        .map((p) => {
          if (!p.condiciones) return p;
          const reglasLimpias = p.condiciones.reglas.filter(
            (r) => r.preguntaId !== id
          );
          if (reglasLimpias.length === 0) return { ...p, condiciones: null };
          if (reglasLimpias.length !== p.condiciones.reglas.length) {
            return { ...p, condiciones: { ...p.condiciones, reglas: reglasLimpias } };
          }
          return p;
        })
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
      condiciones: null,
    });
  }

  function agregarOpcion(preguntaId: string) {
    setPreguntas((prev) =>
      prev.map((p) => {
        if (p.id !== preguntaId) return p;
        if (p.tipo === "si_no" || p.tipo === "escala") return p;
        return {
          ...p,
          opciones: [...p.opciones, { id: idTemporal(), texto: "", valorNumerico: null }],
        };
      })
    );
  }

  function quitarOpcion(preguntaId: string, opcionId: string) {
    setPreguntas((prev) =>
      prev.map((p) => {
        if (p.id !== preguntaId) return p;
        if (p.tipo === "si_no" || p.tipo === "escala") return p;
        if ((p.tipo === "opcion_unica" || p.tipo === "opcion_multiple") && p.opciones.length <= 2) {
          return p;
        }
        return { ...p, opciones: p.opciones.filter((o) => o.id !== opcionId) };
      })
    );
  }

  function actualizarOpcion(
    preguntaId: string,
    opcionId: string,
    cambios: Partial<OpcionDraft>
  ) {
    setPreguntas((prev) =>
      prev.map((p) => {
        if (p.id !== preguntaId) return p;
        if (p.tipo === "si_no") return p; // Sí / No no es editable en valor ni contenido
        return {
          ...p,
          opciones: p.opciones.map((o) => (o.id === opcionId ? { ...o, ...cambios } : o)),
        };
      })
    );
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!titulo.trim()) return setError("Ponle un título a la encuesta.");
    if (!fechaFin) return setError("Define la fecha de cierre.");
    if (preguntas.length === 0) return setError("Agrega al menos una pregunta.");
    if (preguntas.some((p) => !p.texto.trim())) return setError("Todas las preguntas necesitan texto.");
    if (
      preguntas.some(
        (p) => tipoTieneOpciones(p.tipo) && p.opciones.some((o) => !o.texto.trim())
      )
    )
      return setError("Todas las opciones necesitan texto.");

    for (const p of preguntas) {
      if ((p.tipo === "opcion_unica" || p.tipo === "opcion_multiple") && p.opciones.length < 2) {
        return setError(
          `La pregunta "${p.texto || "sin texto"}" de ${
            p.tipo === "opcion_unica" ? "selección única" : "selección múltiple"
          } debe tener como mínimo 2 opciones.`
        );
      }
    }

    setEnviando(true);
    try {
      // Serializar condiciones para el backend (JSON en mostrarSiPreguntaId)
      const preguntasSerializadas = preguntas.map((p) => {
        const { condiciones: _cond, ...resto } = p;
        const serialized = serializarCondiciones(p.condiciones);
        return {
          ...resto,
          mostrarSiPreguntaId: serialized.mostrarSiPreguntaId,
          mostrarSiOpcionId: serialized.mostrarSiOpcionId,
        };
      });
      await onGuardar({
        titulo,
        asignatura,
        fechaFin,
        mensajeCierre,
        preguntas: preguntasSerializadas as unknown as PreguntaDraft[],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar.");
      setEnviando(false);
    }
  }

  // preguntas disponibles como origen de una condición: las que van ANTES
  // en el orden y son de un tipo con opciones fijas de marca única.
  function preguntasCondicionDisponibles(indexActual: number) {
    return preguntas
      .slice(0, indexActual)
      .filter((p) => puedeSerCondicion(p.tipo))
      .map((p, _i) => ({
        id: p.id,
        texto: p.texto,
        numero: preguntas.findIndex((q) => q.id === p.id) + 1,
        opciones: p.opciones.map((o) => ({ id: o.id, texto: o.texto })),
      }));
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
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="fechaFin">Fecha y hora de cierre</Label>
          <FechaHoraPicker
            id="fechaFin"
            value={fechaFin}
            onChange={setFechaFin}
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
          <Label className="text-base font-semibold">Preguntas</Label>
        </div>

        {preguntas.map((pregunta, index) => {
          const esSiNo = pregunta.tipo === "si_no";
          const esEscala = pregunta.tipo === "escala";
          const esOpcionFija = esSiNo || esEscala;
          const estaSiendoArrastrada = dragState?.id === pregunta.id;

          if (estaSiendoArrastrada) {
            return (
              <div
                key={pregunta.id}
                id={`pregunta-${pregunta.id}`}
                data-pregunta-card="true"
                data-id={pregunta.id}
                className="flex items-center justify-center gap-2 rounded-md border-2 border-dashed border-blue-400 bg-blue-50/50 p-6 text-sm font-medium text-blue-600 transition-all duration-150"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                  {index + 1}
                </div>
                <span>Soltar pregunta {index + 1} aquí</span>
              </div>
            );
          }

          return (
            <div
              key={pregunta.id}
              id={`pregunta-${pregunta.id}`}
              data-pregunta-card="true"
              data-id={pregunta.id}
              className="space-y-3 rounded-md border border-slate-200 bg-white p-4 transition-all duration-200 hover:border-slate-300 hover:shadow-sm"
            >
              <div className="flex items-start gap-3">
                {/* Agarre 3x3 posicionado a la izquierda con número */}
                <div className="flex items-center gap-1.5 pt-1">
                  <div
                    role="button"
                    tabIndex={0}
                    onPointerDown={(e) => handlePointerDown(e, pregunta.id)}
                    title="Arrastrar para mover el orden"
                    aria-label="Arrastrar para mover el orden"
                    style={{ touchAction: "none" }}
                    className="group flex h-8 w-8 cursor-grab items-center justify-center rounded-md hover:bg-slate-100 active:cursor-grabbing text-slate-400 hover:text-slate-700 transition-colors"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                      className="transition-colors"
                    >
                      <rect x="1.5" y="1.5" width="3" height="3" rx="0.5" />
                      <rect x="6.5" y="1.5" width="3" height="3" rx="0.5" />
                      <rect x="11.5" y="1.5" width="3" height="3" rx="0.5" />
                      <rect x="1.5" y="6.5" width="3" height="3" rx="0.5" />
                      <rect x="6.5" y="6.5" width="3" height="3" rx="0.5" />
                      <rect x="11.5" y="6.5" width="3" height="3" rx="0.5" />
                      <rect x="1.5" y="11.5" width="3" height="3" rx="0.5" />
                      <rect x="6.5" y="11.5" width="3" height="3" rx="0.5" />
                      <rect x="11.5" y="11.5" width="3" height="3" rx="0.5" />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold text-slate-400 select-none min-w-[1.25rem] text-center">
                    {index + 1}
                  </span>
                </div>

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
                      {esSiNo && (
                        <p className="text-xs text-slate-500 italic">
                          Pregunta de Sí / No fija (no se pueden editar valores ni opciones).
                        </p>
                      )}
                      {esEscala && (
                        <p className="text-xs text-slate-500 italic">
                          Escala fija de 4 opciones (no se pueden agregar ni eliminar opciones).
                        </p>
                      )}
                      {pregunta.opciones.map((opcion) => (
                        <div key={opcion.id} className="flex items-center gap-2">
                          <Input
                            value={opcion.texto}
                            disabled={esSiNo}
                            onChange={(e) =>
                              actualizarOpcion(pregunta.id, opcion.id, { texto: e.target.value })
                            }
                            placeholder="Texto de la opción"
                            className={esSiNo ? "bg-slate-100 text-slate-500 cursor-not-allowed" : ""}
                          />
                          <Input
                            type="number"
                            className={`w-24 ${esSiNo ? "bg-slate-100 text-slate-500 cursor-not-allowed" : ""}`}
                            value={opcion.valorNumerico ?? ""}
                            disabled={esSiNo}
                            onChange={(e) =>
                              actualizarOpcion(pregunta.id, opcion.id, {
                                valorNumerico: e.target.value ? Number(e.target.value) : null,
                              })
                            }
                            placeholder="Valor"
                            title="Valor numérico para análisis (HU-0503)"
                          />
                          {!esOpcionFija && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              disabled={pregunta.opciones.length <= 2}
                              onClick={() => quitarOpcion(pregunta.id, opcion.id)}
                              title={
                                pregunta.opciones.length <= 2
                                  ? "Mínimo 2 opciones requeridas"
                                  : "Eliminar opción"
                              }
                              className={
                                pregunta.opciones.length <= 2
                                  ? "opacity-30 cursor-not-allowed hover:bg-transparent"
                                  : "text-slate-500 hover:text-red-600"
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      {!esOpcionFija && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => agregarOpcion(pregunta.id)}
                        >
                          <Plus className="mr-1 h-3 w-3" />
                          Agregar opción
                        </Button>
                      )}
                    </div>
                  )}

                  {preguntasCondicionDisponibles(index).length > 0 && (
                    <CondicionBuilder
                      condiciones={pregunta.condiciones}
                      preguntasDisponibles={preguntasCondicionDisponibles(index)}
                      onChange={(cond) =>
                        actualizarPregunta(pregunta.id, { condiciones: cond })
                      }
                    />
                  )}
                </div>

                {/* Botones a la derecha: + y Basurero */}
                <div className="flex items-center gap-1 pt-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => agregarPregunta(index)}
                    title="Agregar pregunta"
                    aria-label="Agregar pregunta"
                    className="h-8 w-8 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>

                  {preguntas.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => quitarPregunta(pregunta.id)}
                      title="Eliminar pregunta"
                      aria-label="Eliminar pregunta"
                      className="h-8 w-8 text-slate-500 hover:bg-slate-100 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" disabled={enviando}>
        {enviando ? "Guardando..." : textoBoton}
      </Button>

      {/* Tarjeta flotante que sigue al cursor exactamente en tiempo real */}
      {dragState && (() => {
        const p = preguntas.find((item) => item.id === dragState.id);
        const idx = preguntas.findIndex((item) => item.id === dragState.id);
        const tipoLabel = TIPOS_PREGUNTA.find((t) => t.value === p?.tipo)?.label ?? "";

        return (
          <div
            style={{
              position: "fixed",
              top: dragState.currentY - dragState.grabOffsetY,
              left: dragState.left,
              width: dragState.width,
              zIndex: 99999,
              pointerEvents: "none",
              transform: "scale(1.02)",
            }}
            className="rounded-lg border-2 border-blue-500 bg-white p-4 shadow-2xl ring-4 ring-blue-200/60 opacity-95 transition-transform"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                  {idx + 1}
                </span>
                <span className="text-sm font-semibold text-slate-800 line-clamp-1">
                  {p?.texto || "Pregunta sin título"}
                </span>
              </div>
              <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                {tipoLabel}
              </span>
            </div>
            <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
              <span>{p?.opciones.length ? `${p.opciones.length} opciones` : "Texto abierto"}</span>
              <span className="text-blue-600 font-medium">Moviendo pregunta...</span>
            </div>
          </div>
        );
      })()}
    </form>
  );
}
