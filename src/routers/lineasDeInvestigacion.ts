import { FastifyInstance } from 'fastify';
import {
  createLinea,
  updateLinea,
  getAllLineas
} from '../controllers';

const lineasDeInvestigacionRoutes = (router: FastifyInstance) => {
  router.post('/create', createLinea);
  router.post('/update', updateLinea);
  router.get('/get-all', getAllLineas);

};

export default lineasDeInvestigacionRoutes;