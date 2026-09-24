import { DataSource } from "typeorm";
import { EndorsementTemplateModel } from "../models/endorsement-template.model";
import { ProductModel } from "../models/product.model";
import { TemplateEventModel } from "../models/template-event.model";
import { TemplateFieldModel } from "../models/template-field.model";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST ?? "localhost",
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USER ?? "interseguro",
  password: process.env.DB_PASSWORD ?? "interseguro",
  database: process.env.DB_NAME ?? "interseguro",
  entities: [ProductModel, EndorsementTemplateModel, TemplateFieldModel, TemplateEventModel],
  synchronize: process.env.DB_SYNCHRONIZE !== "false",
  logging: false,
});
