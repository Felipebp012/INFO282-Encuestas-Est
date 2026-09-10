-- CreateTable
CREATE TABLE "Persona" (
    "id" TEXT NOT NULL,
    "rut" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Persona_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "personaId" TEXT,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerificado" BOOLEAN NOT NULL DEFAULT true,
    "passwordHash" TEXT NOT NULL,
    "tokenVerificacion" TEXT,
    "tokenExpiracion" TIMESTAMP(3),
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DominioInstitucional" (
    "id" TEXT NOT NULL,
    "dominio" TEXT NOT NULL,
    "rolPredeterminadoId" TEXT NOT NULL,

    CONSTRAINT "DominioInstitucional_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rol" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "esPredeterminado" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Rol_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permiso" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "descripcion" TEXT,
    "categoria" TEXT,

    CONSTRAINT "Permiso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RolPermiso" (
    "rolId" TEXT NOT NULL,
    "permisoId" TEXT NOT NULL,

    CONSTRAINT "RolPermiso_pkey" PRIMARY KEY ("rolId","permisoId")
);

-- CreateTable
CREATE TABLE "UnidadOrganizacional" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "unidadPadreId" TEXT,

    CONSTRAINT "UnidadOrganizacional_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsuarioRol" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "rolId" TEXT NOT NULL,
    "unidadOrganizacionalId" TEXT NOT NULL,
    "fechaAsignacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UsuarioRol_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plantilla" (
    "id" TEXT NOT NULL,
    "usuarioCreadorId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "estado" TEXT NOT NULL DEFAULT 'publicada',
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Plantilla_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlantillaPregunta" (
    "id" TEXT NOT NULL,
    "plantillaId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "orden" INTEGER NOT NULL,
    "obligatoria" BOOLEAN NOT NULL DEFAULT true,
    "minSelecciones" INTEGER,
    "maxSelecciones" INTEGER,
    "mostrarSiPreguntaId" TEXT,
    "mostrarSiOpcionId" TEXT,

    CONSTRAINT "PlantillaPregunta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlantillaOpcion" (
    "id" TEXT NOT NULL,
    "plantillaPreguntaId" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "orden" INTEGER NOT NULL,
    "valorNumerico" INTEGER,

    CONSTRAINT "PlantillaOpcion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlantillaCompartida" (
    "plantillaId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "fechaCompartido" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlantillaCompartida_pkey" PRIMARY KEY ("plantillaId","usuarioId")
);

-- CreateTable
CREATE TABLE "Curso" (
    "id" TEXT NOT NULL,
    "unidadOrganizacionalId" TEXT,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Curso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeccionCurso" (
    "id" TEXT NOT NULL,
    "cursoId" TEXT NOT NULL,
    "anio" INTEGER NOT NULL,
    "semestre" INTEGER NOT NULL,
    "grupo" TEXT,

    CONSTRAINT "SeccionCurso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeccionCursoAlumno" (
    "id" TEXT NOT NULL,
    "seccionCursoId" TEXT NOT NULL,
    "personaId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "rut" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fechaAlta" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaBaja" TIMESTAMP(3),

    CONSTRAINT "SeccionCursoAlumno_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UnidadOrganizacionalUsuario" (
    "id" TEXT NOT NULL,
    "unidadOrganizacionalId" TEXT NOT NULL,
    "personaId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "rut" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fechaAlta" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaBaja" TIMESTAMP(3),

    CONSTRAINT "UnidadOrganizacionalUsuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Encuesta" (
    "id" TEXT NOT NULL,
    "plantillaId" TEXT,
    "usuarioCreadorId" TEXT NOT NULL,
    "modo" TEXT NOT NULL DEFAULT 'libre',
    "unidad" TEXT,
    "titulo" TEXT NOT NULL,
    "asignatura" TEXT,
    "escuela" TEXT,
    "facultad" TEXT,
    "fechaInicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaFin" TIMESTAMP(3) NOT NULL,
    "mensajeCierre" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'activa',
    "umbralPorcentaje" DOUBLE PRECISION NOT NULL DEFAULT 0.33,
    "umbralMinimo" INTEGER NOT NULL DEFAULT 5,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Encuesta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EncuestaSeccionCurso" (
    "encuestaId" TEXT NOT NULL,
    "seccionCursoId" TEXT NOT NULL,

    CONSTRAINT "EncuestaSeccionCurso_pkey" PRIMARY KEY ("encuestaId","seccionCursoId")
);

-- CreateTable
CREATE TABLE "EncuestaParticipante" (
    "id" TEXT NOT NULL,
    "encuestaId" TEXT NOT NULL,
    "seccionCursoAlumnoId" TEXT NOT NULL,
    "respondido" BOOLEAN NOT NULL DEFAULT false,
    "fechaRespuesta" TIMESTAMP(3),
    "recordatorioEnviado" BOOLEAN NOT NULL DEFAULT false,
    "fechaRecordatorio" TIMESTAMP(3),

    CONSTRAINT "EncuestaParticipante_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EncuestaUnidadOrganizacional" (
    "encuestaId" TEXT NOT NULL,
    "unidadOrganizacionalId" TEXT NOT NULL,

    CONSTRAINT "EncuestaUnidadOrganizacional_pkey" PRIMARY KEY ("encuestaId","unidadOrganizacionalId")
);

-- CreateTable
CREATE TABLE "EncuestaParticipanteUnidad" (
    "id" TEXT NOT NULL,
    "encuestaId" TEXT NOT NULL,
    "unidadOrganizacionalUsuarioId" TEXT NOT NULL,
    "respondido" BOOLEAN NOT NULL DEFAULT false,
    "fechaRespuesta" TIMESTAMP(3),
    "recordatorioEnviado" BOOLEAN NOT NULL DEFAULT false,
    "fechaRecordatorio" TIMESTAMP(3),

    CONSTRAINT "EncuestaParticipanteUnidad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EncuestaParticipanteLibre" (
    "id" TEXT NOT NULL,
    "encuestaId" TEXT NOT NULL,
    "personaId" TEXT,
    "email" TEXT NOT NULL,
    "rut" TEXT,
    "respondido" BOOLEAN NOT NULL DEFAULT false,
    "fechaRespuesta" TIMESTAMP(3),
    "fechaCarga" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recordatorioEnviado" BOOLEAN NOT NULL DEFAULT false,
    "fechaRecordatorio" TIMESTAMP(3),

    CONSTRAINT "EncuestaParticipanteLibre_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EncuestaComentario" (
    "id" TEXT NOT NULL,
    "encuestaId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EncuestaComentario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pregunta" (
    "id" TEXT NOT NULL,
    "encuestaId" TEXT NOT NULL,
    "plantillaPreguntaOrigenId" TEXT,
    "tipo" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "orden" INTEGER NOT NULL,
    "obligatoria" BOOLEAN NOT NULL DEFAULT true,
    "minSelecciones" INTEGER,
    "maxSelecciones" INTEGER,
    "mostrarSiPreguntaId" TEXT,
    "mostrarSiOpcionId" TEXT,

    CONSTRAINT "Pregunta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpcionRespuesta" (
    "id" TEXT NOT NULL,
    "preguntaId" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "orden" INTEGER NOT NULL,
    "valorNumerico" INTEGER,

    CONSTRAINT "OpcionRespuesta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Respuesta" (
    "id" TEXT NOT NULL,
    "encuestaId" TEXT NOT NULL,
    "fechaEnvio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Respuesta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RespuestaDetalle" (
    "id" TEXT NOT NULL,
    "respuestaId" TEXT NOT NULL,
    "preguntaId" TEXT NOT NULL,
    "valorTexto" TEXT,
    "opcionId" TEXT,

    CONSTRAINT "RespuestaDetalle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CodigoQr" (
    "id" TEXT NOT NULL,
    "encuestaId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "fechaGeneracion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CodigoQr_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiToken" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "fechaExpiracion" TIMESTAMP(3),
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApiToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TokenPermiso" (
    "tokenId" TEXT NOT NULL,
    "permisoId" TEXT NOT NULL,

    CONSTRAINT "TokenPermiso_pkey" PRIMARY KEY ("tokenId","permisoId")
);

-- CreateTable
CREATE TABLE "ConfiguracionPlataforma" (
    "id" TEXT NOT NULL,
    "minimoRespuestas" INTEGER NOT NULL,
    "porcentajeMinimo" DOUBLE PRECISION NOT NULL,
    "actualizadoPorId" TEXT NOT NULL,
    "fechaActualizacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConfiguracionPlataforma_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Persona_rut_key" ON "Persona"("rut");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_personaId_key" ON "Usuario"("personaId");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "DominioInstitucional_dominio_key" ON "DominioInstitucional"("dominio");

-- CreateIndex
CREATE UNIQUE INDEX "Rol_nombre_key" ON "Rol"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Permiso_codigo_key" ON "Permiso"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "UsuarioRol_usuarioId_rolId_unidadOrganizacionalId_key" ON "UsuarioRol"("usuarioId", "rolId", "unidadOrganizacionalId");

-- CreateIndex
CREATE INDEX "EncuestaSeccionCurso_seccionCursoId_idx" ON "EncuestaSeccionCurso"("seccionCursoId");

-- CreateIndex
CREATE INDEX "EncuestaUnidadOrganizacional_unidadOrganizacionalId_idx" ON "EncuestaUnidadOrganizacional"("unidadOrganizacionalId");

-- CreateIndex
CREATE UNIQUE INDEX "EncuestaParticipanteLibre_encuestaId_email_key" ON "EncuestaParticipanteLibre"("encuestaId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "ApiToken_token_key" ON "ApiToken"("token");

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_personaId_fkey" FOREIGN KEY ("personaId") REFERENCES "Persona"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DominioInstitucional" ADD CONSTRAINT "DominioInstitucional_rolPredeterminadoId_fkey" FOREIGN KEY ("rolPredeterminadoId") REFERENCES "Rol"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolPermiso" ADD CONSTRAINT "RolPermiso_rolId_fkey" FOREIGN KEY ("rolId") REFERENCES "Rol"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolPermiso" ADD CONSTRAINT "RolPermiso_permisoId_fkey" FOREIGN KEY ("permisoId") REFERENCES "Permiso"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnidadOrganizacional" ADD CONSTRAINT "UnidadOrganizacional_unidadPadreId_fkey" FOREIGN KEY ("unidadPadreId") REFERENCES "UnidadOrganizacional"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsuarioRol" ADD CONSTRAINT "UsuarioRol_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsuarioRol" ADD CONSTRAINT "UsuarioRol_rolId_fkey" FOREIGN KEY ("rolId") REFERENCES "Rol"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsuarioRol" ADD CONSTRAINT "UsuarioRol_unidadOrganizacionalId_fkey" FOREIGN KEY ("unidadOrganizacionalId") REFERENCES "UnidadOrganizacional"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Plantilla" ADD CONSTRAINT "Plantilla_usuarioCreadorId_fkey" FOREIGN KEY ("usuarioCreadorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlantillaPregunta" ADD CONSTRAINT "PlantillaPregunta_plantillaId_fkey" FOREIGN KEY ("plantillaId") REFERENCES "Plantilla"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlantillaOpcion" ADD CONSTRAINT "PlantillaOpcion_plantillaPreguntaId_fkey" FOREIGN KEY ("plantillaPreguntaId") REFERENCES "PlantillaPregunta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlantillaCompartida" ADD CONSTRAINT "PlantillaCompartida_plantillaId_fkey" FOREIGN KEY ("plantillaId") REFERENCES "Plantilla"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlantillaCompartida" ADD CONSTRAINT "PlantillaCompartida_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Curso" ADD CONSTRAINT "Curso_unidadOrganizacionalId_fkey" FOREIGN KEY ("unidadOrganizacionalId") REFERENCES "UnidadOrganizacional"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeccionCurso" ADD CONSTRAINT "SeccionCurso_cursoId_fkey" FOREIGN KEY ("cursoId") REFERENCES "Curso"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeccionCursoAlumno" ADD CONSTRAINT "SeccionCursoAlumno_seccionCursoId_fkey" FOREIGN KEY ("seccionCursoId") REFERENCES "SeccionCurso"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeccionCursoAlumno" ADD CONSTRAINT "SeccionCursoAlumno_personaId_fkey" FOREIGN KEY ("personaId") REFERENCES "Persona"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnidadOrganizacionalUsuario" ADD CONSTRAINT "UnidadOrganizacionalUsuario_unidadOrganizacionalId_fkey" FOREIGN KEY ("unidadOrganizacionalId") REFERENCES "UnidadOrganizacional"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnidadOrganizacionalUsuario" ADD CONSTRAINT "UnidadOrganizacionalUsuario_personaId_fkey" FOREIGN KEY ("personaId") REFERENCES "Persona"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Encuesta" ADD CONSTRAINT "Encuesta_plantillaId_fkey" FOREIGN KEY ("plantillaId") REFERENCES "Plantilla"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Encuesta" ADD CONSTRAINT "Encuesta_usuarioCreadorId_fkey" FOREIGN KEY ("usuarioCreadorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EncuestaSeccionCurso" ADD CONSTRAINT "EncuestaSeccionCurso_encuestaId_fkey" FOREIGN KEY ("encuestaId") REFERENCES "Encuesta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EncuestaSeccionCurso" ADD CONSTRAINT "EncuestaSeccionCurso_seccionCursoId_fkey" FOREIGN KEY ("seccionCursoId") REFERENCES "SeccionCurso"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EncuestaParticipante" ADD CONSTRAINT "EncuestaParticipante_encuestaId_fkey" FOREIGN KEY ("encuestaId") REFERENCES "Encuesta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EncuestaParticipante" ADD CONSTRAINT "EncuestaParticipante_seccionCursoAlumnoId_fkey" FOREIGN KEY ("seccionCursoAlumnoId") REFERENCES "SeccionCursoAlumno"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EncuestaUnidadOrganizacional" ADD CONSTRAINT "EncuestaUnidadOrganizacional_encuestaId_fkey" FOREIGN KEY ("encuestaId") REFERENCES "Encuesta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EncuestaUnidadOrganizacional" ADD CONSTRAINT "EncuestaUnidadOrganizacional_unidadOrganizacionalId_fkey" FOREIGN KEY ("unidadOrganizacionalId") REFERENCES "UnidadOrganizacional"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EncuestaParticipanteUnidad" ADD CONSTRAINT "EncuestaParticipanteUnidad_encuestaId_fkey" FOREIGN KEY ("encuestaId") REFERENCES "Encuesta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EncuestaParticipanteUnidad" ADD CONSTRAINT "EncuestaParticipanteUnidad_unidadOrganizacionalUsuarioId_fkey" FOREIGN KEY ("unidadOrganizacionalUsuarioId") REFERENCES "UnidadOrganizacionalUsuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EncuestaParticipanteLibre" ADD CONSTRAINT "EncuestaParticipanteLibre_encuestaId_fkey" FOREIGN KEY ("encuestaId") REFERENCES "Encuesta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EncuestaParticipanteLibre" ADD CONSTRAINT "EncuestaParticipanteLibre_personaId_fkey" FOREIGN KEY ("personaId") REFERENCES "Persona"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EncuestaComentario" ADD CONSTRAINT "EncuestaComentario_encuestaId_fkey" FOREIGN KEY ("encuestaId") REFERENCES "Encuesta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EncuestaComentario" ADD CONSTRAINT "EncuestaComentario_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pregunta" ADD CONSTRAINT "Pregunta_encuestaId_fkey" FOREIGN KEY ("encuestaId") REFERENCES "Encuesta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pregunta" ADD CONSTRAINT "Pregunta_plantillaPreguntaOrigenId_fkey" FOREIGN KEY ("plantillaPreguntaOrigenId") REFERENCES "PlantillaPregunta"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpcionRespuesta" ADD CONSTRAINT "OpcionRespuesta_preguntaId_fkey" FOREIGN KEY ("preguntaId") REFERENCES "Pregunta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Respuesta" ADD CONSTRAINT "Respuesta_encuestaId_fkey" FOREIGN KEY ("encuestaId") REFERENCES "Encuesta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RespuestaDetalle" ADD CONSTRAINT "RespuestaDetalle_respuestaId_fkey" FOREIGN KEY ("respuestaId") REFERENCES "Respuesta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RespuestaDetalle" ADD CONSTRAINT "RespuestaDetalle_preguntaId_fkey" FOREIGN KEY ("preguntaId") REFERENCES "Pregunta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RespuestaDetalle" ADD CONSTRAINT "RespuestaDetalle_opcionId_fkey" FOREIGN KEY ("opcionId") REFERENCES "OpcionRespuesta"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodigoQr" ADD CONSTRAINT "CodigoQr_encuestaId_fkey" FOREIGN KEY ("encuestaId") REFERENCES "Encuesta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiToken" ADD CONSTRAINT "ApiToken_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TokenPermiso" ADD CONSTRAINT "TokenPermiso_tokenId_fkey" FOREIGN KEY ("tokenId") REFERENCES "ApiToken"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TokenPermiso" ADD CONSTRAINT "TokenPermiso_permisoId_fkey" FOREIGN KEY ("permisoId") REFERENCES "Permiso"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConfiguracionPlataforma" ADD CONSTRAINT "ConfiguracionPlataforma_actualizadoPorId_fkey" FOREIGN KEY ("actualizadoPorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
