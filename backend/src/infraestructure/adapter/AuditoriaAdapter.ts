import { Auditoria } from "../../domain/Auditoria";
import { Auditoria as AuditoriaDomain } from "../../domain/Auditoria";
import { AuditoriaPort } from "../../domain/AuditoriaPort";
import { AuditoriaEntity } from "../entities/AuditoriaEntity";
import { AppDataSource } from "../config/data-base";
import { Repository } from "typeorm";
import { UserEntity } from "../entities/UserEntity";

export class AuditoriaAdapter implements AuditoriaPort {
    private readonly auditoriaRepository: Repository<AuditoriaEntity>;

    constructor() {
        this.auditoriaRepository = AppDataSource.getRepository(AuditoriaEntity);
    }

    private toDomain(entity: AuditoriaEntity): AuditoriaDomain {
        return {
            id: entity.id_log,
            usuarioId: entity.usuario?.id_usuario,
            tablaAfectada: entity.tabla_afectada,
            registroId: entity.registro_id,
            accion: entity.accion,
            descripcion: entity.descripcion,
            estado: entity.estado,
            fecha: entity.fecha,
        };
    }

    private toEntity(auditoria: Omit<Auditoria, "id">): AuditoriaEntity {
        const entity = new AuditoriaEntity();
        if (auditoria.usuarioId) {
            entity.usuario = { id_usuario: auditoria.usuarioId } as UserEntity;
        }
        entity.tabla_afectada = auditoria.tablaAfectada!;
        entity.registro_id = auditoria.registroId!;
        entity.accion = auditoria.accion!;
        entity.descripcion = auditoria.descripcion!;
        entity.estado = auditoria.estado;
        entity.fecha = auditoria.fecha!;
        return entity;
    }

    async createAuditoria(auditoria: Omit<Auditoria, "id">): Promise<number> {
        try {
            const newAuditoria = this.toEntity(auditoria);
            const saved = await this.auditoriaRepository.save(newAuditoria);
            return saved.id_log;
        } catch (error) {
            console.error("Error al crear auditoría", error);
            throw new Error("Error al crear auditoría");
        }
    }

    async getAuditoriaById(id: number): Promise<Auditoria | null> {
        try {
            const entity = await this.auditoriaRepository.findOne({ where: { id_log: id }, relations: ["usuario"] });
            return entity ? this.toDomain(entity) : null;
        } catch (error) {
            console.error("Error al obtener auditoría por id", error);
            throw new Error("Error al obtener auditoría por id");
        }
    }

    async getAllAuditorias(): Promise<Auditoria[]> {
        try {
            const entities = await this.auditoriaRepository.find({ relations: ["usuario"] });
            return entities.map(entity => this.toDomain(entity));
        } catch (error) {
            console.error("Error al obtener todas las auditorías", error);
            throw new Error("Error al obtener todas las auditorías");
        }
    }

    async updateAuditoria(id: number, auditoria: Partial<Auditoria>): Promise<boolean> {
        try {
            const existing = await this.auditoriaRepository.findOne({ where: { id_log: id }, relations: ["usuario"] });
            if (!existing) {
                throw new Error("Auditoría no encontrada");
            }
            if (auditoria.usuarioId) {
                existing.usuario = { id_usuario: auditoria.usuarioId } as UserEntity;
            }
            existing.tabla_afectada = auditoria.tablaAfectada ?? existing.tabla_afectada;
            existing.registro_id = auditoria.registroId ?? existing.registro_id;
            existing.accion = auditoria.accion ?? existing.accion;
            existing.descripcion = auditoria.descripcion ?? existing.descripcion;
            existing.estado = auditoria.estado ?? existing.estado;
            existing.fecha = auditoria.fecha ?? existing.fecha;
            await this.auditoriaRepository.save(existing);
            return true;
        } catch (error) {
            console.error("Error al actualizar auditoría", error);
            throw new Error("Error al actualizar auditoría");
        }
    }

    async deleteAuditoria(id: number): Promise<boolean> {
        try {
            const existing = await this.auditoriaRepository.findOne({ where: { id_log: id } });
            if (!existing) {
                throw new Error("Auditoría no encontrada");
            }
            existing.estado = 0;
            await this.auditoriaRepository.save(existing);
            return true;
        } catch (error) {
            console.error("Error al eliminar auditoría", error);
            throw new Error("Error al eliminar auditoría");
        }
    }
}