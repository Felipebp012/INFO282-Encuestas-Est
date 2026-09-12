"use client";

import { useState, useTransition, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { cambiarEstadoEncuesta } from "@/lib/actions/encuestas";
import { FechaHoraPicker } from "@/components/fecha-hora-picker";
import { Lock, Unlock, X, Clock, AlertCircle } from "lucide-react";

interface Props {
  encuestaId: string;
  estadoActual: string;
  fechaFin: Date | null;
}

export function BotonCambiarEstado({ encuestaId, estadoActual, fechaFin }: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);

  // Fecha por defecto para la reapertura: +7 días a las 23:59
  const fechaSugeridaPorDefecto = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dia = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${dia}T23:59`;
  }, []);

  const [nuevaFecha, setNuevaFecha] = useState(fechaSugeridaPorDefecto);

  const cerradaManualmente = estadoActual === "cerrada";
  const fechaFinPasada = fechaFin ? new Date() > new Date(fechaFin) : false;
  const estaCerrada = cerradaManualmente || fechaFinPasada;

  const handleCerrarAhora = () => {
    setError(null);
    startTransition(async () => {
      try {
        await cambiarEstadoEncuesta(encuestaId, "cerrada");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cerrar la encuesta");
      }
    });
  };

  const handleConfirmarReabrir = () => {
    setError(null);
    if (!nuevaFecha) {
      setError("Por favor selecciona una fecha y hora de cierre.");
      return;
    }

    const fechaObj = new Date(nuevaFecha);
    if (fechaObj <= new Date()) {
      setError("La fecha y hora de cierre debe ser en el futuro.");
      return;
    }

    startTransition(async () => {
      try {
        await cambiarEstadoEncuesta(encuestaId, "activa", nuevaFecha);
        setModalAbierto(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al reabrir la encuesta");
      }
    });
  };

  return (
    <>
      <div className="flex items-center gap-2">
        {estaCerrada ? (
          <Button
            type="button"
            variant="default"
            size="sm"
            disabled={isPending}
            onClick={() => {
              setError(null);
              setModalAbierto(true);
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm"
          >
            <Unlock className="mr-1.5 h-3.5 w-3.5" />
            Reabrir encuesta
          </Button>
        ) : (
          <Button
            type="button"
            variant="destructive"
            size="sm"
            disabled={isPending}
            onClick={handleCerrarAhora}
            className="shadow-sm"
          >
            <Lock className="mr-1.5 h-3.5 w-3.5" />
            {isPending ? "Cerrando..." : "Cerrar encuesta ahora"}
          </Button>
        )}

        {error && !modalAbierto && (
          <span className="text-xs text-red-500 font-medium">{error}</span>
        )}
      </div>

      {/* Modal interactivo para reabrir y elegir nueva fecha/reloj */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-in fade-in-30">
          <div className="relative w-full max-w-2xl rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl animate-in zoom-in-95">
            {/* Cabecera del modal */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Reabrir Encuesta
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Establece una nueva fecha y hora de cierre para permitir que los estudiantes respondan.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalAbierto(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Selector de fecha y reloj */}
            <div className="my-5 space-y-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Nueva fecha y hora de cierre programada:
              </label>

              <FechaHoraPicker
                value={nuevaFecha}
                onChange={(val) => {
                  setNuevaFecha(val);
                  setError(null);
                }}
              />

              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-600">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            {/* Acciones */}
            <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalAbierto(false)}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleConfirmarReabrir}
                disabled={isPending}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
              >
                {isPending ? "Reabriendo..." : "Confirmar y Reabrir Encuesta"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
