
// Auth Controllers
import loginPost from "./auth/login";
import registerPost from "./auth/register";
import validarSesion from "./auth/validarSesion";
import sendEmailRecovery from "./auth/sendEmailRecovery";
import resetPasswordWithToken from "./auth/resetPasswordWithToken";
import getAllUsuarios from "./auth/getAllUsuarios";
import changePassword from "./auth/changePassword";
import updateUser from "./auth/updateUser";

// Linea de Investigación Controllers
import createLinea from "./linea-de-investigacion/create";
import updateLinea from "./linea-de-investigacion/update";
import getAllLineas from "./linea-de-investigacion/getAll";

// periodos academicos
import createPeriodoAcademico from "./periodos/create";
import updatePeriodoAcademico from "./periodos/update";
import getAllPeriodosAcademicos from "./periodos/getAll";

// trabajos
import createTrabajo from "./trabajos/create";
import updateTrabajo from "./trabajos/update";
import getAllTrabajos from "./trabajos/getAllTrabajos";
import getTrabajoById from "./trabajos/getTrabajoById";

// search
import search from "./filters/search";


// Export all controllers
export {
    // Auth Controllers
    loginPost,
    registerPost,
    validarSesion,
    sendEmailRecovery,
    resetPasswordWithToken,
    getAllUsuarios,
    changePassword,
    updateUser,

    // Linea de Investigación Controllers
    createLinea,
    updateLinea,
    getAllLineas,

    // periodos academicos
    createPeriodoAcademico,
    updatePeriodoAcademico,
    getAllPeriodosAcademicos,

    // trabajos
    createTrabajo,
    updateTrabajo,
    getAllTrabajos,
    getTrabajoById,

    // search
    search,

}