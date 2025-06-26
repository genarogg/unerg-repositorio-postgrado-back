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
        const { token } = request.query;

        if (!token) {
            return reply.status(400).send(
                errorResponse({ message: 'Token es requerido' })
            );
        }

        if (!id || isNaN(parseInt(id))) {
            return reply.status(400).send(
                errorResponse({ message: 'ID del trabajo es requerido y debe ser un número válido' })
            );
        }

        // Verificar token y obtener usuario
        const usuario = await verificarToken(token);

        if (!usuario) {
            return reply.status(403).send(
                errorResponse({ message: 'Token inválido o expirado' })
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