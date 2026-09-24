import { DataSource } from "typeorm";
import { EndorsementTemplateModel } from "../models/endorsement-template.model";
import { ProductModel } from "../models/product.model";
import { TemplateEventModel } from "../models/template-event.model";
import { TemplateFieldModel } from "../models/template-field.model";

const fields = [
  { key: "producto", label: "ProductosVida", source: "payload.producto", required: true, order: 1 },
  { key: "usuario", label: "NombreUsuario", source: "payload.usuario", required: true, order: 2 },
  { key: "policyNumber", label: "NumeroPolizaEndoso", source: "payload.policyNumber", required: true, order: 3 },
  { key: "tipoEndosoPol", label: "TipoEndosoPol", source: "config.tipoEndosoPol", required: true, order: 4 },
  { key: "responsableAtencion", label: "ResponsableAtencion", source: "config.responsableAtencion", required: true, order: 5 },
  { key: "endosoModifPrima", label: "EndosoModifPrima", source: "config.endosoModifPrima", required: true, order: 6 },
  { key: "inicioVigencia", label: "InicioVigenciaEndoso", source: "payload.inicioVigencia", defaultValue: "Default", required: false, order: 7 },
  { key: "tipoVigencia", label: "TipoVigenciaEndoso", source: "payload.tipoVigencia", defaultValue: "", required: false, order: 8 },
  { key: "codigoEndoso", label: "EndososSimplesSACRumbo", source: "config.codigoEndoso", required: true, order: 9 },
  { key: "fechaSolicitud", label: "FechaSolicitud", source: "payload.fechaSolicitud", required: true, order: 10 },
  { key: "fechaCliente", label: "FechaCliente", source: "payload.fechaCliente", required: true, order: 11 },
  { key: "fechaEfectiva", label: "FechaEfectiva", source: "payload.fechaEfectiva", required: true, order: 12 },
];

const events = [
  { description: "SolicitarEndoso", orderEvent: 1 },
  { description: "AprobarEndoso", orderEvent: 2 },
];

export async function seedConfig(dataSource: DataSource): Promise<void> {
  const productRepository = dataSource.getRepository(ProductModel);
  const templateRepository = dataSource.getRepository(EndorsementTemplateModel);
  const fieldRepository = dataSource.getRepository(TemplateFieldModel);
  const eventRepository = dataSource.getRepository(TemplateEventModel);

  let vida = await productRepository.findOneBy({ code: "ProductosVida" });
  if (!vida) {
    vida = await productRepository.save({ code: "ProductosVida", name: "Productos Vida" });
  }

  const salud = await productRepository.findOneBy({ code: "ProductosSalud" });
  if (!salud) {
    await productRepository.save({ code: "ProductosSalud", name: "Productos Salud" });
  }

  let template = await templateRepository.findOneBy({
    productId: vida.id,
    tipoEndoso: "CambioFrecuencia",
  });
  if (!template) {
    template = await templateRepository.save({
      productId: vida.id,
      tipoEndoso: "CambioFrecuencia",
      tipoEndosoPol: "Endoso Simple",
      responsableAtencion: "SAC",
      endosoModifPrima: "Si",
      codigoEndoso: "TES008",
    });
  }

  for (const field of fields) {
    const existingField = await fieldRepository.findOneBy({ templateId: template.id, key: field.key });
    if (!existingField) await fieldRepository.save({ ...field, templateId: template.id });
  }
  for (const event of events) {
    const existingEvent = await eventRepository.findOneBy({ templateId: template.id, description: event.description });
    if (!existingEvent) await eventRepository.save({ ...event, templateId: template.id });
  }

  console.log("✅ Tablas de productos, plantillas, campos y eventos configuradas.");
}
