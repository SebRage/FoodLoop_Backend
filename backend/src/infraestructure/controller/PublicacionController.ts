import { Request, Response } from "express";
import { PublicacionApplication } from "../../application/PublicacionApplication";
import { Publicacion } from "../../domain/Publicacion";
import { AuditoriaApplication } from "../../application/AuditoriaApplication";

export class PublicacionController {
	private app: PublicacionApplication;
	private auditoriaApp?: AuditoriaApplication;

	constructor(app: PublicacionApplication, auditoriaApp?: AuditoriaApplication) {
		this.app = app;
		this.auditoriaApp = auditoriaApp;
	}

	async createPublicacion(request: Request, response: Response): Promise<Response> {
		try {
			const body = request.body;
			// Parse fechaCaducidad como fecha local (YYYY-MM-DD) para evitar offset de zona horaria
			const toLocalDate = (isoYmd?: string): Date => {
				if (!isoYmd) return new Date();
				try {
					const [y, m, d] = String(isoYmd).split('-').map((v) => parseInt(v, 10));
					if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
						return new Date(y, m - 1, d);
					}
				} catch {}
				// Fallback
				return new Date(isoYmd);
			};

			const pub: Omit<Publicacion, "id"> = {
				usuarioId: Number(body.usuarioId),
				categoriaId: Number(body.categoriaId),
				titulo: body.titulo,
				descripcion: body.descripcion,
				tipo: body.tipo,
				cantidad: body.cantidad,
				precio: Number(body.precio ?? 0),
				fechaCaducidad: toLocalDate(body.fechaCaducidad),
				estado: 1,
				fechaCreacion: new Date(),
				fechaActualizacion: new Date(),
			};
			const id = await this.app.createPublicacion(pub);
			// Audit
			try {
				if (this.auditoriaApp) {
					const actorId = (request as any).user?.id ?? undefined;
					await this.auditoriaApp.createAuditoria({
						usuarioId: actorId,
						tablaAfectada: "publicaciones",
						registroId: id,
						accion: "CREATE",
						descripcion: `Publicación creada con id ${id}`,
						estado: 1,
						fecha: new Date(),
					});
				}
			} catch (err) {
				console.error("Error creando auditoria (createPublicacion):", err);
			}
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
			// Audit
			try {
				if (this.auditoriaApp) {
					const actorId = (request as any).user?.id ?? undefined;
					await this.auditoriaApp.createAuditoria({
						usuarioId: actorId,
						tablaAfectada: "publicaciones",
						registroId: id,
						accion: "UPDATE",
						descripcion: `Publicación actualizada con id ${id}`,
						estado: 1,
						fecha: new Date(),
					});
				}
			} catch (err) {
				console.error("Error creando auditoria (updatePublicacion):", err);
			}
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
			// Audit
			try {
				if (this.auditoriaApp) {
					const actorId = (request as any).user?.id ?? undefined;
					await this.auditoriaApp.createAuditoria({
						usuarioId: actorId,
						tablaAfectada: "publicaciones",
						registroId: id,
						accion: "DELETE",
						descripcion: `Publicación eliminada con id ${id}`,
						estado: 1,
						fecha: new Date(),
					});
				}
			} catch (err) {
				console.error("Error creando auditoria (deletePublicacion):", err);
			}
			return response.status(200).json({ message: "Eliminada" });
		} catch (error: any) {
			console.error("deletePublicacion error:", error);
			return response.status(500).json({ message: "Error en el servidor" });
		}
	}
}

