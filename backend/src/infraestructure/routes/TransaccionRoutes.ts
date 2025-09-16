import { Router } from "express";
import { TransaccionAdapter } from "../adapter/TransaccionAdapter";
import { TransaccionApplication } from "../../application/TransaccionApplication";
import { TransaccionController } from "../controller/TransaccionController";
import { authenticateToken } from "../web/authMiddleware";

const router = Router();

const transaccionAdapter = new TransaccionAdapter();
const transaccionApp = new TransaccionApplication(transaccionAdapter);
const transaccionController = new TransaccionController(transaccionApp);

router.post("/transacciones", authenticateToken, async (req, res) => {
  await transaccionController.createTransaccion(req, res);
});

router.get("/transacciones", authenticateToken, async (req, res) => {
  await transaccionController.getAllTransacciones(req, res);
});

router.get("/transacciones/:id", authenticateToken, async (req, res) => {
  await transaccionController.getTransaccionById(req, res);
});

router.put("/transacciones/:id", authenticateToken, async (req, res) => {
  await transaccionController.updateTransaccion(req, res);
});

router.put("/transacciones/delete/:id", authenticateToken, async (req, res) => {
  await transaccionController.deleteTransaccion(req, res);
});

export default router;
