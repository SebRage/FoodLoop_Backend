import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ReporteEntity } from "./ReporteEntity";
import { PublicacionEntity } from "./PublicacionEntity";
import { TransaccionEntity } from "./TransaccionEntity";

@Entity({ name: "usuarios" })
export class UserEntity {
  @PrimaryGeneratedColumn()
  id_usuario!: number;

  @Column({ type: "character varying", length: 50 })
  tipo_entidad!: string;

  @Column({ type: "character varying", length: 255 })
  nombre_entidad!: string;

  @Column({ type: "character varying", length: 255, unique: true })
  correo!: string;

  @Column({ type: "character varying", length: 50 })
  telefono!: string;

  @Column({ type: "character varying", length: 255 })
  ubicacion!: string;

  @Column({ type: "character varying", length: 255 })
  direccion!: string;

  @Column({ type: "character varying", length: 255 })
  password!: string;

  @Column({ type: "int", default: 1 })
  estado!: number;

  @Column({ type: "timestamptz" })
  fecha_registro!: Date;
  
  @OneToMany(() => ReporteEntity, (ReporteEntity) => ReporteEntity.reportante)
  reportes!: ReporteEntity[];

  @OneToMany(() => PublicacionEntity, (publicacion) => publicacion.usuario)
  publicaciones!: PublicacionEntity[];

  @OneToMany(() => TransaccionEntity, (t) => t.donante)
  transaccionesDonadas!: TransaccionEntity[];

  @OneToMany(() => TransaccionEntity, (t) => t.beneficiario)
  transaccionesRecibidas!: TransaccionEntity[];
}
