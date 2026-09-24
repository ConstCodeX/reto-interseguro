import { ConfigRepository } from "../repositories/config.repository";
import { TemplateFieldConfig, TranslateRequestDTO } from "../entities/request.dto";
import { TranslateResponseDTO } from "../entities/response.dto";
import { EndorsementConfigModel } from "../models/config.model";

export class EndorseService {
  constructor(private configRepo: ConfigRepository) { }

  async translatePayload(payload: TranslateRequestDTO): Promise<TranslateResponseDTO> {
    // 1. Consultar la BD a través del Repository
    const config = await this.configRepo.findByProductAndTipoEndoso(
      payload.producto,
      payload.tipoEndoso,
    );

    if (!config) {
      throw new Error(`Configuración no encontrada para el tipo de endoso: ${payload.tipoEndoso}`);
    }

    const dynamicData = config.templateFields
      .sort((left, right) => left.order - right.order)
      .map((field) => {
        const value = this.resolveFieldValue(field, payload, config);

        if (value === undefined && field.required) {
          throw new Error(`Falta el campo requerido de la plantilla: ${field.key}`);
        }

        return { etiqueta: field.label, value: value ?? "" };
      });

    // 2. Aplicar lógica de negocio y transformar al Entity(DTO) esperado
    return {
      policyNumber: payload.policyNumber,
      idEnvio: payload.idEnvio,
      financialPlansEntity: { description: payload.frecuencia },
      currency: { description: payload.moneda },
      productEntity: { description: payload.producto },
      eventEntity: {
        description: "SolicitarEndoso",
        dynamicData
      },
      eventAppliedEntities: config.eventAppliedEntities,
      riskUnitEntities: [
        {
          insuranceObjectEntities: [{ insuranceObjectNumber: "1", coverageEntities: [], participationEntities: [] }],
          plansEntity: { description: payload.plan },
          riskUnitNumber: "1"
        }
      ],
      participationEntities: []
    };
  }

  private resolveFieldValue(
    field: TemplateFieldConfig,
    payload: TranslateRequestDTO,
    config: EndorsementConfigModel,
  ): string | undefined {
    const source = field.source.split(".");
    const sourceObject = source[0] === "config" ? config : payload;
    const value = source.slice(1).reduce<unknown>(
      (currentValue, key) => currentValue !== null && typeof currentValue === "object"
        ? (currentValue as Record<string, unknown>)[key]
        : undefined,
      sourceObject,
    );

    return value === undefined || value === null || value === ""
      ? field.defaultValue ?? undefined
      : String(value);
  }
}