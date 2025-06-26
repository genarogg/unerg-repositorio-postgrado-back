import { prisma } from "@fn";
import { ip } from "address";
interface CrearBitacoraArgs {
    usuarioId: number;
    accion: string;
    mensaje?: string;
}

const crearBitacora = async ({ usuarioId, accion, mensaje }: CrearBitacoraArgs) => {
    try {
        const myIP = ip() || "";
        const bitacora = await prisma.bitacora.create({
            data: {
                usuarioId,
                accion,
                ip: myIP,
                mensaje,
            },
        });
        return bitacora;
    } catch (error) {
        console.error("Error al crear la bitácora:", error);
        throw new Error("No se pudo crear la bitácora");
    }
};

export default crearBitacora;