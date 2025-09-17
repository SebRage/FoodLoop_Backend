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

router.post("/categorias", authenticateToken, async (request, response) => {
  try {
    await categoriaController.createCategoria(request, response);
  } catch (error) {
    response.status(400).json({ message: "Error al crear categoría" });
  }
});

router.get("/categorias",authenticateToken, async (request, response) => {
  try {
    await categoriaController.getAllCategorias(request, response);
  } catch (error) {
    response.status(400).json({ message: "Error al obtener categorías" });
  }
});

router.get("/categorias/:id",authenticateToken, async (request, response) => {
  try {
    await categoriaController.getCategoriaById(request, response);
  } catch (error) {
    response.status(400).json({ message: "Error al obtener categoría" });
  }
});

router.put("/categorias/:id", authenticateToken, async (request, response) => {
  try {
    await categoriaController.updateCategoria(request, response);
  } catch (error) {
    response.status(400).json({ message: "Error al actualizar categoría" });
  }
});

router.put("/categorias/delete/:id", authenticateToken, async (request, response) => {
  try {
    await categoriaController.deleteCategoria(request, response);
  } catch (error) {
    response.status(400).json({ message: "Error al eliminar categoría" });
  }
});

export default router;
