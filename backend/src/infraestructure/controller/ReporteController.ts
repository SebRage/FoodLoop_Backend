import { Request, Response } from "express";
import { ReporteApplication } from "../../application/ReporteApplication";
import { Reporte } from "../../domain/Reporte";
import { AuditoriaApplication } from "../../application/AuditoriaApplication";

export class ReporteController {
  private app: ReporteApplication;
  private auditoriaApp?: AuditoriaApplication;

  constructor(app: ReporteApplication, auditoriaApp?: AuditoriaApplication) {
    this.app = app;
    this.auditoriaApp = auditoriaApp;
  }

  // --- Helpers to keep methods simpler and reduce branching ---
  private toOptionalNumber(raw: any, fieldName: string): { value?: number; error?: string } {
    if (raw === undefined) return {};
    const n = Number(raw);
    if (isNaN(n)) return { error: `${fieldName} inválido` };
    return { value: n };
  }

  private parseEstado(raw: any): { value?: number; error?: string } {
    if (raw === undefined) return {};
    const n = Number(raw);
    if (isNaN(n)) return { error: "Estado inválido" };
    return { value: n };
  }

  private parseFechaFlexible(raw: any): { value?: Date; error?: string } {
    if (raw === undefined) return {};
    try {
      if (typeof raw === 'string') {
        const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
        if (m) {
          const y = parseInt(m[1], 10), mo = parseInt(m[2], 10) - 1, d = parseInt(m[3], 10);
          return { value: new Date(y, mo, d, 12, 0, 0) };
        }
        const dt = new Date(raw);
        if (isNaN(dt.getTime())) return { error: "fechaReporte inválida" };
        return { value: dt };
      }
      const dt = new Date(raw);
      if (isNaN(dt.getTime())) return { error: "fechaReporte inválida" };
      return { value: dt };
    } catch {
      return { error: "fechaReporte inválida" };
    }
  }

  private async auditSafe(request: Request, registroId: number, accion: "CREATE" | "UPDATE" | "DELETE", descripcion: string) {
    try {
      if (!this.auditoriaApp) return;
      const actorId = (request as any).user?.id ?? undefined;
      await this.auditoriaApp.createAuditoria({
        usuarioId: actorId,
        tablaAfectada: "reportes",
        registroId,
        accion,
        descripcion,
        estado: 1,
        fecha: new Date(),
      });
    } catch (err) {
      console.error(`Error creando auditoria (${accion} reporte):`, err);
    }
  }

  async createReporte(request: Request, response: Response): Promise<Response> {
    try {
      const descripcion = request.body.descripcion ?? request.body.descripcionReporte;
      const reportanteId = request.body.reportanteId ?? request.body.idReportante ?? request.body.usuarioId;
      const publicacionId = request.body.publicacionId ?? request.body.idPublicacion;

      if (!descripcion || !reportanteId || !publicacionId) {
        return response.status(400).json({ message: "Todos los campos requeridos: descripcion, reportanteId, publicacionId" });
      }

      const reporte: Omit<Reporte, "id"> = {
        descripcion: descripcion.trim(),
        reportanteId: Number(reportanteId),
        publicacionId: Number(publicacionId),
        fechaReporte: new Date(),
        estado: 1,
      };

      const reporteId = await this.app.createReporte(reporte);
      
      try {
        if (this.auditoriaApp) {
          const actorId = (request as any).user?.id ?? undefined;
          await this.auditoriaApp.createAuditoria({
            usuarioId: actorId,
            tablaAfectada: "reportes",
            registroId: reporteId,
            accion: "CREATE",
            descripcion: `Reporte creado con id ${reporteId}`,
            estado: 1,
            fecha: new Date(),
          });
        }
      } catch (err) {
        console.error("Error creando auditoria (createReporte):", err);
      }
      return response.status(201).json({ message: "Reporte creado correctamente", reporteId });
    } catch (error: any) {
      console.error("createReporte error:", error);
      return response.status(500).json({ message: "Error en el servidor", detail: error.message ?? error });
    }
  }

  async getAllReportes(request: Request, response: Response): Promise<Response> {
    try {
      const reportes = await this.app.getAllReportes();
      return response.status(200).json(reportes);
    } catch (error: any) {
      console.error("getAllReportes error:", error);
      return response.status(500).json({ message: "Error en el servidor" });
    }
  }

  async getReporteById(request: Request, response: Response): Promise<Response> {
    try {
      const id = parseInt(request.params.id);
      if (isNaN(id)) {
        return response.status(400).json({ message: "Error en parámetro" });
      }
      const reporte = await this.app.getReporteById(id);
      if (!reporte) return response.status(404).json({ message: "Reporte no encontrado" });
      return response.status(200).json(reporte);
    } catch (error: any) {
      console.error("getReporteById error:", error);
      return response.status(500).json({ message: "Error en el servidor" });
    }
  }

  async getReporteByIdQuery(request: Request, response: Response): Promise<Response> {
    try {
      const idParam = request.query.id as string;
      const id = parseInt(idParam);
      if (!idParam || isNaN(id)) {
        return response.status(400).json({ message: "Error en parámetro" });
      }
      const reporte = await this.app.getReporteById(id);
      if (!reporte) return response.status(404).json({ message: "Reporte no encontrado" });
      return response.status(200).json(reporte);
    } catch (error: any) {
      console.error("getReporteByIdQuery error:", error);
      return response.status(500).json({ message: "Error en el servidor" });
    }
  }

  async deleteReporte(request: Request, response: Response): Promise<Response> {
    try {
      const id = parseInt(request.params.id);
      if (isNaN(id)) {
        return response.status(400).json({ message: "Error en parámetro" });
      }
  const deleted = await this.app.deleteReporte(id);
      if (!deleted) return response.status(404).json({ message: "Reporte no encontrado" });
      
      try {
        if (this.auditoriaApp) {
          const actorId = (request as any).user?.id ?? undefined;
          await this.auditoriaApp.createAuditoria({
            usuarioId: actorId,
            tablaAfectada: "reportes",
            registroId: id,
            accion: "DELETE",
            descripcion: `Reporte eliminado con id ${id}`,
            estado: 1,
            fecha: new Date(),
          });
        }
      } catch (err) {
        console.error("Error creando auditoria (deleteReporte):", err);
      }
      return response.status(200).json({ message: "Reporte eliminado exitosamente" });
    } catch (error: any) {
      console.error("deleteReporte error:", error);
      return response.status(500).json({ message: "Error en el servidor" });
    }
  }

  async deleteReporteQuery(request: Request, response: Response): Promise<Response> {
    try {
      const idParam = request.query.id as string;
      const id = parseInt(idParam);
      if (!idParam || isNaN(id)) {
        return response.status(400).json({ message: "Error en parámetro" });
      }
  const deleted = await this.app.deleteReporte(id);
      if (!deleted) return response.status(404).json({ message: "Reporte no encontrado" });
      return response.status(200).json({ message: "Reporte eliminado exitosamente" });
    } catch (error: any) {
      console.error("deleteReporteQuery error:", error);
      return response.status(500).json({ message: "Error en el servidor" });
    }
  }

  async updateReporte(request: Request, response: Response): Promise<Response> {
    try {
      const id = parseInt(request.params.id);
      if (isNaN(id)) {
        return response.status(400).json({ message: "Error en parámetro" });
      }

      const body = request.body || {};
      const descripcion = body.descripcion;
      const estadoRaw = body.estado;
      const reportanteIdRaw = body.reportanteId ?? body.reportante_id ?? body.idReportante ?? body.usuarioId;
      const publicacionIdRaw = body.publicacionId ?? body.publicacion_id ?? body.idPublicacion;
      const fechaReporteRaw = body.fechaReporte ?? body.fecha_reporte ?? body.fecha;

      // Validaciones y conversiones compactas
      if (descripcion !== undefined && typeof descripcion !== "string") {
        return response.status(400).json({ message: "Descripción inválida" });
      }

      const { value: estado, error: estadoError } = this.parseEstado(estadoRaw);
      if (estadoError) return response.status(400).json({ message: estadoError });

      const { value: reportanteId, error: reportanteError } = this.toOptionalNumber(reportanteIdRaw, "reportanteId");
      if (reportanteError) return response.status(400).json({ message: reportanteError });

      const { value: publicacionId, error: publicacionError } = this.toOptionalNumber(publicacionIdRaw, "publicacionId");
      if (publicacionError) return response.status(400).json({ message: publicacionError });

      const { value: fechaReporte, error: fechaError } = this.parseFechaFlexible(fechaReporteRaw);
      if (fechaError) return response.status(400).json({ message: fechaError });

      // Construye payload incluyendo únicamente los campos presentes
      const payload: Partial<Reporte> = {};
      if (descripcion !== undefined) payload.descripcion = descripcion;
      if (estado !== undefined) payload.estado = estado as number;
      if (reportanteId !== undefined) payload.reportanteId = reportanteId;
      if (publicacionId !== undefined) payload.publicacionId = publicacionId;
      if (fechaReporte !== undefined) payload.fechaReporte = fechaReporte;

      const updated = await this.app.updateReporte(id, payload);
      if (!updated) {
        return response.status(404).json({ message: "Reporte no encontrado o error al actualizar" });
      }

      await this.auditSafe(request, id, "UPDATE", `Reporte actualizado con id ${id}`);
      return response.status(200).json({ message: "Reporte actualizado con éxito" });
    } catch (error: any) {
      console.error("updateReporte error:", error);
      return response.status(500).json({ message: "Error en el servidor" });
    }
  }
}
