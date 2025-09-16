import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from "typeorm";
import { UserEntity } from "./UserEntity";

@Entity({ name: "auditoria" })
export class AuditoriaEntity {
  @PrimaryGeneratedColumn()
  id_log!: number;


  usuario!: UserEntity;

  @Column({ type: "character varying", length: 100 })
  tabla_afectada!: string;

  @Column({ type: "int" })
  registro_id!: number;

  @Column({ type: "character varying", length: 50 })
  accion!: string;  

  @Column({ type: "character varying" })
  descripcion!: string;

  @Column({ type: "int", default: 1 })
  estado!: number;

  @Column({ type: "timestamptz" })
  fecha!: Date;
}
