import { Request, Response } from "express";
import { TransaccionApplication } from "../../application/TransaccionApplication";
import { Transaccion } from "../../domain/Transaccion";
import { AuditoriaApplication } from "../../application/AuditoriaApplication";

export class TransaccionController {
	private app: TransaccionApplication;
	private auditoriaApp?: AuditoriaApplication;

	constructor(app: TransaccionApplication, auditoriaApp?: AuditoriaApplication) {
		this.app = app;
		this.auditoriaApp = auditoriaApp;
	}

	async createTransaccion(request: Request, response: Response): Promise<Response> {
		try {
			const b = request.body;
			const t: Omit<Transaccion, "id"> = {
				publicacionId: Number(b.publicacionId),
				donanteVendedorId: Number(b.donanteVendedorId),
				beneficiarioCompradorId: Number(b.beneficiarioCompradorId),
				estado: 1,
				fechaTransaccion: b.fechaTransaccion ? new Date(b.fechaTransaccion) : new Date(),
			};
			const id = await this.app.createTransaccion(t);
			// Audit
			try {
				if (this.auditoriaApp) {
					const actorId = (request as any).user?.id ?? undefined;
					await this.auditoriaApp.createAuditoria({
						usuarioId: actorId,
						tablaAfectada: "transacciones",
						registroId: id,
						accion: "CREATE",
						descripcion: `Transacción creada con id ${id}`,
						estado: 1,
						fecha: new Date(),
					});
				}
			} catch (err) {
				console.error("Error creando auditoria (createTransaccion):", err);
			}
			return response.status(201).json({ message: "Transacción creada", id });
		} catch (error: any) {
			console.error("createTransaccion error:", error);
			return response.status(500).json({ message: "Error en el servidor" });
		}
	}

	async getAllTransacciones(request: Request, response: Response): Promise<Response> {
		try {
			const list = await this.app.getAllTransacciones();
			return response.status(200).json(list);
		} catch (error: any) {
			console.error("getAllTransacciones error:", error);
			return response.status(500).json({ message: "Error en el servidor" });
		}
	}

	async getTransaccionById(request: Request, response: Response): Promise<Response> {
		try {
			const id = parseInt(request.params.id);
			if (isNaN(id)) return response.status(400).json({ message: "Id inválido" });
			const item = await this.app.getTransaccionById(id);
			if (!item) return response.status(404).json({ message: "No encontrada" });
			return response.status(200).json(item);
		} catch (error: any) {
			console.error("getTransaccionById error:", error);
			return response.status(500).json({ message: "Error en el servidor" });
		}
	}

	async updateTransaccion(request: Request, response: Response): Promise<Response> {
		try {
			const id = parseInt(request.params.id);
			if (isNaN(id)) return response.status(400).json({ message: "Id inválido" });
			const updated = await this.app.updateTransaccion(id, request.body);
			if (!updated) return response.status(404).json({ message: "No encontrada" });
			// Audit
			try {
				if (this.auditoriaApp) {
					const actorId = (request as any).user?.id ?? undefined;
					await this.auditoriaApp.createAuditoria({
						usuarioId: actorId,
						tablaAfectada: "transacciones",
						registroId: id,
						accion: "UPDATE",
						descripcion: `Transacción actualizada con id ${id}`,
						estado: 1,
						fecha: new Date(),
					});
				}
			} catch (err) {
				console.error("Error creando auditoria (updateTransaccion):", err);
			}
			return response.status(200).json({ message: "Actualizada" });
		} catch (error: any) {
			console.error("updateTransaccion error:", error);
			return response.status(500).json({ message: "Error en el servidor" });
		}
	}

	async deleteTransaccion(request: Request, response: Response): Promise<Response> {
		try {
			const id = parseInt(request.params.id);
			if (isNaN(id)) return response.status(400).json({ message: "Id inválido" });
			const deleted = await this.app.deleteTransaccion(id);
			if (!deleted) return response.status(404).json({ message: "No encontrada" });
			// Audit
			try {
				if (this.auditoriaApp) {
					const actorId = (request as any).user?.id ?? undefined;
					await this.auditoriaApp.createAuditoria({
						usuarioId: actorId,
						tablaAfectada: "transacciones",
						registroId: id,
						accion: "DELETE",
						descripcion: `Transacción eliminada con id ${id}`,
						estado: 1,
						fecha: new Date(),
					});
				}
			} catch (err) {
				console.error("Error creando auditoria (deleteTransaccion):", err);
			}
			return response.status(200).json({ message: "Eliminada" });
		} catch (error: any) {
			console.error("deleteTransaccion error:", error);
			return response.status(500).json({ message: "Error en el servidor" });
		}
	}
}

