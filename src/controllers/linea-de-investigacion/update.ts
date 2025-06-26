import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma, verificarToken, successResponse, errorResponse, crearBitacora } from '../../functions';
import { Role } from '@prisma/client';

interface UpdateLineaRequest {
  token: string;
  id: number;
  nombre?: string;
  estado?: boolean;
}

const updateLinea = async (
  request: FastifyRequest<{ Body: UpdateLineaRequest }>,
  reply: FastifyReply
) => {
  try {
    const { token, id, nombre, estado } = request.body;

    if (!token || !id) {
      return reply.status(400).send(
        errorResponse({ message: 'El token y el id son requeridos' })
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

    // Solo puede actualizar si es SUPER o EDITOR
    if (usuario.role !== SUPER && usuario.role !== EDITOR) {
      return reply.status(403).send(
        errorResponse({ message: 'No tienes permisos para actualizar una línea de investigación' })
      );
    }

    // Buscar la línea de investigación existente
    const lineaExistente = await prisma.lineasDeInvestigacion.findUnique({
      where: { id }
    });

    if (!lineaExistente) {
      return reply.status(404).send(
        errorResponse({ message: 'Línea de investigación no encontrada' })
      );
    }

    // Si se va a actualizar el nombre, verificar que no exista otra con ese nombre
    if (nombre && nombre.trim() !== lineaExistente.nombre) {
      const nombreExistente = await prisma.lineasDeInvestigacion.findFirst({
        where: { nombre: nombre.trim(), NOT: { id } }
      });
      if (nombreExistente) {
        return reply.status(409).send(
          errorResponse({ message: 'Ya existe una línea de investigación con ese nombre' })
        );
      }
    }

    // Actualizar la línea de investigación
    const nuevaLinea = await prisma.lineasDeInvestigacion.update({
      where: { id },
      data: {
        ...(nombre ? { nombre: nombre.trim() } : {}),
        ...(typeof estado === 'boolean' ? { estado } : {})
      }
    });

    // Guardar en la bitácora la actualización
    await crearBitacora({
      usuarioId: usuario.id,
      accion: 'ACTUALIZAR_LINEA_INVESTIGACION',
      mensaje: `El usuario ${usuario.email} actualizó la línea de investigación "${lineaExistente.nombre}" (ID: ${id})`
    });

    return reply.status(200).send(
      successResponse({
        message: 'Línea de investigación actualizada exitosamente',
        data: nuevaLinea
      })
    );
  } catch (error: any) {
    return reply.status(500).send(
      errorResponse({ message: error.message || 'Error al actualizar la línea de investigación' })
    );
  }
};

export default updateLinea;