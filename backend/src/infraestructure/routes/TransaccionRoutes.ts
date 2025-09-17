import { Router } from "express";
import { TransaccionAdapter } from "../adapter/TransaccionAdapter";
import { TransaccionApplication } from "../../application/TransaccionApplication";
import { TransaccionController } from "../controller/TransaccionController";
import { authenticateToken } from "../web/authMiddleware";
import { AuditoriaAdapter } from "../adapter/AuditoriaAdapter";
import { AuditoriaApplication } from "../../application/AuditoriaApplication";

const router = Router();

const transaccionAdapter = new TransaccionAdapter();
const transaccionApp = new TransaccionApplication(transaccionAdapter);
const auditoriaAdapter = new AuditoriaAdapter();
const auditoriaApp = new AuditoriaApplication(auditoriaAdapter);
const transaccionController = new TransaccionController(transaccionApp, auditoriaApp);

router.post("/transacciones", authenticateToken, async (request, response) => {
  try {
    await transaccionController.createTransaccion(request, response);
  } catch (error) {
    response.status(400).json({ message: "Error al crear transacción" });
  }
});

router.get("/transacciones", authenticateToken, async (request, response) => {
  try {
    await transaccionController.getAllTransacciones(request, response);
  } catch (error) {
    response.status(400).json({ message: "Error al obtener transacciones" });
  }
});

router.get("/transacciones/:id", authenticateToken, async (request, response) => {
  try {
    await transaccionController.getTransaccionById(request, response);
  } catch (error) {
    response.status(400).json({ message: "Error al obtener transacción" });
  }
});

router.put("/transacciones/:id", authenticateToken, async (request, response) => {
  try {
    await transaccionController.updateTransaccion(request, response);
  } catch (error) {
    response.status(400).json({ message: "Error al actualizar transacción" });
  }
});

router.put("/transacciones/delete/:id", authenticateToken, async (request, response) => {
  try {
    await transaccionController.deleteTransaccion(request, response);
  } catch (error) {
    response.status(400).json({ message: "Error al eliminar transacción" });
  }
});

export default router;
