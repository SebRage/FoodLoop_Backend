import { Reporte as ReporteDomain } from "../../domain/Reporte";
import { ReportePort} from "../../domain/ReportePort";
import { ReporteEntity } from "../entities/ReporteEntity";
import { AppDataSource } from "../config/data-base";
import { Repository } from "typeorm";

export class ReporteAdapter implements ReportePort {
    private readonly reporteRepository: Repository<ReporteEntity>;

    constructor() {
        this.reporteRepository = AppDataSource.getRepository(ReporteEntity);
    }

    private toDomain(entity: ReporteEntity): ReporteDomain {
        return {
            id: entity.id_reporte,
            reportanteId: entity.reportante_id,
            publicacionId: entity.publicacion_id,
            descripcion: entity.descripcion,
            estado: entity.estado,
            fechaReporte: entity.fecha_reporte,
            reportante: entity.reportante ? {
                id: entity.reportante.id_usuario,
                tipoEntidad: entity.reportante.tipo_entidad,
                nombreEntidad: entity.reportante.nombre_entidad,
                correo: entity.reportante.correo,
                telefono: entity.reportante.telefono,
                ubicacion: entity.reportante.ubicacion,
                direccion: entity.reportante.direccion,
                password: entity.reportante.password,
                estado: entity.reportante.estado,
                fechaRegistro: entity.reportante.fecha_registro ? entity.reportante.fecha_registro.toISOString() : undefined,
            } : undefined,
            publicacion: entity.publicacion ? {
                id: entity.publicacion.id_publicacion,
                usuarioId: entity.publicacion.usuario_id,
                categoriaId: entity.publicacion.categoria_id,
                titulo: entity.publicacion.titulo,
                descripcion: entity.publicacion.descripcion,
                tipo: entity.publicacion.tipo,
                cantidad: entity.publicacion.cantidad,
                precio: entity.publicacion.precio,
                fechaCaducidad: entity.publicacion.fecha_caducidad,
                estado: entity.publicacion.estado,
                fechaCreacion: entity.publicacion.fecha_creacion,
                fechaActualizacion: entity.publicacion.fecha_actualizacion,
            } : undefined,
        };
    }

    private toEntity(reporte: Omit<ReporteDomain, "id">): ReporteEntity {
        const entity = new ReporteEntity();
        entity.descripcion = reporte.descripcion!;
        entity.estado = reporte.estado;
        entity.fecha_reporte = reporte.fechaReporte!;
        if (reporte.reportanteId) entity.reportante = { id_usuario: reporte.reportanteId } as any;
        if (reporte.publicacionId) entity.publicacion_id = reporte.publicacionId;
        return entity;
    }

    async createReporte(reporte: Omit<ReporteDomain, "id">): Promise<number> {
        try {
            const newReporte = this.toEntity(reporte);
            const saved = await this.reporteRepository.save(newReporte);
            return saved.id_reporte;
        } catch (error) {
            console.error("Error al crear reporte", error);
            throw new Error("Error al crear reporte");
        }
    }

    async getReporteById(id: number): Promise<ReporteDomain | null> {
        try {
            const entity = await this.reporteRepository.findOne({ where: { id_reporte: id }, relations: ["reportante", "publicacion"] });
            return entity ? this.toDomain(entity) : null;
        } catch (error) {
            console.error("Error al obtener reporte por id", error);
            throw new Error("Error al obtener reporte por id");
        }
    }

    async getAllReportes(): Promise<ReporteDomain[]> {
        try {
            const entities = await this.reporteRepository.find({ relations: ["reportante", "publicacion"] });
            return entities.map(entity => this.toDomain(entity));
        } catch (error) {
            console.error("Error al obtener todos los reportes", error);
            throw new Error("Error al obtener todos los reportes");
        }
    }

    async updateReporte(id: number, reporte: Partial<ReporteDomain>): Promise<boolean> {
        try {
            const existing = await this.reporteRepository.findOne({ where: { id_reporte: id } });
            if (!existing) {
                throw new Error("Reporte no encontrado");
            }
            existing.descripcion = reporte.descripcion ?? existing.descripcion;
            existing.estado = reporte.estado ?? existing.estado;
            existing.fecha_reporte = reporte.fechaReporte ?? existing.fecha_reporte;
            if (reporte.reportanteId) existing.reportante = { id_usuario: reporte.reportanteId } as any;
            if (reporte.publicacionId) existing.publicacion_id = reporte.publicacionId;
            await this.reporteRepository.save(existing);
            return true;
        } catch (error) {
            console.error("Error al actualizar reporte", error);
            throw new Error("Error al actualizar reporte");
        }
    }

    async deleteReporte(id: number): Promise<boolean> {
        try {
            const existing = await this.reporteRepository.findOne({ where: { id_reporte: id } });
            if (!existing) {
                throw new Error("Reporte no encontrado");
            }
            existing.estado = 0;
            await this.reporteRepository.save(existing);
            return true;
        } catch (error) {
            console.error("Error al eliminar reporte", error);
            throw new Error("Error al eliminar reporte");
        }
    }
}