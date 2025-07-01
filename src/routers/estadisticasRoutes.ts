import { FastifyInstance } from 'fastify';
import {

  obtenerEstadisticas
} from '../controllers';

const estadisticasRoutes = (router: FastifyInstance) => {

  router.get('/get-all', obtenerEstadisticas);

};

export default estadisticasRoutes;