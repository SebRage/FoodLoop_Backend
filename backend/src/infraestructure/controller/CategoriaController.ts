import { Request, Response } from "express";
import { CategoriaApplication } from "../../application/CategoriaApplication";
import { Categoria } from "../../domain/Categoria";

export class CategoriaController {
	private app: CategoriaApplication;

	constructor(app: CategoriaApplication) {
		this.app = app;
	}

	async createCategoria(request: Request, response: Response): Promise<Response> {
		try {
			const { nombre, descripcion } = request.body;
			if (!nombre) return response.status(400).json({ message: "Nombre requerido" });
			const cat: Omit<Categoria, "id"> = {
				nombre,
				descripcion: descripcion ?? "",
				estado: 1,
			};
			const id = await this.app.createCategoria(cat);
			return response.status(201).json({ message: "Categoría creada", id });
		} catch (error: any) {
			console.error("createCategoria error:", error);
			return response.status(500).json({ message: "Error en el servidor" });
		}
	}

	async getAllCategorias(request: Request, response: Response): Promise<Response> {
		try {
			const list = await this.app.getAllCategorias();
			return response.status(200).json(list);
		} catch (error: any) {
			console.error("getAllCategorias error:", error);
			return response.status(500).json({ message: "Error en el servidor" });
		}
	}

	async getCategoriaById(request: Request, response: Response): Promise<Response> {
		try {
			const id = parseInt(request.params.id);
			if (isNaN(id)) return response.status(400).json({ message: "Id inválido" });
			const item = await this.app.getCategoriaById(id);
			if (!item) return response.status(404).json({ message: "No encontrada" });
			return response.status(200).json(item);
		} catch (error: any) {
			console.error("getCategoriaById error:", error);
			return response.status(500).json({ message: "Error en el servidor" });
		}
	}

	async updateCategoria(request: Request, response: Response): Promise<Response> {
		try {
			const id = parseInt(request.params.id);
			if (isNaN(id)) return response.status(400).json({ message: "Id inválido" });
			const updated = await this.app.updateCategoria(id, request.body);
			if (!updated) return response.status(404).json({ message: "No encontrada" });
			return response.status(200).json({ message: "Actualizada" });
		} catch (error: any) {
			console.error("updateCategoria error:", error);
			return response.status(500).json({ message: "Error en el servidor" });
		}
	}

	async deleteCategoria(request: Request, response: Response): Promise<Response> {
		try {
			const id = parseInt(request.params.id);
			if (isNaN(id)) return response.status(400).json({ message: "Id inválido" });
			const deleted = await this.app.deleteCategoria(id);
			if (!deleted) return response.status(404).json({ message: "No encontrada" });
			return response.status(200).json({ message: "Eliminada" });
		} catch (error: any) {
			console.error("deleteCategoria error:", error);
			return response.status(500).json({ message: "Error en el servidor" });
		}
	}
}

