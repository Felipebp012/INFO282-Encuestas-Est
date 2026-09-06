import { notFound } from "next/navigation";
import Link from "next/link";
import { obtenerEncuesta } from "@/lib/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ETIQUETAS_TIPO: Record<string, string> = {
  ESCALA: "Escala (1-5)",
  SELECCION: "Selección única",
  TEXTO: "Texto abierto",
};

export default async function DetalleEncuestaPage({
  params,
}: {
  params: { id: string };
}) {
  const encuesta = await obtenerEncuesta(params.id);
  if (!encuesta) notFound();

  return (
    <div className="space-y-6">
      <Link href="/encuestas" className="text-sm text-slate-500 hover:underline">
        ← Volver a mis encuestas
      </Link>
      <h1 className="text-2xl font-semibold">{encuesta.titulo}</h1>
      <p className="text-sm text-slate-500">
        Creada el {new Date(encuesta.creadoEn).toLocaleDateString("es-CL")}
      </p>

      <div className="space-y-3">
        {encuesta.preguntas.map((pregunta, index) => (
          <Card key={pregunta.id}>
            <CardHeader>
              <CardTitle className="text-base">
                {index + 1}. {pregunta.texto}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-500">
              {ETIQUETAS_TIPO[pregunta.tipo]}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
