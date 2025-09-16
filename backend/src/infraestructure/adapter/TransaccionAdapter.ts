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
            monto: entity.monto,
            descripcion: entity.descripcion,
            estado: entity.estado,
            fecha: entity.fecha,
        };
    }

    private toEntity(transaccion: Omit<Transaccion, "id">): TransaccionEntity {
        const entity = new TransaccionEntity();
        entity.monto = transaccion.monto;
        entity.descripcion = transaccion.descripcion!;
        entity.estado = transaccion.estado;
        entity.fecha = transaccion.fecha!;
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
            const entity = await this.transaccionRepository.findOne({ where: { id_transaccion: id } });
            return entity ? this.toDomain(entity) : null;
        } catch (error) {
            console.error("Error al obtener transacción por id", error);
            throw new Error("Error al obtener transacción por id");
        }
    }

    async getAllTransacciones(): Promise<Transaccion[]> {
        try {
            const entities = await this.transaccionRepository.find();
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
            existing.monto = transaccion.monto ?? existing.monto;
            existing.descripcion = transaccion.descripcion ?? existing.descripcion;
            existing.estado = transaccion.estado ?? existing.estado;
            existing.fecha = transaccion.fecha ?? existing.fecha;
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