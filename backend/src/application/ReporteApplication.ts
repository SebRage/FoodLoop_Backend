import { ReportePort } from "../domain/ReportePort";
import { Reporte } from "../domain/Reporte";

export class ReporteApplication {
    private port: ReportePort;
    constructor(port: ReportePort) {
        this.port = port;
    }

    async createReporte(reporte: Omit<Reporte, "id">): Promise<number> {
        return await this.port.createReporte(reporte);
    }

    async updateReporte(id: number, reporte: Partial<Reporte>): Promise<boolean> {
        const existing = await this.port.getReporteById(id);
        if (!existing) throw new Error("Reporte no encontrado");
        return await this.port.updateReporte(id, reporte);
    }

    async deleteReporte(id: number): Promise<boolean> {
        const existing = await this.port.getReporteById(id);
        if (!existing) throw new Error("Reporte no encontrado");
        return await this.port.deleteReporte(id);
    }

    async getReporteById(id: number): Promise<Reporte | null> {
        return await this.port.getReporteById(id);
    }

    async getAllReportes(): Promise<Reporte[]> {
        return await this.port.getAllReportes();
    }
}