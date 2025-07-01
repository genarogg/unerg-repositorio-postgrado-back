import { FastifyRequest, FastifyReply } from 'fastify';
import { successResponse, errorResponse,  prisma } from '../../functions';

interface UpdatePeriodoAcademicoRequest {
    id: number;
    periodo: string;
}

const updatePeriodoAcademico = async (
    request: FastifyRequest<{ Body: UpdatePeriodoAcademicoRequest }>, 
    reply: FastifyReply
) => {
    try {
        const { id, periodo } = request.body;

        console.log("Datos de actualización período académico:", { id, periodo });

        // Validación de entrada
        if (!id || !periodo || periodo.trim() === '') {
            return reply.status(400).send(
                errorResponse({
                    message: "Los campos ID y período son requeridos"
                })
            );
        }

        // Validar que el ID sea un número válido
        if (isNaN(Number(id))) {
            return reply.status(400).send(
                errorResponse({ 
                    message: 'El ID del período académico debe ser un número válido' 
                })
            );
        }

        // Verificar si el período académico existe
        const periodoExistente = await prisma.periodoAcademico.findUnique({
            where: { id: Number(id) }
        });

        if (!periodoExistente) {
            return reply.status(404).send(
                errorResponse({
                    message: "Período académico no encontrado"
                })
            );
        }

        // Verificar si ya existe otro período con el mismo nombre
        const periodoConMismoNombre = await prisma.periodoAcademico.findFirst({
            where: { 
                periodo: {
                    equals: periodo.trim(),
         
                },
                NOT: { id: Number(id) }
            }
        });

        if (periodoConMismoNombre) {
            return reply.status(409).send(
                errorResponse({
                    message: "Ya existe otro período académico con ese nombre"
                })
            );
        }

        // Actualizar período académico
        const periodoActualizado = await prisma.periodoAcademico.update({
            where: { id: Number(id) },
            data: {
                periodo: periodo.trim()
            }
        });


        return reply.status(200).send(
            successResponse({
                message: "Período académico actualizado exitosamente",
                data: {
                    periodoAcademico: periodoActualizado
                }
            })
        );

    } catch (error: any) {
        console.error("Error en updatePeriodoAcademico:", error);

        return reply.status(500).send(
            errorResponse({
                message: "Error interno del servidor (actualización período académico). Inténtalo de nuevo más tarde."
            })
        );
    }
};

export default updatePeriodoAcademico;