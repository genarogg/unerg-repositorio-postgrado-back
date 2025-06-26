import jwt, { JwtPayload } from "jsonwebtoken";
import { prisma, errorResponse } from "@fn"


const verificarToken = async (token: string) => {
    const JWTSECRETO = process.env.JWTSECRETO || "jwt-secret";

    try {

        console.log(token)
        
        const payload = jwt.verify(token, JWTSECRETO) as JwtPayload | undefined;

        console.log(payload)
        
        if (!payload || !payload.id) {
            return errorResponse({ message: "El token no contiene un id de usuario válido" });
        }


        const usuario = await prisma.usuario.findUnique({
            where: { id: payload.id },
        });

        if (!usuario) {
            return errorResponse({ message: "Usuario no encontrado" });
        }

        return usuario;
    } catch (err) {
        console.error("Error al verificar el token:", err);
        return errorResponse({ message: "Error al verificar el token" });
    } finally {
        await prisma.$disconnect();
    }
};

export default verificarToken;