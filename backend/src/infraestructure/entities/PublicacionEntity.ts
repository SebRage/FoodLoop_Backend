import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from "typeorm";
import { UserEntity } from "./UserEntity";
import { CategoriaEntity } from "./CategoriaEntity";

@Entity({ name: "publicaciones" })
export class PublicacionEntity {
  @PrimaryGeneratedColumn()
  id_publicacion!: number;

  @Column({ type: "int" })
  usuario_id!: number;

  @Column({ type: "int" })
  categoria_id!: number;

  @ManyToOne(() => UserEntity, (user) => user.publicaciones, { onDelete: 'NO ACTION', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'usuario_id' })
  usuario!: UserEntity;

  @ManyToOne(() => CategoriaEntity, (cat) => cat.id_categoria, { onDelete: 'NO ACTION', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'categoria_id' })
  categoria!: CategoriaEntity;

  @Column({ type: "character varying", length: 255 })
  titulo!: string;

  @Column({ type: "character varying" })
  descripcion!: string;

  @Column({ type: "character varying", length: 100 })
  tipo!: string;

  @Column({ type: "character varying", length: 100 })
  cantidad!: string;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  precio!: number;

  @Column({ type: "date" })
  fecha_caducidad!: Date;

  @Column({ type: "int", default: 1 })
  estado!: number;

  @Column({ type: "timestamptz" })
  fecha_creacion!: Date;

  @Column({ type: "timestamptz" })
  fecha_actualizacion!: Date;
}
