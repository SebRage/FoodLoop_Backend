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
      // Audit
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
      // Audit
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

      let { descripcion, estado } = request.body;

      if (descripcion !== undefined && typeof descripcion !== "string") {
        return response.status(400).json({ message: "Descripción inválida" });
      }
      if (estado !== undefined && typeof estado !== "number") {
        const maybeNum = Number(estado);
        if (isNaN(maybeNum)) return response.status(400).json({ message: "Estado inválido" });
        estado = maybeNum;
      }

      const payload: Partial<Reporte> = {};
      if (descripcion !== undefined) payload.descripcion = descripcion;
      if (estado !== undefined) payload.estado = estado as number;

      const updated = await this.app.updateReporte(id, payload);
      if (!updated) {
        return response.status(404).json({ message: "Reporte no encontrado o error al actualizar" });
      }
      // Audit
      try {
        if (this.auditoriaApp) {
          const actorId = (request as any).user?.id ?? undefined;
          await this.auditoriaApp.createAuditoria({
            usuarioId: actorId,
            tablaAfectada: "reportes",
            registroId: id,
            accion: "UPDATE",
            descripcion: `Reporte actualizado con id ${id}`,
            estado: 1,
            fecha: new Date(),
          });
        }
      } catch (err) {
        console.error("Error creando auditoria (updateReporte):", err);
      }
      return response.status(200).json({ message: "Reporte actualizado con éxito" });
    } catch (error: any) {
      console.error("updateReporte error:", error);
      return response.status(500).json({ message: "Error en el servidor" });
    }
  }
}
