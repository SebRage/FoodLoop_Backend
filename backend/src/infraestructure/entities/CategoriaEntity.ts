import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "categoria" })
export class CategoriaEntity {
  @PrimaryGeneratedColumn()
  id_categoria!: number;

  @Column({ type: "character varying", length: 100 })
  nombre!: string;

  @Column({ type: "character varying" })
  descripcion!: string;

  @Column({ type: "int", default: 1 })
  estado!: number;
}
