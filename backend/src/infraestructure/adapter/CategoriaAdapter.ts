import { Categoria } from "../../domain/Categoria";
import { CategoriaPort } from "../../domain/CategoriaPort";
import { CategoriaEntity } from "../entities/CategoriaEntity";
import { AppDataSource } from "../config/data-base";
import { Repository } from "typeorm";

export class CategoriaAdapter implements CategoriaPort {
    private categoriaRepository: Repository<CategoriaEntity>;

    constructor() {
        this.categoriaRepository = AppDataSource.getRepository(CategoriaEntity);
    }

    private toDomain(entity: CategoriaEntity): Categoria {
        return {
            id: entity.id_categoria,
            nombre: entity.nombre,
            descripcion: entity.descripcion,
            estado: entity.estado,
        };
    }

    private toEntity(categoria: Omit<Categoria, "id">): CategoriaEntity {
        const entity = new CategoriaEntity();
        entity.nombre = categoria.nombre!;
        entity.descripcion = categoria.descripcion!;
        entity.estado = categoria.estado;
        return entity;
    }

    async createCategoria(categoria: Omit<Categoria, "id">): Promise<number> {
        try {
            const newCategoria = this.toEntity(categoria);
            const saved = await this.categoriaRepository.save(newCategoria);
            return saved.id_categoria;
        } catch (error) {
            console.error("Error al crear categoría", error);
            throw new Error("Error al crear categoría");
        }
    }

    async getCategoriaById(id: number): Promise<Categoria | null> {
        try {
            const entity = await this.categoriaRepository.findOne({ where: { id_categoria: id } });
            return entity ? this.toDomain(entity) : null;
        } catch (error) {
            console.error("Error al obtener categoría por id", error);
            throw new Error("Error al obtener categoría por id");
        }
    }

    async getAllCategorias(): Promise<Categoria[]> {
        try {
            const entities = await this.categoriaRepository.find();
            return entities.map(entity => this.toDomain(entity));
        } catch (error) {
            console.error("Error al obtener todas las categorías", error);
            throw new Error("Error al obtener todas las categorías");
        }
    }

    async updateCategoria(id: number, categoria: Partial<Categoria>): Promise<boolean> {
        try {
            const existing = await this.categoriaRepository.findOne({ where: { id_categoria: id } });
            if (!existing) {
                throw new Error("Categoría no encontrada");
            }
            existing.nombre = categoria.nombre ?? existing.nombre;
            existing.descripcion = categoria.descripcion ?? existing.descripcion;
            existing.estado = categoria.estado ?? existing.estado;
            await this.categoriaRepository.save(existing);
            return true;
        } catch (error) {
            console.error("Error al actualizar categoría", error);
            throw new Error("Error al actualizar categoría");
        }
    }

    async deleteCategoria(id: number): Promise<boolean> {
        try {
            const existing = await this.categoriaRepository.findOne({ where: { id_categoria: id } });
            if (!existing) {
                throw new Error("Categoría no encontrada");
            }
            existing.estado = 0;
            await this.categoriaRepository.save(existing);
            return true;
        } catch (error) {
            console.error("Error al eliminar categoría", error);
            throw new Error("Error al eliminar categoría");
        }
    }
}