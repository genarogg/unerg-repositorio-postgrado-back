import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { successResponse, errorResponse } from '../../functions';

const prisma = new PrismaClient();

/**
 * Obtiene todas las estadísticas existentes con el nombre de la línea de investigación
 */
const obtenerEstadisticas = async (request: FastifyRequest, reply: FastifyReply) => {
  try {

    console.log('Obteniendo estadísticas de trabajos por línea de investigación...');
    const estadisticas = await prisma.estadistica.findMany({
      include: {
        lineaDeInvestigacion: {
          select: {
            id: true,
            nombre: true,
            estado: true
          }
        }
      },
      orderBy: {
        porcentaje: 'desc'
      }
    });

    const totalTrabajos = estadisticas.reduce((total, est) => {
      return total + est.cantidadTrabajos;
    }, 0);

    return reply.status(200).send(
      successResponse({
        message: 'Estadísticas obtenidas correctamente',
        data: {
          estadisticas,
          totalTrabajos,
          cantidadLineas: estadisticas.length
        }
      })
    );

  } catch (error: any) {
    console.error('Error al obtener estadísticas:', error);
    
    return reply.status(500).send(
      errorResponse({
        message: 'Error interno del servidor al obtener las estadísticas'
      })
    );
  }
};

export default obtenerEstadisticas;