import { TransaccionPort } from "../domain/TransaccionPort";
import { Transaccion } from "../domain/Transaccion";

export class TransaccionApplication {
    private readonly port: TransaccionPort;
    constructor(port: TransaccionPort) {
        this.port = port;
    }

    async createTransaccion(transaccion: Omit<Transaccion, "id">): Promise<number> {
        return await this.port.createTransaccion(transaccion);
    }

    async updateTransaccion(id: number, transaccion: Partial<Transaccion>): Promise<boolean> {
        const existing = await this.port.getTransaccionById(id);
        if (!existing) throw new Error("Transacción no encontrada");
        return await this.port.updateTransaccion(id, transaccion);
    }

    async deleteTransaccion(id: number): Promise<boolean> {
        const existing = await this.port.getTransaccionById(id);
        if (!existing) throw new Error("Transacción no encontrada");
        return await this.port.deleteTransaccion(id);
    }

    async getTransaccionById(id: number): Promise<Transaccion | null> {
        return await this.port.getTransaccionById(id);
    }

    async getAllTransacciones(): Promise<Transaccion[]> {
        return await this.port.getAllTransacciones();
    }
}