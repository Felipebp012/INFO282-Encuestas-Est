# Decisiones de alcance

> Esta vuelta el criterio cambió respecto a la primera versión: se pidió
> explícitamente una base **mínima** para las 6 historias señaladas
> (HU-0201, HU-0202, HU-0203, HU-0501, HU-0502, HU-0503), no una
> implementación amplia. Lo que sigue son las decisiones tomadas para que
> esas 6 (y la plomería que necesitan) funcionen sin arrastrar features
> de otras historias.

## Docker + PostgreSQL
`docker-compose.yml` levanta un contenedor `postgres:16` con usuario/clave
`survey`/`survey` y base `survey_app`, mapeado al puerto 5432 local.
`prisma/schema.prisma` usa `provider = "postgresql"` y `DATABASE_URL` en
`.env` ya apunta a ese contenedor. **No pude levantar el contenedor ni
correr las migraciones contra él desde este entorno** (el sandbox donde
trabajo no tiene Docker disponible ni acceso a internet general) — sí
pude verificar que el `schema.prisma` es sintácticamente válido y que
todo el código de TypeScript compila. La primera vez que corras
`docker compose up -d` seguido de `npx prisma migrate dev`, es el momento
en que esto se prueba de verdad por primera vez contra Postgres real.

## Login sin roles (HU-0103, versión mínima)
El modelo de datos completo incluye verificación de correo por token y
lista blanca de dominios (`DominioInstitucional`). Esta base se saltó todo
eso: el login es email + contraseña contra `Usuario`, sembrado
directamente. Tampoco se resuelven roles/permisos en la sesión — cualquier
`Usuario` autenticado puede crear encuestas y responderlas, no hay
distinción de rol todavía. Cuando construyas HU-0101, el lugar natural
para engancharlo es `src/lib/auth.ts` (el `callback session` es donde se
agregarían los roles/permisos a la sesión, tal como estaba en la versión
anterior de este archivo antes de recortarla).

## IDs generados en el client
Para que la lógica condicional (HU-0502) pueda
referenciar preguntas "hermanas" antes de que existan en la base de
datos, el formulario genera los IDs en el navegador
(`crypto.randomUUID()`) y el servidor los usa tal cual al crear las filas.

## Next.js 14.2.35
Se mantiene fijado en esta versión (incluye los parches críticos de
diciembre 2025). `npm audit` sigue marcándolo por el rango amplio del
aviso (9.x-16.x), no porque 14.2.35 en particular tenga cada
vulnerabilidad sin parchar — revisa si hay una versión más nueva antes de
un despliegue real.
