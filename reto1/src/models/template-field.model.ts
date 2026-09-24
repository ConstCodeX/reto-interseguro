import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("template_field")
export class TemplateFieldModel {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column("integer")
  templateId!: number;

  @Column("text")
  key!: string;

  @Column("text")
  label!: string;

  @Column("text")
  source!: string;

  @Column("text", { nullable: true })
  defaultValue!: string | null;

  @Column("boolean", { default: false })
  required!: boolean;

  @Column("integer")
  order!: number;
}
