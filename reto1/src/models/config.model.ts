import { EndorsementTemplateModel } from "./endorsement-template.model";
import { TemplateEventModel } from "./template-event.model";
import { TemplateFieldModel } from "./template-field.model";

export type EndorsementConfigModel = EndorsementTemplateModel & {
  producto: string;
  templateFields: TemplateFieldModel[];
  eventAppliedEntities: TemplateEventModel[];
};
