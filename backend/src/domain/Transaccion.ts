export interface Transaccion {
    id: number;
    publicacionId: number;
    donanteVendedorId: number;
    beneficiarioCompradorId: number;
    estado: number;           
    fechaTransaccion?: Date;
}