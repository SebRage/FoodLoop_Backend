export interface Reporte {
    id: number;
    reportanteId: number;
    publicacionId: number;
    descripcion: string;
    estado: number;
    fechaReporte: Date;
}