import { Request, ResponseToolkit } from "@hapi/hapi";
import { EndorseService } from "../services/endorse.service";
import { TranslateRequestDTO } from "../entities/request.dto";

export class EndorseController {
  constructor(private endorseService: EndorseService) {}

  public translate = async (request: Request, h: ResponseToolkit) => {
    try {
      const payload = this.parsePayload(request.payload);
      const response = await this.endorseService.translatePayload(payload);
      
      return h.response(response).code(200);
    } catch (error: any) {
      return h.response({ error: error.message }).code(400);
    }
  };

  private parsePayload(payload: unknown): TranslateRequestDTO {
    const parsedPayload = typeof payload === "string" ? JSON.parse(payload) : payload;

    if (
      parsedPayload === null ||
      typeof parsedPayload !== "object" ||
      Array.isArray(parsedPayload)
    ) {
      throw new Error("El body debe ser un objeto JSON válido.");
    }

    return parsedPayload as TranslateRequestDTO;
  }
}