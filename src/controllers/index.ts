
// Auth Controllers
import loginPost from "./auth/login";
import registerPost from "./auth/register";
import validarSesion from "./auth/validarSesion";
import sendEmailRecovery from "./auth/sendEmailRecovery";
import resetPasswordWithToken from "./auth/resetPasswordWithToken";
import getAllUsuarios from "./auth/getAllUsuarios";

// Linea de Investigación Controllers
import createLinea from "./linea-de-investigacion/create";
import updateLinea from "./linea-de-investigacion/update";
import getAllLineas from "./linea-de-investigacion/getAll";

// periodos academicos
import createPeriodoAcademico from "./periodo-academico/create";
import updatePeriodoAcademico from "./periodo-academico/update";
import getAllPeriodosAcademicos from "./periodo-academico/getAll";


// Export all controllers
export {
    // Auth Controllers
    loginPost,
    registerPost,
    validarSesion,
    sendEmailRecovery,
    resetPasswordWithToken,
    getAllUsuarios,

    // Linea de Investigación Controllers
    createLinea,
    updateLinea,
    getAllLineas,

    // periodos academicos
    createPeriodoAcademico,
    updatePeriodoAcademico,
    getAllPeriodosAcademicos
}