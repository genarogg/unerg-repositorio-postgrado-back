import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma, verificarToken, successResponse, errorResponse, crearBitacora } from '../../functions';

import { Role } from '@prisma/client';

interface CreateLineaRequest {
    token: string;
    nombre: string;
}

const createLinea = async (
    request: FastifyRequest<{ Body: CreateLineaRequest }>,
    reply: FastifyReply
) => {
    try {
        const { token, nombre } = request.body;

        if (!token || !nombre) {
            return reply.status(400).send(
                errorResponse({ message: 'El token y el nombre son requeridos' })
            );
        }

        // Verificar token y obtener usuario
        const usuario = await verificarToken(token);

        if (!usuario) {
            return reply.status(401).send(
                errorResponse({ message: 'Token inválido o expirado' })
            );
        }

        const { SUPER, EDITOR } = Role;

        // Solo puede crear si es SUPER o EDITOR
        if (usuario.role !== SUPER && usuario.role !== EDITOR) {
            return reply.status(403).send(
                errorResponse({ message: 'No tienes permisos para crear una línea de investigación' })
            );
        }

        // Verifica si la línea de investigación ya existe
        const lineaExistente = await prisma.lineasDeInvestigacion.findFirst({
            where: { nombre: nombre.trim() }
        });

        if (lineaExistente) {
            return reply.status(409).send(
                errorResponse({ message: 'La línea de investigación ya existe' })
            );
        }

        // Crear la línea de investigación con estado activo (true) por defecto
        const nuevaLinea = await prisma.lineasDeInvestigacion.create({
            data: {
                nombre,
                estado: true,
                usuarioId: usuario.id
            }
        });

        // Guardar en la bitácora la creación
        await crearBitacora({
            usuarioId: usuario.id,
            accion: 'CREAR_LINEA_INVESTIGACION',
            mensaje: `El usuario ${usuario.email} creó la línea de investigación "${nombre}"`
        });

        return reply.status(201).send(
            successResponse({
                message: 'Línea de investigación creada exitosamente',
                data: nuevaLinea
            })
        );
    } catch (error: any) {
        return reply.status(500).send(
            errorResponse({ message: error.message || 'Error al crear la línea de investigación' })
        );
    }
};

export default createLinea;