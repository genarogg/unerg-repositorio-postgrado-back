import { FastifyRequest, FastifyReply } from 'fastify';
import { encriptarContrasena, generarToken, successResponse, errorResponse, crearBitacora, prisma } from '../../functions';

import { Role } from '@prisma/client';

interface RegisterRequest {
    name: string;
    lastName: string;
    email: string;
    password: string;
    cedula: string;
    estado?: boolean;
    role?: Role;
}

const registerPost = async (request: FastifyRequest<{ Body: RegisterRequest }>, reply: FastifyReply) => {
    try {
        const { name, lastName, email, password, cedula, estado, role } = request.body;

        // Validación de entrada
        if (!name || !lastName || !email || !password || !cedula) {
            return reply.status(400).send(
                errorResponse({
                    message: "Todos los campos (name, lastName, email, password, cedula) son requeridos"
                })
            );
        }

        // Verificar si el usuario ya existe
        const usuarioExistente = await prisma.usuario.findUnique({
            where: { email: email.toLowerCase() }
        });

        if (usuarioExistente) {
            return reply.status(409).send(
                errorResponse({
                    message: "El correo electrónico ya está registrado"
                })
            );
        }

        // Hashear la contraseña
        const hashedPassword = await encriptarContrasena({ password });

        // Asignar rol por defecto si no viene
        const userRole = role ?? Role.EDITOR;

        // Asignar estado por defecto si no viene
        const userEstado = typeof estado === 'boolean' ? estado : true;

        // Crear usuario
        const usuario = await prisma.usuario.create({
            data: {
                name,
                lastName,
                email: email.toLowerCase(),
                password: hashedPassword,
                cedula,
                estado: userEstado,
                role: userRole
            }
        });

        // Generar token JWT
        const token = generarToken({ id: usuario.id });

        // Crear bitácora de registro exitoso
        crearBitacora({
            usuarioId: usuario.id,
            accion: "REGISTER_SUCCESS",
            mensaje: "Registro exitoso"
        });

        // Respuesta exitosa sin incluir la contraseña
        const { password: _, ...usuarioSinPassword } = usuario;

        return reply.status(201).send(
            successResponse({
                message: "Usuario registrado exitosamente",
                data: {
                    token,
                    usuario: usuarioSinPassword
                }
            })
        );

    } catch (error: any) {
        console.error("Error en registerController:", error);

        return reply.status(500).send(
            errorResponse({
                message: "Error interno del servidor (registro). Inténtalo de nuevo más tarde."
            })
        );
    }
};

export default registerPost;