import healthcheck from "./healthcheck";
import authRoutes from "./auth";
import lineasDeInvestigacionRoutes from "./lineasDeInvestigacion";
import periodoAcademicoRoutes from "./periodoAcademicoRoutes"
import trabajosRouter from "./trabajos";
import estadisticasRoutes from "./estadisticasRoutes";
import searchRoutes from "./searchRoutes";
import generarReporteRouter from "./reporte";

export {
    healthcheck,
    authRoutes,
    lineasDeInvestigacionRoutes,
    generarReporteRouter,
    searchRoutes,
    estadisticasRoutes,
    periodoAcademicoRoutes,
    trabajosRouter
}