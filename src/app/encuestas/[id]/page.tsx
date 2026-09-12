import { notFound } from "next/navigation";
import Link from "next/link";
import { obtenerEncuesta } from "@/lib/actions/encuestas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { BotonCambiarEstado } from "@/components/boton-cambiar-estado";

const ETIQUETA_TIPO: Record<string, string> = {
  texto_libre: "Texto abierto",
  opcion_unica: "Selección única",
  opcion_multiple: "Selección múltiple",
  escala: "Escala",
  si_no: "Sí / No",
};

export default async function DetalleEncuestaPage({
  params,
}: {
  params: { id: string };
}) {
  const encuesta = await obtenerEncuesta(params.id);
  if (!encuesta) notFound();

  const cerradaManualmente = encuesta.estado === "cerrada";
  const fechaFinPasada = encuesta.fechaFin ? new Date() > new Date(encuesta.fechaFin) : false;
  const estaCerrada = cerradaManualmente || fechaFinPasada;

  const fechaCierreTexto = encuesta.fechaFin
    ? new Date(encuesta.fechaFin).toLocaleDateString("es-CL", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <div className="space-y-8">
      <Link href="/encuestas" className="text-sm text-slate-500 hover:underline">
        ← Volver a mis encuestas
      </Link>

      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold">{encuesta.titulo}</h1>
          {estaCerrada ? (
            <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">
              {cerradaManualmente ? "Cerrada manualmente" : "Cerrada (expiró)"}
            </span>
          ) : (
            <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
              Activa
            </span>
          )}
        </div>
        <p className="text-sm text-slate-500">
          {encuesta.asignatura ?? "Sin asignatura"} · {encuesta._count.respuestas}{" "}
          respuestas / {encuesta._count.participantesLibre} habilitados
        </p>
        {fechaCierreTexto && (
          <p className={`text-xs mt-1 ${estaCerrada ? "text-red-500" : "text-slate-400"}`}>
            {fechaFinPasada ? "Fecha de cierre vencida:" : "Cierre programado:"} {fechaCierreTexto}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Link href={`/encuestas/${encuesta.id}/participantes`}>
          <Button variant="outline">
            Participantes ({encuesta._count.participantesLibre})
          </Button>
        </Link>
        <Link href={`/responder/${encuesta.id}`}>
          <Button variant="outline">Ir a responder (para probar)</Button>
        </Link>
        <BotonCambiarEstado
          encuestaId={encuesta.id}
          estadoActual={encuesta.estado}
          fechaFin={encuesta.fechaFin}
        />
      </div>


      <Card>
        <CardHeader>
          <CardTitle className="text-base">Preguntas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {encuesta.preguntas.map((p, i) => (
            <div key={p.id} className="text-sm text-slate-600">
              <p>
                {i + 1}. {p.texto}{" "}
                <span className="text-xs text-slate-400">({ETIQUETA_TIPO[p.tipo]})</span>
                {p.mostrarSiPreguntaId && (() => {
                  let label = "condicional";
                  if (p.mostrarSiPreguntaId.startsWith("{")) {
                    try {
                      const parsed = JSON.parse(p.mostrarSiPreguntaId);
                      if (parsed.reglas?.length > 1) {
                        label = `${parsed.reglas.length} condiciones (${parsed.operador})`;
                      }
                    } catch { /* legacy format */ }
                  }
                  return (
                    <span className="ml-1 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
                      🔀 {label}
                    </span>
                  );
                })()}
              </p>
              {p.opciones.length > 0 && (
                <ul className="pl-4 text-xs text-slate-400">
                  {p.opciones.map((o) => (
                    <li key={o.id}>
                      {o.texto}
                      {o.valorNumerico !== null && ` (valor: ${o.valorNumerico})`}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <p className="text-xs text-slate-400">
        Esta es una base mínima (ver docs/PROGRESO.md): no hay panel de
        resultados, estados borrador/activa/cerrada, ni distribución con QR
        todavía — la encuesta queda "activa" desde que se crea, y el enlace
        para responder es directamente <code>/responder/{encuesta.id}</code>.
      </p>
    </div>
  );
}
