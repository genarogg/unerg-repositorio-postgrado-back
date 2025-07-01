import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';

import generatePDF from '../../functions/generatePDF';

// Inicializa Prisma (ajusta según tu configuración)
const prisma = new PrismaClient();

interface ReporteBody {
  lineasInvestigacion: number[];
  periodosAcademicos: number[];
  configuracion: {
    incluirEstadisticas: boolean;
    formato: string;
  };
}

const generarReporte = async (req: FastifyRequest, res: FastifyReply) => {
  try {
    const { lineasInvestigacion, periodosAcademicos, configuracion } = req.body as ReporteBody;

    console.log("Generando reporte con los siguientes datos:", req.body);

    // Consulta para contar trabajos por línea de investigación
    const trabajosPorLinea = await prisma.trabajo.groupBy({
      by: ['lineaDeInvestigacionId'],
      where: {
        lineaDeInvestigacionId: { in: lineasInvestigacion }
      },
      _count: {
        id: true
      },
      orderBy: {
        lineaDeInvestigacionId: 'asc'
      }
    });

    // Consulta para contar trabajos por período académico
    const trabajosPorPeriodo = await prisma.trabajo.groupBy({
      by: ['periodoAcademicoId'],
      where: {
        periodoAcademicoId: { in: periodosAcademicos }
      },
      _count: {
        id: true
      },
      orderBy: {
        periodoAcademicoId: 'asc'
      }
    });

    // Consulta combinada: trabajos por línea Y período
    const trabajosPorLineaYPeriodo = await prisma.trabajo.groupBy({
      by: ['lineaDeInvestigacionId', 'periodoAcademicoId'],
      where: {
        lineaDeInvestigacionId: { in: lineasInvestigacion },
        periodoAcademicoId: { in: periodosAcademicos }
      },
      _count: {
        id: true
      },
      orderBy: [
        { lineaDeInvestigacionId: 'asc' },
        { periodoAcademicoId: 'asc' }
      ]
    });

    // Total general de trabajos que cumplen ambos criterios
    const totalTrabajos = await prisma.trabajo.count({
      where: {
        lineaDeInvestigacionId: { in: lineasInvestigacion },
        periodoAcademicoId: { in: periodosAcademicos }
      }
    });

    // Información adicional: nombres de líneas y períodos (opcional)
    const lineasInfo = await prisma.lineasDeInvestigacion.findMany({
      where: {
        id: { in: lineasInvestigacion }
      },
      select: {
        id: true,
        nombre: true,
        estado: true
      }
    });

    const periodosInfo = await prisma.periodoAcademico.findMany({
      where: {
        id: { in: periodosAcademicos }
      },
      select: {
        id: true,
        periodo: true
      }
    });

    // Formatear datos para mejor legibilidad
    const trabajosPorLineaFormatted = trabajosPorLinea.map(item => ({
      lineaDeInvestigacionId: item.lineaDeInvestigacionId,
      cantidadTrabajos: item._count.id,
      nombreLinea: lineasInfo.find(l => l.id === item.lineaDeInvestigacionId)?.nombre || 'Sin nombre'
    }));

    const trabajosPorPeriodoFormatted = trabajosPorPeriodo.map(item => ({
      periodoAcademicoId: item.periodoAcademicoId,
      cantidadTrabajos: item._count.id,
      periodo: periodosInfo.find(p => p.id === item.periodoAcademicoId)?.periodo || 'Sin periodo'
    }));

    const trabajosPorLineaYPeriodoFormatted = trabajosPorLineaYPeriodo.map(item => ({
      lineaDeInvestigacionId: item.lineaDeInvestigacionId,
      periodoAcademicoId: item.periodoAcademicoId,
      cantidadTrabajos: item._count.id,
      nombreLinea: lineasInfo.find(l => l.id === item.lineaDeInvestigacionId)?.nombre || 'Sin nombre',
      periodo: periodosInfo.find(p => p.id === item.periodoAcademicoId)?.periodo || 'Sin periodo'
    }));

    const reporte = {
      resumen: {
        total_trabajos: totalTrabajos,
        lineas_consultadas: lineasInvestigacion.length,
        periodos_consultados: periodosAcademicos.length,
        fecha_generacion: new Date().toISOString()
      },
      trabajos_por_linea: trabajosPorLineaFormatted,
      trabajos_por_periodo: trabajosPorPeriodoFormatted,
      trabajos_por_linea_y_periodo: trabajosPorLineaYPeriodoFormatted,
      filtros_aplicados: {
        lineas_investigacion: lineasInvestigacion,
        periodos_academicos: periodosAcademicos
      },
      configuracion: configuracion
    };




    const pdf = await generatePDF({ template: 'ReporteGlobal', data: reporte });

  
    // Respuesta según el formato solicitado
    if (configuracion.formato === 'JSON') {
      return res.status(200).send({
        success: true,
        data: pdf,
        message: "Reporte generado exitosamente en formato JSON"
      });
    } else {
      // Aquí podrías agregar otros formatos como CSV, Excel, etc.
      return res.status(200).send({
        success: true,
        data: reporte,
        message: `Formato ${configuracion.formato} no implementado, devolviendo JSON`
      });
    }

  } catch (error) {
    console.error("Error generando reporte:", error);
    return res.status(500).send({
      success: false,
      error: "Error interno del servidor",
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

export default generarReporte;