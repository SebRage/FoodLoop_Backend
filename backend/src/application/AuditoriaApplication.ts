import { AuditoriaPort } from "../domain/AuditoriaPort";
import { Auditoria } from "../domain/Auditoria";

export class AuditoriaApplication {
    private readonly port: AuditoriaPort;
    constructor(port: AuditoriaPort) {
        this.port = port;
    }

    async createAuditoria(auditoria: Omit<Auditoria, "id">): Promise<number> {
        return await this.port.createAuditoria(auditoria);
    }

    async updateAuditoria(id: number, auditoria: Partial<Auditoria>): Promise<boolean> {
        const existing = await this.port.getAuditoriaById(id);
        if (!existing) throw new Error("Auditoría no encontrada");
        return await this.port.updateAuditoria(id, auditoria);
    }

    async deleteAuditoria(id: number): Promise<boolean> {
        const existing = await this.port.getAuditoriaById(id);
        if (!existing) throw new Error("Auditoría no encontrada");
        return await this.port.deleteAuditoria(id);
    }

    async getAuditoriaById(id: number): Promise<Auditoria | null> {
        return await this.port.getAuditoriaById(id);
    }

    async getAllAuditorias(): Promise<Auditoria[]> {
        return await this.port.getAllAuditorias();
    }
}