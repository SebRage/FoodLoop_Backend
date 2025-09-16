import { Transaccion } from "./Transaccion";

export interface TransaccionPort {
    createTransaccion(transaccion: Omit<Transaccion, "id">): Promise<number>;
    updateTransaccion(id: number, transaccion: Partial<Transaccion>): Promise<boolean>;
    deleteTransaccion(id: number): Promise<boolean>;
    getTransaccionById(id: number): Promise<Transaccion | null>;
    getAllTransacciones(): Promise<Transaccion[]>;
}