# Arquitectura del Sistema — Plataforma de Encuestas Universitarias

Grupo 9 — Taller de Ingeniería de Software (INFO282)

---

## 1. Resumen y Topología

La plataforma de encuestas está diseñada bajo una topología de servicios orquestada con Docker Compose, garantizando aislamiento, reproducibilidad y compatibilidad tanto en el entorno de despliegue del taller como en entornos locales de desarrollo.

```text
                                        [ Navegador / Cliente ]
                                                   |
                        +--------------------------+--------------------------+
                        | (http://localhost:3009 o                            | (http://localhost:4009 o
                        |  http://grupo9.146.83.216.166.nip.io)               |  http://grupo9.146.83.216.166.nip.io/api)
                        v                                                     v
            +-----------------------+                             +-----------------------+
            |    grupo9_frontend    |                             |    grupo9_backend     |
            |     (Next.js 14)      |                             |   (API Node.js/REST)  |
            |   App Router + Auth   |                             |    Healthcheck + CRUD |
            |    Server Actions     |                             +-----------+-----------+
            +-----------+-----------+                                         |
                        |                                                     |
                        | (Prisma ORM / Conexión directa)                     | (Prisma ORM / DB)
                        +--------------------------+--------------------------+
                                                   |
                                                   v
                                        +-----------------------+
                                        |      grupo9_bdd       |
                                        |     PostgreSQL 16     |
                                        |   Modelo ~30 tablas   |
                                        +-----------------------+
```

---

## 2. Los Dos Entornos de Docker Compose

El proyecto mantiene dos archivos Compose sincronizados para no interferir con los despliegues del curso ni con el trabajo local:

### A. `docker-compose.yml` (Servidor del Taller / Evaluación)
* **Objetivo:** Despliegue en el servidor institucional del curso bajo el dominio asignado al grupo.
* **Red:** Conectado a la red Docker externa preexistente `red_taller_software`.
* **URLs de acceso:**
  * Frontend: `http://grupo9.146.83.216.166.nip.io` (puerto interno `3009`).
  * Backend API: `http://grupo9.146.83.216.166.nip.io/api` (puerto `4009`).
  * Base de datos: `grupo9_bdd:5432` dentro de la red Docker.

### B. `docker-compose.local.yml` (Desarrollo Local Autónomo)
* **Objetivo:** Ejecutar todo el stack en cualquier máquina de desarrollo sin requerir redes externas creadas de antemano.
* **Puertos publicados a localhost:**
  * Frontend: `http://localhost:3009`
  * Backend: `http://localhost:4000` (con `/health`)
  * PostgreSQL: `localhost:5432`
* **Comando de inicio:**
  ```powershell
  docker compose -f docker-compose.local.yml up -d
  ```

---

## 3. Servicios del Sistema

### 3.1. `grupo9_frontend` (Aplicación Principal Web)
* **Tecnología:** Next.js 14.2 (App Router), React 18, TypeScript, Tailwind CSS, shadcn/ui (Radix UI), Zod.
* **Autenticación:** Auth.js (NextAuth) con estrategia de credenciales y sesiones protegidas vía `src/middleware.ts`.
* **Capa de Negocio y Datos:** Utiliza **Server Actions** (`src/lib/actions/`) que se ejecutan en el entorno seguro de Node.js del servidor Next.js, conectándose directamente a PostgreSQL mediante Prisma Client (`src/lib/prisma.ts`). Esto provee:
  * Validación estricta en servidor con esquemas Zod.
  * Respuestas anónimas sin vínculo de llave foránea al estudiante (HU-0301).
  * Control de unicidad de respuesta (HU-0203) y validación de grupo objetivo (HU-0201).
  * Carga y parseo seguro de nóminas CSV con PapaParse (HU-0202).

#### Estructura de Rutas Frontend (`src/app/`):
* `/login`: Inicio de sesión para docentes y estudiantes de prueba.
* `/encuestas`: Panel de encuestas creadas por el usuario autenticado.
* `/encuestas/nueva`: Constructor interactivo de encuestas con soporte para:
  * 5 tipos de preguntas: Escala, Selección única, Selección múltiple, Texto libre y Sí/No (HU-0501).
  * Lógica condicional interactiva entre preguntas (HU-0502).
  * Asignación de valores numéricos a opciones de respuesta (HU-0503).
* `/encuestas/[id]`: Detalle de la encuesta con métricas de respuestas y participantes habilitados.
* `/encuestas/[id]/participantes`: Carga y gestión del listado CSV de estudiantes habilitados (HU-0202).
* `/responder/[id]`: Flujo del estudiante para responder encuestas habilitadas, con evaluación dinámica de saltos condicionales en cliente y envío seguro.

### 3.2. `grupo9_backend` (Microservicio API REST)
* **Tecnología:** Node.js, Prisma Client, Zod.
* **Ubicación del código:** Carpeta `backend/`.
* **Función:** Cumple el rol de microservicio API independiente para la topología multicontenedor del taller.
* **Endpoints expuestos:**
  * `GET /health`: Healthcheck vital para Docker. El contenedor frontend no arranca hasta que este endpoint responda `200 OK`.
  * `GET /encuestas`: Listado general de encuestas vía REST.
  * `GET /encuestas/:id`: Detalle de una encuesta específica por identificador.
  * `POST /encuestas`: Creación de encuestas vía payload JSON.
  * `PUT /encuestas/:id`: Actualización de encuestas.
  * `DELETE /encuestas/:id`: Eliminación de encuestas.

### 3.3. `grupo9_bdd` (Base de Datos Relacional)
* **Motor:** PostgreSQL 16 Alpine.
* **Persistencia:** Volumen Docker gestionado (`grupo9_postgres_data` en servidor, `postgres_data_local` en local).
* **Credenciales configuradas:**
  * Usuario: `admin`
  * Contraseña: `password123`
  * Base de datos: `encuestas_db`
* **Modelo relacional:** Detallado exhaustivamente en `docs/MODELO_DATOS.md` con ~30 tablas definidas en `prisma/schema.prisma`.

---

## 4. Flujo de Datos y Arquitectura de Funcionalidades

```text
[Estudiante / Docente]
         |
         | 1. Formulario interactivo (React Client Component)
         v
[Server Action ("use server")]
         |
         | 2. Validación de sesión (NextAuth) y payload (Zod)
         | 3. Reglas de negocio (Habilitación, unicidad, anonimato)
         v
   [Prisma ORM]
         |
         | 4. Query parametrizada vía pool TCP
         v
[PostgreSQL 16]
```

### Principios clave implementados:
1. **Anonimato por diseño (HU-0301):** La tabla `Respuesta` nunca guarda la llave foránea del usuario ni de la persona. El seguimiento de completitud se registra en tablas de autorización (`EncuestaParticipanteLibre.respondido = true`) de forma desacoplada para imposibilitar la trazabilidad cruzada.
2. **Unicidad de respuesta (HU-0203):** La Server Action `enviarRespuesta` verifica en la misma transacción que el participante esté habilitado y que no figure como respondido antes de insertar la respuesta.
3. **Validación de grupo objetivo (HU-0201 / HU-0202):** La importación por CSV almacena a los estudiantes habilitados por RUT y correo en `EncuestaParticipanteLibre`, validando la pertenencia antes de permitir desplegar el formulario de respuesta.

---

## 5. Comandos de Gestión y Operación

### Levantar en entorno local:
```powershell
docker compose -f docker-compose.local.yml up -d --build
```

### Ejecutar migraciones del modelo completo:
```powershell
npx prisma migrate dev
```

### Sembrar datos iniciales (usuarios y encuesta demo):
```powershell
npm run seed
```

### Ver el estado de los servicios:
```powershell
docker compose -f docker-compose.local.yml ps
```

### Ver registros (logs) del sistema:
```powershell
docker compose -f docker-compose.local.yml logs -f
```

### Detener los servicios conservando los datos:
```powershell
docker compose -f docker-compose.local.yml down
```

### Detener y reiniciar desde cero (borrando datos):
```powershell
docker compose -f docker-compose.local.yml down -v
```
