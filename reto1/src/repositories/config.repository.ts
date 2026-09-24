import { DataSource, Repository } from "typeorm";
import { EndorsementConfigModel } from "../models/config.model";
import { EndorsementTemplateModel } from "../models/endorsement-template.model";
import { ProductModel } from "../models/product.model";
import { TemplateEventModel } from "../models/template-event.model";
import { TemplateFieldModel } from "../models/template-field.model";

export class ConfigRepository {
  private productRepository: Repository<ProductModel>;
  private templateRepository: Repository<EndorsementTemplateModel>;
  private fieldRepository: Repository<TemplateFieldModel>;
  private eventRepository: Repository<TemplateEventModel>;

  constructor(dataSource: DataSource) {
    this.productRepository = dataSource.getRepository(ProductModel);
    this.templateRepository = dataSource.getRepository(EndorsementTemplateModel);
    this.fieldRepository = dataSource.getRepository(TemplateFieldModel);
    this.eventRepository = dataSource.getRepository(TemplateEventModel);
  }

  async findByProductAndTipoEndoso(
    producto: string,
    tipoEndoso: string,
  ): Promise<EndorsementConfigModel | null> {
    const product = await this.productRepository.findOne({ where: { code: producto } });
    if (!product) return null;

    const template = await this.templateRepository.findOne({
      where: { productId: product.id, tipoEndoso },
    });
    if (!template) return null;

    const [templateFields, eventAppliedEntities] = await Promise.all([
      this.fieldRepository.find({ where: { templateId: template.id }, order: { order: "ASC" } }),
      this.eventRepository.find({ where: { templateId: template.id }, order: { orderEvent: "ASC" } }),
    ]);

    return {
      ...template,
      producto: product.code,
      templateFields,
      eventAppliedEntities,
    };
  }

  async listTemplateCatalog() {
    const products = await this.productRepository.find({ order: { code: "ASC" } });
    const templates = await this.templateRepository.find({ order: { tipoEndoso: "ASC" } });

    return Promise.all(templates.map(async (template) => {
      const product = products.find((item) => item.id === template.productId);
      const [fields, events] = await Promise.all([
        this.fieldRepository.find({ where: { templateId: template.id }, order: { order: "ASC" } }),
        this.eventRepository.find({ where: { templateId: template.id }, order: { orderEvent: "ASC" } }),
      ]);

      return {
        product: product?.code ?? "unknown",
        productName: product?.name ?? "unknown",
        template,
        fields,
        events,
      };
    }));
  }
}
