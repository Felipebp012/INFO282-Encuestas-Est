# Decisiones de alcance

> Esta vuelta el criterio cambió respecto a la primera versión: se pidió
> explícitamente una base **mínima** para las 6 historias señaladas
> (HU-0201, HU-0202, HU-0203, HU-0501, HU-0502, HU-0503), no una
> implementación amplia. Lo que sigue son las decisiones tomadas para que
> esas 6 (y la plomería que necesitan) funcionen sin arrastrar features
> de otras historias.

## Docker + PostgreSQL
El proyecto cuenta con dos configuraciones Docker Compose sincronizadas:
- `docker-compose.yml`: para el entorno del servidor del taller (`red_taller_software` externa, subdominio `http://grupo9.146.83.216.166.nip.io`).
- `docker-compose.local.yml`: para desarrollo local independiente (puertos mapeados en `localhost`).

Ambos levantan `postgres:16-alpine` (`grupo9_bdd`) con usuario/clave `admin`/`password123` y base de datos `encuestas_db` (puerto 5432 local / 5439 en red externa).
`prisma/schema.prisma` usa `provider = "postgresql"` y `DATABASE_URL` en `.env` apunta a esta base de datos. Además se conserva el microservicio API `grupo9_backend` (puerto 4000/4009) para responder a healthchecks y requerimientos de API del taller, asegurando que ambos compose levanten siempre de manera sana y coordinada.

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
