import "reflect-metadata";
import * as Hapi from "@hapi/hapi";
import { AppDataSource } from "./config/database";
import { registerEndorseModule } from "./modules/endorse.module";
import { seedConfig } from "./seeders/config.seeder";
import { signDevelopmentToken, verifyBearerToken } from "./security/jwt";

const init = async () => {
  await AppDataSource.initialize();
  await seedConfig(AppDataSource);

  const server = Hapi.server({
    port: Number(process.env.PORT ?? 3000),
    host: process.env.HOST ?? "0.0.0.0",
    routes: {
      cors: true,
    },
  });

  server.ext("onRequest", (request, h) => {
    const authorization = typeof request.headers.authorization === "string"
      ? request.headers.authorization
      : undefined;

    if (request.method === "options" || request.path === "/health" || request.path === "/openapi.json" || (request.path === "/api/v1/auth/dev-token" && process.env.ENABLE_DEV_AUTH !== "false") || verifyBearerToken(authorization)) {
      return h.continue;
    }

    return h.response({ error: "Token JWT requerido o inválido" }).code(401).takeover();
  });

  server.route({
    method: "GET",
    path: "/health",
    handler: () => ({
      status: "ok",
      service: "endorse-translator",
      version: "v1",
      database: AppDataSource.isInitialized ? "connected" : "disconnected",
      timestamp: new Date().toISOString(),
    }),
  });

  server.route({
    method: "GET",
    path: "/openapi.json",
    handler: () => ({
      openapi: "3.0.3",
      info: { title: "Endorse Translator API", version: "1.0.0" },
      servers: [{ url: "/" }],
      paths: {
        "/endorse/translate": { post: { summary: "Transforma un endoso plano" } },
        "/api/v1/endorse/translate": { post: { summary: "Transforma un endoso plano (versionado)" } },
        "/api/v1/database/templates": { get: { summary: "Lista plantillas configuradas" } },
        "/api/v1/auth/dev-token": { post: { summary: "Genera un token automatico para desarrollo" } },
        "/health": { get: { summary: "Estado del servicio" } },
      },
      security: [{ bearerAuth: [] }],
      components: { securitySchemes: { bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" } } },
    }),
  });

  server.route({
    method: "POST",
    path: "/api/v1/auth/dev-token",
    handler: () => ({ token: signDevelopmentToken(), expiresIn: "1h", developmentOnly: true }),
  });

  registerEndorseModule(server, AppDataSource);

  await server.start();
  console.log("🚀 Servidor corriendo en %s", server.info.uri);
};

process.on("unhandledRejection", (err) => {
  console.error(err);
  process.exit(1);
});

init();