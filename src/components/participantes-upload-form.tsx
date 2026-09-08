"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { importarParticipantesCsv } from "@/lib/actions/participantes";

// HU-0202 — importar CSV/Excel de estudiantes habilitados. Sprint 1:
// solo CSV con columnas "email,rut" (Excel real queda para después,
// ver docs/PROGRESO.md).
export function ParticipantesUploadForm({ encuestaId }: { encuestaId: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function onFileChange() {
    const archivo = inputRef.current?.files?.[0];
    if (!archivo) return;
    setCargando(true);
    setMensaje(null);
    try {
      const texto = await archivo.text();
      const resultado = await importarParticipantesCsv(encuestaId, texto);
      setMensaje(`${resultado.agregados} participantes cargados/actualizados.`);
    } catch (err) {
      setMensaje(err instanceof Error ? err.message : "Error al importar.");
    } finally {
      setCargando(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        onChange={onFileChange}
        disabled={cargando}
        className="hidden"
      />
      <p className="text-xs text-slate-400">
        Archivo CSV con columnas: <code>email,rut</code>
      </p>
      {mensaje && <p className="text-sm text-slate-600">{mensaje}</p>}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => inputRef.current?.click()}
        disabled={cargando}
      >
        {cargando ? "Cargando..." : "Elegir archivo"}
      </Button>
    </div>
  );
}
