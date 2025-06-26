import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma, successResponse, errorResponse, verificarToken, crearBitacora } from '../../functions';

interface UpdatePeriodoRequest {
    token: string;
    id: number;
    periodo?: string;
}

const updatePeriodoAcademico = async (
    request: FastifyRequest<{ Body: UpdatePeriodoRequest }>,
    reply: FastifyReply
) => {
    try {
        const { token, id, periodo } = request.body;

        if (!token || !id) {
            return reply.status(400).send(
                errorResponse({ message: 'El token y el id son requeridos' })
            );
        }

        // Verificar token y obtener usuario
        const usuario = await verificarToken(token);

        if (!usuario || (usuario.role !== 'SUPER' && usuario.role !== 'EDITOR')) {
            return reply.status(403).send(
                errorResponse({ message: 'No tienes permisos para actualizar un periodo académico' })
            );
        }

        // Buscar el periodo académico existente
        const periodoExistente = await prisma.periodoAcademico.findUnique({
            where: { id }
        });

        if (!periodoExistente) {
            return reply.status(404).send(
                errorResponse({ message: 'Periodo académico no encontrado' })
            );
        }

        // Si se va a actualizar el nombre, verificar que no exista otro igual
        if (periodo && periodo.trim() !== periodoExistente.periodo) {
            const periodoDuplicado = await prisma.periodoAcademico.findFirst({
                where: { periodo: periodo.trim(), NOT: { id } }
            });
            if (periodoDuplicado) {
                return reply.status(409).send(
                    errorResponse({ message: 'Ya existe un periodo académico con ese nombre' })
                );
            }
        }

        // Actualizar el periodo académico
        const periodoActualizado = await prisma.periodoAcademico.update({
            where: { id },
            data: {
                ...(periodo ? { periodo: periodo.trim() } : {})
            }
        });

        // Guardar en la bitácora la actualización
        await crearBitacora({
            usuarioId: usuario.id,
            accion: 'ACTUALIZAR_PERIODO_ACADEMICO',
            mensaje: `El usuario ${usuario.email} actualizó el periodo académico (ID: ${id})`
        });

        return reply.status(200).send(
            successResponse({
                message: 'Periodo académico actualizado exitosamente',
                data: periodoActualizado
            })
        );
    } catch (error: any) {
        return reply.status(500).send(
            errorResponse({ message: error.message || 'Error al actualizar el periodo académico' })
        );
    }
};

export default updatePeriodoAcademico;