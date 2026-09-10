# Modelo de datos — Plataforma de Encuestas Universitarias

## 1. Diagrama entidad-relación

Copia el bloque de abajo y envuélvelo entre ```` ```mermaid ```` y ```` ``` ```` en tu editor (GitHub, Notion, Obsidian, etc.) para que se renderice como diagrama. Aquí se deja en texto plano para que se pueda copiar sin problemas.

```
erDiagram
  USUARIO ||--o{ USUARIO_ROL : tiene
  ROL ||--o{ USUARIO_ROL : asignado_a
  UNIDAD_ORGANIZACIONAL ||--o{ USUARIO_ROL : alcance
  UNIDAD_ORGANIZACIONAL |o--o{ UNIDAD_ORGANIZACIONAL : subunidad_de
  ROL ||--o{ ROL_PERMISO : otorga
  PERMISO ||--o{ ROL_PERMISO : concedido_en
  ROL ||--o{ DOMINIO_INSTITUCIONAL : predetermina
  PERSONA |o--o{ USUARIO : identifica

  USUARIO ||--o{ PLANTILLA : crea
  USUARIO ||--o{ ENCUESTA : crea
  PLANTILLA |o--o{ ENCUESTA : origina
  PLANTILLA ||--o{ PLANTILLA_PREGUNTA : contiene
  PLANTILLA_PREGUNTA ||--o{ PLANTILLA_OPCION : ofrece
  PLANTILLA ||--o{ PLANTILLA_COMPARTIDA : comparte
  USUARIO ||--o{ PLANTILLA_COMPARTIDA : recibe

  UNIDAD_ORGANIZACIONAL |o--o{ CURSO : contiene
  CURSO ||--o{ SECCION_CURSO : tiene
  SECCION_CURSO ||--o{ SECCION_CURSO_ALUMNO : matricula
  PERSONA ||--o{ SECCION_CURSO_ALUMNO : identifica
  UNIDAD_ORGANIZACIONAL ||--o{ UNIDAD_ORGANIZACIONAL_USUARIO : incluye
  PERSONA ||--o{ UNIDAD_ORGANIZACIONAL_USUARIO : identifica

  ENCUESTA ||--o{ ENCUESTA_SECCION_CURSO : incluye
  SECCION_CURSO ||--o{ ENCUESTA_SECCION_CURSO : incluida_en
  ENCUESTA ||--o{ ENCUESTA_UNIDAD_ORGANIZACIONAL : incluye
  UNIDAD_ORGANIZACIONAL ||--o{ ENCUESTA_UNIDAD_ORGANIZACIONAL : incluida_en

  ENCUESTA ||--o{ ENCUESTA_PARTICIPANTE : autoriza
  SECCION_CURSO_ALUMNO ||--o{ ENCUESTA_PARTICIPANTE : participa
  ENCUESTA ||--o{ ENCUESTA_PARTICIPANTE_UNIDAD : autoriza
  UNIDAD_ORGANIZACIONAL_USUARIO ||--o{ ENCUESTA_PARTICIPANTE_UNIDAD : participa
  ENCUESTA ||--o{ ENCUESTA_PARTICIPANTE_LIBRE : autoriza
  PERSONA |o--o{ ENCUESTA_PARTICIPANTE_LIBRE : identifica

  ENCUESTA ||--o{ ENCUESTA_COMENTARIO : tiene
  USUARIO ||--o{ ENCUESTA_COMENTARIO : escribe

  ENCUESTA ||--o{ PREGUNTA : contiene
  PLANTILLA_PREGUNTA |o--o{ PREGUNTA : origina
  PREGUNTA ||--o{ OPCION_RESPUESTA : ofrece
  ENCUESTA ||--o{ RESPUESTA : recibe
  RESPUESTA ||--o{ RESPUESTA_DETALLE : detalla
  PREGUNTA ||--o{ RESPUESTA_DETALLE : responde
  OPCION_RESPUESTA |o--o{ RESPUESTA_DETALLE : selecciona
  ENCUESTA ||--o{ CODIGO_QR : distribuye

  USUARIO ||--o{ API_TOKEN : posee
  API_TOKEN ||--o{ TOKEN_PERMISO : limita_a
  PERMISO ||--o{ TOKEN_PERMISO : concedido_en

  USUARIO ||--o{ CONFIGURACION_PLATAFORMA : actualiza

  PERSONA {
    int id PK
    string rut
    string nombre
    timestamp fecha_creacion
  }
  USUARIO {
    int id PK
    int persona_id FK
    string nombre
    string email
    boolean email_verificado
    string password_hash
    string token_verificacion
    timestamp token_expiracion
  }
  DOMINIO_INSTITUCIONAL {
    int id PK
    string dominio
    int rol_predeterminado_id FK
  }
  ROL {
    int id PK
    string nombre
    string descripcion
    boolean es_predeterminado
  }
  PERMISO {
    int id PK
    string codigo
    string descripcion
    string categoria
  }
  ROL_PERMISO {
    int rol_id FK
    int permiso_id FK
  }
  USUARIO_ROL {
    int usuario_id FK
    int rol_id FK
    int unidad_organizacional_id FK
    timestamp fecha_asignacion
  }
  UNIDAD_ORGANIZACIONAL {
    int id PK
    string nombre
    string tipo
    int unidad_padre_id FK
  }
  PLANTILLA {
    int id PK
    int usuario_creador_id FK
    string nombre
    string categoria
    int version
    string estado
  }
  PLANTILLA_PREGUNTA {
    int id PK
    int plantilla_id FK
    string tipo
    string texto
    int orden
    boolean obligatoria
    int min_selecciones
    int max_selecciones
  }
  PLANTILLA_OPCION {
    int id PK
    int plantilla_pregunta_id FK
    string texto
    int orden
  }
  PLANTILLA_COMPARTIDA {
    int plantilla_id FK
    int usuario_id FK
    timestamp fecha_compartido
  }
  CURSO {
    int id PK
    int unidad_organizacional_id FK
    string codigo
    string nombre
    boolean activo
  }
  SECCION_CURSO {
    int id PK
    int curso_id FK
    int anio
    int semestre
    string grupo
  }
  SECCION_CURSO_ALUMNO {
    int id PK
    int seccion_curso_id FK
    int persona_id FK
    string email
    string rut
    boolean activo
    timestamp fecha_alta
    timestamp fecha_baja
  }
  UNIDAD_ORGANIZACIONAL_USUARIO {
    int id PK
    int unidad_organizacional_id FK
    int persona_id FK
    string email
    string rut
    string tipo
    boolean activo
    timestamp fecha_alta
    timestamp fecha_baja
  }
  ENCUESTA_SECCION_CURSO {
    int encuesta_id FK
    int seccion_curso_id FK
  }
  ENCUESTA_UNIDAD_ORGANIZACIONAL {
    int encuesta_id FK
    int unidad_organizacional_id FK
  }
  ENCUESTA {
    int id PK
    int plantilla_id FK
    int usuario_creador_id FK
    string modo
    string unidad
    string titulo
    date fecha_inicio
    date fecha_fin
    string estado
  }
  ENCUESTA_PARTICIPANTE {
    int id PK
    int encuesta_id FK
    int seccion_curso_alumno_id FK
    boolean respondido
    timestamp fecha_respuesta
    boolean recordatorio_enviado
    timestamp fecha_recordatorio
  }
  ENCUESTA_PARTICIPANTE_UNIDAD {
    int id PK
    int encuesta_id FK
    int unidad_organizacional_usuario_id FK
    boolean respondido
    timestamp fecha_respuesta
    boolean recordatorio_enviado
    timestamp fecha_recordatorio
  }
  ENCUESTA_PARTICIPANTE_LIBRE {
    int id PK
    int encuesta_id FK
    int persona_id FK
    string email
    string rut
    boolean respondido
    timestamp fecha_respuesta
    timestamp fecha_carga
    boolean recordatorio_enviado
    timestamp fecha_recordatorio
  }
  ENCUESTA_COMENTARIO {
    int id PK
    int encuesta_id FK
    int usuario_id FK
    string texto
    timestamp fecha_creacion
  }
  PREGUNTA {
    int id PK
    int encuesta_id FK
    int plantilla_pregunta_origen_id FK
    string tipo
    string texto
    int orden
    boolean obligatoria
    int min_selecciones
    int max_selecciones
  }
  OPCION_RESPUESTA {
    int id PK
    int pregunta_id FK
    string texto
    int orden
  }
  RESPUESTA {
    int id PK
    int encuesta_id FK
    timestamp fecha_envio
  }
  RESPUESTA_DETALLE {
    int id PK
    int respuesta_id FK
    int pregunta_id FK
    string valor_texto
    int opcion_id FK
  }
  CODIGO_QR {
    int id PK
    int encuesta_id FK
    string url
    timestamp fecha_generacion
  }
  API_TOKEN {
    int id PK
    int usuario_id FK
    string token
    timestamp fecha_expiracion
  }
  TOKEN_PERMISO {
    int token_id FK
    int permiso_id FK
  }
  CONFIGURACION_PLATAFORMA {
    int id PK
    int minimo_respuestas
    decimal porcentaje_minimo
    int actualizado_por_id FK
    timestamp fecha_actualizacion
  }
```

## 2. Principios de diseño clave

Antes del diccionario, cinco decisiones transversales que explican *por qué* varias tablas están estructuradas como están:

1. **Anonimato por separación, no por bandera.** `RESPUESTA` nunca tiene una FK hacia `USUARIO` ni hacia las tablas de autorización (`ENCUESTA_PARTICIPANTE` / `ENCUESTA_PARTICIPANTE_LIBRE`). Al responder, se hacen dos escrituras independientes: una inserta la respuesta (sin identidad), otra marca `respondido = true` en la tabla de autorización. Nunca existe un campo que conecte "quién" con "qué respondió".
2. **Catálogo de cursos con creación controlada por permiso.** `CURSO` es un catálogo compartido por toda la carrera (para analítica limpia y sin errores de tipeo por mayúsculas/minúsculas), sembrado inicialmente a mano con la malla completa. Crear un `CURSO` nuevo requiere un permiso (por ejemplo `curso.crear`) — normalmente en manos del director de carrera, aunque puede habilitarse también para docentes puntuales. *(Nota: `curso.crear` es solo un ejemplo de cómo se usaría el sistema `PERMISO`/`ROL` genérico que ya existe — no es una tabla ni un campo nuevo; qué permisos existen y quién los tiene por defecto es una decisión de datos semilla/configuración inicial, no del esquema.)* Un docente crea sus `SECCION_CURSO` (año, semestre, grupo, roster) seleccionando un `CURSO` ya existente del catálogo.
3. **Borrado lógico de los rosters.** `SECCION_CURSO_ALUMNO` y `UNIDAD_ORGANIZACIONAL_USUARIO` nunca se borran físicamente; se marcan `activo = false` con `fecha_baja` para no romper referencias desde encuestas pasadas, y se pueden reactivar si la persona vuelve a aparecer en un CSV posterior.
4. **Foto del roster al crear la encuesta.** `ENCUESTA_PARTICIPANTE` / `ENCUESTA_PARTICIPANTE_UNIDAD` se llenan copiando (al momento de crear/publicar) los alumnos `activo = true` del origen seleccionado — no se calcula en vivo — para que cambios posteriores no alteren retroactivamente quién podía responder una encuesta ya cerrada.
5. **Permisos por composición, no por rol fijo.** `ROL` y `PERMISO` están desacoplados; un usuario puede tener varios roles, cada uno con alcance opcional a una `UNIDAD_ORGANIZACIONAL` específica (carrera, instituto, facultad, o cualquier nivel que se agregue después sin cambiar el esquema).
6. **Tres modos de autorización para una encuesta, nunca combinados.** Una encuesta apunta a una o varias `SECCION_CURSO` (modo "cursos", vía `ENCUESTA_SECCION_CURSO`), o a una o varias `UNIDAD_ORGANIZACIONAL` del mismo nivel (modo "unidad", vía `ENCUESTA_UNIDAD_ORGANIZACIONAL`), o a una lista suelta subida solo para esa vez (modo "libre") — nunca a una combinación de los tres. Cada modo tiene su propia tabla paralela de autorización, repitiendo siempre el mismo patrón: quién puede responder se guarda separado de qué respondió. `ENCUESTA.modo` guarda ese estado de forma explícita (en vez de tener que inferirlo revisando qué otras tablas tienen filas para esa encuesta); qué existan filas solo en el par de tablas correspondiente al modo (y no en las de los otros dos) sigue siendo responsabilidad de la aplicación, porque un CHECK de Postgres no puede mirar el contenido de otras tablas.
7. **Dominios cerrados con CHECK, solo donde el valor es un estado fijo, no una etiqueta libre.** Campos que representan una máquina de estados con opciones conocidas de antemano (`ENCUESTA.estado`, `PLANTILLA.estado`, `PLANTILLA_PREGUNTA.tipo`/`PREGUNTA.tipo`) llevan un `CHECK ... IN (...)` para que un valor mal escrito o un estado inventado por error no entre nunca a la base. Campos que son etiquetas abiertas por diseño (`UNIDAD_ORGANIZACIONAL.tipo`, `PERMISO.categoria`) se dejan como texto libre a propósito, porque su gracia es poder crecer sin rediseñar el esquema.
8. **Identidad institucional estable, separada de la cuenta.** `PERSONA` (por RUT) es lo que permite reconocer que el mismo individuo aparece en distintos rosters (`SECCION_CURSO_ALUMNO`, `UNIDAD_ORGANIZACIONAL_USUARIO`) y, eventualmente, en `USUARIO` — sin depender de comparar el correo como texto, que puede cambiar o escribirse de forma distinta según la fuente. `PERSONA` nunca se llena con un dato autoreportado por quien se registra: solo se crea o reutiliza a partir de un CSV institucional, la única fuente que este modelo trata como confiable para el RUT. Por eso `USUARIO.persona_id` es nullable — una cuenta que nunca aparece en ningún roster (ej. un superadministrador) simplemente no tiene una `PERSONA` asociada, y no pasa nada.

## 3. Diccionario de datos

### 3.1 Usuarios, roles y permisos

**PERSONA** — Identidad institucional estable de cualquier individuo conocido por la universidad (estudiante, docente, administrativo), exista o no una cuenta creada. Se identifica por RUT porque, a diferencia del correo, no cambia. Nunca se llena con un dato autoreportado por quien se registra — solo se crea o se reutiliza a partir de un CSV institucional (importado por un docente o director de carrera), que es la única fuente que este modelo considera confiable para el RUT.

| Campo | Tipo | Descripción | Restricciones |
|---|---|---|---|
| id | int | Identificador único | PK |
| rut | string | RUT de la persona, tal como viene del CSV que la originó | único |
| nombre | string | Nombre completo, tomado del CSV/registro que creó esta fila | — |
| fecha_creacion | timestamp | Cuándo se creó esta identidad por primera vez | — |

**USUARIO** — Cuenta de cualquier persona que usa la plataforma (estudiante, docente, administrativo). El rol ya no es un campo fijo aquí; se resuelve vía `USUARIO_ROL`.

| Campo | Tipo | Descripción | Restricciones |
|---|---|---|---|
| id | int | Identificador único | PK |
| persona_id | int | Identidad institucional enlazada, si ya se estableció (ver flujo de sincronización más abajo) | FK → PERSONA, nullable |
| nombre | string | Nombre completo | — |
| email | string | Correo institucional, usado para iniciar sesión | único |
| email_verificado | boolean | Si confirmó el link enviado a su correo tras registrarse | default false |
| password_hash | string | Contraseña elegida por el usuario, siempre almacenada con hash (nunca en texto plano) | se crea recién después de verificar el correo |
| token_verificacion | string | Token de un solo uso para el link de confirmación de correo | nullable, se limpia tras verificar |
| token_expiracion | timestamp | Vencimiento del token de verificación | nullable |

**DOMINIO_INSTITUCIONAL** — Lista blanca de dominios de correo permitidos para registrarse (ej. `alumnos.uach.cl`, `uach.cl`, `inf.uach.cl`), cada uno con el rol que se asigna por defecto al registrarse con ese dominio.

| Campo | Tipo | Descripción | Restricciones |
|---|---|---|---|
| id | int | Identificador único | PK |
| dominio | string | Dominio de correo permitido (sin `@`) | único |
| rol_predeterminado_id | int | Rol que se asigna automáticamente a quien se registra con este dominio | FK → ROL |

**ROL** — Conjunto nombrado de permisos (ej. "Estudiante", "Docente", "Jefe de carrera"). Ya no son valores fijos en código; son filas editables.

| Campo | Tipo | Descripción | Restricciones |
|---|---|---|---|
| id | int | Identificador único | PK |
| nombre | string | Nombre visible del rol | — |
| descripcion | string | Para qué sirve este rol | — |
| es_predeterminado | boolean | Si es uno de los roles base del sistema (Estudiante/Docente/Admin) o uno creado a medida | default false |

**PERMISO** — Unidad atómica de autorización (ej. `api.access`, `encuesta.crear`, `dashboard.analitica.ver`).

| Campo | Tipo | Descripción | Restricciones |
|---|---|---|---|
| id | int | Identificador único | PK |
| codigo | string | Identificador legible por código (ej. `encuesta.crear`) | único |
| descripcion | string | Explicación en lenguaje natural | — |
| categoria | string | Agrupador para la UI (ej. "Encuestas", "API", "Administración") | — |

**ROL_PERMISO** — Tabla puente N:M: qué permisos otorga cada rol.

| Campo | Tipo | Descripción | Restricciones |
|---|---|---|---|
| rol_id | int | Rol que otorga el permiso | FK → ROL, parte de PK compuesta |
| permiso_id | int | Permiso otorgado | FK → PERMISO, parte de PK compuesta |

**USUARIO_ROL** — Tabla puente N:M: qué roles tiene cada usuario y en qué unidad organizacional aplica cada uno. Todo rol tiene un alcance — incluidos los roles "globales", que apuntan al nodo raíz de la jerarquía (ver nota en `UNIDAD_ORGANIZACIONAL`) en vez de dejar el campo vacío. Restricción: la combinación `(usuario_id, rol_id, unidad_organizacional_id)` debe ser única, para que un mismo rol no se pueda asignar dos veces a la misma persona en el mismo alcance — esto solo funciona de forma confiable si el campo nunca es NULL, porque en SQL un NULL nunca se considera igual a otro NULL.

| Campo | Tipo | Descripción | Restricciones |
|---|---|---|---|
| usuario_id | int | Usuario que tiene el rol | FK → USUARIO, parte de la restricción de unicidad |
| rol_id | int | Rol asignado | FK → ROL, parte de la restricción de unicidad |
| unidad_organizacional_id | int | Alcance del rol (ej. "Docente de la carrera X"). Para roles globales, apunta al nodo raíz de `UNIDAD_ORGANIZACIONAL` | FK → UNIDAD_ORGANIZACIONAL, no nulo, parte de la restricción de unicidad |
| fecha_asignacion | timestamp | Cuándo se asignó este rol | — |

**Regla de resolución de permisos (de aplicación, no del esquema):** si un usuario tiene un permiso es la unión de todos los `PERMISO` que otorgan todos los `ROL` que tiene asignados (vía `ROL_PERMISO` a través de `USUARIO_ROL`) — sin excepciones puntuales por persona. Otorgar o quitar permisos es una facultad exclusiva del superadministrador; el resto de los roles con capacidad de gestionar personas (ej. Director de Carrera) solo puede *asignar roles ya existentes* a otros usuarios que no sean estudiantes — nunca definir permisos sueltos. Por eso, si alguien necesita un conjunto especial de permisos (ej. un docente que además puede aprobar planillas), la solución es un rol nuevo que ya incluya esa combinación (ej. "Docente Premium" = permisos de Docente + `planilla.aprobar`), asignable a uno o más usuarios — no una excepción a nivel de persona.

**UNIDAD_ORGANIZACIONAL** — Árbol autorreferenciado de la estructura de la universidad (carrera, instituto, facultad, y cualquier nivel futuro), sin necesidad de rediseñar el esquema al agregar niveles. Existe exactamente una fila raíz (ej. "Universidad Austral de Chile", `tipo = "Global"`) con `unidad_padre_id = NULL` — es el único nodo de todo el árbol al que se le permite tener el padre vacío. Los roles "de toda la plataforma" apuntan a esta fila en vez de dejar `USUARIO_ROL.unidad_organizacional_id` en blanco, precisamente para evitar el problema de unicidad con NULL.

| Campo | Tipo | Descripción | Restricciones |
|---|---|---|---|
| id | int | Identificador único | PK |
| nombre | string | Nombre de la unidad (ej. "Ingeniería Civil en Informática") | — |
| tipo | string | Tipo de unidad, texto libre (ej. "Carrera", "Facultad") | — |
| unidad_padre_id | int | Unidad inmediatamente superior en el árbol | FK → UNIDAD_ORGANIZACIONAL (autorreferencia), nullable en la raíz |

**Relaciones de este grupo:**
- `ROL_PERMISO` y `USUARIO_ROL` son las dos tablas puente que reemplazan el campo fijo `rol` de `USUARIO`: un usuario tiene N roles, un rol tiene N permisos.
- `UNIDAD_ORGANIZACIONAL` se apunta a sí misma (`unidad_padre_id`) para modelar cualquier profundidad de jerarquía con una sola tabla.
- `USUARIO_ROL.unidad_organizacional_id` es lo que le da *alcance* a un rol: el mismo rol "Jefe de carrera" puede estar asignado a distintos usuarios con distinta unidad, o incluso al mismo usuario en varias unidades (varias filas).
- `DOMINIO_INSTITUCIONAL.rol_predeterminado_id` conecta el proceso de registro con el sistema de roles: registrarse con un dominio válido asigna automáticamente un rol base.
- Que el rol "Estudiante" nunca tenga permisos es una decisión de datos semilla (no insertar filas en `ROL_PERMISO` para ese rol), no algo que necesite representarse en el esquema.

**Nota resuelta — `ROL.posicion` y `USUARIO_PERMISO_OVERRIDE` se eliminaron del modelo.** Ambos existían para escenarios de jerarquía/excepción entre roles que ya no aplican: se definió que otorgar o quitar permisos es exclusivo del superadministrador (sin delegación a roles intermedios que necesitaran compararse en jerarquía), y que cualquier combinación especial de permisos para una persona se resuelve creando un rol nuevo que agrupe esos permisos, no con una excepción individual. Con eso, la resolución de permisos queda como un solo paso: unión de `ROL_PERMISO` a través de `USUARIO_ROL`, sin pasos adicionales.

**Flujo de sincronización vía `PERSONA` (cómo `persona_id` termina enlazado en `USUARIO`, `SECCION_CURSO_ALUMNO`, `UNIDAD_ORGANIZACIONAL_USUARIO` y `ENCUESTA_PARTICIPANTE_LIBRE`):**
- **Al importar un CSV** (de una sección de curso, de una unidad organizacional, o de una encuesta en modo "libre"): por cada fila, se busca una `PERSONA` con ese RUT. Si existe, se reutiliza; si no, se crea. La fila del roster/CSV correspondiente queda con ese `persona_id`, y sigue guardando su propio `email`/`rut` locales igual que antes (`PERSONA` no reemplaza esos campos, los complementa).
- El mismo paso revisa si existe algún `USUARIO` con `email_verificado = true` cuyo correo coincida con el de esa fila y cuyo `persona_id` siga en `NULL` — si lo encuentra, lo enlaza a esa misma `PERSONA` en ese momento.
- **Al registrarse un `USUARIO`** (verificando su correo con token, igual que hoy — el formulario de registro no cambia, nunca se le pide el RUT a la persona): se busca si su correo ya verificado coincide con el de alguna fila existente en `SECCION_CURSO_ALUMNO`/`UNIDAD_ORGANIZACIONAL_USUARIO`/`ENCUESTA_PARTICIPANTE_LIBRE`. Si la encuentra (esa fila ya trae `persona_id` de un CSV anterior), enlaza su `persona_id` a esa misma `PERSONA`. Si no encuentra ninguna coincidencia (nadie ha subido nunca un CSV con ese correo — típico de una cuenta de superadministrador), `USUARIO.persona_id` queda en `NULL`: no se le fabrica una `PERSONA` con un RUT autoreportado, porque ese dato no es confiable si no viene de un CSV institucional.
- El orden en que ocurren estos dos eventos (CSV antes o después del registro) no importa — cualquiera de los dos que llegue primero deja la mitad del enlace lista, y el que llega después completa la otra mitad.
- Con esto, todas las filas de roster de una misma persona a lo largo de los años —y su cuenta, si la tiene— comparten el mismo `persona_id`, sin importar por cuál de las tres tablas paralelas de `ENCUESTA_PARTICIPANTE*` haya llegado.

### 3.2 Plantillas

**PLANTILLA** — Modelo reutilizable de encuesta, con sus propias preguntas. Existe independientemente de cualquier encuesta concreta.

| Campo | Tipo | Descripción | Restricciones |
|---|---|---|---|
| id | int | Identificador único | PK |
| usuario_creador_id | int | Quién creó la plantilla | FK → USUARIO |
| nombre | string | Nombre de la plantilla | — |
| categoria | string | Agrupador temático | — |
| version | int | Número de versión de la plantilla | — |
| estado | string | Ej. "borrador", "publicada", "archivada" | `CHECK estado IN ('borrador', 'publicada', 'archivada')` |

**PLANTILLA_PREGUNTA** — Preguntas que pertenecen a una plantilla (no a una encuesta).

| Campo | Tipo | Descripción | Restricciones |
|---|---|---|---|
| id | int | Identificador único | PK |
| plantilla_id | int | Plantilla a la que pertenece | FK → PLANTILLA |
| tipo | string | Tipo de pregunta | `CHECK tipo IN ('texto_libre', 'opcion_unica', 'opcion_multiple', 'escala')` |
| texto | string | Enunciado de la pregunta | — |
| orden | int | Posición dentro de la plantilla | — |
| obligatoria | boolean | Si debe responderse sí o sí | — |
| min_selecciones | int | Mínimo de opciones que se deben marcar (solo tiene sentido si `tipo = 'opcion_multiple'`) | nullable; `CHECK (tipo = 'opcion_multiple' OR (min_selecciones IS NULL AND max_selecciones IS NULL))` |
| max_selecciones | int | Máximo de opciones que se pueden marcar (solo tiene sentido si `tipo = 'opcion_multiple'`) | nullable; `CHECK (min_selecciones IS NULL OR max_selecciones IS NULL OR min_selecciones <= max_selecciones)` |

**PLANTILLA_OPCION** — Opciones de respuesta de una pregunta de plantilla (para preguntas de selección).

| Campo | Tipo | Descripción | Restricciones |
|---|---|---|---|
| id | int | Identificador único | PK |
| plantilla_pregunta_id | int | Pregunta de plantilla a la que pertenece | FK → PLANTILLA_PREGUNTA |
| texto | string | Texto de la opción | — |
| orden | int | Posición entre las opciones | — |

**PLANTILLA_COMPARTIDA** — A qué docentes específicos, además del creador, se les compartió una plantilla privada.

| Campo | Tipo | Descripción | Restricciones |
|---|---|---|---|
| plantilla_id | int | Plantilla compartida | FK → PLANTILLA, parte de PK compuesta |
| usuario_id | int | Docente con quien se comparte | FK → USUARIO, parte de PK compuesta |
| fecha_compartido | timestamp | Cuándo se compartió | — |

Regla de visibilidad (de aplicación, no del esquema): una plantilla es visible/usable para su `usuario_creador_id` y para cualquier `usuario_id` que aparezca en `PLANTILLA_COMPARTIDA` para esa plantilla. Nadie más puede verla ni usarla — el catálogo es privado por defecto, no abierto a todos los docentes.

**Relaciones de este grupo:**
- `PLANTILLA` → `PLANTILLA_PREGUNTA` → `PLANTILLA_OPCION` replica exactamente la estructura de `ENCUESTA` → `PREGUNTA` → `OPCION_RESPUESTA`, porque una plantilla necesita contenido real para poder "instanciarse" en una encuesta.
- Al crear una encuesta desde una plantilla, se copian sus preguntas/opciones hacia `PREGUNTA`/`OPCION_RESPUESTA` (no se referencian en vivo), dejando el rastro en `PREGUNTA.plantilla_pregunta_origen_id` — así editar la encuesta no afecta la plantilla original.
- `PLANTILLA_COMPARTIDA` hace que compartir una plantilla sea una decisión explícita del creador hacia docentes puntuales, no algo abierto a todo el catálogo por defecto.

### 3.3 Cursos y secciones

**CURSO** — Catálogo normalizado de códigos de curso (ej. "INFO101"), para evitar duplicados por errores de tipeo (que no se lean "INFO188" e "info188" como dos cursos distintos). Se siembra inicialmente con la malla completa de la carrera (incluidos optativos); crear una fila nueva después requiere el permiso `curso.crear`, típicamente en manos del director de carrera, aunque puede habilitarse también a docentes puntuales.

| Campo | Tipo | Descripción | Restricciones |
|---|---|---|---|
| id | int | Identificador único | PK |
| unidad_organizacional_id | int | A qué carrera/facultad pertenece este curso | FK → UNIDAD_ORGANIZACIONAL, nullable |
| codigo | string | Código oficial del curso | único |
| nombre | string | Nombre del curso | — |
| activo | boolean | Si sigue vigente en la malla actual (false = descontinuado). Un curso descontinuado nunca se borra —solo deja de aparecer como opción para nuevas `SECCION_CURSO`— porque encuestas históricas pueden seguir apuntando a él a través de sus secciones | default true |

**SECCION_CURSO** — Una oferta concreta de un curso en un semestre/año/grupo específico. Es donde realmente vive el roster de estudiantes.

| Campo | Tipo | Descripción | Restricciones |
|---|---|---|---|
| id | int | Identificador único | PK |
| curso_id | int | Curso al que pertenece esta sección | FK → CURSO |
| anio | int | Año en que se dicta | — |
| semestre | int | Semestre (1 o 2) | — |
| grupo | string | Identificador de grupo/paralelo, para cursos divididos | nullable |

**SECCION_CURSO_ALUMNO** — Roster de estudiantes de una sección específica, con borrado lógico para preservar el historial.

| Campo | Tipo | Descripción | Restricciones |
|---|---|---|---|
| id | int | Identificador único | PK |
| seccion_curso_id | int | Sección a la que pertenece este alumno | FK → SECCION_CURSO |
| persona_id | int | Identidad institucional de este estudiante, resuelta/creada por RUT al importar el CSV | FK → PERSONA |
| email | string | Correo institucional del estudiante | — |
| rut | string | RUT del estudiante | — |
| activo | boolean | Si está actualmente inscrito (false = salió del curso) | default true |
| fecha_alta | timestamp | Cuándo se agregó (o reactivó) | — |
| fecha_baja | timestamp | Cuándo se marcó inactivo | nullable |

**UNIDAD_ORGANIZACIONAL_USUARIO** — Roster general de una carrera o facultad completa (por ejemplo, exportado por el director de carrera o el decano), independiente de cualquier curso puntual. Se llama "usuario" y no "alumno" a propósito: el mismo listado puede incluir tanto estudiantes como docentes u otro personal, por si una encuesta general de facultad también quiere incluir a los docentes como participantes. Mismo patrón de borrado lógico que `SECCION_CURSO_ALUMNO`.

| Campo | Tipo | Descripción | Restricciones |
|---|---|---|---|
| id | int | Identificador único | PK |
| unidad_organizacional_id | int | Carrera o facultad a la que pertenece este listado | FK → UNIDAD_ORGANIZACIONAL |
| persona_id | int | Identidad institucional de esta persona, resuelta/creada por RUT al importar el CSV | FK → PERSONA |
| email | string | Correo institucional de la persona (estudiante, docente, etc.) | — |
| rut | string | RUT de la persona | — |
| tipo | string | Categoría de esta persona dentro del roster (estudiante, docente, administrativo), tomada del CSV. Permite que una encuesta filtre "solo estudiantes" aunque la persona todavía no se haya registrado ni tenga un rol asignado — filtrar por `USUARIO_ROL` no serviría para alguien sin cuenta todavía | `CHECK tipo IN ('estudiante', 'docente', 'administrativo', 'otro')` |
| activo | boolean | Si sigue perteneciendo a esa unidad | default true |
| fecha_alta | timestamp | Cuándo se agregó (o reactivó) | — |
| fecha_baja | timestamp | Cuándo se marcó inactivo | nullable |

Nota: aunque la persona todavía no tenga cuenta creada en la plataforma en el momento de importar el listado, no hay problema — la fila queda enlazada a su `PERSONA` (por RUT) desde ese momento, y cuando se registre (verificando ese mismo correo institucional) su `USUARIO.persona_id` se completa automáticamente contra esa misma identidad — ver el flujo detallado en la sección 3.1.

Nota sobre permisos: crear un nodo nuevo en `UNIDAD_ORGANIZACIONAL` (una carrera, una facultad) es una acción estructural poco frecuente — normalmente parte de la configuración inicial de la plataforma, hecha por el superadministrador, no algo que un director de carrera haga por su cuenta. Lo que sí hace el director de carrera de forma rutinaria, cada vez que cambia la matrícula, es **importar el roster** de un nodo que ya existe — una acción distinta, gatillada por un permiso distinto y acotada a la unidad donde tiene ese rol (vía `USUARIO_ROL.unidad_organizacional_id`).

**Relaciones de este grupo:**
- `CURSO` → `SECCION_CURSO` es 1:N: un mismo curso ("Programación") tiene una sección distinta por cada semestre/año/grupo en que se dicta.
- `SECCION_CURSO` → `SECCION_CURSO_ALUMNO` es 1:N: el roster real de estudiantes vive aquí, no en `CURSO`, precisamente porque cambia cada semestre.
- `UNIDAD_ORGANIZACIONAL` → `UNIDAD_ORGANIZACIONAL_USUARIO` sigue el mismo patrón que `SECCION_CURSO` → `SECCION_CURSO_ALUMNO`, pero a nivel de carrera/facultad completa en vez de un curso puntual — para encuestas más generales.
- Al importar un CSV nuevo (para una sección o para una unidad organizacional), se sincroniza contra el roster existente: los correos nuevos se agregan, los que reaparecen se reactivan (`activo = true`), y los que ya no están en el CSV se marcan `activo = false` — nunca se borran filas. El RUT de cada fila es obligatorio en el CSV (no opcional) precisamente porque es lo que permite resolver/crear la `PERSONA` correspondiente al importar.
- `CURSO.activo` sigue el mismo principio de borrado lógico: un curso que sale de la malla se marca `activo = false` en vez de eliminarse, para no romper el historial de `SECCION_CURSO` y las encuestas que dependen de él.
- `persona_id` en ambos rosters es lo que permite reconocer que la misma persona aparece en secciones/unidades distintas a lo largo del tiempo, sin depender de comparar el texto del correo — ver el flujo completo en la sección 3.1.

### 3.4 Encuestas y participación

**ENCUESTA** — Instancia real que los usuarios responden. Puede originarse desde una plantilla o crearse desde cero, y puede dirigirse a uno o varios cursos, a una o varias unidades organizacionales del mismo nivel (varias carreras, o varias facultades, ver nota más abajo), o a una lista libre (ver los tres modos más abajo).

| Campo | Tipo | Descripción | Restricciones |
|---|---|---|---|
| id | int | Identificador único | PK |
| plantilla_id | int | Plantilla de origen, si aplica | FK → PLANTILLA, nullable |
| usuario_creador_id | int | Quién creó la encuesta | FK → USUARIO |
| modo | string | En cuál de los tres modos de autorización opera esta encuesta | `CHECK modo IN ('cursos', 'unidad', 'libre')` |
| unidad | string | Unidad del curso a la que corresponde (ej. "Unidad 2"), dato puramente descriptivo — se queda en la encuesta y no en el curso, porque el mismo curso cubre varias unidades a lo largo del semestre | nullable — si se quiere exigir solo cuando `modo = 'cursos'`, esa validación va en la aplicación, no en la base de datos |
| titulo | string | Título visible de la encuesta | — |
| fecha_inicio | date | Apertura | — |
| fecha_fin | date | Cierre | — |
| estado | string | Ej. "borrador", "activa", "cerrada" | `CHECK estado IN ('borrador', 'activa', 'cerrada')` |

**ENCUESTA_SECCION_CURSO** — A qué sección(es) de curso está dirigida una encuesta en modo "cursos". Es N:M porque una misma encuesta puede enviarse a varios cursos o grupos a la vez (ej. Marianna manda la misma encuesta a sus dos paralelos).

| Campo | Tipo | Descripción | Restricciones |
|---|---|---|---|
| encuesta_id | int | Encuesta que se dirige a esa sección | FK → ENCUESTA, parte de PK compuesta |
| seccion_curso_id | int | Sección de curso incluida | FK → SECCION_CURSO, parte de PK compuesta |

**ENCUESTA_PARTICIPANTE** — Lista de autorizados para una encuesta en modo "cursos"; referencia por ID, sin duplicar correo/rut. Es la "foto" del roster activo al momento de crear/publicar la encuesta, agregando los alumnos de **todas** las secciones incluidas en `ENCUESTA_SECCION_CURSO` (si el mismo `persona_id` aparece en más de una sección seleccionada, se deduplica al tomar la foto, para que esa persona no quede habilitada para responder dos veces).

| Campo | Tipo | Descripción | Restricciones |
|---|---|---|---|
| id | int | Identificador único | PK |
| encuesta_id | int | Encuesta a la que autoriza | FK → ENCUESTA |
| seccion_curso_alumno_id | int | Estudiante autorizado (referencia al roster de una de las secciones incluidas) | FK → SECCION_CURSO_ALUMNO |
| respondido | boolean | Si ya envió su respuesta (sin decir cuál) | default false |
| fecha_respuesta | timestamp | Cuándo respondió | nullable |
| recordatorio_enviado | boolean | Si ya se le envió el recordatorio de esta encuesta (para no reenviarlo cada vez que corre el proceso de recordatorios) | default false |
| fecha_recordatorio | timestamp | Cuándo se envió el recordatorio | nullable |

**ENCUESTA_UNIDAD_ORGANIZACIONAL** — A qué unidad(es) organizacionales está dirigida una encuesta en modo "unidad". Es N:M por la misma razón que `ENCUESTA_SECCION_CURSO`: una misma encuesta puede dirigirse a más de una unidad a la vez (ej. "Informática" + "Electrónica" en una sola encuesta comparativa entre carreras).

| Campo | Tipo | Descripción | Restricciones |
|---|---|---|---|
| encuesta_id | int | Encuesta que se dirige a esa unidad | FK → ENCUESTA, parte de PK compuesta |
| unidad_organizacional_id | int | Unidad organizacional incluida | FK → UNIDAD_ORGANIZACIONAL, parte de PK compuesta |

**ENCUESTA_PARTICIPANTE_UNIDAD** — Lista de autorizados para una encuesta en modo "unidad"; mismo patrón que `ENCUESTA_PARTICIPANTE`, pero referenciando el roster general de `UNIDAD_ORGANIZACIONAL_USUARIO` de **todas** las unidades incluidas en `ENCUESTA_UNIDAD_ORGANIZACIONAL` (con la misma deduplicación por `persona_id` al tomar la foto, por si la misma persona aparece en el roster de más de una unidad seleccionada).

| Campo | Tipo | Descripción | Restricciones |
|---|---|---|---|
| id | int | Identificador único | PK |
| encuesta_id | int | Encuesta a la que autoriza | FK → ENCUESTA |
| unidad_organizacional_usuario_id | int | Persona autorizada (referencia al roster general de una de las unidades incluidas) | FK → UNIDAD_ORGANIZACIONAL_USUARIO |
| respondido | boolean | Si ya envió su respuesta (sin decir cuál) | default false |
| fecha_respuesta | timestamp | Cuándo respondió | nullable |
| recordatorio_enviado | boolean | Si ya se le envió el recordatorio de esta encuesta | default false |
| fecha_recordatorio | timestamp | Cuándo se envió el recordatorio | nullable |

**ENCUESTA_PARTICIPANTE_LIBRE** — Lista de autorizados para una encuesta *sin* sección de curso asociada; guarda el correo/rut directamente porque no hay un roster persistente que referenciar por defecto.

| Campo | Tipo | Descripción | Restricciones |
|---|---|---|---|
| id | int | Identificador único | PK |
| encuesta_id | int | Encuesta a la que autoriza | FK → ENCUESTA |
| persona_id | int | Identidad institucional de esta persona, si el CSV de esta encuesta incluyó RUT y se pudo resolver contra `PERSONA` | FK → PERSONA, nullable |
| email | string | Correo autorizado (subido directamente en el CSV de esta encuesta) | — |
| rut | string | RUT, si se incluyó en el CSV | nullable |
| respondido | boolean | Si ya envió su respuesta | default false |
| fecha_respuesta | timestamp | Cuándo respondió (faltaba en la versión anterior — las otras dos tablas de autorización sí la tenían) | nullable |
| fecha_carga | timestamp | Cuándo se subió este listado | — |
| recordatorio_enviado | boolean | Si ya se le envió el recordatorio de esta encuesta | default false |
| fecha_recordatorio | timestamp | Cuándo se envió el recordatorio | nullable |

**ENCUESTA_COMENTARIO** — Anotaciones privadas del docente creador sobre su propia encuesta. No son visibles para nadie más ni existen a nivel de plantilla.

| Campo | Tipo | Descripción | Restricciones |
|---|---|---|---|
| id | int | Identificador único | PK |
| encuesta_id | int | Encuesta comentada | FK → ENCUESTA |
| usuario_id | int | Autor del comentario (siempre el creador de la encuesta) | FK → USUARIO |
| texto | string | Contenido del comentario | — |
| fecha_creacion | timestamp | Cuándo se escribió | — |

**Relaciones de este grupo — los tres modos de una encuesta:**
- **Modo "cursos":** `ENCUESTA.modo = 'cursos'`, la encuesta tiene una o más filas en `ENCUESTA_SECCION_CURSO` (uno o varios cursos/grupos), y su autorización vive en `ENCUESTA_PARTICIPANTE`.
- **Modo "unidad":** `ENCUESTA.modo = 'unidad'`, la encuesta tiene una o más filas en `ENCUESTA_UNIDAD_ORGANIZACIONAL` (una o varias unidades), y su autorización vive en `ENCUESTA_PARTICIPANTE_UNIDAD`.
- **Modo "libre":** `ENCUESTA.modo = 'libre'`, no tiene ni secciones ni unidades — su autorización vive en `ENCUESTA_PARTICIPANTE_LIBRE`, cargada directamente desde un CSV subido para esa encuesta puntual.
- Una encuesta usa **un solo modo a la vez**, nunca una combinación. La columna `modo` hace ese estado explícito y consultable; que existan filas solo en la tabla de "incluye"/autorización correspondiente al modo (y no en las de los otros dos) sigue sin poder forzarse con un CHECK simple — un CHECK de Postgres no puede mirar filas de otra tabla — así que esa parte se valida en la capa de aplicación (o, si se quiere forzar a nivel de base, con un trigger). Esto ahora es simétrico entre "cursos" y "unidad": ambos modos delegan el "uno o varios" a una tabla puente N:M en vez de un campo único, por la misma razón en los dos casos.
- **Regla para "modo unidad" (de aplicación, no del esquema): las unidades seleccionadas para una misma encuesta deben ser todas del mismo `UNIDAD_ORGANIZACIONAL.tipo`** (todas carreras, o todas facultades — nunca una carrera junto con la facultad que la contiene). Esto evita el caso más obvio de duplicado (alguien que aparece tanto en el roster de su carrera como en el de la facultad que la incluye), pero **no elimina la necesidad de deduplicar por `persona_id`** al tomar la foto: incluso entre unidades del mismo nivel, alguien puede aparecer en más de un roster por un error de carga, por una relación de árbol mal configurada por el superadministrador, o por un caso legítimo como una doble titulación entre dos carreras. La deduplicación por `persona_id` en `ENCUESTA_PARTICIPANTE_UNIDAD` es la que realmente garantiza "no responde dos veces"; la regla de "mismo nivel" solo reduce cuánto tiene que trabajar esa deduplicación.
- Se recomienda un índice sobre `ENCUESTA_SECCION_CURSO.seccion_curso_id` y sobre `ENCUESTA_UNIDAD_ORGANIZACIONAL.unidad_organizacional_id` (además de sus claves compuestas, que ya cubren `encuesta_id` primero): sin ellos, "qué encuestas ha tenido este curso/unidad" recorre la tabla completa en vez de usar un índice.
- Ninguna de las tres tablas de autorización tiene FK hacia `RESPUESTA` — esa desconexión es la que sostiene el anonimato, sin importar el modo.
- `recordatorio_enviado`/`fecha_recordatorio` en las tres tablas de autorización registran si ya se le mandó el aviso a ese participante, para que el proceso que revisa "no respondidos con poco tiempo restante" no lo notifique dos veces; a quién avisar se sigue calculando al vuelo (no respondido + fecha_fin próxima), solo el "ya se avisó" queda guardado.
- Ninguna de las tres tablas de autorización tiene `persona_id` directo — lo heredan indirectamente: `ENCUESTA_PARTICIPANTE` a través de `SECCION_CURSO_ALUMNO`, `ENCUESTA_PARTICIPANTE_UNIDAD` a través de `UNIDAD_ORGANIZACIONAL_USUARIO`, y `ENCUESTA_PARTICIPANTE_LIBRE` lo tiene directo (nullable, porque su CSV puede no traer RUT). Gracias a eso, "todas las encuestas en las que esta persona estuvo habilitada a participar, sin importar el modo" se responde con un `UNION` de las tres tablas filtrando por el mismo `persona_id`, en vez de comparar el correo como texto tres veces.
- `ENCUESTA_COMENTARIO.usuario_id` siempre coincide con `ENCUESTA.usuario_creador_id`; la visibilidad exclusiva se controla comparando ambos valores en la capa de permisos, no en el esquema.

### 3.5 Preguntas y respuestas

**PREGUNTA** — Preguntas reales de una encuesta (copiadas desde una plantilla o creadas directamente).

| Campo | Tipo | Descripción | Restricciones |
|---|---|---|---|
| id | int | Identificador único | PK |
| encuesta_id | int | Encuesta a la que pertenece | FK → ENCUESTA |
| plantilla_pregunta_origen_id | int | Pregunta de plantilla de la que proviene, si aplica | FK → PLANTILLA_PREGUNTA, nullable |
| tipo | string | Tipo de pregunta | `CHECK tipo IN ('texto_libre', 'opcion_unica', 'opcion_multiple', 'escala')` |
| texto | string | Enunciado | — |
| orden | int | Posición dentro de la encuesta | — |
| obligatoria | boolean | Si debe responderse | — |
| min_selecciones | int | Mínimo de opciones que se deben marcar (solo tiene sentido si `tipo = 'opcion_multiple'`); se copia desde `PLANTILLA_PREGUNTA` si la pregunta viene de una plantilla | nullable; misma CHECK que en `PLANTILLA_PREGUNTA` |
| max_selecciones | int | Máximo de opciones que se pueden marcar (solo tiene sentido si `tipo = 'opcion_multiple'`) | nullable; misma CHECK que en `PLANTILLA_PREGUNTA` |

**OPCION_RESPUESTA** — Opciones de una pregunta de encuesta (para preguntas de selección).

| Campo | Tipo | Descripción | Restricciones |
|---|---|---|---|
| id | int | Identificador único | PK |
| pregunta_id | int | Pregunta a la que pertenece | FK → PREGUNTA |
| texto | string | Texto de la opción | — |
| orden | int | Posición entre las opciones | — |

**RESPUESTA** — Un envío completo de la encuesta. Deliberadamente sin ninguna referencia a quién la envió.

| Campo | Tipo | Descripción | Restricciones |
|---|---|---|---|
| id | int | Identificador único | PK |
| encuesta_id | int | Encuesta respondida | FK → ENCUESTA |
| fecha_envio | timestamp | Cuándo se envió | — |

**RESPUESTA_DETALLE** — Cada respuesta individual a una pregunta dentro de un envío.

| Campo | Tipo | Descripción | Restricciones |
|---|---|---|---|
| id | int | Identificador único | PK |
| respuesta_id | int | Envío al que pertenece | FK → RESPUESTA |
| pregunta_id | int | Pregunta respondida | FK → PREGUNTA |
| valor_texto | string | Respuesta de texto libre, si aplica | nullable; `CHECK ((valor_texto IS NOT NULL) <> (opcion_id IS NOT NULL))` |
| opcion_id | int | Opción elegida, si es pregunta de selección (una fila por cada opción marcada, para preguntas de selección múltiple) | FK → OPCION_RESPUESTA, nullable; misma CHECK que `valor_texto` |

**Relaciones de este grupo:**
- `RESPUESTA` no tiene FK hacia `USUARIO` — es la pieza central del mecanismo de anonimato.
- `RESPUESTA_DETALLE` usa `valor_texto` **o** `opcion_id` según el tipo de pregunta, nunca ambos a la vez ni ninguno de los dos — esto ya lo fuerza un CHECK en el esquema, no solo la aplicación, como red de seguridad ante un bug o una escritura manual.
- Una pregunta de **selección múltiple** no necesita una tabla aparte para las marcas: si el estudiante marca 3 de 5 opciones, se insertan 3 filas en `RESPUESTA_DETALLE` para esa misma `pregunta_id`, una por cada `opcion_id` marcado. El tope de cuántas puede marcar vive en `min_selecciones`/`max_selecciones` de la propia `PREGUNTA` (copiados desde `PLANTILLA_PREGUNTA` si aplica); ninguno de los dos CHECK de esos campos puede validar por sí solo que la persona efectivamente marcó dentro del rango al responder — eso compara contra las filas de `RESPUESTA_DETALLE`, de otra tabla, así que esa parte queda en la aplicación.
- `PREGUNTA.plantilla_pregunta_origen_id` es opcional para permitir trazabilidad hacia la plantilla de origen sin obligarla (encuestas creadas desde cero no tienen origen).

### 3.6 Distribución y acceso API

**CODIGO_QR** — Código QR generado para distribuir el acceso a una encuesta.

| Campo | Tipo | Descripción | Restricciones |
|---|---|---|---|
| id | int | Identificador único | PK |
| encuesta_id | int | Encuesta que distribuye | FK → ENCUESTA |
| url | string | URL codificada en el QR | — |
| fecha_generacion | timestamp | Cuándo se generó | — |

**API_TOKEN** — Token de acceso a la API para integraciones externas.

| Campo | Tipo | Descripción | Restricciones |
|---|---|---|---|
| id | int | Identificador único | PK |
| usuario_id | int | Dueño del token | FK → USUARIO |
| token | string | Valor del token (idealmente hasheado en la base) | único |
| fecha_expiracion | timestamp | Vencimiento | nullable |

**TOKEN_PERMISO** — Alcance (scope) de un token: subconjunto de permisos que ese token puede usar, no necesariamente todos los del usuario dueño.

| Campo | Tipo | Descripción | Restricciones |
|---|---|---|---|
| token_id | int | Token acotado | FK → API_TOKEN, parte de PK compuesta |
| permiso_id | int | Permiso incluido en el alcance del token | FK → PERMISO, parte de PK compuesta |

**Relaciones de este grupo:**
- `TOKEN_PERMISO` limita un `API_TOKEN` a un subconjunto de los permisos que ya tiene su usuario dueño (nunca puede otorgar más permisos de los que el usuario ya posee vía `USUARIO_ROL`/`ROL_PERMISO`) — esa validación es de aplicación, no del esquema.

### 3.7 Configuración de la plataforma

**CONFIGURACION_PLATAFORMA** — Umbral mínimo de participación para mostrar resultados de cualquier encuesta, definido globalmente.

| Campo | Tipo | Descripción | Restricciones |
|---|---|---|---|
| id | int | Identificador único | PK |
| minimo_respuestas | int | Cantidad mínima absoluta de respuestas requeridas (ej. 5) | — |
| porcentaje_minimo | decimal | Porcentaje mínimo de participación requerido (ej. 0.33) | — |
| actualizado_por_id | int | Quién hizo este cambio | FK → USUARIO |
| fecha_actualizacion | timestamp | Cuándo se hizo | — |

**Regla de negocio asociada (no expresable en el ER, va en la capa de aplicación):** los resultados de una encuesta solo se muestran si se cumplen **ambas** condiciones a la vez — `total_respuestas >= minimo_respuestas` **Y** `(total_respuestas / total_habilitados) >= porcentaje_minimo`. Si se inserta una fila nueva cada vez que cambian estos valores (en vez de sobrescribir), se obtiene gratis un historial de cómo ha evolucionado el criterio en el tiempo.
