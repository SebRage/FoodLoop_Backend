import { Router } from "express";
import { ReporteAdapter } from "../adapter/ReporteAdapter";
import { ReporteApplication } from "../../application/ReporteApplication";
import { ReporteController } from "../controller/ReporteController";
import { authenticateToken } from "../web/authMiddleware";
import { AuditoriaAdapter } from "../adapter/AuditoriaAdapter";
import { AuditoriaApplication } from "../../application/AuditoriaApplication";

const router = Router();

// ... crear instancias usando el adaptador y la aplicación
const reporteAdapter = new ReporteAdapter();
const reporteApp = new ReporteApplication(reporteAdapter);
const auditoriaAdapter = new AuditoriaAdapter();
const auditoriaApp = new AuditoriaApplication(auditoriaAdapter);
const reporteController = new ReporteController(reporteApp, auditoriaApp);

router.post("/reportes", async (request, response) => {
  try {
    await reporteController.createReporte(request, response);
  } catch (error) {
    response.status(400).json({ message: "Error al crear reporte" });
  }
});

router.get("/reportes",authenticateToken, async (request, response) => {
  try {
    await reporteController.getAllReportes(request, response);
  } catch (error) {
    response.status(400).json({ message: "Error al obtener reportes" });
  }
});

router.get("/reportes/:id",authenticateToken, async (request, response) => {
  try {
    await reporteController.getReporteById(request, response);
  } catch (error) {
    response.status(400).json({ message: "Error al obtener reporte" });
  }
});

router.get("/reportes/query/id", authenticateToken, async (request, response) => {
  try {
    await reporteController.getReporteByIdQuery(request, response);
  } catch (error) {
    response.status(400).json({ message: "Error al obtener reporte por query param 'id'" });
  }
});

router.put("/reportes/:id",authenticateToken, async (request, response) => {
  try {
    await reporteController.updateReporte(request, response);
  } catch (error) {
    response.status(400).json({ message: "Error al actualizar reporte" });
  }
});

router.put("/reportes/delete/:id",authenticateToken, async (request, response) => {
  try {
    await reporteController.deleteReporte(request, response);
  } catch (error) {
    response.status(400).json({ message: "Error al eliminar reporte" });
  }
});

router.put("/reportes/query/delete",authenticateToken, async (request, response) => {
  try {
    await reporteController.deleteReporteQuery(request, response);
  } catch (error) {
    response.status(400).json({ message: "Error al eliminar reporte por query params" });
  }
});

export default router;
