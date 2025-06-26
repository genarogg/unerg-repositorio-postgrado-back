import { FastifyRequest, FastifyReply } from 'fastify';
import { sendEmail } from "../../email";
import { generarToken, prisma, errorResponse, successResponse } from "../../functions";

interface sendEmailRecoveryRequest {
    email: string;
}

const sendEmailRecovery = async (
    request: FastifyRequest<{ Body: sendEmailRecoveryRequest }>,
    reply: FastifyReply
) => {
    try {
        const { email } = request.body;

        if (!email) {
            return reply.status(400).send(
                errorResponse({ message: 'El email es requerido' })
            );
        }

        // Buscar usuario por email
        const usuario = await prisma.usuario.findUnique({ where: { email } });

        if (!usuario) {
            return reply.status(404).send(
                errorResponse({ message: 'Usuario no encontrado' })
            );
        }

        // Generar token
        const token = generarToken(usuario);

        // Crear link de reseteo
        const link = `${process.env.CORS_URL}?token=${token}`;

        // Enviar correo
        await sendEmail({
            email,
            subject: "Reestablecer contraseña",
            templateName: "resetPassWord",
            templateData: { link },
        });

        return reply.status(200).send(
            successResponse({ message: 'Se envió un correo para restablecer la contraseña' })
        );
    } catch (error) {
        console.error("Error al enviar el correo de restablecimiento de contraseña:", error);
        return reply.status(500).send(
            errorResponse({ message: 'No se pudo enviar el correo de restablecimiento de contraseña' })
        );
    }
};

export default sendEmailRecovery;