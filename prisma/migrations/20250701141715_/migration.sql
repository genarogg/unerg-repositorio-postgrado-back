-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER', 'EDITOR');

-- CreateEnum
CREATE TYPE "Estado" AS ENUM ('PENDIENTE', 'VALIDADO', 'RECHAZADO');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "cedula" TEXT NOT NULL,
    "estado" BOOLEAN NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bitacora" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "accion" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "hora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha" TIMESTAMP(3) NOT NULL,
    "mensaje" TEXT,

    CONSTRAINT "Bitacora_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LineasDeInvestigacion" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "estado" BOOLEAN NOT NULL,
    "usuarioId" INTEGER NOT NULL,

    CONSTRAINT "LineasDeInvestigacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trabajo" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "autor" TEXT NOT NULL,
    "lineaDeInvestigacionId" INTEGER NOT NULL,
    "estado" "Estado" NOT NULL,
    "doc" TEXT NOT NULL,
    "periodoAcademicoId" INTEGER NOT NULL,
    "resumen" TEXT NOT NULL,

    CONSTRAINT "Trabajo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PeriodoAcademico" (
    "id" SERIAL NOT NULL,
    "periodo" TEXT NOT NULL,

    CONSTRAINT "PeriodoAcademico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Estadistica" (
    "id" SERIAL NOT NULL,
    "lineaDeInvestigacionId" INTEGER NOT NULL,
    "cantidadTrabajos" INTEGER NOT NULL,
    "porcentaje" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Estadistica_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- AddForeignKey
ALTER TABLE "Bitacora" ADD CONSTRAINT "Bitacora_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LineasDeInvestigacion" ADD CONSTRAINT "LineasDeInvestigacion_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trabajo" ADD CONSTRAINT "Trabajo_lineaDeInvestigacionId_fkey" FOREIGN KEY ("lineaDeInvestigacionId") REFERENCES "LineasDeInvestigacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trabajo" ADD CONSTRAINT "Trabajo_periodoAcademicoId_fkey" FOREIGN KEY ("periodoAcademicoId") REFERENCES "PeriodoAcademico"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Estadistica" ADD CONSTRAINT "Estadistica_lineaDeInvestigacionId_fkey" FOREIGN KEY ("lineaDeInvestigacionId") REFERENCES "LineasDeInvestigacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
