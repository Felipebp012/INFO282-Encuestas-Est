import { notFound } from "next/navigation";
import Link from "next/link";
import { SurveyBuilderForm } from "@/components/survey-builder-form";
import { obtenerEncuesta } from "@/lib/actions";

export default async function EditarEncuestaPage({
  params,
}: {
  params: { id: string };
}) {
  const encuesta = await obtenerEncuesta(params.id);
  if (!encuesta) notFound();

  return (
    <div className="space-y-6">
      <Link href={`/encuestas/${encuesta.id}`} className="text-sm text-slate-500 hover:underline">
        ← Volver a la encuesta
      </Link>
      <h1 className="text-2xl font-semibold">Editar encuesta</h1>
      <SurveyBuilderForm
        encuestaId={encuesta.id}
        initialTitulo={encuesta.titulo}
        initialPreguntas={encuesta.preguntas.map(({ texto, tipo, respuestas }) => ({
          texto,
          tipo: tipo as "ESCALA" | "SELECCION" | "TEXTO",
          respuestas: respuestas.map(({ texto }) => texto),
        }))}
      />
    </div>
  );
}