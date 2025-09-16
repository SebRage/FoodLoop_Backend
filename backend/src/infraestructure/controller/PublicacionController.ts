import { Request, Response } from "express";
import { PublicacionApplication } from "../../application/PublicacionApplication";
import { Publicacion } from "../../domain/Publicacion";

export class PublicacionController {
	private app: PublicacionApplication;

	constructor(app: PublicacionApplication) {
		this.app = app;
	}

	async createPublicacion(request: Request, response: Response): Promise<Response> {
		try {
			const body = request.body;
			const pub: Omit<Publicacion, "id"> = {
				usuarioId: Number(body.usuarioId),
				categoriaId: Number(body.categoriaId),
				titulo: body.titulo,
				descripcion: body.descripcion,
				tipo: body.tipo,
				cantidad: body.cantidad,
				precio: Number(body.precio ?? 0),
				fechaCaducidad: body.fechaCaducidad ? new Date(body.fechaCaducidad) : new Date(),
				estado: 1,
				fechaCreacion: new Date(),
				fechaActualizacion: new Date(),
			};
			const id = await this.app.createPublicacion(pub);
			return response.status(201).json({ message: "Publicación creada", id });
		} catch (error: any) {
			console.error("createPublicacion error:", error);
			return response.status(500).json({ message: "Error en el servidor" });
		}
	}

	async getAllPublicaciones(request: Request, response: Response): Promise<Response> {
		try {
			const list = await this.app.getAllPublicaciones();
			return response.status(200).json(list);
		} catch (error: any) {
			console.error("getAllPublicaciones error:", error);
			return response.status(500).json({ message: "Error en el servidor" });
		}
	}

	async getPublicacionById(request: Request, response: Response): Promise<Response> {
		try {
			const id = parseInt(request.params.id);
			if (isNaN(id)) return response.status(400).json({ message: "Id inválido" });
			const item = await this.app.getPublicacionById(id);
			if (!item) return response.status(404).json({ message: "No encontrada" });
			return response.status(200).json(item);
		} catch (error: any) {
			console.error("getPublicacionById error:", error);
			return response.status(500).json({ message: "Error en el servidor" });
		}
	}

	async updatePublicacion(request: Request, response: Response): Promise<Response> {
		try {
			const id = parseInt(request.params.id);
			if (isNaN(id)) return response.status(400).json({ message: "Id inválido" });
			const updated = await this.app.updatePublicacion(id, request.body);
			if (!updated) return response.status(404).json({ message: "No encontrada" });
			return response.status(200).json({ message: "Actualizada" });
		} catch (error: any) {
			console.error("updatePublicacion error:", error);
			return response.status(500).json({ message: "Error en el servidor" });
		}
	}

	async deletePublicacion(request: Request, response: Response): Promise<Response> {
		try {
			const id = parseInt(request.params.id);
			if (isNaN(id)) return response.status(400).json({ message: "Id inválido" });
			const deleted = await this.app.deletePublicacion(id);
			if (!deleted) return response.status(404).json({ message: "No encontrada" });
			return response.status(200).json({ message: "Eliminada" });
		} catch (error: any) {
			console.error("deletePublicacion error:", error);
			return response.status(500).json({ message: "Error en el servidor" });
		}
	}
}

