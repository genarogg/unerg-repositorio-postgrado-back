import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma, verificarToken, successResponse, errorResponse, crearBitacora, encriptarContrasena, generarToken } from '../../functions';

interface ResetPasswordWithTokenRequest {
    token: string;
    nuevaContrasena: string;
    id?: number;
}

const resetPasswordWithToken = async (
    request: FastifyRequest<{ Body: ResetPasswordWithTokenRequest }>,
    reply: FastifyReply
) => {
    try {
        const { token, nuevaContrasena } = request.body;

        if (!token || !nuevaContrasena) {
            return reply.status(400).send(
                errorResponse({ message: 'El token y la nueva contraseña son requeridos' })
            );
        }

        const usuarioVerificado = await verificarToken(token);

        const usuarioId = usuarioVerificado.id;

        // Si la función retorna un error, lo enviamos
        if (!usuarioVerificado || !usuarioId) {
            return reply.status(401).send(
                errorResponse({ message: 'Token inválido o expirado' })
            );
        }

        // Buscar usuario por ID
        const usuarioExistente = await prisma.usuario.findUnique({
            where: { id: Number(usuarioId) }
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
            where: { id: Number(usuarioId) },
            data: { password: hashedPassword }
        });

        // Crear una entrada en la bitácora
        crearBitacora({
            usuarioId: usuarioId,
            accion: `Cambio de contraseña`,
            mensaje: `El usuario ${usuarioActualizado.email} cambió su contraseña`
        });

        const tokenInit = generarToken({ id: Number(usuarioId) });

        // No enviar la contraseña en la respuesta
        const { password, ...usuarioSinPassword } = usuarioActualizado;

        return reply.status(200).send(
            successResponse({
                message: 'Contraseña actualizada exitosamente',
                data: { usuario: usuarioSinPassword, token: tokenInit }
            })
        );
    } catch (error: any) {
        return reply.status(500).send(
            errorResponse({ message: error.message || 'Error al actualizar la contraseña' })
        );
    }
};

export default resetPasswordWithToken;