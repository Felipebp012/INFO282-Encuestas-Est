import Link from "next/link";
import { eliminarEncuesta } from "@/features/encuestas/actions/encuesta.actions";
import { obtenerEncuestas } from "@/lib/api/encuestas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function EncuestasPage() {
  const encuestas = await obtenerEncuestas();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Mis encuestas</h1>
        <Link href="/encuestas/nueva">
          <Button>Nueva encuesta</Button>
        </Link>
      </div>

      {encuestas.length === 0 ? (
        <p className="text-sm text-slate-500">
          Todavía no has creado ninguna encuesta. Empieza con la primera.
        </p>
      ) : (
        <div className="space-y-4">
          {encuestas.map((encuesta) => (
            <Card key={encuesta.id} className="transition-shadow hover:shadow-md">
              <Link href={`/encuestas/${encuesta.id}`}>
                <CardHeader>
                  <CardTitle>{encuesta.titulo}</CardTitle>
                </CardHeader>
              </Link>
              <CardContent className="flex items-center justify-between text-sm text-slate-500">
                <span>{encuesta.preguntas.length} preguntas</span>
                <div className="flex items-center gap-3">
                  <Link
                    href={`/encuestas/${encuesta.id}/editar`}
                    className="text-slate-700 hover:underline"
                  >
                    Editar
                  </Link>
                  <form action={eliminarEncuesta}>
                    <input type="hidden" name="id" value={encuesta.id} />
                    <Button type="submit" variant="ghost" className="px-0 text-red-600">
                      Eliminar
                    </Button>
                  </form>
                  <span>
                    {new Date(encuesta.creadoEn).toLocaleDateString("es-CL")}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
