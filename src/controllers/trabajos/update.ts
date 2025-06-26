import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma, verificarToken, successResponse, errorResponse, crearBitacora, uploadFileLocal } from '../../functions';
import { Estado } from '@prisma/client';
import { unlinkSync, existsSync } from 'fs';
import path from 'path';

interface UpdateTrabajoRequest {
    token: string;
    id: number;
    titulo?: string;
    autor?: string;
    lineaDeInvestigacionId?: number;
    doc?: any; // Nuevo archivo PDF (opcional)
    periodoAcademicoId?: number;
    estado?: Estado;
}

const updateTrabajo = async (
    request: FastifyRequest<{ Body: UpdateTrabajoRequest }>,
    reply: FastifyReply
) => {
    try {
        const { token, id, titulo, autor, lineaDeInvestigacionId, doc, periodoAcademicoId, estado } = request.body;

        if (!token || !id) {
            return reply.status(400).send(
                errorResponse({ message: 'Token e ID del trabajo son requeridos' })
            );
        }

        // Verificar token y obtener usuario
        const usuario = await verificarToken(token);

        if (!usuario || (usuario.role !== 'SUPER' && usuario.role !== 'EDITOR')) {
            return reply.status(403).send(
                errorResponse({ message: 'No tienes permisos para actualizar un trabajo' })
            );
        }

        // Verificar que el trabajo existe
        const trabajoExistente = await prisma.trabajo.findUnique({
            where: { id }
        });

        if (!trabajoExistente) {
            return reply.status(404).send(
                errorResponse({ message: 'Trabajo no encontrado' })
            );
        }

        // Si se proporciona título, verificar que no exista otro trabajo con el mismo título en la misma línea y periodo
        if (titulo && titulo.trim() !== trabajoExistente.titulo) {
            const trabajoConMismoTitulo = await prisma.trabajo.findFirst({
                where: {
                    titulo: titulo.trim(),
                    lineaDeInvestigacionId: lineaDeInvestigacionId || trabajoExistente.lineaDeInvestigacionId,
                    periodoAcademicoId: periodoAcademicoId || trabajoExistente.periodoAcademicoId,
                    id: { not: id } // Excluir el trabajo actual
                }
            });

            if (trabajoConMismoTitulo) {
                return reply.status(409).send(
                    errorResponse({ message: 'Ya existe otro trabajo con ese título en la misma línea y periodo académico' })
                );
            }
        }

        // Preparar datos para actualizar
        const updateData: any = {};
        const cambios: string[] = [];

        if (titulo && titulo.trim() !== trabajoExistente.titulo) {
            updateData.titulo = titulo.trim();
            cambios.push(`título de "${trabajoExistente.titulo}" a "${titulo.trim()}"`);
        }

        if (autor && autor.trim() !== trabajoExistente.autor) {
            updateData.autor = autor.trim();
            cambios.push(`autor de "${trabajoExistente.autor}" a "${autor.trim()}"`);
        }

        if (lineaDeInvestigacionId && lineaDeInvestigacionId !== trabajoExistente.lineaDeInvestigacionId) {
            updateData.lineaDeInvestigacionId = lineaDeInvestigacionId;
            cambios.push(`línea de investigación`);
        }

        if (periodoAcademicoId && periodoAcademicoId !== trabajoExistente.periodoAcademicoId) {
            updateData.periodoAcademicoId = periodoAcademicoId;
            cambios.push(`periodo académico`);
        }

        if (estado && estado !== trabajoExistente.estado) {
            updateData.estado = estado;
            cambios.push(`estado de "${trabajoExistente.estado}" a "${estado}"`);
        }

        // Manejar actualización del documento PDF
        let docAnterior = trabajoExistente.doc;
        if (doc) {
            try {
                // Subir nuevo documento
                const nuevoDocPath = await uploadFileLocal(doc, 'trabajos');
                updateData.doc = nuevoDocPath;
                cambios.push(`documento PDF`);

                // Eliminar documento anterior si existe
                if (docAnterior) {
                    const rutaDocAnterior = path.join(process.cwd(), 'public', docAnterior);
                    if (existsSync(rutaDocAnterior)) {
                        unlinkSync(rutaDocAnterior);
                    }
                }
            } catch (error) {
                return reply.status(500).send(
                    errorResponse({ message: 'Error al subir el nuevo documento' })
                );
            }
        }

        // Verificar si hay cambios que realizar
        if (Object.keys(updateData).length === 0) {
            return reply.status(400).send(
                errorResponse({ message: 'No se proporcionaron cambios para actualizar' })
            );
        }

        // Actualizar el trabajo
        const trabajoActualizado = await prisma.trabajo.update({
            where: { id },
            data: updateData
        });

        // Registrar en bitácora
        await crearBitacora({
            usuarioId: usuario.id,
            accion: 'ACTUALIZAR_TRABAJO',
            mensaje: `El usuario ${usuario.email} actualizó el trabajo "${trabajoActualizado.titulo}". Cambios: ${cambios.join(', ')}`
        });

        return reply.status(200).send(
            successResponse({
                message: 'Trabajo actualizado exitosamente',
                data: trabajoActualizado
            })
        );

    } catch (error: any) {
        // Si hubo error y se subió un nuevo documento, considerar limpieza
        return reply.status(500).send(
            errorResponse({ message: error.message || 'Error al actualizar el trabajo' })
        );
    }
};

export default updateTrabajo;