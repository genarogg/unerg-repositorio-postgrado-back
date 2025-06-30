import { FastifyRequest, FastifyReply } from 'fastify';
import { encriptarContrasena, successResponse, errorResponse, crearBitacora, prisma } from '../../functions';
import { Role } from '@prisma/client';

interface UpdateUserRequest {
    id: number;
    name?: string;
    lastName?: string;
    email?: string;
    password?: string;
    cedula?: string;
    estado?: boolean;
    role?: Role;
}

const updateUser = async (request: FastifyRequest<{ Body: UpdateUserRequest }>, reply: FastifyReply) => {
    try {
        const { id, name, lastName, email, password, cedula, estado, role } = request.body;

        console.log("Datos de actualización:", { id, name, lastName, email, cedula, estado, role });

        // Validación de entrada - ID es requerido
        if (!id) {
            return reply.status(400).send(
                errorResponse({
                    message: "El ID del usuario es requerido"
                })
            );
        }

        // Validar que el ID sea un número válido
        if (isNaN(Number(id))) {
            return reply.status(400).send(
                errorResponse({ message: 'El ID del usuario debe ser un número válido' })
            );
        }

        // Verificar si el usuario existe
        const usuarioExistente = await prisma.usuario.findUnique({
            where: { id: Number(id) }
        });

        if (!usuarioExistente) {
            return reply.status(404).send(
                errorResponse({
                    message: "Usuario no encontrado"
                })
            );
        }

        // Si se proporciona un email, verificar que no esté en uso por otro usuario
        if (email && email.toLowerCase() !== usuarioExistente.email.toLowerCase()) {
            const emailEnUso = await prisma.usuario.findUnique({
                where: { 
                    email: email.toLowerCase(),
                    NOT: { id: Number(id) }
                }
            });

            if (emailEnUso) {
                return reply.status(409).send(
                    errorResponse({
                        message: "El correo electrónico ya está registrado por otro usuario"
                    })
                );
            }
        }

        // Preparar datos para actualizar
        const datosActualizacion: any = {};

        if (name !== undefined) datosActualizacion.name = name;
        if (lastName !== undefined) datosActualizacion.lastName = lastName;
        if (email !== undefined) datosActualizacion.email = email.toLowerCase();
        if (cedula !== undefined) datosActualizacion.cedula = cedula;
        if (typeof estado === 'boolean') datosActualizacion.estado = estado;
        if (role !== undefined) datosActualizacion.role = role;

        // Si se proporciona una nueva contraseña, hashearla
        if (password) {
            const hashedPassword = await encriptarContrasena({ password });
            datosActualizacion.password = hashedPassword;
        }

        // Verificar que hay al menos un campo para actualizar
        if (Object.keys(datosActualizacion).length === 0) {
            return reply.status(400).send(
                errorResponse({
                    message: "Debe proporcionar al menos un campo para actualizar"
                })
            );
        }

        // Actualizar usuario
        const usuarioActualizado = await prisma.usuario.update({
            where: { id: Number(id) },
            data: datosActualizacion
        });

        // Crear bitácora de actualización
        const camposActualizados = Object.keys(datosActualizacion).join(', ');
        crearBitacora({
            usuarioId: Number(id),
            accion: "USER_UPDATE",
            mensaje: `Usuario actualizado. Campos modificados: ${camposActualizados}`
        });

        // Respuesta exitosa sin incluir la contraseña
        const { password: _, ...usuarioSinPassword } = usuarioActualizado;

        return reply.status(200).send(
            successResponse({
                message: "Usuario actualizado exitosamente",
                data: {
                    usuario: usuarioSinPassword
                }
            })
        );

    } catch (error: any) {
        console.error("Error en updateUser:", error);

        return reply.status(500).send(
            errorResponse({
                message: "Error interno del servidor (actualización). Inténtalo de nuevo más tarde."
            })
        );
    }
};

export default updateUser;