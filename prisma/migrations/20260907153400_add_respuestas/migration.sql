-- CreateTable
CREATE TABLE "Respuesta" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "texto" TEXT NOT NULL,
    "orden" INTEGER NOT NULL,
    "preguntaId" TEXT NOT NULL,
    CONSTRAINT "Respuesta_preguntaId_fkey" FOREIGN KEY ("preguntaId") REFERENCES "Pregunta" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
