import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("template_event")
export class TemplateEventModel {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column("integer")
  templateId!: number;

  @Column("text")
  description!: string;

  @Column("integer")
  orderEvent!: number;
}
