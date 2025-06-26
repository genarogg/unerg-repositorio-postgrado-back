import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma, successResponse, errorResponse } from '../../functions';

const getAllPeriodosAcademicos = async (
    request: FastifyRequest,
    reply: FastifyReply
) => {
    try {
        const periodos = await prisma.periodoAcademico.findMany({
            select: {
                id: true,
                periodo: true
            }
        });

        return reply.status(200).send(
            successResponse({
                message: 'Periodos académicos obtenidos exitosamente',
                data: periodos
            })
        );
    } catch (error: any) {
        return reply.status(500).send(
            errorResponse({
                message: error.message || 'Error al obtener los periodos académicos'
            })
        );
    }
};

export default getAllPeriodosAcademicos;