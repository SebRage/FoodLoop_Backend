import { Publicacion } from "../../domain/Publicacion";
import { PublicacionPort } from "../../domain/PublicacionPort";
import { PublicacionEntity } from "../entities/PublicacionEntity";
import { AppDataSource } from "../config/data-base";
import { Repository } from "typeorm";

export class PublicacionAdapter implements PublicacionPort {
    private publicacionRepository: Repository<PublicacionEntity>;

    constructor() {
        this.publicacionRepository = AppDataSource.getRepository(PublicacionEntity);
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
            // Relaciones opcionales
            ...(entity.usuario ? { usuario: {
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
            }} : {}),
            ...(entity.categoria ? { categoria: {
                id: entity.categoria.id_categoria,
                nombre: entity.categoria.nombre,
                descripcion: entity.categoria.descripcion,
                estado: entity.categoria.estado,
            } } : {}),
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
            // Permitir cambiar usuario y categoría asociados si se proveen
            if (publicacion.usuarioId !== undefined) {
                existing.usuario_id = Number(publicacion.usuarioId);
            }
            if (publicacion.categoriaId !== undefined) {
                existing.categoria_id = Number(publicacion.categoriaId);
            }
            if (publicacion.titulo !== undefined) {
                existing.titulo = publicacion.titulo;
            }
            if (publicacion.descripcion !== undefined) {
                existing.descripcion = publicacion.descripcion;
            }
            if (publicacion.tipo !== undefined) {
                existing.tipo = publicacion.tipo;
            }
            if (publicacion.cantidad !== undefined) {
                existing.cantidad = publicacion.cantidad;
            }
            if (publicacion.precio !== undefined) {
                existing.precio = publicacion.precio;
            }
            if (publicacion.fechaCaducidad !== undefined) {
                existing.fecha_caducidad = (publicacion.fechaCaducidad instanceof Date)
                    ? publicacion.fechaCaducidad
                    : new Date(publicacion.fechaCaducidad as any);
            }
            if (publicacion.estado !== undefined) {
                existing.estado = publicacion.estado;
            }
            if (publicacion.fechaCreacion !== undefined) {
                existing.fecha_creacion = (publicacion.fechaCreacion instanceof Date)
                    ? publicacion.fechaCreacion
                    : new Date(publicacion.fechaCreacion as any);
            }
            if (publicacion.fechaActualizacion !== undefined) {
                existing.fecha_actualizacion = (publicacion.fechaActualizacion instanceof Date)
                    ? publicacion.fechaActualizacion
                    : new Date(publicacion.fechaActualizacion as any);
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