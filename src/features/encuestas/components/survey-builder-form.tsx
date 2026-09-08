"use client";

import {
  useRef,
  useState,
  type DragEvent,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  actualizarEncuesta,
  crearEncuesta,
} from "@/features/encuestas/actions/encuesta.actions";
import type { TipoPregunta } from "@/features/encuestas/types/encuesta.types";
import { Grid3X3, Plus, Trash2 } from "lucide-react";

interface PreguntaBorrador {
  id?: string;
  texto: string;
  tipo: TipoPregunta;
  respuestas: RespuestaBorrador[];
}

interface RespuestaBorrador {
  texto: string;
  predeterminada: boolean;
}

interface SurveyBuilderFormProps {
  encuestaId?: string;
  initialTitulo?: string;
  initialPreguntas?: PreguntaBorrador[];
}

const TIPOS: { value: TipoPregunta; label: string }[] = [
  { value: "ESCALA", label: "Escala (1-5)" },
  { value: "SELECCION", label: "Selección única" },
  { value: "SELECCION_MULTIPLE", label: "Selección múltiple" },
  { value: "TEXTO", label: "Texto abierto" },
];

function respuestasIniciales(): RespuestaBorrador[] {
  return [
    { texto: "", predeterminada: true },
    { texto: "", predeterminada: true },
  ];
}

function nuevoId() {
  return globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);
}

function normalizarRespuestas(
  respuestas: RespuestaBorrador[]
): RespuestaBorrador[] {
  return respuestas.length >= 2
    ? respuestas
    : [
        ...respuestas,
        ...Array.from({ length: 2 - respuestas.length }, () => ({
          texto: "",
          predeterminada: true,
        })),
      ];
}

function nuevaPregunta(tipo: TipoPregunta = "ESCALA"): PreguntaBorrador {
  return {
    id: nuevoId(),
    texto: "",
    tipo,
    respuestas:
      tipo === "SELECCION" || tipo === "SELECCION_MULTIPLE"
        ? respuestasIniciales()
        : [],
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
          id: pregunta.id ?? nuevoId(),
          respuestas:
            pregunta.tipo === "SELECCION" ||
            pregunta.tipo === "SELECCION_MULTIPLE"
              ? normalizarRespuestas(
                  pregunta.respuestas.map((respuesta) =>
                    typeof respuesta === "string"
                      ? { texto: respuesta, predeterminada: false }
                      : respuesta
                  )
                )
              : [],
        }))
      : [nuevaPregunta()]
  );
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const preguntaRefs = useRef<Array<HTMLDivElement | null>>([]);
  const respuestaRefs = useRef<Array<Array<HTMLDivElement | null>>>([]);
  const preguntasActuales = useRef<PreguntaBorrador[]>([]);
  const historialPreguntas = useRef<PreguntaBorrador[][]>([]);
  const respuestaArrastrada = useRef<{
    preguntaIndex: number;
    respuestaIndex: number;
  } | null>(null);
  const preguntaArrastrada = useRef<string | null>(null);
  const inicioArrastrePregunta = useRef(0);
  const desplazamientoPregunta = useRef(0);
  const autoScrollFrame = useRef<number | null>(null);
  const [preguntaEnMovimiento, setPreguntaEnMovimiento] = useState(false);
  const [preguntaDesplazada, setPreguntaDesplazada] = useState<string | null>(
    null
  );
  const [desplazamientoVisual, setDesplazamientoVisual] = useState(0);

  function actualizarPreguntas(
    actualizar: (actuales: PreguntaBorrador[]) => PreguntaBorrador[],
    guardarEnHistorial = true
  ) {
    setPreguntas((actuales) => {
      preguntasActuales.current = actuales;
      if (guardarEnHistorial) {
        historialPreguntas.current = [
          ...historialPreguntas.current.slice(-49),
          actuales,
        ];
      }
      const siguientes = actualizar(actuales);
      preguntasActuales.current = siguientes;
      return siguientes;
    });
  }

  function agregarPregunta(debajoDe?: number) {
    const nuevoIndex = debajoDe === undefined ? preguntas.length : debajoDe + 1;
    actualizarPreguntas((prev) => {
      const siguientes = [...prev];
      siguientes.splice(nuevoIndex, 0, nuevaPregunta());
      return siguientes;
    });

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const nuevaPreguntaElement = preguntaRefs.current[nuevoIndex];
        const desplazamiento = nuevaPreguntaElement?.offsetHeight ?? 180;
        window.scrollBy({ top: desplazamiento + 32, behavior: "smooth" });
      });
    });
  }

  function quitarPregunta(index: number) {
    actualizarPreguntas((prev) => prev.filter((_, i) => i !== index));
  }

  function actualizarPregunta(
    index: number,
    campo: keyof PreguntaBorrador,
    valor: string
  ) {
    actualizarPreguntas((prev) =>
      prev.map((pregunta, i) =>
        i === index ? { ...pregunta, [campo]: valor } : pregunta
      )
    );
  }

  function cambiarTipoPregunta(index: number, tipo: TipoPregunta) {
    actualizarPreguntas((prev) =>
      prev.map((pregunta, i) =>
        i === index
          ? {
              ...pregunta,
              tipo,
              respuestas:
                tipo === "SELECCION" || tipo === "SELECCION_MULTIPLE"
                  ? normalizarRespuestas(pregunta.respuestas)
                  : [],
            }
          : pregunta
      )
    );
  }

  function agregarRespuesta(index: number) {
    const nuevoIndex = preguntas[index].respuestas.length;
    actualizarPreguntas((prev) =>
      prev.map((pregunta, i) =>
        i === index
          ? {
              ...pregunta,
              respuestas: [
                ...pregunta.respuestas,
                { texto: "", predeterminada: false },
              ],
            }
          : pregunta
      )
    );

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const respuestas = respuestaRefs.current[index] ?? [];
        const nuevaRespuesta = respuestas[nuevoIndex];
        const desplazamiento = nuevaRespuesta?.offsetHeight ?? 48;
        window.scrollBy({ top: desplazamiento + 16, behavior: "smooth" });
      });
    });
  }

  function actualizarRespuesta(
    preguntaIndex: number,
    respuestaIndex: number,
    texto: string
  ) {
    actualizarPreguntas((prev) =>
      prev.map((pregunta, i) =>
        i === preguntaIndex
          ? {
              ...pregunta,
              respuestas: pregunta.respuestas.map((respuesta, j) =>
                j === respuestaIndex ? { ...respuesta, texto } : respuesta
              ),
            }
          : pregunta
      )
    );
  }

  function quitarRespuesta(preguntaIndex: number, respuestaIndex: number) {
    if (preguntas[preguntaIndex].respuestas.length <= 2) return;

    actualizarPreguntas((prev) =>
      prev.map((pregunta, i) =>
        i === preguntaIndex
          ? {
              ...pregunta,
              respuestas: pregunta.respuestas.filter(
                (_, j) => j !== respuestaIndex
              ),
            }
          : pregunta
      )
    );
  }

  function iniciarArrastre(
    event: DragEvent<HTMLButtonElement>,
    preguntaIndex: number,
    respuestaIndex: number
  ) {
    respuestaArrastrada.current = { preguntaIndex, respuestaIndex };
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", `${preguntaIndex}:${respuestaIndex}`);
  }

  function moverRespuestaDuranteArrastre(
    event: DragEvent<HTMLDivElement>,
    preguntaIndex: number,
    destinoIndex: number
  ) {
    event.preventDefault();
    const origen = respuestaArrastrada.current;

    if (!origen || origen.preguntaIndex !== preguntaIndex) return;
    if (origen.respuestaIndex === destinoIndex) return;

    actualizarPreguntas((prev) =>
      prev.map((pregunta, index) => {
        if (index !== preguntaIndex) return pregunta;

        const respuestas = [...pregunta.respuestas];
        const [respuestaMovida] = respuestas.splice(origen.respuestaIndex, 1);
        respuestas.splice(destinoIndex, 0, respuestaMovida);
        return { ...pregunta, respuestas };
      })
    );
    respuestaArrastrada.current = {
      ...origen,
      respuestaIndex: destinoIndex,
    };
  }

  function moverPreguntaDuranteArrastre(
    event: DragEvent<HTMLDivElement>,
    destinoId: string
  ) {
    event.preventDefault();
    const origenId = preguntaArrastrada.current;
    if (!origenId) return;

    const listaActual = preguntasActuales.current.length
      ? preguntasActuales.current
      : preguntas;
    const origenIndexActual = listaActual.findIndex(
      (pregunta) => pregunta.id === origenId
    );
    const destinoIndexActual = listaActual.findIndex(
      (pregunta) => pregunta.id === destinoId
    );
    if (
      origenIndexActual < 0 ||
      destinoIndexActual < 0 ||
      origenIndexActual === destinoIndexActual
    ) {
      return;
    }

    const tarjetaDestino = event.currentTarget.getBoundingClientRect();
    const mitadDestino = tarjetaDestino.top + tarjetaDestino.height / 2;
    const arrastrandoHaciaAbajo = origenIndexActual < destinoIndexActual;

    if (
      (arrastrandoHaciaAbajo && event.clientY < mitadDestino) ||
      (!arrastrandoHaciaAbajo && event.clientY > mitadDestino)
    ) {
      return;
    }

    actualizarPreguntas((prev) => {
      const origenIndex = prev.findIndex((pregunta) => pregunta.id === origenId);
      const destinoIndex = prev.findIndex(
        (pregunta) => pregunta.id === destinoId
      );
      if (origenIndex < 0 || destinoIndex < 0 || origenIndex === destinoIndex) {
        return prev;
      }
      const preguntasActualizadas = [...prev];
      const [preguntaMovida] = preguntasActualizadas.splice(origenIndex, 1);
      preguntasActualizadas.splice(destinoIndex, 0, preguntaMovida);
      return preguntasActualizadas;
    }, false);
  }

  function desplazarDuranteArrastre(event: DragEvent<HTMLDivElement>) {
    if (!preguntaEnMovimiento) return;

    const margen = 220;
    const velocidad = 18;
    const posicion = event.clientY;
    let desplazamiento = 0;

    if (posicion < margen) desplazamiento = -velocidad;
    if (posicion > window.innerHeight - margen) desplazamiento = velocidad;

    if (desplazamiento !== 0 && autoScrollFrame.current === null) {
      autoScrollFrame.current = window.requestAnimationFrame(() => {
        window.scrollBy({ top: desplazamiento, behavior: "auto" });
        autoScrollFrame.current = null;
      });
    }
  }

  function deshacer() {
    const anterior = historialPreguntas.current.pop();
    if (anterior) setPreguntas(anterior);
  }

  function iniciarArrastrePregunta(
    event: DragEvent<HTMLButtonElement>,
    id: string
  ) {
    preguntaArrastrada.current = id;
    inicioArrastrePregunta.current = event.clientY;
    desplazamientoPregunta.current = 0;
    setPreguntaDesplazada(id);
    setDesplazamientoVisual(0);
    setPreguntaEnMovimiento(true);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", id);
  }

  function moverVisualPregunta(event: DragEvent<HTMLDivElement>, id: string) {
    if (preguntaArrastrada.current !== id) return;

    const desplazamiento = event.clientY - inicioArrastrePregunta.current;
    desplazamientoPregunta.current = desplazamiento;
    setDesplazamientoVisual(desplazamiento);
    setPreguntaDesplazada(id);
  }

  function finalizarArrastrePregunta() {
    preguntaArrastrada.current = null;
    desplazamientoPregunta.current = 0;
    setPreguntaDesplazada(null);
    setDesplazamientoVisual(0);
    setPreguntaEnMovimiento(false);
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (!titulo.trim()) {
      setError("Ponle un título a la encuesta.");
      return;
    }
    if (preguntas.some((pregunta) => !pregunta.texto.trim())) {
      setError("Todas las preguntas necesitan texto.");
      return;
    }
    if (
      preguntas.some(
        (pregunta) =>
          (pregunta.tipo === "SELECCION" ||
            pregunta.tipo === "SELECCION_MULTIPLE") &&
          pregunta.respuestas.some((respuesta) => !respuesta.texto.trim())
      )
    ) {
      setError("Todas las respuestas necesitan texto.");
      return;
    }

    const formData = new FormData();
    if (encuestaId) formData.set("id", encuestaId);
    formData.set("titulo", titulo);
    formData.set(
      "preguntas",
      JSON.stringify(
        preguntas.map((pregunta) => ({
          respuestas: pregunta.respuestas.map((respuesta) => respuesta.texto),
          texto: pregunta.texto,
          tipo: pregunta.tipo,
        }))
      )
    );

    setEnviando(true);
    try {
      await (encuestaId
        ? actualizarEncuesta(formData)
        : crearEncuesta(formData));
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "No se pudo guardar la encuesta."
      );
      setEnviando(false);
    }
  }

  function manejarAtajo(event: KeyboardEvent<HTMLFormElement>) {
    const elemento = event.target as HTMLElement;
    if (
      elemento.tagName === "INPUT" ||
      elemento.tagName === "TEXTAREA" ||
      elemento.tagName === "SELECT" ||
      elemento.isContentEditable
    ) {
      return;
    }

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
      event.preventDefault();
      deshacer();
    }
  }

  return (
    <form onSubmit={onSubmit} onKeyDown={manejarAtajo} className="space-y-8">
      <div className="space-y-2">
        <Label htmlFor="titulo">Título de la encuesta</Label>
        <Input
          id="titulo"
          value={titulo}
          onChange={(event) => setTitulo(event.target.value)}
          placeholder="Satisfacción con la asignatura - INFO 282"
        />
      </div>

      <div
        className={`space-y-4 ${preguntaEnMovimiento ? "pb-[60vh]" : ""}`}
      >
        <Label>Preguntas</Label>

        {preguntas.map((pregunta, index) => (
          <div
            key={pregunta.id}
            ref={(element) => {
              preguntaRefs.current[index] = element;
            }}
            className={`flex items-start gap-3 rounded-md border border-slate-200 p-4 transition-[transform,box-shadow,opacity] duration-150 ease-out ${
              preguntaDesplazada === pregunta.id
                ? "relative z-20 scale-[1.015] opacity-90 shadow-xl"
                : ""
            }`}
            style={{
              transform:
                preguntaDesplazada === pregunta.id
                  ? `translate3d(0, ${desplazamientoVisual}px, 0) scale(1.015)`
                  : "translate3d(0, 0, 0) scale(1)",
              zIndex: preguntaDesplazada === pregunta.id ? 20 : 0,
            }}
            onDrag={(event) => moverVisualPregunta(event, pregunta.id ?? "")}
            onDragOver={(event) => {
              moverPreguntaDuranteArrastre(event, pregunta.id ?? "");
              desplazarDuranteArrastre(event);
            }}
            onDrop={() => {
              finalizarArrastrePregunta();
            }}
            onDragEnd={finalizarArrastrePregunta}
          >
            <div className="mt-1 flex items-center gap-1">
              <button
                type="button"
                draggable
                onDragStart={(event) =>
                  iniciarArrastrePregunta(event, pregunta.id ?? "")
                }
                onDragEnd={finalizarArrastrePregunta}
                aria-label="Mover pregunta"
                title="Arrastrar pregunta"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md p-0 text-slate-400 hover:bg-slate-100 hover:text-slate-700 active:cursor-grabbing"
              >
                <Grid3X3 className="h-5 w-5" />
              </button>
              <span className="text-sm text-slate-400">{index + 1}</span>
            </div>
            <div className="flex-1 space-y-2">
              <Input
                value={pregunta.texto}
                onChange={(event) =>
                  actualizarPregunta(index, "texto", event.target.value)
                }
                placeholder="¿Qué tan satisfecho/a estás con...?"
              />
              <select
                value={pregunta.tipo}
                onChange={(event) =>
                  cambiarTipoPregunta(index, event.target.value as TipoPregunta)
                }
                className="h-9 rounded-md border border-slate-300 bg-white px-2 text-sm text-slate-700"
              >
                {TIPOS.map((tipo) => (
                  <option key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </option>
                ))}
              </select>
              {!preguntaEnMovimiento &&
                (pregunta.tipo === "SELECCION" ||
                pregunta.tipo === "SELECCION_MULTIPLE") && (
                <div className="space-y-2 pt-2">
                  {pregunta.respuestas.map((respuesta, respuestaIndex) => (
                    <div
                      key={respuestaIndex}
                      ref={(element) => {
                        if (!respuestaRefs.current[index]) {
                          respuestaRefs.current[index] = [];
                        }
                        respuestaRefs.current[index][respuestaIndex] = element;
                      }}
                      className="flex items-center gap-2"
                      onDragOver={(event) =>
                        moverRespuestaDuranteArrastre(
                          event,
                          index,
                          respuestaIndex
                        )
                      }
                      onDrop={(event) => {
                        event.preventDefault();
                        respuestaArrastrada.current = null;
                      }}
                    >
                      <button
                        type="button"
                        draggable
                        onDragStart={(event) =>
                          iniciarArrastre(event, index, respuestaIndex)
                        }
                        onDragEnd={() => {
                          respuestaArrastrada.current = null;
                        }}
                        aria-label="Mover respuesta"
                        title="Arrastrar respuesta"
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md p-0 text-slate-400 hover:bg-slate-100 hover:text-slate-700 active:cursor-grabbing"
                      >
                        <Grid3X3 className="h-4 w-4" />
                      </button>
                      <Input
                        value={respuesta.texto}
                        onChange={(event) =>
                          actualizarRespuesta(
                            index,
                            respuestaIndex,
                            event.target.value
                          )
                        }
                        placeholder={`Respuesta ${respuestaIndex + 1}`}
                      />
                      {pregunta.respuestas.length >= 3 && (
                        <Button
                          type="button"
                          variant="ghost"
                          className="px-2 text-red-600"
                          onClick={() => quitarRespuesta(index, respuestaIndex)}
                          aria-label="Quitar respuesta"
                          title="Borrar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    className="px-3 py-1.5"
                    onClick={() => agregarRespuesta(index)}
                          title="Agregar respuesta"
                  >
                    <Plus className="h-4 w-4" />
                    Agregar respuesta
                  </Button>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => agregarPregunta(index)}
                  aria-label="Agregar pregunta"
                  title="Agregar pregunta"
                >
                  <Plus className="h-4 w-4" />
                </Button>
                {preguntas.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => quitarPregunta(index)}
                    aria-label="Quitar pregunta"
                    title="Borrar"
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
        {enviando
          ? "Guardando..."
          : encuestaId
            ? "Guardar cambios"
            : "Guardar encuesta"}
      </Button>
    </form>
  );
}