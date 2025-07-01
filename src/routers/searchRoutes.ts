import { FastifyInstance } from 'fastify';
import {
  search
} from '../controllers';

const searchRoutes = (router: FastifyInstance) => {

  router.get('/main', search);

};

export default searchRoutes;