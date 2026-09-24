export interface TranslateResponseDTO {
  policyNumber: string;
  idEnvio: number;
  financialPlansEntity: { description: string };
  currency: { description: string };
  productEntity: { description: string };
  eventEntity: {
    description: string;
    dynamicData: Array<{ etiqueta: string; value: string }>;
  };
  eventAppliedEntities: Array<{ description: string; orderEvent: number }>;
  riskUnitEntities: Array<any>;
  participationEntities: Array<any>;
}