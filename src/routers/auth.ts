import { FastifyInstance } from 'fastify';
import {
  loginPost,
  registerPost,
  validarSesion,
  sendEmailRecovery,
  resetPasswordWithToken
} from '../controllers';

const authRoutes = (router: FastifyInstance) => {
  router.post('/login', loginPost);
  router.post('/register', registerPost);
  router.post('/validar-sesion', validarSesion);
  router.post('/send-email-recovery', sendEmailRecovery);
  router.post('/reset-password-with-token', resetPasswordWithToken);
};

export default authRoutes;