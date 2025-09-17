import { Router } from "express";
import { AuditoriaAdapter } from "../adapter/AuditoriaAdapter";
import { AuditoriaApplication } from "../../application/AuditoriaApplication";
import { AuditoriaController } from "../controller/AuditoriaController";
import { authenticateToken } from "../web/authMiddleware";

const router = Router();

const auditoriaAdapter = new AuditoriaAdapter();
const auditoriaApp = new AuditoriaApplication(auditoriaAdapter);
const auditoriaController = new AuditoriaController(auditoriaApp);

router.post("/auditorias", authenticateToken, async (request, response) => {
  try {
    await auditoriaController.createAuditoria(request, response);
  } catch (error) {
    response.status(400).json({ message: "Error al crear auditoria" });
  }
});

router.get("/auditorias", authenticateToken, async (request, response) => {
  try {
    await auditoriaController.getAllAuditorias(request, response);
  } catch (error) {
    response.status(400).json({ message: "Error al obtener auditorias" });
  }
});

router.get("/auditorias/:id", authenticateToken, async (request, response) => {
  try {
    await auditoriaController.getAuditoriaById(request, response);
  } catch (error) {
    response.status(400).json({ message: "Error al obtener auditoria" });
  }
});

router.put("/auditorias/:id", authenticateToken, async (request, response) => {
  try {
    await auditoriaController.updateAuditoria(request, response);
  } catch (error) {
    response.status(400).json({ message: "Error al actualizar auditoria" });
  }
});

router.put("/auditorias/delete/:id", authenticateToken, async (request, response) => {
  try {
    await auditoriaController.deleteAuditoria(request, response);
  } catch (error) {
    response.status(400).json({ message: "Error al eliminar auditoria" });
  }
});

export default router;
