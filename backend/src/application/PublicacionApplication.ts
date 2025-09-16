import { PublicacionPort } from "../domain/PublicacionPort";
import { Publicacion } from "../domain/Publicacion";

export class PublicacionApplication {
    private port: PublicacionPort;
    constructor(port: PublicacionPort) {
        this.port = port;
    }

    async createPublicacion(publicacion: Omit<Publicacion, "id">): Promise<number> {
        return await this.port.createPublicacion(publicacion);
    }

    async updatePublicacion(id: number, publicacion: Partial<Publicacion>): Promise<boolean> {
        const existing = await this.port.getPublicacionById(id);
        if (!existing) throw new Error("Publicación no encontrada");
        return await this.port.updatePublicacion(id, publicacion);
    }

    async deletePublicacion(id: number): Promise<boolean> {
        const existing = await this.port.getPublicacionById(id);
        if (!existing) throw new Error("Publicación no encontrada");
        return await this.port.deletePublicacion(id);
    }

    async getPublicacionById(id: number): Promise<Publicacion | null> {
        return await this.port.getPublicacionById(id);
    }

    async getAllPublicaciones(): Promise<Publicacion[]> {
        return await this.port.getAllPublicaciones();
    }
}