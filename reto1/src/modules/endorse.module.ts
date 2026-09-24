import { Server } from "@hapi/hapi";
import { DataSource } from "typeorm";
import { EndorseController } from "../controllers/endorse.controller";
import { ConfigRepository } from "../repositories/config.repository";
import { endorseRoutes } from "../routes/endorse.routes";
import { EndorseService } from "../services/endorse.service";

export function registerEndorseModule(server: Server, dataSource: DataSource): void {
  const configRepository = new ConfigRepository(dataSource);
  const endorseService = new EndorseService(configRepository);
  const endorseController = new EndorseController(endorseService);

  server.route([
    ...endorseRoutes(endorseController),
    {
      method: "GET",
      path: "/api/v1/database/templates",
      handler: () => configRepository.listTemplateCatalog(),
    },
  ]);
}
