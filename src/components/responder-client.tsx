"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { enviarRespuesta } from "@/lib/actions/respuestas";
import {
  deserializarCondiciones,
  evaluarCondiciones,
} from "@/components/condicion-builder";

interface Opcion {
  id: string;
  texto: string;
}

interface Pregunta {
  id: string;
  tipo: string;
  texto: string;
  obligatoria: boolean;
  minSelecciones: number | null;
  maxSelecciones: number | null;
  mostrarSiPreguntaId: string | null;
  mostrarSiOpcionId: string | null;
  opciones: Opcion[];
}

interface RespuestaLocal {
  valorTexto?: string;
  opcionIds?: string[];
}

export function ResponderClient({
  encuestaId,
  titulo,
  mensajeCierre,
  email,
  preguntas,
}: {
  encuestaId: string;
  titulo: string;
  mensajeCierre: string | null;
  email: string;
  preguntas: Pregunta[];
}) {
  const [respuestas, setRespuestas] = useState<Record<string, RespuestaLocal>>({});
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  // HU-0502 — visibilidad en vivo según la lógica condicional configurada
  // por el docente. Soporta formato legacy (CUID simple) y nuevo (JSON múltiple).
  const visibles = useMemo(() => {
    return preguntas.filter((p) => {
      if (!p.mostrarSiPreguntaId) return true;

      const condiciones = deserializarCondiciones(
        p.mostrarSiPreguntaId,
        p.mostrarSiOpcionId
      );
      if (!condiciones || condiciones.reglas.length === 0) return true;

      return evaluarCondiciones(condiciones, respuestas);
    });
  }, [preguntas, respuestas]);

  function setValorTexto(preguntaId: string, valor: string) {
    setRespuestas((prev) => ({ ...prev, [preguntaId]: { valorTexto: valor } }));
  }

  function setUnicaOpcion(preguntaId: string, opcionId: string) {
    setRespuestas((prev) => ({ ...prev, [preguntaId]: { opcionIds: [opcionId] } }));
  }

  function toggleOpcionMultiple(preguntaId: string, opcionId: string, max: number | null) {
    setRespuestas((prev) => {
      const actuales = prev[preguntaId]?.opcionIds ?? [];
      const yaMarcada = actuales.includes(opcionId);
      let nuevas: string[];
      if (yaMarcada) {
        nuevas = actuales.filter((id) => id !== opcionId);
      } else {
        if (max && actuales.length >= max) return prev;
        nuevas = [...actuales, opcionId];
      }
      return { ...prev, [preguntaId]: { opcionIds: nuevas } };
    });
  }

  async function onSubmit() {
    setError(null);

    for (const p of visibles) {
      if (!p.obligatoria) continue;
      const r = respuestas[p.id];
      if (p.tipo === "texto_libre" && !r?.valorTexto?.trim()) {
        return setError(`Falta responder: "${p.texto}"`);
      }
      if (p.tipo !== "texto_libre" && (!r?.opcionIds || r.opcionIds.length === 0)) {
        return setError(`Falta responder: "${p.texto}"`);
      }
      if (p.tipo === "opcion_multiple" && p.minSelecciones && (r?.opcionIds?.length ?? 0) < p.minSelecciones) {
        return setError(`"${p.texto}" requiere al menos ${p.minSelecciones} opciones.`);
      }
    }

    setEnviando(true);
    try {
      await enviarRespuesta(
        encuestaId,
        email,
        visibles.map((p) => ({
          preguntaId: p.id,
          valorTexto: respuestas[p.id]?.valorTexto,
          opcionIds: respuestas[p.id]?.opcionIds,
        }))
      );
      setEnviado(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo enviar tu respuesta.");
      setEnviando(false);
    }
  }

  if (enviado) {
    return (
      <div className="mx-auto mt-16 max-w-md space-y-3 text-center">
        <h1 className="text-xl font-semibold">¡Respuesta enviada!</h1>
        <p className="text-sm text-slate-500">
          {mensajeCierre || "Gracias por tu participación."}
        </p>
        <p className="text-xs text-slate-400">
          Tu respuesta se guardó de forma anónima — no queda ningún registro
          que conecte tu identidad con lo que respondiste.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold">{titulo}</h1>
        <p className="text-xs text-slate-400">Tus respuestas son 100% anónimas.</p>
      </div>

      <div className="space-y-6">
        {visibles.map((p, i) => (
          <div key={p.id} className="space-y-2">
            <p className="text-sm font-medium">
              {i + 1}. {p.texto} {p.obligatoria && <span className="text-red-500">*</span>}
            </p>

            {p.tipo === "texto_libre" && (
              <Textarea
                value={respuestas[p.id]?.valorTexto ?? ""}
                onChange={(e) => setValorTexto(p.id, e.target.value)}
              />
            )}

            {(p.tipo === "opcion_unica" || p.tipo === "escala" || p.tipo === "si_no") && (
              <div className="space-y-1">
                {p.opciones.map((o) => (
                  <label key={o.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name={p.id}
                      checked={respuestas[p.id]?.opcionIds?.[0] === o.id}
                      onChange={() => setUnicaOpcion(p.id, o.id)}
                    />
                    {o.texto}
                  </label>
                ))}
              </div>
            )}

            {p.tipo === "opcion_multiple" && (
              <div className="space-y-1">
                {p.opciones.map((o) => (
                  <label key={o.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={respuestas[p.id]?.opcionIds?.includes(o.id) ?? false}
                      onChange={() => toggleOpcionMultiple(p.id, o.id, p.maxSelecciones)}
                    />
                    {o.texto}
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button onClick={onSubmit} disabled={enviando} className="w-full">
        {enviando ? "Enviando..." : "Enviar respuesta"}
      </Button>
    </div>
  );
}
