# Plataforma de Encuestas — frontend, backend y PostgreSQL

## Qué incluye
- `/encuestas` — Mis encuestas: lista de las encuestas guardadas
- `/encuestas/nueva` — Crear encuesta: título + preguntas dinámicas (escala, selección única con respuestas editables, texto abierto)
- `/encuestas/[id]` — Detalle: ver las preguntas de una encuesta ya guardada

## Arquitectura Docker

La aplicación se ejecuta en tres servicios:

- `grupo9_frontend`: Next.js publicado en el puerto `3009`.
- `grupo9_backend`: API HTTP y Prisma publicada en el puerto `4009`.
- `grupo9_bdd`: PostgreSQL publicado en el puerto `5439`.

El frontend se comunica con el backend mediante HTTP. Solo el backend se conecta directamente a PostgreSQL.

## Requisitos
- Node.js 18 o superior

## Cómo correrlo

1. Instalar dependencias:
   ```
   npm install
   ```

2. Configurar el backend local. Crea un archivo `.env` en la raíz:
   ```
   BACKEND_URL="http://localhost:4009"
   ```

3. Levantar los tres servicios con Docker:
   ```
  docker compose up --build
   ```

  El backend aplica automáticamente las migraciones PostgreSQL al iniciar.

4. Levantar el servidor de desarrollo:
   ```
   npm run dev
   ```

5. Abrir http://localhost:3009 — te va a redirigir a `/encuestas`.

## Ver la base de datos directamente (opcional)
```
npx prisma studio
```
Abre una interfaz web para mirar/editar las filas guardadas.

## Estructura
```
  app/                            Rutas Next.js
  components/ui/                  Componentes visuales reutilizables
  features/encuestas/             UI, tipos, esquemas y acciones del frontend
  lib/api/                        Cliente HTTP hacia el backend
backend/
  src/                            API, repositorio y conexión Prisma
  prisma/                          Modelo y migraciones PostgreSQL
docker-compose.yml                 grupo9_frontend, grupo9_backend, grupo9_bdd
```

## Nota sobre seguridad de dependencias
Se fijó `next@14.2.35`, que incluye los parches de las vulnerabilidades
críticas reportadas en diciembre de 2025 (RCE y DoS en Server Components).
Antes de desplegar esto en algún servidor real, revisa si hay una versión
más nueva de Next.js disponible.

## Documentación técnica

Consulta [docs/ARQUITECTURA.md](docs/ARQUITECTURA.md) para conocer la estructura de carpetas, los componentes principales, el flujo de datos, los servicios Docker, las variables de entorno y los comandos frecuentes.
