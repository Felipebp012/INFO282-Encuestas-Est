import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Seed mínimo para esta base: sin roles/permisos (HU-0101, fuera de
// alcance) — solo lo necesario para probar HU-0201/0202/0203/0501/0502/0503
// de punta a punta. Ver docs/PROGRESO.md.
async function main() {
  const passwordDocente = "docente123";
  const passwordEstudiante = "estudiante123";

  const usuarioDocente = await prisma.usuario.upsert({
    where: { email: "docente@demo.cl" },
    update: {},
    create: {
      email: "docente@demo.cl",
      nombre: "Docente Demo",
      passwordHash: await bcrypt.hash(passwordDocente, 10),
    },
  });

  const personaEstudiante = await prisma.persona.upsert({
    where: { rut: "11111111-1" },
    update: {},
    create: { rut: "11111111-1", nombre: "Estudiante Demo" },
  });

  await prisma.usuario.upsert({
    where: { email: "estudiante@demo.cl" },
    update: {},
    create: {
      email: "estudiante@demo.cl",
      nombre: "Estudiante Demo",
      passwordHash: await bcrypt.hash(passwordEstudiante, 10),
      personaId: personaEstudiante.id,
    },
  });

  // --- Encuesta de ejemplo: ejercita los 5 tipos de pregunta (HU-0501),
  // una condición (HU-0502) y valores numéricos en escala/sí-no (HU-0503).
  const encuestaDemoExistente = await prisma.encuesta.findFirst({
    where: { titulo: "Satisfacción POO 2026-1" },
  });

  if (!encuestaDemoExistente) {
    const preguntaPrimeraVez = await prisma.pregunta.create({
      data: {
        encuestaId: (
          await prisma.encuesta.create({
            data: {
              titulo: "Satisfacción POO 2026-1",
              asignatura: "Programación Orientada a Objetos",
              usuarioCreadorId: usuarioDocente.id,
              fechaFin: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
              mensajeCierre: "¡Gracias por tu participación!",
            },
          })
        ).id,
        tipo: "si_no",
        texto: "¿Es la primera vez que cursas esta asignatura?",
        orden: 0,
        obligatoria: true,
        opciones: {
          create: [
            { texto: "Sí", orden: 0, valorNumerico: 1 },
            { texto: "No", orden: 1, valorNumerico: 0 },
          ],
        },
      },
      include: { opciones: true },
    });

    const opcionNo = preguntaPrimeraVez.opciones.find((o) => o.texto === "No")!;

    await prisma.pregunta.create({
      data: {
        encuestaId: preguntaPrimeraVez.encuestaId,
        tipo: "escala",
        texto: "¿Qué tan satisfecho/a estás con el desarrollo general de la asignatura?",
        orden: 1,
        obligatoria: true,
        opciones: {
          create: [
            { texto: "Muy insatisfecho", orden: 0, valorNumerico: 1 },
            { texto: "Insatisfecho", orden: 1, valorNumerico: 2 },
            { texto: "Neutral", orden: 2, valorNumerico: 3 },
            { texto: "Satisfecho", orden: 3, valorNumerico: 4 },
            { texto: "Muy satisfecho", orden: 4, valorNumerico: 5 },
          ],
        },
      },
    });

    // HU-0502 — solo se muestra si respondió "No" a la primera pregunta.
    await prisma.pregunta.create({
      data: {
        encuestaId: preguntaPrimeraVez.encuestaId,
        tipo: "texto_libre",
        texto: "Ya que no es tu primera vez: ¿qué cambió respecto a versiones anteriores?",
        orden: 2,
        obligatoria: false,
        mostrarSiPreguntaId: preguntaPrimeraVez.id,
        mostrarSiOpcionId: opcionNo.id,
      },
    });

    await prisma.pregunta.create({
      data: {
        encuestaId: preguntaPrimeraVez.encuestaId,
        tipo: "opcion_multiple",
        texto: "¿Qué aspectos te resultaron más útiles? (elige 1 a 2)",
        orden: 3,
        obligatoria: false,
        minSelecciones: 1,
        maxSelecciones: 2,
        opciones: {
          create: [
            { texto: "Ayudantías", orden: 0 },
            { texto: "Material de apoyo", orden: 1 },
            { texto: "Ejercicios prácticos", orden: 2 },
          ],
        },
      },
    });

    await prisma.encuestaParticipanteLibre.create({
      data: {
        encuestaId: preguntaPrimeraVez.encuestaId,
        email: "estudiante@demo.cl",
        rut: personaEstudiante.rut,
        personaId: personaEstudiante.id,
      },
    });
  }

  console.log("Seed listo:");
  console.log(`  Docente:    docente@demo.cl / ${passwordDocente}`);
  console.log(`  Estudiante: estudiante@demo.cl / ${passwordEstudiante}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
