import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, JoinColumn } from "typeorm";
import { UserEntity } from "./UserEntity";
import { PublicacionEntity } from "./PublicacionEntity";

@Entity({ name: "reportes" })
export class ReporteEntity {
  @PrimaryGeneratedColumn()
  id_reporte!: number;

  @Column({ type: "int" })
  reportante_id!: number;

  @Column({ type: "int" })
  publicacion_id!: number;

  @Column({ type: "character varying" })
  descripcion!: string;

  @Column({ type: "int", default: 1 })
  estado!: number;

  @Column({ type: "timestamptz" })
  fecha_reporte!: Date;

  @ManyToOne(() => UserEntity, (user) => user.reportes, {
    onUpdate: "CASCADE",
    onDelete: "NO ACTION",
  })
  @JoinColumn({ name: "reportante_id" })
  reportante!: UserEntity;

  @ManyToOne(() => PublicacionEntity, (p) => p.id_publicacion, {
    onUpdate: "CASCADE",
    onDelete: "NO ACTION",
  })
  @JoinColumn({ name: "publicacion_id" })
  publicacion!: PublicacionEntity;

}
