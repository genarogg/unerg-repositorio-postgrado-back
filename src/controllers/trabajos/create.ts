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
    pdfBase64: string; // Si se envía el PDF como base64
    resumen?: string; // Resumen opcional
}

const createTrabajo = async (
    request: FastifyRequest<{ Body: CreateTrabajoRequest }>,
    reply: FastifyReply
) => {
    try {
        const { token, titulo, autor, lineaDeInvestigacionId, doc, periodoAcademicoId, estado, resumen, pdfBase64 } = request.body;



        console.log({ token, titulo, autor, lineaDeInvestigacionId, periodoAcademicoId, estado,resumen, pdfBase64 });

        if (!token || !titulo || !autor || !lineaDeInvestigacionId || !doc || !periodoAcademicoId || !pdfBase64) {
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



        // Subir el archivo PDF al servidor y obtener la referencia
        const docPath = await uploadFileLocal({ pdfBase64 }); // Guardar en carpeta 'trabajos'

        console.log(`Archivo subido exitosamente: ${docPath}`);


        // Crear el trabajo con la referencia al archivo
        const nuevoTrabajo = await prisma.trabajo.create({
            data: {
                titulo: titulo.trim(),
                autor: autor.trim(),
                lineaDeInvestigacionId,
                doc: docPath, // Guardar la referencia al archivo
                periodoAcademicoId,
                estado: estado ?? 'PENDIENTE', // Por defecto, el estado es PENDIENTE
                resumen: resumen ? resumen.trim() : ""
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