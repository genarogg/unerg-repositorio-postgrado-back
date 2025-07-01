import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma, verificarToken, successResponse, errorResponse, crearBitacora, uploadFileLocal } from '../../functions';

import { Estado } from '@prisma/client';

interface CreateTrabajoRequest {
    token: string;
    titulo: string;
    autor: string;
    lineaDeInvestigacionId: number;
    doc: any; // Archivo PDF que se subirá
    periodoAcademicoId: number;
    estado?: Estado;
}

const createTrabajo = async (
    request: FastifyRequest<{ Body: CreateTrabajoRequest }>,
    reply: FastifyReply
) => {
    try {
        const { token, titulo, autor, lineaDeInvestigacionId, doc, periodoAcademicoId, estado } = request.body;

        console.log({ token, titulo, autor, lineaDeInvestigacionId, periodoAcademicoId, estado });

        if (!token || !titulo || !autor || !lineaDeInvestigacionId || !doc || !periodoAcademicoId) {
            return reply.status(400).send(
                errorResponse({ message: 'Todos los campos son requeridos' })
            );
        }

        // Verificar token y obtener usuario
        const usuario = await verificarToken(token);

        if (!usuario || (usuario.role !== 'SUPER' && usuario.role !== 'EDITOR')) {
            return reply.status(403).send(
                errorResponse({ message: 'No tienes permisos para crear un trabajo' })
            );
        }

        // Verificar si ya existe un trabajo con el mismo título en la misma línea y periodo
        const trabajoExistente = await prisma.trabajo.findFirst({
            where: {
                titulo: titulo.trim(),
                lineaDeInvestigacionId,
                periodoAcademicoId
            }
        });

        if (trabajoExistente) {
            return reply.status(409).send(
                errorResponse({ message: 'Ya existe un trabajo con ese título en la misma línea y periodo académico' })
            );
        }

        console.log('Subiendo archivo PDF...');

        // Subir el archivo PDF al servidor y obtener la referencia
        const docPath = await uploadFileLocal(doc, 'trabajos'); // Guardar en carpeta 'trabajos'

        // Crear el trabajo con la referencia al archivo
        const nuevoTrabajo = await prisma.trabajo.create({
            data: {
                titulo: titulo.trim(),
                autor: autor.trim(),
                lineaDeInvestigacionId,
                doc: docPath, // Guardar la referencia al archivo
                periodoAcademicoId,
                estado: estado ?? 'pendiente',
                resumen: '' // O puedes obtenerlo de request.body si lo tienes disponible
            }
        });

        // Guardar en la bitácora la creación
        await crearBitacora({
            usuarioId: usuario.id,
            accion: 'CREAR_TRABAJO',
            mensaje: `El usuario ${usuario.email} creó el trabajo "${titulo.trim()}" con documento ${docPath}`
        });

        return reply.status(201).send(
            successResponse({
                message: 'Trabajo creado exitosamente',
                data: nuevoTrabajo
            })
        );
    } catch (error: any) {
        // Si hay error después de subir el archivo, podrías considerar eliminarlo
        return reply.status(500).send(
            errorResponse({ message: error.message || 'Error al crear el trabajo' })
        );
    }
};

export default createTrabajo;