import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma, successResponse, errorResponse, crearBitacora, encriptarContrasena } from '../../functions';

interface ChangePasswordRequest {
    id: number;
    nuevaContrasena: string;
}

const changePassword = async (
    request: FastifyRequest<{ Body: ChangePasswordRequest }>,
    reply: FastifyReply
) => {
    try {
        const { id, nuevaContrasena } = request.body;

        console.log("Datos de cambio de contraseña:", { id, nuevaContrasena });

        if (!id || !nuevaContrasena) {
            return reply.status(400).send(
                errorResponse({ message: 'El ID del usuario y la nueva contraseña son requeridos' })
            );
        }

        // Validar que el ID sea un número válido
        if (isNaN(Number(id))) {
            return reply.status(400).send(
                errorResponse({ message: 'El ID del usuario debe ser un número válido' })
            );
        }

        // Buscar usuario por ID
        const usuarioExistente = await prisma.usuario.findUnique({
            where: { id: Number(id) }
        });

        if (!usuarioExistente) {
            return reply.status(404).send(
                errorResponse({ message: 'Usuario no encontrado' })
            );
        }

        // Encriptar la nueva contraseña
        const hashedPassword = await encriptarContrasena({
            password: nuevaContrasena
        });

        // Actualizar la contraseña del usuario
        const usuarioActualizado = await prisma.usuario.update({
            where: { id: Number(id) },
            data: { password: hashedPassword }
        });

        // Crear una entrada en la bitácora
        crearBitacora({
            usuarioId: Number(id),
            accion: `Cambio de contraseña administrativa`,
            mensaje: `Se cambió la contraseña del usuario ${usuarioActualizado.email}`
        });

        // No enviar la contraseña en la respuesta
        const { password, ...usuarioSinPassword } = usuarioActualizado;

        return reply.status(200).send(
            successResponse({
                message: 'Contraseña actualizada exitosamente',
                data: { usuario: usuarioSinPassword }
            })
        );
    } catch (error: any) {
        return reply.status(500).send(
            errorResponse({ message: error.message || 'Error al cambiar la contraseña' })
        );
    }
};

export default changePassword;