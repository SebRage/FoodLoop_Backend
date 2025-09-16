export interface Auditoria {
    id: number;
    usuarioId?: number;
    tablaAfectada?: string;
    registroId?: number;
    accion: string;
    descripcion: string;
    estado: number;
    fecha: Date;
}