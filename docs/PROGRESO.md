# Progreso

> Esta es una **base mínima**, no una implementación completa del proyecto.
> El modelo de datos (`docs/MODELO_DATOS.md`) está completo en
> `prisma/schema.prisma` — el resto de las historias de usuario se
> construyen tú mismo sobre esa base, tabla por tabla, cuando corresponda.

## Historias con código funcional

| HU | Descripción | Dónde vive |
|---|---|---|
| HU-0201 | Verificar que quien responde pertenece al grupo objetivo | `src/app/responder/[id]/page.tsx` (`verificarParticipante`) |
| HU-0202 | Importar listado CSV de estudiantes habilitados | `src/lib/actions/participantes.ts`, `src/app/encuestas/[id]/participantes/` |
| HU-0203 | Una sola respuesta por estudiante | `src/lib/actions/respuestas.ts` |
| HU-0501 | Tipos de pregunta (escala, única, múltiple, texto, sí/no) | `src/lib/tipos-pregunta.ts`, `src/components/encuesta-form.tsx` |
| HU-0502 | Lógica condicional entre preguntas | `src/components/encuesta-form.tsx` (definir), `src/components/responder-client.tsx` (evaluar en vivo) |
| HU-0503 | Valor numérico por opción (escala/sí-no) | `prisma/schema.prisma` (`OpcionRespuesta.valorNumerico`), `src/components/encuesta-form.tsx` |

**HU-0301 (anonimato)** también quedó aplicada, aunque no es una pantalla:
`Respuesta` nunca tiene una FK hacia identidad — ver el comentario en
`src/lib/actions/respuestas.ts`.

## Plomería mínima agregada para que las 6 de arriba funcionen
- **Login básico** (`src/lib/auth.ts`): email + contraseña contra `Usuario`.
  Sin roles ni permisos (eso es HU-0101, no está en este recorte).
- **Crear encuesta mínima** (`src/lib/actions/encuestas.ts` + `src/app/encuestas/nueva/`):
  título, asignatura, fecha de cierre, mensaje de cierre, preguntas. Sin
  plantillas (HU-0401/0402), sin estados borrador/activa/cerrada
  (HU-0701-0704) — toda encuesta nace "activa".
- **Listado y detalle mínimos** (`src/app/encuestas/`): solo para navegar
  y probar lo de arriba — no hay panel de resultados, comentarios,
  distribución con QR, ni exportación.

## Todo lo demás: modelo listo, sin código de aplicación
Las ~30 tablas de `docs/MODELO_DATOS.md` están en `prisma/schema.prisma`
completas y con sus relaciones — pero sin ningún server action ni pantalla
que las use todavía. Entre las más relevantes para lo que sigue:

- `Rol`, `Permiso`, `RolPermiso`, `UsuarioRol` → HU-0101/0102
- `Plantilla`, `PlantillaPregunta`, `PlantillaOpcion`, `PlantillaCompartida` → HU-0401/0402
- `Curso`, `SeccionCurso`, `SeccionCursoAlumno` → modo "cursos" de participación
- `UnidadOrganizacionalUsuario`, `EncuestaParticipanteUnidad` → modo "unidad"
- `EncuestaComentario` → HU-0709
- `CodigoQr` → HU-0601
- `ApiToken`, `TokenPermiso` → HU-0901/0902
- `ConfiguracionPlataforma` → HU-0302 (umbral de participación)

Cuando construyas sobre cualquiera de estas, el patrón a seguir es el mismo
que ya ves en `src/lib/actions/`: un archivo por dominio, funciones
`async function` con `"use server"`, validación con Zod donde hay un
formulario de por medio.

## Cómo probarlo
1. `docker compose up -d`
2. `npm install`
3. `npx prisma migrate dev --name init`
4. `npm run seed`
5. `npm run dev`
6. Entra como `docente@demo.cl / docente123` → ya hay una encuesta de
   ejemplo ("Satisfacción POO 2026-1") que ejercita los 5 tipos de
   pregunta, una condición y valores numéricos.
7. Entra como `estudiante@demo.cl / estudiante123` → ve a
   `/responder/<id-de-la-encuesta>` y respóndela.
