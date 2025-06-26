import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma, successResponse, errorResponse } from '../../functions';

const getAllLineas = async (
    request: FastifyRequest,
    reply: FastifyReply
) => {
    try {
        const lineas = await prisma.lineasDeInvestigacion.findMany({
            select: {
                id: true,
                nombre: true,
                estado: true,
            }
        });

        return reply.status(200).send(
            successResponse({
                message: 'Líneas de investigación obtenidas exitosamente',
                data: lineas
            })
        );
    } catch (error: any) {
        return reply.status(500).send(
            errorResponse({
                message: error.message || 'Error al obtener las líneas de investigación'
            })
        );
    }
};

export default getAllLineas;