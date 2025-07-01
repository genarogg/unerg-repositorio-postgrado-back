import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Genera y actualiza las estadísticas de todas las líneas de investigación
 * Calcula la cantidad de trabajos y el porcentaje que representa cada línea
 */
export async function generarEstadisticas() {
  try {
    // 1. Borrar todas las estadísticas anteriores
    await prisma.estadistica.deleteMany({});
    
    // 2. Obtener todas las líneas de investigación activas
    const lineasDeInvestigacion = await prisma.lineasDeInvestigacion.findMany({
      where: {
        estado: true
      },
      include: {
        _count: {
          select: {
            Trabajos: true
          }
        }
      }
    });

    // 3. Calcular el total de trabajos
    const totalTrabajos = lineasDeInvestigacion.reduce((total, linea) => {
      return total + linea._count.Trabajos;
    }, 0);

    // 4. Crear nuevas estadísticas
    const estadisticas = [];
    
    for (const linea of lineasDeInvestigacion) {
      const cantidadTrabajos = linea._count.Trabajos;
      const porcentaje = totalTrabajos > 0 ? (cantidadTrabajos / totalTrabajos) * 100 : 0;

      const estadistica = await prisma.estadistica.create({
        data: {
          lineaDeInvestigacionId: linea.id,
          cantidadTrabajos: cantidadTrabajos,
          porcentaje: parseFloat(porcentaje.toFixed(2))
        },
        include: {
          lineaDeInvestigacion: {
            select: {
              id: true,
              nombre: true
            }
          }
        }
      });

      estadisticas.push(estadistica);
    }

    return {
      success: true,
      data: estadisticas,
      totalTrabajos,
      message: 'Estadísticas generadas correctamente'
    };

  } catch (error: any) {
    console.error('Error al generar estadísticas:', error);
    return {
      success: false,
      error: error.message,
      message: 'Error al generar las estadísticas'
    };
  }
}