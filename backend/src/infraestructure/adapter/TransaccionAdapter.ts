import { Transaccion } from "../../domain/Transaccion";
import { TransaccionPort } from "../../domain/TransaccionPort";
import { TransaccionEntity } from "../entities/TransaccionEntity";
import { AppDataSource } from "../config/data-base";
import { Repository } from "typeorm";

export class TransaccionAdapter implements TransaccionPort {
    private transaccionRepository: Repository<TransaccionEntity>;

    constructor() {
        this.transaccionRepository = AppDataSource.getRepository(TransaccionEntity);
    }

    private toDomain(entity: TransaccionEntity): Transaccion {
        return {
            id: entity.id_transaccion,
            publicacionId: entity.publicacion_id,
            donanteVendedorId: entity.donante_vendedor_id,
            beneficiarioCompradorId: entity.beneficiario_comprador_id,
            estado: entity.estado,
            fechaTransaccion: entity.fecha_transaccion,
            
            ...(entity.donante ? { donante: {
                id: entity.donante.id_usuario,
                tipoEntidad: entity.donante.tipo_entidad,
                nombreEntidad: entity.donante.nombre_entidad,
                correo: entity.donante.correo,
            }} : {}),
            ...(entity.beneficiario ? { beneficiario: {
                id: entity.beneficiario.id_usuario,
                tipoEntidad: entity.beneficiario.tipo_entidad,
                nombreEntidad: entity.beneficiario.nombre_entidad,
                correo: entity.beneficiario.correo,
            }} : {}),
            ...(entity.publicacion ? { publicacion: {
                id: entity.publicacion.id_publicacion,
                titulo: entity.publicacion.titulo,
            }} : {}),
        };
    }

    private toEntity(transaccion: Omit<Transaccion, "id">): TransaccionEntity {
        const entity = new TransaccionEntity();
        entity.publicacion_id = transaccion.publicacionId;
        entity.donante_vendedor_id = transaccion.donanteVendedorId;
        entity.beneficiario_comprador_id = transaccion.beneficiarioCompradorId;
        entity.estado = transaccion.estado;
        entity.fecha_transaccion = transaccion.fechaTransaccion!;
        return entity;
    }

    async createTransaccion(transaccion: Omit<Transaccion, "id">): Promise<number> {
        try {
            const newTransaccion = this.toEntity(transaccion);
            const saved = await this.transaccionRepository.save(newTransaccion);
            return saved.id_transaccion;
        } catch (error) {
            console.error("Error al crear transacción", error);
            throw new Error("Error al crear transacción");
        }
    }

    async getTransaccionById(id: number): Promise<Transaccion | null> {
        try {
            const entity = await this.transaccionRepository.findOne({ where: { id_transaccion: id }, relations: ["donante", "beneficiario", "publicacion"] });
            return entity ? this.toDomain(entity) : null;
        } catch (error) {
            console.error("Error al obtener transacción por id", error);
            throw new Error("Error al obtener transacción por id");
        }
    }

    async getAllTransacciones(): Promise<Transaccion[]> {
        try {
            const entities = await this.transaccionRepository.find({ relations: ["donante", "beneficiario", "publicacion"] });
            return entities.map(entity => this.toDomain(entity));
        } catch (error) {
            console.error("Error al obtener todas las transacciones", error);
            throw new Error("Error al obtener todas las transacciones");
        }
    }

    async updateTransaccion(id: number, transaccion: Partial<Transaccion>): Promise<boolean> {
        try {
            const existing = await this.transaccionRepository.findOne({ where: { id_transaccion: id } });
            if (!existing) {
                throw new Error("Transacción no encontrada");
            }
            existing.publicacion_id = transaccion.publicacionId ?? existing.publicacion_id;
            existing.donante_vendedor_id = transaccion.donanteVendedorId ?? existing.donante_vendedor_id;
            existing.beneficiario_comprador_id = transaccion.beneficiarioCompradorId ?? existing.beneficiario_comprador_id;
            existing.estado = transaccion.estado ?? existing.estado;
            existing.fecha_transaccion = transaccion.fechaTransaccion ?? existing.fecha_transaccion;
            await this.transaccionRepository.save(existing);
            return true;
        } catch (error) {
            console.error("Error al actualizar transacción", error);
            throw new Error("Error al actualizar transacción");
        }
    }

    async deleteTransaccion(id: number): Promise<boolean> {
        try {
            const existing = await this.transaccionRepository.findOne({ where: { id_transaccion: id } });
            if (!existing) {
                throw new Error("Transacción no encontrada");
            }
            existing.estado = 0;
            await this.transaccionRepository.save(existing);
            return true;
        } catch (error) {
            console.error("Error al eliminar transacción", error);
            throw new Error("Error al eliminar transacción");
        }
    }
}