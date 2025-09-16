import { Reporte } from "./Reporte";

export interface ReportePort {
    createReporte(reporte: Omit<Reporte, "id">): Promise<number>;
    updateReporte(id: number, reporte: Partial<Reporte>): Promise<boolean>;
    deleteReporte(id: number): Promise<boolean>;
    getReporteById(id: number): Promise<Reporte | null>;
    getAllReportes(): Promise<Reporte[]>;
}