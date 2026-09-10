# Plataforma de Encuestas — Base mínima

Base para que **tú** sigas construyendo — no una implementación completa.
Trae funcionando solo 6 historias de usuario puntuales, más la plomería
mínima que necesitaban (login básico, crear encuesta sin plantillas). El
modelo de datos completo del proyecto está en `prisma/schema.prisma`, listo
para que construyas el resto encima sin rediseñar nada.

📖 Lee primero:
- **`docs/PROGRESO.md`** — qué funciona, qué no, y dónde vive cada cosa
- **`docs/DECISIONES.md`** — qué se sacó a propósito y por qué
- **`docs/MODELO_DATOS.md`** — el modelo de datos completo (fuente de verdad)

## Stack
Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui (Radix +
CVA) + Zod + Auth.js (NextAuth) + Prisma + **PostgreSQL vía Docker**.

## Cómo correrlo

1. Levantar Postgres:
   ```
   docker compose up -d
   ```

2. Instalar dependencias:
   ```
   npm install
   ```

3. Crear las tablas:
   ```
   npx prisma migrate dev --name init
   ```

4. Sembrar datos de prueba:
   ```
   npm run seed
   ```

5. Levantar el servidor:
   ```
   npm run dev
   ```

6. Abrir http://localhost:3000

## Usuarios de prueba

| Correo | Contraseña |
|---|---|
| docente@demo.cl | docente123 |
| estudiante@demo.cl | estudiante123 |

El seed ya deja creada la encuesta **"Satisfacción POO 2026-1"**, con
preguntas que ejercitan los 5 tipos (HU-0501), una condicional (HU-0502) y
valores numéricos en escala/sí-no (HU-0503), y al estudiante de prueba ya
habilitado para responderla (HU-0201).

## Flujo para probar

1. Entra como **docente** → `/encuestas` → entra a la encuesta de ejemplo.
2. Copia el enlace `/responder/<id>` (se ve en la URL del detalle).
3. Cierra sesión, entra como **estudiante**, abre ese enlace y respóndela
   — vas a ver la pregunta condicional aparecer solo si respondes "No" a
   la primera.
4. Intenta entrar de nuevo a responder la misma encuesta con el mismo
   estudiante — el sistema debe bloquear el reenvío (HU-0203).
5. Vuelve como docente → `/encuestas/<id>/participantes` → sube un CSV
   con columnas `email,rut` para agregar más gente habilitada (HU-0202).

## Ver la base de datos directamente
```
npx prisma studio
```

## Detener/reiniciar Postgres
```
docker compose down          # detiene, conserva los datos
docker compose down -v       # detiene y borra los datos (empezar de cero)
```

## Estructura
```
docker-compose.yml            Postgres 16 local
docs/
  MODELO_DATOS.md             Modelo de datos completo (fuente de verdad)
  PROGRESO.md                  Qué funciona y qué no
  DECISIONES.md                 Simplificaciones deliberadas
prisma/
  schema.prisma               TODAS las tablas del modelo (solo una fracción tiene código de app)
  seed.ts                      Usuarios de prueba + encuesta de ejemplo
src/
  middleware.ts                Protege /encuestas y /responder
  lib/
    auth.ts                    Login básico (email + contraseña, sin roles)
    tipos-pregunta.ts           Tipos de pregunta y valores por defecto (HU-0501/0503)
    actions/
      encuestas.ts              Crear/listar/ver encuesta (mínimo)
      participantes.ts           Importar CSV + verificar habilitación (HU-0201/0202)
      respuestas.ts               Envío anónimo + una sola vez (HU-0203/0301)
  app/
    login/
    encuestas/                   Mis encuestas, nueva, [id], [id]/participantes
    responder/[id]/              Flujo del estudiante (HU-0201/0203/0502)
  components/
    encuesta-form.tsx            Constructor: tipos, condicional, valor numérico
    responder-client.tsx          Formulario dinámico del estudiante
    participantes-upload-form.tsx  Subida de CSV
```

## Notas de seguridad
- `next@14.2.35` incluye los parches críticos de diciembre 2025; revisa si
  hay una versión más nueva antes de desplegar en producción.
- `NEXTAUTH_SECRET` en `.env` es un valor de ejemplo — genera uno real
  (`openssl rand -base64 32`) antes de cualquier despliegue público.
- Las credenciales de Postgres en `docker-compose.yml`/`.env`
  (`survey`/`survey`) son solo para desarrollo local.
