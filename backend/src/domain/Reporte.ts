import { User } from "./User";
import { Publicacion } from "./Publicacion";

export interface Reporte {
    id: number;
    reportanteId: number;
    publicacionId: number;
    descripcion: string;
    estado: number;
    fechaReporte: Date;
    reportante?: User;
    publicacion?: Publicacion;
}