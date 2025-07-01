import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma, verificarToken, successResponse, errorResponse } from '../../functions';

interface GetTrabajoByIdParams {
    id: string;
}

interface GetTrabajoByIdQuery {
    token: string;
}

const getTrabajoById = async (
    request: FastifyRequest<{
        Params: GetTrabajoByIdParams;
        Querystring: GetTrabajoByIdQuery;
    }>,
    reply: FastifyReply
) => {
    try {
        const { id } = request.params;
      

        
        if (!id || isNaN(parseInt(id))) {
            return reply.status(400).send(
                errorResponse({ message: 'ID del trabajo es requerido y debe ser un número válido' })
            );
        }

      

        // Buscar el trabajo por ID con todas sus relaciones
        const trabajo = await prisma.trabajo.findUnique({
            where: {
                id: parseInt(id)
            },
            include: {
                lineaDeInvestigacion: {
                    select: {
                        id: true,
                        nombre: true,
                        estado: true,
                        usuario: {
                            select: {
                                id: true,
                                name: true,
                                lastName: true,
                                email: true
                            }
                        }
                    }
                },
                periodoAcademico: {
                    select: {
                        id: true,
                        periodo: true
                    }
                }
            }
        });

        if (!trabajo) {
            return reply.status(404).send(
                errorResponse({ message: 'Trabajo no encontrado' })
            );
        }

        return reply.status(200).send(
            successResponse({
                message: 'Trabajo obtenido exitosamente',
                data: trabajo
            })
        );

    } catch (error: any) {
        return reply.status(500).send(
            errorResponse({ message: error.message || 'Error al obtener el trabajo' })
        );
    }
};

export default getTrabajoById;