import { FastifyRequest, FastifyReply } from 'fastify';
import { verificarToken, successResponse, errorResponse } from '../../functions';

interface ValidarSesionRequest {
    token: string;
}

const validarSesion = async (
    request: FastifyRequest<{ Body: ValidarSesionRequest }>,
    reply: FastifyReply
) => {
    try {
        const { token } = request.body;

        console.log("Token recibido:", token);  

        if (!token) {
            return reply.status(400).send(
                errorResponse({ message: 'El token es requerido' })
            );
        }

        const usuario = await verificarToken(token);

        // Si la función retorna un error, lo enviamos
        if (!usuario) {
            return reply.status(401).send(
                errorResponse({ message: 'Token inválido o expirado' })
            );
        }

        // No enviar la contraseña
        const { password, ...usuarioSinPassword } = usuario;

        return reply.status(200).send(
            successResponse({
                message: 'Token verificado exitosamente',
                data: { usuario: usuarioSinPassword }
            })
        );
    } catch (error: any) {
        return reply.status(500).send(
            errorResponse({ message: error.message || 'Error al validar el token' })
        );
    }
};

export default validarSesion;