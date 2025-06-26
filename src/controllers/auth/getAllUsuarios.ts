import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma, successResponse, errorResponse, verificarToken } from '../../functions';

interface GetAllUsuariosRequest {
  token: string;
}

const getAllUsuarios = async (
  request: FastifyRequest<{ Body: GetAllUsuariosRequest }>,
  reply: FastifyReply
) => {
  try {
    const { token } = request.body;

    if (!token) {
      return reply.status(400).send(
        errorResponse({ message: 'El token es requerido' })
      );
    }

    const usuario = await verificarToken(token);

    if (!usuario || usuario.role !== 'SUPER') {
      return reply.status(403).send(
        errorResponse({ message: 'No tienes permisos para ver los usuarios' })
      );
    }

    const usuarios = await prisma.usuario.findMany({
      select: {
        id: true,
        name: true,
        lastName: true,
        email: true,
        role: true,
        cedula: true,
        estado: true,
      }
    });

    return reply.status(200).send(
      successResponse({
        message: 'Usuarios obtenidos exitosamente',
        data: usuarios
      })
    );
  } catch (error: any) {
    return reply.status(500).send(
      errorResponse({
        message: error.message || 'Error al obtener los usuarios'
      })
    );
  }
};

export default getAllUsuarios;