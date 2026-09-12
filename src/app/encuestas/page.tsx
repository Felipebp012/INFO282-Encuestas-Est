import Link from "next/link";
import { listarMisEncuestas } from "@/lib/actions/encuestas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function EncuestasPage() {
  const encuestas = await listarMisEncuestas();

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
          {encuestas.map((encuesta) => {
            const cerradaManualmente = encuesta.estado === "cerrada";
            const fechaFinPasada = encuesta.fechaFin ? new Date() > new Date(encuesta.fechaFin) : false;
            const estaCerrada = cerradaManualmente || fechaFinPasada;

            return (
              <Link key={encuesta.id} href={`/encuestas/${encuesta.id}`}>
                <Card className="transition-shadow hover:shadow-md">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{encuesta.titulo}</CardTitle>
                      {estaCerrada ? (
                        <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">
                          Cerrada
                        </span>
                      ) : (
                        <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                          Activa
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="flex items-center justify-between text-sm text-slate-500">
                    <span>
                      {encuesta._count.respuestas} respuestas ·{" "}
                      {encuesta._count.participantesLibre} habilitados
                    </span>
                    <span>{encuesta.asignatura ?? "Sin asignatura"}</span>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

      )}
    </div>
  );
}
