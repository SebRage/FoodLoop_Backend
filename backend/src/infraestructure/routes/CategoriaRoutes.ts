import { Router } from "express";
import { CategoriaAdapter } from "../adapter/CategoriaAdapter";
import { CategoriaApplication } from "../../application/CategoriaApplication";
import { CategoriaController } from "../controller/CategoriaController";
import { AuditoriaAdapter } from "../adapter/AuditoriaAdapter";
import { AuditoriaApplication } from "../../application/AuditoriaApplication";
import { authenticateToken } from "../web/authMiddleware";

const router = Router();

const categoriaAdapter = new CategoriaAdapter();
const categoriaApp = new CategoriaApplication(categoriaAdapter);
const auditoriaAdapter = new AuditoriaAdapter();
const auditoriaApp = new AuditoriaApplication(auditoriaAdapter);

const categoriaController = new CategoriaController(categoriaApp, auditoriaApp);

router.post("/categorias", authenticateToken, async (req, res) => {
  await categoriaController.createCategoria(req, res);
});

router.get("/categorias", async (req, res) => {
  await categoriaController.getAllCategorias(req, res);
});

router.get("/categorias/:id", async (req, res) => {
  await categoriaController.getCategoriaById(req, res);
});

router.put("/categorias/:id", authenticateToken, async (req, res) => {
  await categoriaController.updateCategoria(req, res);
});

router.put("/categorias/delete/:id", authenticateToken, async (req, res) => {
  await categoriaController.deleteCategoria(req, res);
});

export default router;
