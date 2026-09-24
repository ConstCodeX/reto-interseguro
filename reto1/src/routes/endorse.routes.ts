import { ServerRoute } from "@hapi/hapi";
import { EndorseController } from "../controllers/endorse.controller";

export function endorseRoutes(controller: EndorseController): ServerRoute[] {
  return ["/endorse/translate", "/api/v1/endorse/translate"].map((path) => ({
    method: "POST" as const,
    path,
    handler: controller.translate,
  }));
}
