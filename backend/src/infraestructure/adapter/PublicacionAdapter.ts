import { Publicacion } from "../../domain/Publicacion";
import { PublicacionPort } from "../../domain/PublicacionPort";
import { PublicacionEntity } from "../entities/PublicacionEntity";
import { AppDataSource } from "../config/data-base";
import { Repository } from "typeorm";

export class PublicacionAdapter implements PublicacionPort {
    private readonly publicacionRepository: Repository<PublicacionEntity>;

    constructor() {
        this.publicacionRepository = AppDataSource.getRepository(PublicacionEntity);
    }

    // Helpers para mantener el código declarativo y consistente
    private parseIsoLikeDateString(s: string): Date {
        const parts = s.split('-');
        if (parts.length === 3) {
            const y = parseInt(parts[0], 10);
            const m = parseInt(parts[1], 10);
            const d = parseInt(parts[2], 10);
            if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
                return new Date(y, m - 1, d);
            }
        }
        return new Date(s);
    }

    private parseDateInput(val: unknown): Date | undefined {
        if (val === undefined || val === null) return undefined;
        if (val instanceof Date) return val;
        if (typeof val === 'string') return this.parseIsoLikeDateString(val);
        return new Date(val as any);
    }

    private mapUsuario(entity: PublicacionEntity) {
        if (!entity.usuario) return undefined;
        return {
            id: entity.usuario.id_usuario,
            tipoEntidad: entity.usuario.tipo_entidad,
            nombreEntidad: entity.usuario.nombre_entidad,
            correo: entity.usuario.correo,
            telefono: entity.usuario.telefono,
            ubicacion: entity.usuario.ubicacion,
            direccion: entity.usuario.direccion,
            password: entity.usuario.password,
            estado: entity.usuario.estado,
            fechaRegistro: entity.usuario.fecha_registro ? entity.usuario.fecha_registro.toISOString() : undefined,
        };
    }

    private mapCategoria(entity: PublicacionEntity) {
        if (!entity.categoria) return undefined;
        return {
            id: entity.categoria.id_categoria,
            nombre: entity.categoria.nombre,
            descripcion: entity.categoria.descripcion,
            estado: entity.categoria.estado,
        };
    }


    private toDomain(entity: PublicacionEntity): Publicacion {
        return {
            id: entity.id_publicacion,
            usuarioId: entity.usuario_id,
            categoriaId: entity.categoria_id,
            titulo: entity.titulo,
            descripcion: entity.descripcion,
            tipo: entity.tipo,
            cantidad: entity.cantidad,
            precio: entity.precio,
            fechaCaducidad: entity.fecha_caducidad,
            estado: entity.estado,
            fechaCreacion: entity.fecha_creacion,
            fechaActualizacion: entity.fecha_actualizacion,
            ...(entity.usuario ? { usuario: this.mapUsuario(entity) } : {}),
            ...(entity.categoria ? { categoria: this.mapCategoria(entity) } : {}),
        };
    }


    private toEntity(publicacion: Omit<Publicacion, "id">): PublicacionEntity {
        const entity = new PublicacionEntity();
        entity.usuario_id = publicacion.usuarioId;
        entity.categoria_id = publicacion.categoriaId;
        entity.titulo = publicacion.titulo!;
        entity.descripcion = publicacion.descripcion!;
        entity.tipo = publicacion.tipo!;
        entity.cantidad = publicacion.cantidad!;
        entity.precio = publicacion.precio!;
        entity.fecha_caducidad = publicacion.fechaCaducidad!;
        entity.estado = publicacion.estado;
        entity.fecha_creacion = publicacion.fechaCreacion!;
        entity.fecha_actualizacion = publicacion.fechaActualizacion!;
        return entity;
    }

    async createPublicacion(publicacion: Omit<Publicacion, "id">): Promise<number> {
        try {
            const newPublicacion = this.toEntity(publicacion);
            const saved = await this.publicacionRepository.save(newPublicacion);
            return saved.id_publicacion;
        } catch (error) {
            console.error("Error al crear publicación", error);
            throw new Error("Error al crear publicación");
        }
    }

    async getPublicacionById(id: number): Promise<Publicacion | null> {
        try {
            const entity = await this.publicacionRepository.findOne({ where: { id_publicacion: id }, relations: ["usuario", "categoria"] });
            return entity ? this.toDomain(entity) : null;
        } catch (error) {
            console.error("Error al obtener publicación por id", error);
            throw new Error("Error al obtener publicación por id");
        }
    }

    async getAllPublicaciones(): Promise<Publicacion[]> {
        try {
            const entities = await this.publicacionRepository.find({ relations: ["usuario", "categoria"] });
            return entities.map(entity => this.toDomain(entity));
        } catch (error) {
            console.error("Error al obtener todas las publicaciones", error);
            throw new Error("Error al obtener todas las publicaciones");
        }
    }

    async updatePublicacion(id: number, publicacion: Partial<Publicacion>): Promise<boolean> {
        try {
            const existing = await this.publicacionRepository.findOne({ where: { id_publicacion: id } });
            if (!existing) {
                throw new Error("Publicación no encontrada");
            }

            // Mapeo de propiedades del dominio a la entidad con asignaciones declarativas
            const assignments: Array<{ key: keyof Publicacion; apply: (val: any) => void }> = [
                { key: 'usuarioId', apply: (val) => { existing.usuario_id = Number(val); } },
                { key: 'categoriaId', apply: (val) => { existing.categoria_id = Number(val); } },
                { key: 'titulo', apply: (val) => { existing.titulo = val; } },
                { key: 'descripcion', apply: (val) => { existing.descripcion = val; } },
                { key: 'tipo', apply: (val) => { existing.tipo = val; } },
                { key: 'cantidad', apply: (val) => { existing.cantidad = val; } },
                { key: 'precio', apply: (val) => { existing.precio = val; } },
                { key: 'estado', apply: (val) => { existing.estado = val; } },
                { key: 'fechaCaducidad', apply: (val) => { const d = this.parseDateInput(val); if (d) existing.fecha_caducidad = d; } },
                { key: 'fechaCreacion', apply: (val) => { const d = this.parseDateInput(val); if (d) existing.fecha_creacion = d; } },
                { key: 'fechaActualizacion', apply: (val) => { const d = this.parseDateInput(val); if (d) existing.fecha_actualizacion = d; } },
            ];

            for (const { key, apply } of assignments) {
                if (Object.prototype.hasOwnProperty.call(publicacion, key)) {
                    const val = (publicacion as any)[key];
                    if (val !== undefined) apply(val);
                }
            }

            await this.publicacionRepository.save(existing);
            return true;
        } catch (error) {
            console.error("Error al actualizar publicación", error);
            throw new Error("Error al actualizar publicación");
        }
    }

    async deletePublicacion(id: number): Promise<boolean> {
        try {
            const existing = await this.publicacionRepository.findOne({ where: { id_publicacion: id } });
            if (!existing) {
                throw new Error("Publicación no encontrada");
            }
            existing.estado = 0;
            await this.publicacionRepository.save(existing);
            return true;
        } catch (error) {
            console.error("Error al eliminar publicación", error);
            throw new Error("Error al eliminar publicación");
        }
    }
}