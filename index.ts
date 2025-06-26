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

const server: FastifyInstance = Fastify({})

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

// Configura  @fastify/rate-limit
import rateLimit from '@fastify/rate-limit';
server.register(rateLimit, {
  max: 100,
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
  maxEventLoopDelay: 1500,
  message: 'Under pressure!',
  retryAfter: 50
});

// Configurar slow down
import slowDown from 'fastify-slow-down';
server.register(slowDown, {
  delayAfter: 50,
  delay: 500
});

// Configurar compresión
import compress from '@fastify/compress';
server.register(compress, { global: true });

// Configurar caching
import fastifyCaching from '@fastify/caching';
server.register(fastifyCaching, {
  privacy: fastifyCaching.privacy.PUBLIC,
  expiresIn: 3600
});

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


// Registrar @fastify/express
import fastifyExpress from '@fastify/express';
import express from 'express';

import { ApolloServer } from "@apollo/server";

import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default";

import bodyParser from "body-parser";
import { processRequest } from "graphql-upload-minimal";
import { schema, resolvers } from "./src/graphql"

server.register(fastifyExpress).after(async () => {
  const app = express();

  const apolloServer = new ApolloServer({
    typeDefs: schema,
    resolvers,
    introspection: true,
    csrfPrevention: false,
    plugins: [ApolloServerPluginLandingPageLocalDefault({ embed: true })],
  });

  await apolloServer.start();

  app.use(
    "/graphql",
    // Middleware para procesar peticiones multipart (subida de archivos)
    async (req, res, next) => {
      if (
        req.method === "POST" &&
        req.headers["content-type"] &&
        req.headers["content-type"].includes("multipart/form-data")
      ) {
        try {
          req.body = await processRequest(req, res);
        } catch (error) {
          return next(error);
        }
      }
      next();
    },
    // Este parser se usará para peticiones JSON (no multipart)
    bodyParser.json(),

    expressMiddleware(apolloServer)
  );

  server.use(app);

});


import fastifyView from '@fastify/view';
import ejs from 'ejs';

server.register(fastifyView, {
  engine: {
    ejs
  },
  root: path.join(__dirname, 'src', 'views'),
  viewExt: 'ejs',
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
import { healthcheck } from "./src/routers"
server.register(healthcheck, { prefix: '/' })


import tack from "./src/tasks"

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