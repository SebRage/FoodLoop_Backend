import { Request, NextFunction, Response } from "express";
import { AuthApplication } from "../../application/AuthApplication";
import { UserAdapter } from "../adapter/UserAdapter";
import { UserApplicationService } from "../../application/UserApplicationService";

// Reuse application service to validate admin credentials if no token is provided
const userAdapter = new UserAdapter();
const userApp = new UserApplicationService(userAdapter);

export function authenticateToken(
  request: Request,
  response: Response,
  next: NextFunction
): void {
  const authHeader = request.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if(!token){
    // Fallback: allow admin access without token if valid admin credentials are provided
  const email = (request.body && (request.body.email ?? request.body.correo)) || (request.query && (request.query.email as string));
  const password = (request.body && request.body.password) || (request.query && (request.query.password as string));

    if (!email || !password) {
      response.status(401).json({message: "Token requerido o credenciales de administrador"});
      return;
    }

    (async () => {
      try {
        const { user } = await userApp.loginWithUserData(email, password);
        if (user && user.estado === 2) {
          (request as any).user = { id: user.id, email: user.correo, role: "admin" };
          next();
        } else {
          response.status(401).json({ message: "Acceso solo para administradores" });
        }
      } catch (e) {
        response.status(401).json({ message: "Credenciales inválidas" });
      }
    })();
    return;
  }

  try {
    const payload = AuthApplication.verifyToken(token);
    (request as any).user = payload;
    next();
  } catch (error) {
    response.status(403).json({message: "Token invalido o expirado"}); 
  }
}



