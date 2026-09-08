# Documentacion de la plataforma

## 1. Resumen

La plataforma permite crear, consultar, editar y eliminar encuestas. El proyecto esta dividido en tres servicios Docker:

```text
Navegador
   |
   v
grupo9_frontend  Next.js      localhost:3009
   |
   v
grupo9_backend   API Node.js  localhost:4009
   |
   v
grupo9_bdd       PostgreSQL   localhost:5439
```

Dentro de la red Docker, los servicios se comunican usando sus nombres y puertos internos:

- Frontend: `grupo9_frontend:3000`
- Backend: `grupo9_backend:4000`
- Base de datos: `grupo9_bdd:5432`

Los puertos terminados en `9` son los puertos publicados en el computador del usuario.

### Puertos externos e internos

En Docker, la configuracion de puertos usa el formato:

```text
PUERTO_EXTERNO:PUERTO_INTERNO
```

El puerto externo es la puerta de entrada desde el computador del usuario o desde Internet. El puerto interno es el puerto donde realmente escucha la aplicacion dentro de su contenedor.

En este proyecto:

```yaml
"3009:3000" # Frontend: computador -> contenedor
"4009:4000" # Backend: computador -> contenedor
"5439:5432" # PostgreSQL: computador -> contenedor
```

La comunicacion queda asi:

```text
Desde el computador:                 Dentro de Docker:

http://localhost:3009  ----------->  grupo9_frontend:3000
http://localhost:4009  ----------->  grupo9_backend:4000
localhost:5439        ----------->  grupo9_bdd:5432
```

Por eso el navegador usa `http://localhost:3009`, pero el frontend usa esta URL para comunicarse con el backend:

```env
BACKEND_URL=http://grupo9_backend:4000
```

El frontend y el backend se comunican dentro de la red Docker, por lo que usan el nombre del servicio (`grupo9_backend`) y el puerto interno (`4000`). El puerto externo (`4009`) solo se utiliza para acceder al backend desde fuera de Docker.

Los puertos internos pueden mantenerse estandar entre distintos proyectos, porque cada proyecto tiene su propia red Docker. Los puertos externos si deben ser diferentes cuando varias aplicaciones se ejecutan en el mismo servidor.

## 2. Estructura principal

```text
.
├── src/                         Frontend Next.js
│   ├── app/                     Rutas y paginas
│   ├── components/ui/           Componentes visuales reutilizables
│   ├── features/encuestas/      Funcionalidad de encuestas
│   └── lib/api/                 Cliente HTTP hacia el backend
├── backend/                     Backend independiente
│   ├── src/                     API, validacion y persistencia
│   ├── prisma/                  Modelo y migraciones PostgreSQL
│   └── Dockerfile               Imagen del backend
├── prisma/                      Configuracion historica/local anterior
├── docker/                      Dockerfile del frontend
├── docker-compose.yml            Orquestacion de los tres servicios
├── .env                          Variables para ejecucion local
├── .env.docker                  Variables de referencia para Docker
└── .dockerignore                Archivos excluidos de la imagen frontend
```

## 3. Frontend: `src/`

### `src/app/`

Contiene el App Router de Next.js. Sus archivos representan paginas y rutas:

- `layout.tsx`: layout global, metadata y estilos generales.
- `page.tsx`: redirecciona la pagina inicial hacia `/encuestas`.
- `encuestas/page.tsx`: lista las encuestas.
- `encuestas/nueva/page.tsx`: pagina para crear una encuesta.
- `encuestas/[id]/page.tsx`: detalle de una encuesta.
- `encuestas/[id]/editar/page.tsx`: pagina para editar una encuesta.

Las paginas obtienen datos mediante `src/lib/api/encuestas.ts`. No deben conectarse directamente a Prisma.

### `src/components/ui/`

Contiene componentes visuales genericos que pueden reutilizarse en cualquier funcionalidad:

- `button.tsx`: boton con variantes visuales.
- `card.tsx`: tarjeta y sus subcomponentes.
- `input.tsx`: campo de entrada de texto.
- `label.tsx`: etiqueta para formularios.

### `src/features/encuestas/`

Agrupa todo lo especifico de encuestas:

- `components/survey-builder-form.tsx`: formulario interactivo para crear y editar encuestas.
- `actions/encuesta.actions.ts`: Server Actions que reciben formularios y llaman al backend HTTP.
- `schemas/encuesta.schema.ts`: validacion de titulos, preguntas y respuestas con Zod.
- `types/encuesta.types.ts`: tipos TypeScript compartidos por el frontend.

El formulario funciona en el navegador porque usa `use client` y administra su estado con React. Las preguntas y respuestas se pueden reordenar arrastrando sus asas `Grid3X3`. El boton `+` de una pregunta inserta la nueva pregunta inmediatamente debajo de ella. Al agregar una pregunta o respuesta, la pantalla se desplaza suavemente para mostrar el nuevo elemento. Durante el arrastre de preguntas se ocultan las respuestas, se agrega espacio inferior y la pagina se desplaza automaticamente al acercarse a sus bordes. `Ctrl+Z` deshace cambios del constructor, excepto la edicion de texto dentro de los campos, donde conserva el deshacer normal del navegador. Cuando existen tres o mas respuestas, todas muestran la opcion para eliminar, manteniendo siempre un minimo de dos.

### `src/lib/api/`

- `encuestas.ts`: cliente HTTP del frontend.
- Usa `BACKEND_URL` para llamar a los endpoints del backend.
- Define las operaciones `GET`, `POST`, `PUT` y `DELETE` para encuestas.

### `src/lib/`

- `utils.ts`: utilidad `cn` para combinar clases CSS.
- `actions.ts` y `prisma.ts`: fachadas de compatibilidad. El frontend actual usa el cliente HTTP y no Prisma directamente.

## 4. Backend: `backend/`

### `backend/src/server.js`

Es el servidor HTTP de la API. Expone:

```text
GET    /health
GET    /encuestas
GET    /encuestas/:id
POST   /encuestas
PUT    /encuestas/:id
DELETE /encuestas/:id
```

El endpoint `/health` se usa para que Docker confirme que el backend esta funcionando.

### `backend/src/encuestas/schema.js`

Valida los datos recibidos por la API con Zod. Acepta cuatro tipos de pregunta:

- `ESCALA`
- `SELECCION`
- `SELECCION_MULTIPLE`
- `TEXTO`

Las preguntas `SELECCION` y `SELECCION_MULTIPLE` requieren respuestas. La selección única se representa con círculos y la múltiple con casillas cuadradas.

### `backend/src/encuestas/repository.js`

Es la capa que consulta y modifica la base de datos usando Prisma. Contiene las operaciones para:

- Obtener todas las encuestas.
- Obtener una encuesta por id.
- Crear una encuesta con sus preguntas y respuestas.
- Actualizar una encuesta.
- Eliminar una encuesta.

### `backend/src/db/prisma.js`

Crea el cliente Prisma y evita crear multiples conexiones innecesarias durante el desarrollo.

### `backend/prisma/`

- `schema.prisma`: define los modelos `Encuesta`, `Pregunta` y `Respuesta`.
- `migrations/`: contiene la migracion PostgreSQL inicial.
- El backend ejecuta `prisma migrate deploy` al iniciar el contenedor.

## 5. Modelo de datos

```text
Encuesta 1 ---- N Pregunta 1 ---- N Respuesta
```

- Una encuesta tiene muchas preguntas.
- Una pregunta puede tener muchas respuestas.
- Las relaciones usan borrado en cascada.
- Las respuestas se crean solo para preguntas de seleccion.
- `Pregunta.tipo` usa el enum `ESCALA`, `SELECCION`, `SELECCION_MULTIPLE` o `TEXTO`.

## 6. Docker

### `docker-compose.yml`

Orquesta los servicios:

- `grupo9_bdd`: usa `postgres:16-alpine` y conserva los datos en `grupo9_postgres_data`.
- `grupo9_backend`: construye `backend/Dockerfile`, ejecuta migraciones y levanta la API.
- `grupo9_frontend`: construye `docker/app/Dockerfile.dev` y levanta Next.js.

Los `healthcheck` aseguran que:

1. PostgreSQL este listo.
2. El backend pueda iniciar y responder `/health`.
3. El frontend se inicie despues del backend.

### `backend/Dockerfile`

Construye la imagen del backend, instala dependencias, copia Prisma y genera Prisma Client.

### `docker/app/Dockerfile.dev`

Construye la imagen de desarrollo del frontend Next.js.

### `.dockerignore`

Evita copiar archivos innecesarios a la imagen frontend, como `node_modules`, `.next`, `backend` y el Prisma historico de la raiz.

## 7. Variables de entorno

### `.env`

Se usa para ejecucion local del proyecto frontend. Actualmente contiene la base SQLite historica y no se usa para la base PostgreSQL de Docker.

### `.env.docker`

Es un archivo de referencia para variables del entorno Docker. No inicia servicios ni reemplaza a `docker-compose.yml`.

```env
BACKEND_URL="http://localhost:4009"
```

Dentro de Docker, Compose usa esta direccion interna para el frontend:

```env
BACKEND_URL=http://grupo9_backend:4000
```

La diferencia es importante: `localhost` representa el computador del usuario; `grupo9_backend` representa el nombre del contenedor dentro de la red Docker.

## 8. Comandos frecuentes

Iniciar o reconstruir los servicios:

```powershell
docker compose up --build -d
```

Ver estado de los contenedores:

```powershell
docker ps
```

Ver logs:

```powershell
docker compose logs -f
```

Ver logs de un servicio:

```powershell
docker compose logs -f grupo9_backend
```

Detener los servicios sin eliminar el volumen de datos:

```powershell
docker compose down
```

Abrir la aplicacion:

```text
http://localhost:3009
```

Verificar el backend:

```text
http://localhost:4009/health
```

## 9. Flujo para crear una encuesta

1. El usuario completa `SurveyBuilderForm`.
2. El frontend valida datos basicos y crea un `FormData`.
3. La Server Action transforma el formulario a JSON.
4. `src/lib/api/encuestas.ts` envia un `POST /encuestas`.
5. El backend valida nuevamente con Zod.
6. El repository usa Prisma para guardar encuesta, preguntas y respuestas.
7. PostgreSQL persiste la informacion.
8. El backend devuelve la encuesta creada.
9. Next.js invalida la lista y redirige al detalle.

La validacion se realiza en frontend y backend; la del backend es la que protege realmente los datos.

## 10. Recomendaciones

- No publicar credenciales reales en Git.
- Cambiar `POSTGRES_PASSWORD` antes de un despliegue real.
- No eliminar el volumen `grupo9_postgres_data` si se quieren conservar datos.
- Usar `docker compose down` para detener servicios sin borrar el volumen.
- Probar `/health` antes de diagnosticar errores del frontend.
- Mantener Prisma y las migraciones dentro de `backend/`.
