import Link from "next/link";
import { notFound } from "next/navigation";
import { obtenerEncuesta } from "@/lib/actions/encuestas";
import { listarParticipantes } from "@/lib/actions/participantes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ParticipantesUploadForm } from "@/components/participantes-upload-form";

export default async function ParticipantesPage({
  params,
}: {
  params: { id: string };
}) {
  const encuesta = await obtenerEncuesta(params.id);
  if (!encuesta) notFound();

  const participantes = await listarParticipantes(params.id);

  return (
    <div className="space-y-6">
      <Link
        href={`/encuestas/${encuesta.id}`}
        className="text-sm text-slate-500 hover:underline"
      >
        ← Volver a la encuesta
      </Link>
      <h1 className="text-2xl font-semibold">Participantes: {encuesta.titulo}</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Importar listado (CSV)</CardTitle>
        </CardHeader>
        <CardContent>
          <ParticipantesUploadForm encuestaId={encuesta.id} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Habilitados ({participantes.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {participantes.length === 0 ? (
            <p className="text-sm text-slate-500">Todavía no has importado a nadie.</p>
          ) : (
            participantes.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between border-b py-2 text-sm last:border-none"
              >
                <span>{p.email}</span>
                <span className={p.respondido ? "text-emerald-600" : "text-slate-400"}>
                  {p.respondido ? "Respondió" : "Pendiente"}
                </span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
