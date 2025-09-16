import { Auditoria } from "./Auditoria";

export interface AuditoriaPort {
    createAuditoria(auditoria: Omit<Auditoria, "id">): Promise<number>;
    updateAuditoria(id: number, auditoria: Partial<Auditoria>): Promise<boolean>;
    deleteAuditoria(id: number): Promise<boolean>;
    getAuditoriaById(id: number): Promise<Auditoria | null>;
    getAllAuditorias(): Promise<Auditoria[]>;
}