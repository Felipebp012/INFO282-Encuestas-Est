"use client";

import { useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  GitBranch,
  Plus,
  X,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

// ─── Tipos ──────────────────────────────────────────────────────────────

export interface CondicionRegla {
  preguntaId: string;
  opcionId: string;
}

export interface CondicionesConfig {
  operador: "Y" | "O";
  reglas: CondicionRegla[];
}

interface PreguntaDisponible {
  id: string;
  texto: string;
  numero: number; // 1-indexed para mostrar al usuario
  opciones: { id: string; texto: string }[];
}

interface CondicionBuilderProps {
  condiciones: CondicionesConfig | null;
  preguntasDisponibles: PreguntaDisponible[];
  onChange: (condiciones: CondicionesConfig | null) => void;
}

// ─── Serialización / Deserialización ────────────────────────────────────
// Se guarda en mostrarSiPreguntaId como JSON. Si es un CUID simple (legacy),
// se interpreta como condición simple con mostrarSiOpcionId.

export function serializarCondiciones(
  condiciones: CondicionesConfig | null
): { mostrarSiPreguntaId: string | null; mostrarSiOpcionId: string | null } {
  if (!condiciones || condiciones.reglas.length === 0) {
    return { mostrarSiPreguntaId: null, mostrarSiOpcionId: null };
  }
  // Si solo hay 1 regla, guardar en formato legacy para máxima compatibilidad
  if (condiciones.reglas.length === 1) {
    return {
      mostrarSiPreguntaId: condiciones.reglas[0].preguntaId,
      mostrarSiOpcionId: condiciones.reglas[0].opcionId,
    };
  }
  // Múltiples reglas: serializar como JSON
  return {
    mostrarSiPreguntaId: JSON.stringify(condiciones),
    mostrarSiOpcionId: null,
  };
}

export function deserializarCondiciones(
  mostrarSiPreguntaId: string | null,
  mostrarSiOpcionId: string | null
): CondicionesConfig | null {
  if (!mostrarSiPreguntaId) return null;

  // Intentar parsear como JSON (formato nuevo)
  if (mostrarSiPreguntaId.startsWith("{")) {
    try {
      const parsed = JSON.parse(mostrarSiPreguntaId) as CondicionesConfig;
      if (parsed.operador && Array.isArray(parsed.reglas)) {
        return parsed;
      }
    } catch {
      // Si falla, tratar como CUID legacy
    }
  }

  // Formato legacy: CUID simple
  if (mostrarSiOpcionId) {
    return {
      operador: "Y",
      reglas: [{ preguntaId: mostrarSiPreguntaId, opcionId: mostrarSiOpcionId }],
    };
  }

  return null;
}

// ─── Evaluador de condiciones (para responder-client) ───────────────────

export function evaluarCondiciones(
  condiciones: CondicionesConfig,
  respuestas: Record<string, { opcionIds?: string[] }>
): boolean {
  if (condiciones.reglas.length === 0) return true;

  if (condiciones.operador === "Y") {
    return condiciones.reglas.every((regla) => {
      const r = respuestas[regla.preguntaId];
      return r?.opcionIds?.includes(regla.opcionId) ?? false;
    });
  } else {
    // operador "O"
    return condiciones.reglas.some((regla) => {
      const r = respuestas[regla.preguntaId];
      return r?.opcionIds?.includes(regla.opcionId) ?? false;
    });
  }
}

// ─── Componente Principal ──────────────────────────────────────────────

export function CondicionBuilder({
  condiciones,
  preguntasDisponibles,
  onChange,
}: CondicionBuilderProps) {
  const activo = condiciones !== null;

  // Resumen en lenguaje natural
  const resumenTexto = useMemo(() => {
    if (!condiciones || condiciones.reglas.length === 0) return null;

    const partes = condiciones.reglas
      .map((regla) => {
        const preg = preguntasDisponibles.find((p) => p.id === regla.preguntaId);
        if (!preg) return null;
        const opc = preg.opciones.find((o) => o.id === regla.opcionId);
        if (!opc) return null;
        return `P${preg.numero} = "${opc.texto}"`;
      })
      .filter(Boolean);

    if (partes.length === 0) return null;

    const conector = condiciones.operador === "Y" ? " y " : " o ";
    return partes.join(conector);
  }, [condiciones, preguntasDisponibles]);

  function toggleActivo() {
    if (activo) {
      onChange(null);
    } else {
      onChange({ operador: "Y", reglas: [] });
    }
  }

  function agregarRegla() {
    if (!condiciones) return;
    // Buscar primera pregunta disponible que no esté ya usada con todas sus opciones
    const primera = preguntasDisponibles[0];
    if (!primera || primera.opciones.length === 0) return;

    onChange({
      ...condiciones,
      reglas: [
        ...condiciones.reglas,
        { preguntaId: primera.id, opcionId: primera.opciones[0].id },
      ],
    });
  }

  function quitarRegla(index: number) {
    if (!condiciones) return;
    const nuevas = condiciones.reglas.filter((_, i) => i !== index);
    onChange({ ...condiciones, reglas: nuevas });
  }

  function actualizarRegla(index: number, cambios: Partial<CondicionRegla>) {
    if (!condiciones) return;
    onChange({
      ...condiciones,
      reglas: condiciones.reglas.map((r, i) =>
        i === index ? { ...r, ...cambios } : r
      ),
    });
  }

  function toggleOperador() {
    if (!condiciones) return;
    onChange({
      ...condiciones,
      operador: condiciones.operador === "Y" ? "O" : "Y",
    });
  }

  if (preguntasDisponibles.length === 0) return null;

  return (
    <div
      className={`rounded-lg border transition-all duration-200 ${
        activo
          ? "border-l-4 border-l-amber-400 border-t-slate-200 border-r-slate-200 border-b-slate-200 bg-amber-50/40"
          : "border-slate-200 bg-slate-50/50"
      }`}
    >
      {/* Cabecera con toggle */}
      <button
        type="button"
        onClick={toggleActivo}
        className="flex w-full items-center justify-between px-3 py-2.5 text-left transition-colors hover:bg-slate-100/50 rounded-t-lg"
      >
        <div className="flex items-center gap-2">
          <GitBranch
            className={`h-4 w-4 transition-colors ${
              activo ? "text-amber-600" : "text-slate-400"
            }`}
          />
          <span
            className={`text-sm font-medium ${
              activo ? "text-amber-800" : "text-slate-500"
            }`}
          >
            Lógica condicional
          </span>
          {activo && condiciones && condiciones.reglas.length > 0 && (
            <span className="rounded-full bg-amber-200/80 px-2 py-0.5 text-[10px] font-bold text-amber-800">
              {condiciones.reglas.length}{" "}
              {condiciones.reglas.length === 1 ? "condición" : "condiciones"}
            </span>
          )}
        </div>
        {activo ? (
          <ToggleRight className="h-5 w-5 text-amber-600" />
        ) : (
          <ToggleLeft className="h-5 w-5 text-slate-400" />
        )}
      </button>

      {/* Panel de condiciones (expandido cuando activo) */}
      {activo && condiciones && (
        <div className="border-t border-amber-200/60 px-3 pb-3 pt-2 space-y-2">
          <p className="text-[11px] text-amber-700/70 font-medium">
            Esta pregunta se mostrará solo cuando se cumplan las siguientes condiciones:
          </p>

          {/* Lista de reglas */}
          {condiciones.reglas.map((regla, idx) => {
            const pregOrigen = preguntasDisponibles.find(
              (p) => p.id === regla.preguntaId
            );

            return (
              <div key={idx}>
                {/* Operador Y/O entre reglas (no antes de la primera) */}
                {idx > 0 && (
                  <div className="flex items-center justify-center py-1">
                    <button
                      type="button"
                      onClick={toggleOperador}
                      className={`rounded-full px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider transition-all duration-150 ${
                        condiciones.operador === "Y"
                          ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                          : "bg-purple-100 text-purple-700 hover:bg-purple-200"
                      }`}
                      title="Clic para alternar entre Y / O"
                    >
                      {condiciones.operador}
                    </button>
                  </div>
                )}

                {/* Fila de la condición */}
                <div className="flex items-center gap-1.5 rounded-md bg-white border border-slate-200 p-1.5 shadow-sm transition-all hover:shadow-md">
                  {/* Indicador visual */}
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-amber-100 text-[10px] font-bold text-amber-700">
                    {idx + 1}
                  </div>

                  {/* Selector de pregunta */}
                  <Select
                    value={regla.preguntaId}
                    onValueChange={(v) => {
                      const preg = preguntasDisponibles.find((p) => p.id === v);
                      actualizarRegla(idx, {
                        preguntaId: v,
                        opcionId: preg?.opciones[0]?.id ?? "",
                      });
                    }}
                  >
                    <SelectTrigger className="h-8 w-auto min-w-[140px] max-w-[200px] text-xs border-slate-200">
                      <SelectValue placeholder="Pregunta..." />
                    </SelectTrigger>
                    <SelectContent>
                      {preguntasDisponibles.map((p) => (
                        <SelectItem key={p.id} value={p.id} className="text-xs">
                          <span className="font-semibold text-slate-500">
                            P{p.numero}
                          </span>{" "}
                          <span className="text-slate-700 line-clamp-1">
                            {p.texto || "(sin texto)"}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Indicador "=" */}
                  <span className="shrink-0 text-xs font-bold text-slate-400">=</span>

                  {/* Selector de opción */}
                  <Select
                    value={regla.opcionId}
                    onValueChange={(v) => actualizarRegla(idx, { opcionId: v })}
                  >
                    <SelectTrigger className="h-8 w-auto min-w-[120px] max-w-[180px] text-xs border-slate-200">
                      <SelectValue placeholder="Respuesta..." />
                    </SelectTrigger>
                    <SelectContent>
                      {(pregOrigen?.opciones ?? []).map((o) => (
                        <SelectItem key={o.id} value={o.id} className="text-xs">
                          {o.texto || "(sin texto)"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Botón eliminar condición */}
                  <button
                    type="button"
                    onClick={() => quitarRegla(idx)}
                    className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                    title="Eliminar esta condición"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}

          {/* Botón agregar condición */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={agregarRegla}
            className="mt-1 h-7 gap-1 text-xs text-amber-700 hover:bg-amber-100/60 hover:text-amber-900"
          >
            <Plus className="h-3 w-3" />
            Agregar condición
          </Button>

          {/* Resumen en lenguaje natural */}
          {resumenTexto && (
            <div className="mt-1 rounded-md bg-amber-100/50 px-2.5 py-1.5 text-[11px] text-amber-800">
              <span className="font-semibold">Vista previa:</span> Se mostrará si{" "}
              {resumenTexto}.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
