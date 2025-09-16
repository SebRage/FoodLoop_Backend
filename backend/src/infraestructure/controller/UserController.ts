import { Request, Response } from "express";
import { UserApplicationService } from "../../application/UserApplicationService";
import { User } from "../../domain/User";
import { NAME_REGEX, EMAIL_REGEX, PASSWORD_REGEX } from "../../utils/RegexUtils";
import { formatToBogotaShort } from "../../utils/DateUtils";

export class UserController {
  private app: UserApplicationService;

  constructor(app: UserApplicationService) {
    this.app = app;
  }

  async login(request: Request, response: Response): Promise<Response> {
    try {
      console.log("Login body:", request.body);

      // aceptar tanto "email" como "correo"
      const email = request.body.email ?? request.body.correo;
      const password = request.body.password;

      if (!email || !password) {
        return response
          .status(400)
          .json({ error: "Email y contraseña son requeridos" });
      }

      const token = await this.app.login(email, password);
      return response.status(200).json({ token });
    } catch (error: any) {
      console.error("login error:", error);
      return response.status(401).json({ message: "Invalid Credentials" });
    }
  }

  async registerUser(request: Request, response: Response): Promise<Response> {
    // aceptar tanto (name,email) como (nombreEntidad,correo)
    const rawName = request.body.name ?? request.body.nombreEntidad;
    const name = typeof rawName === "string" ? rawName.trim() : "";
    const email = request.body.email ?? request.body.correo;
    const password = request.body.password;

    try {
      if (!name) return response.status(400).json({ message: "Nombre es requerido" });
      if (!NAME_REGEX.test(name)) return response.status(400).json({ message: "Error en dato" });

      if (!email || !EMAIL_REGEX.test(email))
        return response.status(400).json({ error: "Correo electrónico no válido" });

      if (!password || !PASSWORD_REGEX.test(password))
        return response.status(400).json({
          error:
            "La contraseña debe tener al menos 6 caracteres y máximo 25, incluyendo al menos una letra y un número",
        });

      const status = 1;
  const user: Omit<User, "id"> = {
        tipoEntidad: request.body.tipoEntidad ?? "Individual",
        nombreEntidad: name,
        correo: email,
        telefono: request.body.telefono ?? "",
        ubicacion: request.body.ubicacion ?? "",
        direccion: request.body.direccion ?? "",
        password,
        estado: status,
      };

      const userId = await this.app.createUser(user);
      return response
        .status(201)
        .json({ message: "Usuario registrado correctamente", userId });
    } catch (error: any) {
      console.error("registerUser error:", error);
      return response.status(500).json({ message: "Error en el servidor", detail: error.message ?? error });
    }
  }

  async getAllUsers(request: Request, response: Response): Promise<Response> {
    try {
      const users = await this.app.getAllUsers();
  // El adapter ya devuelve `fechaRegistro` en el dominio
  return response.status(200).json(users);
    } catch (error) {
      return response.status(500).json({ message: "Error en el servidor" });
    }
  }

  async getUserById(request: Request, response: Response): Promise<Response> {
    try {
      const id = parseInt(request.params.id);
      if (isNaN(id)) {
        return response.status(400).json({ message: "Error en parámetro" });
      }
      const user = await this.app.getUserById(id);
      if (!user)
        return response.status(404).json({ message: "Usuario no encontrado" });
  return response.status(200).json(user);
    } catch (error) {
      return response.status(500).json({ message: "Error en el servidor" });
    }
  }

  async getUserByIdQuery(request: Request, response: Response): Promise<Response> {
    try {
      const idParam = request.query.id as string;
      const id = parseInt(idParam);
      if (!idParam || isNaN(id)) {
        return response.status(400).json({ message: "Query param 'id' inválido" });
      }
      const user = await this.app.getUserById(id);
      if (!user) {
        return response.status(404).json({ message: "Usuario no encontrado" });
      }
  return response.status(200).json(user);
    } catch (error) {
      return response.status(500).json({ message: "Error en el servidor" });
    }
  }

  async getUserByEmail(request: Request, response: Response): Promise<Response> {
    try {
      const email: string = request.params.email;
      if (!email) {
        return response.status(400).json({ message: "Error en el parámetro" });
      }
      const user = await this.app.getUserByEmail(email);
      if (!user) {
        return response.status(404).json({ message: "Usuario no encontrado" });
      }
  return response.status(200).json(user);
    } catch (error) {
      return response.status(500).json({ message: "Error en el servidor" });
    }
  }

  async getUserByEmailQuery(request: Request, response: Response): Promise<Response> {
    try {
      const email = request.query.email as string;
      if (!email) {
        return response.status(400).json({ message: "Query param 'email' es requerido" });
      }
      const user = await this.app.getUserByEmail(email);
      if (!user) {
        return response.status(404).json({ message: "Usuario no encontrado" });
      }
      return response.status(200).json(user);
    } catch (error) {
      return response.status(500).json({ message: "Error en el servidor" });
    }
  }

  async deleteUser(request: Request, response: Response): Promise<Response> {
    try {
      const id = parseInt(request.params.id);
      if (isNaN(id)) {
        return response.status(400).json({ message: "Error en parámetro" });
      }
      const deleted = await this.app.deleteUserById(id);
      if (!deleted) {
        return response.status(404).json({ message: "Usuario no encontrado" });
      }
      return response.status(200).json({ message: "Usuario dado de baja exitosamente" });
    } catch (error) {
      return response.status(500).json({ message: "Error en el servidor" });
    }
  }

  async deleteUserQuery(request: Request, response: Response): Promise<Response> {
    try {
      const idParam = request.query.id as string;
      const id = parseInt(idParam);
      if (!idParam || isNaN(id)) {
        return response.status(400).json({ message: "Query param 'id' inválido" });
      }
      const deleted = await this.app.deleteUserById(id);
      if (!deleted) {
        return response.status(404).json({ message: "Usuario no encontrado" });
      }
      return response.status(200).json({ message: "Usuario dado de baja exitosamente" });
    } catch (error) {
      return response.status(500).json({ message: "Error en el servidor" });
    }
  }

  async updateUser(request: Request, response: Response): Promise<Response> {
    try {
      const id = parseInt(request.params.id);
      if (isNaN(id)) {
        return response.status(400).json({ message: "Error en parámetro" });
      }

      let { name, email, password, status } = request.body;

      // Validaciones antes de actualizar
      if (name && !/^[a-zA-Z\s]{3,}$/.test(name.trim()))
        return response.status(400).json({
          message: "El nombre debe tener al menos 3 caracteres y solo contener letras",
        });

      if (email && !EMAIL_REGEX.test(email.trim()))
        return response.status(400).json({ message: "Correo electrónico no válido" });

      if (password && !/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/.test(password.trim()))
        return response.status(400).json({
          message:
            "La contraseña debe tener al menos 6 caracteres, incluyendo al menos una letra y un número",
        });

      // Forzar status por defecto y mapear "name" a "nombreEntidad"
      status = 1;
      const updated = await this.app.updateUser(id, {
        nombreEntidad: name,
        correo: email,
        password,
        estado: status,
      });
      if (!updated) {
        return response.status(404).json({
          message: "Usuario no encontrado o error al actualizar",
        });
      }
      return response.status(200).json({ message: "Usuario actualizado con éxito" });
    } catch (error) {
      return response.status(500).json({ message: "Error en el servidor" });
    }
  }
}