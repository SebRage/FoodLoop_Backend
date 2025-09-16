export interface Auditoria {
    id_log: number;
    usuario_id: number;
    accion: string;        
    descripcion: string;
    estado: number;        
    fecha: Date;
}