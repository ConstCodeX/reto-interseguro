import assert from "node:assert/strict";
import test from "node:test";
import { EndorseService } from "../src/services/endorse.service";
import { TranslateRequestDTO } from "../src/entities/request.dto";
import { EndorsementConfigModel } from "../src/models/config.model";
import { ConfigRepository } from "../src/repositories/config.repository";

const payload: TranslateRequestDTO = {
  policyNumber: "POL-001",
  idEnvio: 10,
  frecuencia: "Mensual",
  tipoEndoso: "CambioFrecuencia",
  producto: "ProductosVida",
  plan: "Plan A",
  moneda: "PEN",
  usuario: "usuario.test",
  fechaSolicitud: "2026-09-24",
  fechaCliente: "2026-09-24",
  fechaEfectiva: "2026-09-25",
};

function createService(config: Partial<EndorsementConfigModel>): EndorseService {
  const repository = {
    findByProductAndTipoEndoso: async () => config as EndorsementConfigModel,
  } as unknown as ConfigRepository;

  return new EndorseService(repository);
}

test("transforma los campos configurados respetando su orden", async () => {
  const service = createService({
    templateFields: [
      { key: "usuario", label: "Usuario", source: "payload.usuario", required: true, order: 2 },
      { key: "policyNumber", label: "Poliza", source: "payload.policyNumber", required: true, order: 1 },
    ],
  });

  const response = await service.translatePayload(payload);

  assert.deepEqual(response.eventEntity.dynamicData, [
    { etiqueta: "Poliza", value: "POL-001" },
    { etiqueta: "Usuario", value: "usuario.test" },
  ]);
});

test("usa el valor por defecto cuando el payload no trae el campo", async () => {
  const service = createService({
    templateFields: [
      { key: "inicioVigencia", label: "Inicio", source: "payload.inicioVigencia", defaultValue: "Default", required: false, order: 1 },
    ],
  });

  const response = await service.translatePayload(payload);

  assert.deepEqual(response.eventEntity.dynamicData, [{ etiqueta: "Inicio", value: "Default" }]);
});

test("falla cuando falta un campo requerido de la plantilla", async () => {
  const service = createService({
    templateFields: [
      { key: "campoNuevo", label: "CampoNuevo", source: "payload.campoNuevo", required: true, order: 1 },
    ],
  });

  await assert.rejects(
    () => service.translatePayload(payload),
    /Falta el campo requerido de la plantilla: campoNuevo/,
  );
});
