export interface User {
    id: number;
    tipoEntidad: string;      
    nombreEntidad: string;
    correo: string;
    telefono?: string;
    ubicacion?: string;
    direccion?: string;
    password: string;
    estado: number;
    fechaRegistro?: Date;
}