"use client";

import { useRouter } from "next/navigation";
import { EncuestaForm } from "@/components/encuesta-form";
import { crearEncuesta } from "@/lib/actions/encuestas";

// Sin selector de plantilla (HU-0401/0402 quedan fuera de esta base) —
// se crea directamente con el constructor (HU-0501/0502/0503).
export default function NuevaEncuestaPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Nueva encuesta</h1>
      <EncuestaForm
        onGuardar={async (draft) => {
          await crearEncuesta(draft);
          router.refresh();
        }}
      />
    </div>
  );
}
