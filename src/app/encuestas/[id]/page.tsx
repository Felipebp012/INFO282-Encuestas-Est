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
            <CardContent className="space-y-2 text-sm text-slate-500">
              <p>{ETIQUETAS_TIPO[pregunta.tipo]}</p>
              {pregunta.tipo === "SELECCION" && pregunta.respuestas.length > 0 && (
                <ul className="space-y-1 text-slate-700">
                  {pregunta.respuestas.map((respuesta) => (
                    <li key={respuesta.id} className="flex items-center gap-2">
                      <span className="h-4 w-4 rounded-full border border-slate-400" />
                      {respuesta.texto}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
