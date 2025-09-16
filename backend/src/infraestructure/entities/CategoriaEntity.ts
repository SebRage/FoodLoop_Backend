import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { PublicacionEntity } from "./PublicacionEntity";

@Entity({ name: "categorias" })
export class CategoriaEntity {
  @PrimaryGeneratedColumn()
  id_categoria!: number;

  @Column({ type: "character varying", length: 100 })
  nombre!: string;

  @Column({ type: "character varying" })
  descripcion!: string;

  @Column({ type: "int", default: 1 })
  estado!: number;

  @OneToMany(() => PublicacionEntity, (p) => p.categoria)
  publicaciones!: PublicacionEntity[];
}
