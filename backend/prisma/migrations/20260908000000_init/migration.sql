CREATE TYPE "TipoPregunta" AS ENUM ('ESCALA', 'SELECCION', 'TEXTO');

CREATE TABLE "Encuesta" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Encuesta_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Pregunta" (
    "id" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "tipo" "TipoPregunta" NOT NULL,
    "orden" INTEGER NOT NULL,
    "encuestaId" TEXT NOT NULL,
    CONSTRAINT "Pregunta_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Respuesta" (
    "id" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "orden" INTEGER NOT NULL,
    "preguntaId" TEXT NOT NULL,
    CONSTRAINT "Respuesta_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Pregunta"
ADD CONSTRAINT "Pregunta_encuestaId_fkey"
FOREIGN KEY ("encuestaId") REFERENCES "Encuesta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Respuesta"
ADD CONSTRAINT "Respuesta_preguntaId_fkey"
FOREIGN KEY ("preguntaId") REFERENCES "Pregunta"("id") ON DELETE CASCADE ON UPDATE CASCADE;