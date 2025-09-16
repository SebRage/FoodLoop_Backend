export interface Publicacion {
    id: number;
    usuarioId: number;
    categoriaId: number;
    titulo: string;
    descripcion: string;
    tipo: string;
    cantidad: string;
    precio: number;
    fechaCaducidad: Date;
    estado: number;
    fechaCreacion: Date;
    fechaActualizacion: Date;
}