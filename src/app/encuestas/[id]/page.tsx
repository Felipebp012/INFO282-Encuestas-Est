import { notFound } from "next/navigation";
import Link from "next/link";
import { obtenerEncuesta } from "@/lib/actions/encuestas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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

  return (
    <div className="space-y-8">
      <Link href="/encuestas" className="text-sm text-slate-500 hover:underline">
        ← Volver a mis encuestas
      </Link>

      <div>
        <h1 className="text-2xl font-semibold">{encuesta.titulo}</h1>
        <p className="text-sm text-slate-500">
          {encuesta.asignatura ?? "Sin asignatura"} · {encuesta._count.respuestas}{" "}
          respuestas / {encuesta._count.participantesLibre} habilitados
        </p>
      </div>

      <div className="flex gap-2">
        <Link href={`/encuestas/${encuesta.id}/participantes`}>
          <Button variant="outline">
            Participantes ({encuesta._count.participantesLibre})
          </Button>
        </Link>
        <Link href={`/responder/${encuesta.id}`}>
          <Button variant="outline">Ir a responder (para probar)</Button>
        </Link>
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
                {p.mostrarSiPreguntaId && (
                  <span className="text-xs text-slate-400"> · condicional</span>
                )}
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
