import { CategoriaPort } from "../domain/CategoriaPort";
import { Categoria } from "../domain/Categoria";

export class CategoriaApplication {
    private readonly port: CategoriaPort;
    constructor(port: CategoriaPort) {
        this.port = port;
    }

    async createCategoria(categoria: Omit<Categoria, "id">): Promise<number> {
        return await this.port.createCategoria(categoria);
    }

    async updateCategoria(id: number, categoria: Partial<Categoria>): Promise<boolean> {
        const existing = await this.port.getCategoriaById(id);
        if (!existing) throw new Error("Categoría no encontrada");
        return await this.port.updateCategoria(id, categoria);
    }

    async deleteCategoria(id: number): Promise<boolean> {
        const existing = await this.port.getCategoriaById(id);
        if (!existing) throw new Error("Categoría no encontrada");
        return await this.port.deleteCategoria(id);
    }

    async getCategoriaById(id: number): Promise<Categoria | null> {
        return await this.port.getCategoriaById(id);
    }

    async getAllCategorias(): Promise<Categoria[]> {
        return await this.port.getAllCategorias();
    }
}