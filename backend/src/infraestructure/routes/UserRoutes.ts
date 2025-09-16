import { Router } from "express";
import { UserAdapter } from "../adapter/UserAdapter";
import { UserApplicationService } from "../../application/UserApplicationService";
import { UserController } from "../controller/UserController";
import { AuditoriaAdapter } from "../adapter/AuditoriaAdapter";
import { AuditoriaApplication } from "../../application/AuditoriaApplication";
import { authenticateToken } from '../web/authMiddleware';

const router = Router();


const userAdapter = new UserAdapter();
const userApp = new UserApplicationService(userAdapter);

// auditoria instances
const auditoriaAdapter = new AuditoriaAdapter();
const auditoriaApp = new AuditoriaApplication(auditoriaAdapter);

const userController = new UserController(userApp, auditoriaApp);

router.post("/login", async (request, response) => {
    await userController.login(request, response);
});

router.post("/users", authenticateToken, async (request, response) => {
    try {
        await userController.registerUser(request, response);
    } catch (error) {
        response.status(400).json({ message: "Error al obtener datos" });
    }
});

router.get("/users", authenticateToken, async (request, response) => {
    try {
        await userController.getAllUsers(request, response);
    } catch (error) {
        response.status(400).json({ message: "Error al obtener datos" });
    }
});

router.get("/users/:id", async (request, response) => {
    try {
        await userController.getUserById(request, response);
    } catch (error) {
        response.status(400).json({ message: "Error al obtener datos" });
    }
});

router.get("/users/email/:email", async (request, response) => {
    try {
        await userController.getUserByEmail(request, response);
    } catch (error) {
        response.status(400).json({ message: "Error al obtener datos" });
    }
});

router.put("/users/:id", async (request, response) => {
    try {
        await userController.updateUser(request, response);
    } catch (error) {
        response.status(400).json({ message: "Error al actualizar datos" });
    }
});

router.put("/users/delete/:id", async (request, response) => {
    try {
        await userController.deleteUser(request, response);
    } catch (error) {
        response.status(400).json({ message: "Error al dar de baja el usuario" });
    }
});

router.get("/users/query/id", async (request, response) => {
    try {
        await userController.getUserByIdQuery(request, response);
    } catch (error) {
        response.status(400).json({
            message: "Error al obtener usuario por query param 'id'",
        });
    }
});

router.get("/users/query/email", async (request, response) => {
    try {
        await userController.getUserByEmailQuery(request, response);
    } catch (error) {
        response.status(400).json({
            message: "Error al obtener usuario por query param 'email'",
        });
    }
});

router.put("/users/query/delete", async (request, response) => {
    try {
        return await userController.deleteUserQuery(request, response);
    } catch (error) {
        return response.status(400).json({
            message: "Error al dar de baja el usuario mediante query params",
        });
    }
});

export default router;