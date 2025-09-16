import { Router } from "express";
import { AuditoriaAdapter } from "../adapter/AuditoriaAdapter";
import { AuditoriaApplication } from "../../application/AuditoriaApplication";
import { AuditoriaController } from "../controller/AuditoriaController";
import { authenticateToken } from "../web/authMiddleware";

const router = Router();

const auditoriaAdapter = new AuditoriaAdapter();
const auditoriaApp = new AuditoriaApplication(auditoriaAdapter);
const auditoriaController = new AuditoriaController(auditoriaApp);

router.post("/auditorias", authenticateToken, async (req, res) => {
  await auditoriaController.createAuditoria(req, res);
});

router.get("/auditorias", authenticateToken, async (req, res) => {
  await auditoriaController.getAllAuditorias(req, res);
});

router.get("/auditorias/:id", authenticateToken, async (req, res) => {
  await auditoriaController.getAuditoriaById(req, res);
});

router.put("/auditorias/:id", authenticateToken, async (req, res) => {
  await auditoriaController.updateAuditoria(req, res);
});

router.put("/auditorias/delete/:id", authenticateToken, async (req, res) => {
  await auditoriaController.deleteAuditoria(req, res);
});

export default router;
