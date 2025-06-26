import { FastifyInstance } from 'fastify';
import {
  createPeriodoAcademico,
  updatePeriodoAcademico,
  getAllPeriodosAcademicos
} from '../controllers';

const periodoAcademicoRoutes = (router: FastifyInstance) => {
  router.post('/create', createPeriodoAcademico);
  router.put('/update', updatePeriodoAcademico);
  router.get('/get-all', getAllPeriodosAcademicos);

};

export default periodoAcademicoRoutes;