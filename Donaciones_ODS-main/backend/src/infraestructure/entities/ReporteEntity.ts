import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, JoinColumn } from "typeorm";
import { UserEntity } from "./UserEntity";

@Entity({ name: "reporte" })
export class ReporteEntity {
  @PrimaryGeneratedColumn()
  id_reporte!: number;

  @Column({ type: "int" })
  reportanteId!: number;

  @Column({ type: "int" })
  publicacionId!: number;

  @Column({ type: "character varying" })
  descripcion!: string;

  @Column({ type: "int", default: 1 })
  estado!: number;

  @Column({ type: "timestamptz" })
  fechaReporte!: Date;

  @ManyToOne(() => UserEntity, (UserEntity) => UserEntity.id_usuario, {
    onUpdate: "CASCADE",
    onDelete: "NO ACTION",
  })
  @JoinColumn({ name: "reportanteId" })
  reportante!: UserEntity;

}
