import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma, successResponse, errorResponse } from '../../functions';
import { Estado } from '@prisma/client';

interface SearchTrabajosQuery {
    q?: string; 
    query?: string;  // Parámetro adicional para compatibilidad
    titulo?: string; 
    autor?: string; 
    periodo?: string; 
    lineaInvestigacion?: string; 
    estado?: Estado; 
    sortBy?: 'titulo' | 'autor' | 'id';
    sortOrder?: 'asc' | 'desc';
}

const searchTrabajos = async (
    request: FastifyRequest<{ Querystring: SearchTrabajosQuery }>,
    reply: FastifyReply
) => {
    try {
        const {
            q,
            query,
            titulo,
            autor,
            periodo,
            lineaInvestigacion,
            estado,
            sortBy = 'id',
            sortOrder = 'desc'
        } = request.query;

        // Usar 'q' si está presente, sino usar 'query' como fallback
        const searchTerm = q || query;

        // Verificar que al menos un parámetro de búsqueda esté presente
        if (!searchTerm && !titulo && !autor && !periodo && !lineaInvestigacion && !estado) {
            return reply.status(400).send(
                errorResponse({ message: 'Se requiere al menos un parámetro de búsqueda' })
            );
        }

        // Validar sortBy
        const validSortFields = ['titulo', 'autor', 'id'];
        const validSortBy = validSortFields.includes(sortBy) ? sortBy : 'id';
        
        // Validar sortOrder
        const validSortOrder = sortOrder === 'asc' ? 'asc' : 'desc';

        // Construir filtros de búsqueda
        const where: any = {
            AND: []
        };

        // Búsqueda general (searchTerm) - busca en título, autor, línea y periodo
        if (searchTerm) {
            where.OR = [
                {
                    titulo: {
                        contains: searchTerm
                    }
                },
                {
                    autor: {
                        contains: searchTerm
                    }
                },
                {
                    lineaDeInvestigacion: {
                        nombre: {
                            contains: searchTerm
                        }
                    }
                },
                {
                    periodoAcademico: {
                        periodo: {
                            contains: searchTerm
                        }
                    }
                }
            ];
        }

        // Filtros específicos
        if (titulo) {
            where.AND.push({
                titulo: {
                    contains: titulo
                }
            });
        }

        if (autor) {
            where.AND.push({
                autor: {
                    contains: autor
                }
            });
        }

        if (periodo) {
            where.AND.push({
                periodoAcademico: {
                    periodo: {
                        contains: periodo
                    }
                }
            });
        }

        if (lineaInvestigacion) {
            where.AND.push({
                lineaDeInvestigacion: {
                    nombre: {
                        contains: lineaInvestigacion
                    }
                }
            });
        }

        if (estado) {
            where.AND.push({
                estado: estado
            });
        }

        // Si no hay filtros AND, eliminar el array vacío
        if (where.AND.length === 0) {
            delete where.AND;
        }

        // Configurar ordenamiento
        const orderBy: any = {};
        orderBy[validSortBy] = validSortOrder;

        // Ejecutar búsqueda
        const [trabajos, totalCount] = await Promise.all([
            prisma.trabajo.findMany({
                where,
                include: {
                    lineaDeInvestigacion: {
                        select: {
                            id: true,
                            nombre: true,
                            estado: true
                        }
                    },
                    periodoAcademico: {
                        select: {
                            id: true,
                            periodo: true
                        }
                    }
                },
                orderBy
            }),
            prisma.trabajo.count({ where })
        ]);

        // Información de la búsqueda realizada
        const searchInfo = {
            searchTerm: searchTerm,
            filters: {
                titulo,
                autor,
                periodo,
                lineaInvestigacion,
                estado
            },
            resultsFound: totalCount,
            sortBy: validSortBy,
            sortOrder: validSortOrder
        };

        return reply.status(200).send(
            successResponse({
                message: `Se encontraron ${totalCount} trabajo(s) que coinciden con la búsqueda`,
                data: {
                    trabajos,
                    search: searchInfo
                }
            })
        );

    } catch (error: any) {
        console.error('Error en searchTrabajos:', error);
        return reply.status(500).send(
            errorResponse({ 
                message: error.message || 'Error interno del servidor al realizar la búsqueda',
                error: process.env.NODE_ENV === 'development' ? error.stack : undefined
            })
        );
    }
};

export default searchTrabajos;