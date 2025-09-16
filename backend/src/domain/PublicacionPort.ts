import { Publicacion } from "./Publicacion";

export interface PublicacionPort {
    createPublicacion(publicacion: Omit<Publicacion, "id">): Promise<number>;
    updatePublicacion(id: number, publicacion: Partial<Publicacion>): Promise<boolean>;
    deletePublicacion(id: number): Promise<boolean>;
    getPublicacionById(id: number): Promise<Publicacion | null>;
    getAllPublicaciones(): Promise<Publicacion[]>;
}