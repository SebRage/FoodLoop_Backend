import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "publicacion" })
export class PublicacionEntity {
  @PrimaryGeneratedColumn()
  id_publicacion!: number;

  @Column({ type: "int" })
  usuario_id!: number;

  @Column({ type: "int" })
  categoria_id!: number;

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

  @Column({ type: "timestamp" })
  fecha_creacion!: Date;

  @Column({ type: "timestamp" })
  fecha_actualizacion!: Date;
}
