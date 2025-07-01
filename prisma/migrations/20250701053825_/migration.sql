-- CreateTable
CREATE TABLE "Usuario" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "cedula" TEXT NOT NULL,
    "estado" BOOLEAN NOT NULL
);

-- CreateTable
CREATE TABLE "Bitacora" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "usuarioId" INTEGER NOT NULL,
    "accion" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "hora" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha" DATETIME NOT NULL,
    "mensaje" TEXT,
    CONSTRAINT "Bitacora_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LineasDeInvestigacion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "estado" BOOLEAN NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    CONSTRAINT "LineasDeInvestigacion_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Trabajo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "titulo" TEXT NOT NULL,
    "autor" TEXT NOT NULL,
    "lineaDeInvestigacionId" INTEGER NOT NULL,
    "estado" TEXT NOT NULL,
    "doc" TEXT NOT NULL,
    "periodoAcademicoId" INTEGER NOT NULL,
    "resumen" TEXT NOT NULL,
    CONSTRAINT "Trabajo_lineaDeInvestigacionId_fkey" FOREIGN KEY ("lineaDeInvestigacionId") REFERENCES "LineasDeInvestigacion" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Trabajo_periodoAcademicoId_fkey" FOREIGN KEY ("periodoAcademicoId") REFERENCES "PeriodoAcademico" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PeriodoAcademico" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "periodo" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Estadistica" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "lineaDeInvestigacionId" INTEGER NOT NULL,
    "cantidadTrabajos" INTEGER NOT NULL,
    "porcentaje" REAL NOT NULL,
    CONSTRAINT "Estadistica_lineaDeInvestigacionId_fkey" FOREIGN KEY ("lineaDeInvestigacionId") REFERENCES "LineasDeInvestigacion" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");
