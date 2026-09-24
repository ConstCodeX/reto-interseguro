export interface TranslateRequestDTO {
  policyNumber: string;
  idEnvio: number;
  frecuencia: string;
  tipoEndoso: string;
  producto: string;
  plan: string;
  moneda: string;
  usuario: string;
  fechaSolicitud: string;
  fechaCliente: string;
  fechaEfectiva: string;
}

export interface TemplateFieldConfig {
  key: string;
  label: string;
  source: string;
  defaultValue?: string | null;
  required: boolean;
  order: number;
}