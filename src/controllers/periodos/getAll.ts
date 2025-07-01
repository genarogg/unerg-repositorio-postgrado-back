import { FastifyRequest, FastifyReply } from 'fastify';
import { successResponse, errorResponse, prisma } from '../../functions';

const getAllPeriodosAcademicos = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const periodos = await prisma.periodoAcademico.findMany({
            orderBy: {
                periodo: 'asc'
            },
            include: {
                _count: {
                    select: { Trabajos: true }
                }
            }
        });

        console.log(periodos)

        return reply.status(200).send(
            successResponse({
                message: "Períodos académicos obtenidos exitosamente",
                data: {
                    periodos: periodos.reverse(),
                    total: periodos.length
                }
            })
        );

    } catch (error: any) {
        console.error("Error en getAllPeriodosAcademicos:", error);

        return reply.status(500).send(
            errorResponse({
                message: "Error interno del servidor al obtener períodos académicos"
            })
        );
    }
};

export default getAllPeriodosAcademicos;