import { Request, Response } from "express";
import { TransaccionApplication } from "../../application/TransaccionApplication";
import { Transaccion } from "../../domain/Transaccion";
import { AuditoriaApplication } from "../../application/AuditoriaApplication";
import { PublicacionApplication } from "../../application/PublicacionApplication";

export class TransaccionController {
	private app: TransaccionApplication;
	private auditoriaApp?: AuditoriaApplication;
	private publicacionApp?: PublicacionApplication;

	constructor(app: TransaccionApplication, auditoriaApp?: AuditoriaApplication, publicacionApp?: PublicacionApplication) {
		this.app = app;
		this.auditoriaApp = auditoriaApp;
		this.publicacionApp = publicacionApp;
	}

		// --- Helpers to reduce branching and keep logic readable ---
		private toRequiredNumber(raw: any, fieldName: string): { value?: number; error?: string } {
			if (raw === undefined || raw === null || raw === '') return { error: `${fieldName} inválido` };
			const n = Number(raw);
			return isNaN(n) ? { error: `${fieldName} inválido` } : { value: n };
		}

		private parseFechaFlexible(raw: any, fieldName: string): { value?: Date; error?: string } {
			if (raw === undefined) return {};
			try {
				if (typeof raw === 'string') {
					const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
					if (m) {
						const y = parseInt(m[1], 10), mo = parseInt(m[2], 10) - 1, d = parseInt(m[3], 10);
						return { value: new Date(y, mo, d, 12, 0, 0) };
					}
					const dt = new Date(raw);
					if (isNaN(dt.getTime())) return { error: `${fieldName} inválida` };
					return { value: dt };
				}
				const dt = new Date(raw);
				if (isNaN(dt.getTime())) return { error: `${fieldName} inválida` };
				return { value: dt };
			} catch {
				return { error: `${fieldName} inválida` };
			}
		}

		private async auditSafe(request: Request, tabla: string, registroId: number | undefined, accion: "CREATE" | "UPDATE" | "DELETE", descripcion: string) {
			try {
				if (!this.auditoriaApp) return;
				const actorId = (request as any).user?.id ?? undefined;
				await this.auditoriaApp.createAuditoria({
					usuarioId: actorId,
					tablaAfectada: tabla,
					registroId,
					accion,
					descripcion,
					estado: 1,
					fecha: new Date(),
				});
			} catch (err) {
				console.error(`Error creando auditoria (${accion} ${tabla}):`, err);
			}
		}

		private async validatePublicacionDisponible(pubId: number): Promise<{ ok: true } | { ok: false; status: number; message: string }> {
			if (!this.publicacionApp) return { ok: true };
			try {
				const pub = await this.publicacionApp.getPublicacionById(pubId);
				if (!pub) return { ok: false, status: 404, message: "Publicación no encontrada" };
				if (Number(pub.estado) !== 1) return { ok: false, status: 409, message: "Publicación no disponible" };
				return { ok: true };
			} catch (err) {
				console.error("Error validando publicación:", err);
				return { ok: false, status: 500, message: "Error al validar publicación" };
			}
		}

	async createTransaccion(request: Request, response: Response): Promise<Response> {
		try {
			const b = request.body || {};
			const pubIdRes = this.toRequiredNumber(b.publicacionId, 'publicacionId');
			if (pubIdRes.error) return response.status(400).json({ message: pubIdRes.error });
			const pubId = pubIdRes.value!;

			const pubCheck = await this.validatePublicacionDisponible(pubId);
			if (!pubCheck.ok) return response.status(pubCheck.status).json({ message: pubCheck.message });

			let fechaTransaccion: Date = new Date();
			const fechaRes = this.parseFechaFlexible(b.fechaTransaccion, 'fechaTransaccion');
			if (fechaRes.error) return response.status(400).json({ message: fechaRes.error });
			if (fechaRes.value) fechaTransaccion = fechaRes.value;

			const t: Omit<Transaccion, "id"> = {
				publicacionId: pubId,
				donanteVendedorId: Number(b.donanteVendedorId),
				beneficiarioCompradorId: Number(b.beneficiarioCompradorId),
				estado: 1,
				fechaTransaccion,
			};
			const id = await this.app.createTransaccion(t);

			// Pausar publicación (estado = 0) para que no sea visible a otros
			try {
				if (this.publicacionApp) {
					await this.publicacionApp.updatePublicacion(pubId, { estado: 0, fechaActualizacion: new Date() as any });
					await this.auditSafe(request, 'publicaciones', pubId, 'UPDATE', `Publicación ${pubId} pausada por creación de transacción ${id}`);
				}
			} catch (err) {
				console.error("Error pausando publicación en createTransaccion:", err);
			}

			await this.auditSafe(request, 'transacciones', id, 'CREATE', `Transacción creada con id ${id}`);
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
			const body = request.body || {};
			
			if (body.fechaTransaccion !== undefined && typeof body.fechaTransaccion === 'string') {
				const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(body.fechaTransaccion);
				if (m) {
					const y = parseInt(m[1], 10), mo = parseInt(m[2], 10) - 1, d = parseInt(m[3], 10);
					body.fechaTransaccion = new Date(y, mo, d, 12, 0, 0);
				}
			}
			const updated = await this.app.updateTransaccion(id, body);
			if (!updated) return response.status(404).json({ message: "No encontrada" });
			
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

