import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from "typeorm";
import { UserEntity } from "./UserEntity";
import { PublicacionEntity } from "./PublicacionEntity";

@Entity({ name: "transacciones" })
export class TransaccionEntity {
  @PrimaryGeneratedColumn()
  id_transaccion!: number;

  @Column({ type: "int" })
  publicacion_id!: number;

  @Column({ type: "int" })
  donante_vendedor_id!: number;

  // beneficiario_comprador_id defined below as column and relation

  @Column({ type: "int" })
  beneficiario_comprador_id!: number;

  @Column({ type: "int", default: 1 })
  estado!: number;

  @Column({ type: "timestamptz" })
  fecha_transaccion!: Date;

  @ManyToOne(() => PublicacionEntity, (p) => p.id_publicacion, { onDelete: 'NO ACTION', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'publicacion_id' })
  publicacion!: PublicacionEntity;

  @ManyToOne(() => UserEntity, (u) => u.transaccionesDonadas, { onDelete: 'NO ACTION', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'donante_vendedor_id' })
  donante!: UserEntity;

  @ManyToOne(() => UserEntity, (u) => u.transaccionesRecibidas, { onDelete: 'NO ACTION', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'beneficiario_comprador_id' })
  beneficiario!: UserEntity;
}
