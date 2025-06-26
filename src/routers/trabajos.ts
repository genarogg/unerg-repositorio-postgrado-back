import { FastifyInstance } from 'fastify';
import {
    createTrabajo,
    updateTrabajo,
    getAllTrabajos,
    getTrabajoById,
} from '../controllers';

const trabajosRouter = (router: FastifyInstance) => {
    router.post('/create', createTrabajo);
    router.put('/update', updateTrabajo);
    router.get('/get-all', getAllTrabajos);
    router.get('/get-by-id/:id', getTrabajoById);

};

export default trabajosRouter;