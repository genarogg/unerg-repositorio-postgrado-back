import { FastifyInstance } from 'fastify';
import {
  generarReporte
} from '../controllers';

const authRoutes = (router: FastifyInstance) => {
  router.post('/generar', generarReporte);

};

export default authRoutes;