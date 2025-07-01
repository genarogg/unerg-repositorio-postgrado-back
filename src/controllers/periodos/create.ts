import { FastifyRequest, FastifyReply } from 'fastify';
import { successResponse, errorResponse, prisma } from '../../functions';

interface CreatePeriodoAcademicoRequest {
    periodo: string;
}

const createPeriodoAcademico = async (
    request: FastifyRequest<{ Body: CreatePeriodoAcademicoRequest }>, 
    reply: FastifyReply
) => {
    try {
        const { periodo } = request.body;

        console.log("Datos de creación período académico:", { periodo });

        // Validación de entrada
        if (!periodo || periodo.trim() === '') {
            return reply.status(400).send(
                errorResponse({
                    message: "El campo período es requerido"
                })
            );
        }

        // Verificar si el período académico ya existe
        const periodoExistente = await prisma.periodoAcademico.findFirst({
            where: { 
                periodo: {
                    equals: periodo.trim(),
                
                }
            }
        });

        if (periodoExistente) {
            return reply.status(409).send(
                errorResponse({
                    message: "El período académico ya existe"
                })
            );
        }

        // Crear período académico
        const nuevoPeriodo = await prisma.periodoAcademico.create({
            data: {
                periodo: periodo.trim()
            }
        });

      
        return reply.status(201).send(
            successResponse({
                message: "Período académico creado exitosamente",
                data: {
                    periodoAcademico: nuevoPeriodo
                }
            })
        );

    } catch (error: any) {
        console.error("Error en createPeriodoAcademico:", error);

        return reply.status(500).send(
            errorResponse({
                message: "Error interno del servidor (creación período académico). Inténtalo de nuevo más tarde."
            })
        );
    }
};

export default createPeriodoAcademico;