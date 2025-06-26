import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma, verificarToken, successResponse, errorResponse } from '../../functions';
import { Estado } from '@prisma/client';

interface SearchTrabajosQuery {
    token: string;
    q?: string; 
    titulo?: string; 
    autor?: string; 
    periodo?: string; 
    lineaInvestigacion?: string; 
    estado?: Estado; 
    page?: string;
    limit?: string;
    sortBy?: 'titulo' | 'autor' | 'createdAt' | 'updatedAt';
    sortOrder?: 'asc' | 'desc';
}

const searchTrabajos = async (
    request: FastifyRequest<{ Querystring: SearchTrabajosQuery }>,
    reply: FastifyReply
) => {
    try {
        const {
            token,
            q,
            titulo,
            autor,
            periodo,
            lineaInvestigacion,
            estado,
            page = '1',
            limit = '10',
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = request.query;

        if (!token) {
            return reply.status(400).send(
                errorResponse({ message: 'Token es requerido' })
            );
        }

        // Verificar que al menos un parámetro de búsqueda esté presente
        if (!q && !titulo && !autor && !periodo && !lineaInvestigacion && !estado) {
            return reply.status(400).send(
                errorResponse({ message: 'Se requiere al menos un parámetro de búsqueda' })
            );
        }

        // Verificar token y obtener usuario
        const usuario = await verificarToken(token);

        if (!usuario) {
            return reply.status(403).send(
                errorResponse({ message: 'Token inválido o expirado' })
            );
        }

        // Convertir parámetros de paginación
        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);
        const skip = (pageNumber - 1) * limitNumber;

        // Construir filtros de búsqueda
        const where: any = {
            AND: []
        };

        // Búsqueda general (q) - busca en título, autor, línea y periodo
        if (q) {
            where.OR = [
                {
                    titulo: {
                        contains: q,
                        mode: 'insensitive'
                    }
                },
                {
                    autor: {
                        contains: q,
                        mode: 'insensitive'
                    }
                },
                {
                    lineaDeInvestigacion: {
                        nombre: {
                            contains: q,
                            mode: 'insensitive'
                        }
                    }
                },
                {
                    periodoAcademico: {
                        periodo: {
                            contains: q,
                            mode: 'insensitive'
                        }
                    }
                }
            ];
        }

        // Filtros específicos
        if (titulo) {
            where.AND.push({
                titulo: {
                    contains: titulo,
                    mode: 'insensitive'
                }
            });
        }

        if (autor) {
            where.AND.push({
                autor: {
                    contains: autor,
                    mode: 'insensitive'
                }
            });
        }

        if (periodo) {
            where.AND.push({
                periodoAcademico: {
                    periodo: {
                        contains: periodo,
                        mode: 'insensitive'
                    }
                }
            });
        }

        if (lineaInvestigacion) {
            where.AND.push({
                lineaDeInvestigacion: {
                    nombre: {
                        contains: lineaInvestigacion,
                        mode: 'insensitive'
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
        orderBy[sortBy] = sortOrder;

        // Ejecutar búsqueda con paginación
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
                orderBy,
                skip,
                take: limitNumber
            }),
            prisma.trabajo.count({ where })
        ]);

        // Calcular información de paginación
        const totalPages = Math.ceil(totalCount / limitNumber);
        const hasNextPage = pageNumber < totalPages;
        const hasPrevPage = pageNumber > 1;

        const paginationInfo = {
            currentPage: pageNumber,
            totalPages,
            totalCount,
            hasNextPage,
            hasPrevPage,
            limit: limitNumber
        };

        // Información de la búsqueda realizada
        const searchInfo = {
            searchTerm: q,
            filters: {
                titulo,
                autor,
                periodo,
                lineaInvestigacion,
                estado
            },
            resultsFound: totalCount
        };

        return reply.status(200).send(
            successResponse({
                message: `Se encontraron ${totalCount} trabajo(s) que coinciden con la búsqueda`,
                data: {
                    trabajos,
                    pagination: paginationInfo,
                    search: searchInfo
                }
            })
        );

    } catch (error: any) {
        return reply.status(500).send(
            errorResponse({ message: error.message || 'Error al realizar la búsqueda' })
        );
    }
};

export default searchTrabajos;