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

router.post("/publicaciones", authenticateToken, async (request, response) => {
  try {
    await publicacionController.createPublicacion(request, response);
  } catch (error) {
    response.status(400).json({ message: "Error al crear publicación" });
  }
});

router.get("/publicaciones", authenticateToken, async (request, response) => {
  try {
    await publicacionController.getAllPublicaciones(request, response);
  } catch (error) {
    response.status(400).json({ message: "Error al obtener publicaciones" });
  }
});

router.get("/publicaciones/:id", authenticateToken, async (request, response) => {
  try {
    await publicacionController.getPublicacionById(request, response);
  } catch (error) {
    response.status(400).json({ message: "Error al obtener publicación" });
  }
});

router.put("/publicaciones/:id", authenticateToken, async (request, response) => {
  try {
    await publicacionController.updatePublicacion(request, response);
  } catch (error) {
    response.status(400).json({ message: "Error al actualizar publicación" });
  }
});

router.put("/publicaciones/delete/:id", authenticateToken, async (request, response) => {
  try {
    await publicacionController.deletePublicacion(request, response);
  } catch (error) {
    response.status(400).json({ message: "Error al eliminar publicación" });
  }
});

export default router;
