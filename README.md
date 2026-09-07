# Plataforma de Encuestas — Prototipo local (frontend + persistencia básica)

## Qué incluye
- `/encuestas` — Mis encuestas: lista de las encuestas guardadas
- `/encuestas/nueva` — Crear encuesta: título + preguntas dinámicas (escala, selección única con respuestas editables, texto abierto)
- `/encuestas/[id]` — Detalle: ver las preguntas de una encuesta ya guardada

## Qué NO incluye
- Docker / PostgreSQL — usa SQLite en un archivo local; migrar a Postgres es
  cambiar una línea en `prisma/schema.prisma`

## Requisitos
- Node.js 18 o superior

## Cómo correrlo

1. Instalar dependencias:
   ```
   npm install
   ```

2. Crear la base de datos local (SQLite) y generar el cliente de Prisma:
   ```
   npx prisma migrate dev --name init
   ```
   Esto crea el archivo `prisma/dev.db` con las tablas `Encuesta`, `Pregunta` y `Respuesta`.

3. Levantar el servidor de desarrollo:
   ```
   npm run dev
   ```

4. Abrir http://localhost:3000 — te va a redirigir a `/encuestas`.

## Ver la base de datos directamente (opcional)
```
npx prisma studio
```
Abre una interfaz web para mirar/editar las filas guardadas.

## Migrar a PostgreSQL más adelante
En `prisma/schema.prisma`, cambiar:
```
provider = "sqlite"
```
por:
```
provider = "postgresql"
```
y actualizar `DATABASE_URL` en `.env` con la cadena de conexión real
(ej. la que entregue el contenedor Docker cuando lo agreguen). Después,
correr `npx prisma migrate dev` de nuevo para recrear las tablas en Postgres.

## Estructura
```
src/
  app/
    encuestas/page.tsx           Mis encuestas
    encuestas/nueva/page.tsx     Crear encuesta
    encuestas/[id]/page.tsx      Detalle de una encuesta
  components/
    survey-builder-form.tsx      Formulario dinámico de preguntas y respuestas (client component)
    ui/                          Button, Input, Label, Card (estilo shadcn, escritos a mano)
  lib/
    prisma.ts                    Cliente de Prisma
    actions.ts                   Server Actions: crearEncuesta, obtenerEncuestas, obtenerEncuesta
prisma/schema.prisma             Modelo de datos: Encuesta, Pregunta, Respuesta
```

## Nota sobre seguridad de dependencias
Se fijó `next@14.2.35`, que incluye los parches de las vulnerabilidades
críticas reportadas en diciembre de 2025 (RCE y DoS en Server Components).
Antes de desplegar esto en algún servidor real, revisa si hay una versión
más nueva de Next.js disponible.
