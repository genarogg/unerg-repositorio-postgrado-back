import jwt from "jsonwebtoken";

interface Usuario {
    id: number;
}

const generarToken = (usuario: Usuario): string => {
    const JWTSECRETO: any = process.env.JWTSECRETO || "jwt-secret";
    const JWTTIEMPO: any = process.env.JWTTIEMPO || "1d";

    const { id } = usuario;

    try {
        const token = jwt.sign(
            { id },
            JWTSECRETO,
            {
                algorithm: "HS256",
                expiresIn: JWTTIEMPO,
            }
        );

        return token;
    } catch (error: any) {
        throw new Error(`Error al generar el token: ${error.message}`);
    }
};

export default generarToken;
