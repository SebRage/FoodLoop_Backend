import { Request, Response } from "express";
import { AuditoriaApplication } from "../../application/AuditoriaApplication";
import { Auditoria } from "../../domain/Auditoria";

export class AuditoriaController {
	private app: AuditoriaApplication;

	constructor(app: AuditoriaApplication) {
		this.app = app;
	}

	async createAuditoria(request: Request, response: Response): Promise<Response> {
		try {
			const { usuarioId, tablaAfectada, registroId, accion, descripcion } = request.body;
			if (!accion || !descripcion) return response.status(400).json({ message: "Campos requeridos: accion, descripcion" });
			const audit: Omit<Auditoria, "id"> = {
				usuarioId: usuarioId ?? undefined,
				tablaAfectada: tablaAfectada ?? undefined,
				registroId: registroId ?? undefined,
				accion,
				descripcion,
				estado: 1,
				fecha: new Date(),
			};
			const id = await this.app.createAuditoria(audit);
			return response.status(201).json({ message: "Auditoría creada", id });
		} catch (error: any) {
			console.error("createAuditoria error:", error);
			return response.status(500).json({ message: "Error en el servidor" });
		}
	}

	async getAllAuditorias(request: Request, response: Response): Promise<Response> {
		try {
			const list = await this.app.getAllAuditorias();
			return response.status(200).json(list);
		} catch (error: any) {
			console.error("getAllAuditorias error:", error);
			return response.status(500).json({ message: "Error en el servidor" });
		}
	}

	async getAuditoriaById(request: Request, response: Response): Promise<Response> {
		try {
			const id = parseInt(request.params.id);
			if (isNaN(id)) return response.status(400).json({ message: "Id inválido" });
			const item = await this.app.getAuditoriaById(id);
			if (!item) return response.status(404).json({ message: "No encontrada" });
			return response.status(200).json(item);
		} catch (error: any) {
			console.error("getAuditoriaById error:", error);
			return response.status(500).json({ message: "Error en el servidor" });
		}
	}

	async updateAuditoria(request: Request, response: Response): Promise<Response> {
		try {
			const id = parseInt(request.params.id);
			if (isNaN(id)) return response.status(400).json({ message: "Id inválido" });
			const updated = await this.app.updateAuditoria(id, request.body);
			if (!updated) return response.status(404).json({ message: "No encontrada" });
			return response.status(200).json({ message: "Actualizado" });
		} catch (error: any) {
			console.error("updateAuditoria error:", error);
			return response.status(500).json({ message: "Error en el servidor" });
		}
	}

	async deleteAuditoria(request: Request, response: Response): Promise<Response> {
		try {
			const id = parseInt(request.params.id);
			if (isNaN(id)) return response.status(400).json({ message: "Id inválido" });
			const deleted = await this.app.deleteAuditoria(id);
			if (!deleted) return response.status(404).json({ message: "No encontrada" });
			return response.status(200).json({ message: "Eliminada" });
		} catch (error: any) {
			console.error("deleteAuditoria error:", error);
			return response.status(500).json({ message: "Error en el servidor" });
		}
	}
}

