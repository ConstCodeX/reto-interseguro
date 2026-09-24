import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("endorsement_template")
export class EndorsementTemplateModel {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column("integer")
  productId!: number;

  @Column("text")
  tipoEndoso!: string;

  @Column("text")
  tipoEndosoPol!: string;

  @Column("text")
  responsableAtencion!: string;

  @Column("text")
  endosoModifPrima!: string;

  @Column("text")
  codigoEndoso!: string;
}
