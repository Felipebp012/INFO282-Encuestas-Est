-- CreateTable
CREATE TABLE "Encuesta" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "titulo" TEXT NOT NULL,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Pregunta" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "texto" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "orden" INTEGER NOT NULL,
    "encuestaId" TEXT NOT NULL,
    CONSTRAINT "Pregunta_encuestaId_fkey" FOREIGN KEY ("encuestaId") REFERENCES "Encuesta" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
