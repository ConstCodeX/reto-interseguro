import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("product")
export class ProductModel {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column("text", { unique: true })
  code!: string;

  @Column("text")
  name!: string;
}
