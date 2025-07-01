// Limpia la consola
import clear from "console-clear";
clear();

import Fastify, { FastifyInstance } from 'fastify'
import path from 'path';
import Table from 'cli-table3';
import colors from "colors";

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import 'dotenv/config';
const { PORT } = process.env;

// Configurar límites amplios para base64
const server: FastifyInstance = Fastify({
  bodyLimit: 100 * 1024 * 1024, // 100MB para manejar archivos base64
  requestTimeout: 120000, // 2 minutos de timeout
  keepAliveTimeout: 10000
})

// Configura y registra @fastify/cors
import cors from '@fastify/cors';
server.register(cors, {
  origin: '*',
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
});

// configurar helmet
import helmet from '@fastify/helmet';
server.register(helmet, {
  global: true,
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  frameguard: { action: 'deny' },
  hidePoweredBy: true,
});

// Configura  @fastify/rate-limit con límites más flexibles para archivos
import rateLimit from '@fastify/rate-limit';
server.register(rateLimit, {
  max: 50, // Reducir número de requests pero permitir archivos grandes
  timeWindow: '1 minute',
  errorResponseBuilder: (req, context) => {
    return {
      code: 429,
      error: 'Too Many Requests',
      message: 'Has alcanzado el límite de solicitudes. Por favor, inténtalo de nuevo más tarde.'
    }
  }
});

import underPressure from '@fastify/under-pressure';

server.register(underPressure, {
  maxEventLoopDelay: 3000, // Más tiempo para procesar archivos grandes
  message: 'Under pressure!',
  retryAfter: 50
});

// Configurar slow down con menos restricciones
import slowDown from 'fastify-slow-down';
server.register(slowDown, {
  delayAfter: 20, // Permitir más requests antes del delay
  delay: 200 // Menor delay
});

// Configurar compresión
import compress from '@fastify/compress';
server.register(compress, { global: true });

// Configurar Swagger
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';

server.register(fastifySwagger, {
  swagger: {
    info: {
      title: 'API documentacion',
      description: 'API documentacion for my project',
      version: '1.0.0'
    },
    host: 'localhost:' + Number(PORT),
    schemes: ['http'],
    consumes: ['application/json'],
    produces: ['application/json']
  }
});

server.register(fastifySwaggerUi, {
  routePrefix: '/documentacion',
  uiConfig: {
    docExpansion: 'full',
    deepLinking: false
  },
  staticCSP: true,
  transformStaticCSP: (header) => header
});

// Configurar metrics
import fastifyMetrics from 'fastify-metrics';
server.register(fastifyMetrics, {
  endpoint: '/metrics'
});

// db conection
import dbConection from "./src/config/db-conection";
let dbStatus: any;

import fastifyView from '@fastify/view';
import ejs from 'ejs';

server.register(fastifyView, {
  engine: {
    ejs
  },
  root: path.join(__dirname, 'src', 'views'),
  viewExt: 'ejs',
});

// Configurar multipart con límites para base64
import fastifyMultipart from '@fastify/multipart';
server.register(fastifyMultipart, {
  limits: {
    fieldNameSize: 500,     // Más espacio para nombres de campo
    fieldSize: 100 * 1024 * 1024, // 100MB para campos con base64
    fields: 20,             // Más campos permitidos
    fileSize: 100 * 1024 * 1024, // 100MB por archivo
    files: 10,              // Más archivos permitidos
    headerPairs: 5000       // Más headers permitidos
  }
});

// Agregar manejo específico para JSON con base64
server.addContentTypeParser('application/json', { parseAs: 'string', bodyLimit: 100 * 1024 * 1024 }, function (req, body, done) {
  try {
    const json = JSON.parse(body as string);
    done(null, json);
  } catch (err: any) {
    err.statusCode = 400;
    done(err, undefined);
  }
});

// Manejo de errores específico para archivos grandes
server.setErrorHandler((error, request, reply) => {
  console.error('Error del servidor:', error);
  
  if (error.code === 'FST_REQ_FILE_TOO_LARGE' || error.code === 'LIMIT_FILE_SIZE') {
    reply.status(413).send({
      type: 'error',
      message: 'El archivo es demasiado grande. Tamaño máximo permitido: 75MB (antes de codificación base64)'
    });
  } else if (error.code === 'FST_ERR_CTP_BODY_TOO_LARGE') {
    reply.status(413).send({
      type: 'error',
      message: 'El contenido del request es demasiado grande. Reduce el tamaño del archivo.'
    });
  } else if (error.statusCode === 413) {
    reply.status(413).send({
      type: 'error',
      message: 'Payload demasiado grande. El archivo excede el límite permitido.'
    });
  } else {
    reply.status(error.statusCode || 500).send({
      type: 'error',
      message: error.message || 'Error interno del servidor'
    });
  }
});

// servir archivos estáticos
import fastifyStatic from '@fastify/static';
server.register(fastifyStatic, {
  root: path.join(__dirname, "..", "public"),
  prefix: '/',
  cacheControl: true,
  maxAge: 86400000,
  etag: true
});

// routers
import { healthcheck, authRoutes, lineasDeInvestigacionRoutes, trabajosRouter, periodoAcademicoRoutes } from "./src/routers"

server.register(healthcheck, { prefix: '/' })
server.register(authRoutes, { prefix: '/auth' })
server.register(lineasDeInvestigacionRoutes, { prefix: '/lineas-de-investigacion' })
server.register(trabajosRouter, { prefix: '/trabajos' })
server.register(periodoAcademicoRoutes, { prefix: "/periodo" })

import tack from "./src/tasks"
import seed from "./src/seed";

const start = async () => {

  if (process.env.IS_SERVERLESS) {
    return
  }

  try {
    const port = Number(PORT) || 3500
    dbStatus = await dbConection();
    await server.listen({ port, host: '0.0.0.0' });

    const table = new Table({
      head: ['Servicio', 'URL'],
      colWidths: [20, 50]
    });

    /* ejecutar tareas programadas */
    tack()
    seed()

    table.push(
      ['Servidor', colors.green(`http://localhost:${PORT}`)],
      ['Graphql', colors.green(`http://localhost:${PORT}/graphql`)],
      ['Documentacion', colors.cyan(`http://localhost:${PORT}/documentacion`)],
      ["db estatus", colors.cyan(dbStatus)]
    );

    // Imprimir la tabla
    console.log(table.toString());
  } catch (err) {
    server.log.error(err)
    console.log(err)
    process.exit(1)
  }
}

start()

export default server;