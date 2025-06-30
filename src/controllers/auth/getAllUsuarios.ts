import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma, successResponse, errorResponse, verificarToken } from '../../functions';

interface GetAllUsuariosRequest {

}

const getAllUsuarios = async (
  request: FastifyRequest<{ Body: GetAllUsuariosRequest }>,
  reply: FastifyReply
) => {
  try {
   

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

    console.log("Usuarios obtenidos:", usuarios); 

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