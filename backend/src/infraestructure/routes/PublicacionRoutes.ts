import { Router } from "express";
import { PublicacionAdapter } from "../adapter/PublicacionAdapter";
import { PublicacionApplication } from "../../application/PublicacionApplication";
import { PublicacionController } from "../controller/PublicacionController";
import { authenticateToken } from "../web/authMiddleware";
import { AuditoriaAdapter } from "../adapter/AuditoriaAdapter";
import { AuditoriaApplication } from "../../application/AuditoriaApplication";

const router = Router();

const publicacionAdapter = new PublicacionAdapter();
const publicacionApp = new PublicacionApplication(publicacionAdapter);
const auditoriaAdapter = new AuditoriaAdapter();
const auditoriaApp = new AuditoriaApplication(auditoriaAdapter);
const publicacionController = new PublicacionController(publicacionApp, auditoriaApp);

router.post("/publicaciones", authenticateToken, async (req, res) => {
  await publicacionController.createPublicacion(req, res);
});

router.get("/publicaciones", async (req, res) => {
  await publicacionController.getAllPublicaciones(req, res);
});

router.get("/publicaciones/:id", async (req, res) => {
  await publicacionController.getPublicacionById(req, res);
});

router.put("/publicaciones/:id", authenticateToken, async (req, res) => {
  await publicacionController.updatePublicacion(req, res);
});

router.put("/publicaciones/delete/:id", authenticateToken, async (req, res) => {
  await publicacionController.deletePublicacion(req, res);
});

export default router;
