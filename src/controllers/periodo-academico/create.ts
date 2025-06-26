import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma, successResponse, errorResponse, verificarToken, crearBitacora } from '../../functions';

interface CreatePeriodoRequest {
    token: string;
    periodo: string;
}

const createPeriodoAcademico = async (
    request: FastifyRequest<{ Body: CreatePeriodoRequest }>,
    reply: FastifyReply
) => {
    try {
        const { token, periodo } = request.body;

        if (!token || !periodo) {
            return reply.status(400).send(
                errorResponse({ message: 'El token y el periodo son requeridos' })
            );
        }

        // Verificar token y obtener usuario
        const usuario = await verificarToken(token);

        if (!usuario || (usuario.role !== 'SUPER' && usuario.role !== 'EDITOR')) {
            return reply.status(403).send(
                errorResponse({ message: 'No tienes permisos para crear un periodo académico' })
            );
        }

        // Verificar si el periodo ya existe
        const periodoExistente = await prisma.periodoAcademico.findFirst({
            where: { periodo: periodo.trim() }
        });

        if (periodoExistente) {
            return reply.status(409).send(
                errorResponse({ message: 'El periodo académico ya existe' })
            );
        }

        // Crear el periodo académico
        const nuevoPeriodo = await prisma.periodoAcademico.create({
            data: {
                periodo: periodo.trim()
            }
        });

        // Guardar en la bitácora la creación
        crearBitacora({
            usuarioId: usuario.id,
            accion: 'CREAR_PERIODO_ACADEMICO',
            mensaje: `El usuario ${usuario.email} creó el periodo académico "${periodo.trim()}"`
        });

        return reply.status(201).send(
            successResponse({
                message: 'Periodo académico creado exitosamente',
                data: nuevoPeriodo
            })
        );

    } catch (error: any) {
        return reply.status(500).send(
            errorResponse({ message: error.message || 'Error al crear el periodo académico' })
        );
    }
};

export default createPeriodoAcademico;