import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma, compararContrasena, generarToken, successResponse, errorResponse, crearBitacora } from '../../functions';


interface LoginRequest {
    email: string;
    password: string;
}

const loginPost = async (request: FastifyRequest<{ Body: LoginRequest }>, reply: FastifyReply) => {
    try {
        const { email, password } = request.body;

        // Validación de entrada
        if (!email || !password) {
            return reply.status(400).send(
                errorResponse({
                    message: "El correo electrónico y la contraseña son requeridos"
                })
            );
        }

        // Buscar usuario por email
        const usuario = await prisma.usuario.findUnique({
            where: { email: email.toLowerCase() }
        });

        if (!usuario) {
            return reply.status(401).send(
                errorResponse({
                    message: "Usuario no encontrado!"
                })
            );
        }

        // Verificar contraseña
        const contrasenaValida = await compararContrasena({
            password,
            hashedPassword: usuario.password
        });

        if (!contrasenaValida) {
            return reply.status(401).send(
                errorResponse({
                    message: "La contraseña es incorrecta"
                })
            );
        }

        // Generar token JWT
        const token = generarToken({ id: usuario.id });

        // Crear bitácora de login exitoso
        crearBitacora({
            usuarioId: usuario.id,
            accion: "LOGIN_SUCCESS",
            mensaje: "Login exitoso"
        });

        // Respuesta exitosa sin incluir la contraseña
        const { password: _, ...usuarioSinPassword } = usuario;

        return reply.status(200).send(
            successResponse({
                message: "Login exitoso",
                data: {
                    token,
                    usuario: usuarioSinPassword
                }
            })
        );

    } catch (error: any) {
        console.error("Error en loginController:", error);

        return reply.status(500).send(
            errorResponse({
                message: "Error interno del servidor (login). Inténtalo de nuevo más tarde."
            })
        );
    }
};

export default loginPost;
