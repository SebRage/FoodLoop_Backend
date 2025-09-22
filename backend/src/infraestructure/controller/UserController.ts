import { Request, Response } from "express";
import { UserApplicationService } from "../../application/UserApplicationService";
import { User } from "../../domain/User";
import { NAME_REGEX, EMAIL_REGEX, PASSWORD_REGEX } from "../../utils/RegexUtils";
import { formatToBogotaShort } from "../../utils/DateUtils";
import { AuditoriaApplication } from "../../application/AuditoriaApplication";

export class UserController {
  private app: UserApplicationService;
  private auditoriaApp?: AuditoriaApplication;

  constructor(app: UserApplicationService, auditoriaApp?: AuditoriaApplication) {
    this.app = app;
    this.auditoriaApp = auditoriaApp;
  }

  // --- Helpers to keep methods small and readable ---
  private trimIfString(v: any): string | undefined {
    return typeof v === 'string' ? v.trim() : undefined;
  }

  private toOptionalNumber(raw: any): number | undefined {
    if (raw === undefined || raw === null || raw === '') return undefined;
    const n = Number(raw);
    return isNaN(n) ? undefined : n;
  }

  private validateNameOptional(raw: any): string | undefined {
    const name = this.trimIfString(raw);
    if (name === undefined) return undefined;
    if (!NAME_REGEX.test(name)) {
      return "El nombre debe tener al menos 3 caracteres y solo contener letras y caracteres permitidos";
    }
    return undefined;
  }

  private validateEmailOptional(raw: any): string | undefined {
    const email = this.trimIfString(raw);
    if (email === undefined) return undefined;
    if (!EMAIL_REGEX.test(email)) {
      return "Correo electrónico no válido";
    }
    return undefined;
  }

  private validatePasswordOptional(raw: any): string | undefined {
    const pwd = this.trimIfString(raw);
    if (pwd === undefined) return undefined;
    if (!PASSWORD_REGEX.test(pwd)) {
      return "La contraseña debe tener al menos 8 caracteres y máximo 25, incluyendo al menos una letra y un número";
    }
    return undefined;
  }

  private async auditSafe(request: Request, tabla: string, registroId: number | undefined, accion: "CREATE" | "UPDATE" | "DELETE", descripcion: string) {
    try {
      if (!this.auditoriaApp) return;
      const actorId = (request as any).user?.id ?? undefined;
      await this.auditoriaApp.createAuditoria({
        usuarioId: actorId,
        tablaAfectada: tabla,
        registroId,
        accion,
        descripcion,
        estado: 1,
        fecha: new Date(),
      });
    } catch (err) {
      console.error(`Error creando auditoria (${accion} ${tabla}):`, err);
    }
  }

  async resetPassword(request: Request, response: Response): Promise<Response> {
    try {
      const email = request.body.email ?? request.body.correo;
      const newPassword = request.body.newPassword ?? request.body.password;
      if (!email || !newPassword) {
        return response.status(400).json({ message: "Email y nueva contraseña son requeridos" });
      }
      await this.app.resetPasswordByEmail(email, newPassword);

      // Audit best-effort
      try {
        if (this.auditoriaApp) {
          const actorId = (request as any).user?.id ?? undefined;
          await this.auditoriaApp.createAuditoria({
            usuarioId: actorId,
            tablaAfectada: "users",
            registroId: undefined,
            accion: "UPDATE",
            descripcion: `Reset password para ${email}`,
            estado: 1,
            fecha: new Date(),
          });
        }
      } catch (err) {
        console.error("Error creando auditoria (resetPassword):", err);
      }

      return response.status(200).json({ message: "Contraseña actualizada correctamente" });
    } catch (error: any) {
      if (String(error?.message || "").includes("no encontrado")) {
        return response.status(404).json({ message: "Usuario no encontrado" });
      }
      console.error("resetPassword error:", error);
      return response.status(500).json({ message: "Error en el servidor" });
    }
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

      const { token, user } = await this.app.loginWithUserData(email, password);
      return response.status(200).json({
        token,
        user: {
          id: user.id,
          estado: user.estado,
          nombreEntidad: user.nombreEntidad,
          correo: user.correo
        }
      });
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
        tipoEntidad: request.body.tipoEntidad ?? "",
        nombreEntidad: name,
        correo: email,
        telefono: request.body.telefono ?? "",
        ubicacion: request.body.ubicacion ?? "",
        direccion: request.body.direccion ?? "",
        password,
        estado: status,
      };

      const userId = await this.app.createUser(user);

      // Create audit record (best-effort, don't block on failure)
      try {
        if (this.auditoriaApp) {
          const actorId = (request as any).user?.id ?? undefined;
          await this.auditoriaApp.createAuditoria({
            usuarioId: actorId,
            tablaAfectada: "users",
            registroId: userId,
            accion: "CREATE",
            descripcion: `Usuario creado con id ${userId}`,
            estado: 1,
            fecha: new Date(),
          });
        }
      } catch (err) {
        console.error("Error creando auditoria (registerUser):", err);
      }

      return response
        .status(201)
        .json({ message: "Usuario registrado correctamente", userId });
    } catch (error: any) {
      const msg = String(error?.message || "");
      if (msg.includes("ya existe")) {
        return response.status(409).json({ message: "Ese email ya está en uso" });
      }
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
      if (!user) return response.status(404).json({ message: "Usuario no encontrado" });
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

      // Audit
      try {
        if (this.auditoriaApp) {
          const actorId = (request as any).user?.id ?? undefined;
          await this.auditoriaApp.createAuditoria({
            usuarioId: actorId,
            tablaAfectada: "users",
            registroId: id,
            accion: "DELETE",
            descripcion: `Usuario dado de baja con id ${id}`,
            estado: 1,
            fecha: new Date(),
          });
        }
      } catch (err) {
        console.error("Error creando auditoria (deleteUser):", err);
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


      try {
        if (this.auditoriaApp) {
          const actorId = (request as any).user?.id ?? undefined;
          await this.auditoriaApp.createAuditoria({
            usuarioId: actorId,
            tablaAfectada: "users",
            registroId: id,
            accion: "DELETE",
            descripcion: `Usuario dado de baja con id ${id} (query)`,
            estado: 1,
            fecha: new Date(),
          });
        }
      } catch (err) {
        console.error("Error creando auditoria (deleteUserQuery):", err);
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

      const b = request.body || {};
      const rawName = b.nombreEntidad ?? b.name;
      const rawEmail = b.correo ?? b.email;
      const rawPassword = b.password;
      const rawStatus = b.estado ?? b.status;
      const rawTipoEntidad = b.tipoEntidad ?? b.tipo_entidad;
      const rawTelefono = b.telefono ?? b.phone;
      const rawDireccion = b.direccion ?? b.address;
      const rawUbicacion = b.ubicacion ?? b.location;

      const validationError = this.validateNameOptional(rawName)
        || this.validateEmailOptional(rawEmail)
        || this.validatePasswordOptional(rawPassword);
      if (validationError) return response.status(400).json({ message: validationError });

      const updatePairs: Array<[keyof User, any]> = [
        ['nombreEntidad', this.trimIfString(rawName)],
        ['correo', this.trimIfString(rawEmail)],
        ['password', this.trimIfString(rawPassword)],
        ['estado', this.toOptionalNumber(rawStatus)],
        ['tipoEntidad', this.trimIfString(rawTipoEntidad)],
        ['telefono', this.trimIfString(rawTelefono)],
        ['direccion', this.trimIfString(rawDireccion)],
        ['ubicacion', this.trimIfString(rawUbicacion)],
      ];
      const updatePayload: Partial<User> = {};
      for (const [key, value] of updatePairs) {
        if (value !== undefined) (updatePayload as any)[key] = value;
      }

      if (Object.keys(updatePayload).length === 0) {
        return response.status(400).json({ message: "No hay campos para actualizar" });
      }

      const updated = await this.app.updateUser(id, updatePayload);
      if (!updated) {
        return response.status(404).json({ message: "Usuario no encontrado o error al actualizar" });
      }

      await this.auditSafe(request, 'users', id, 'UPDATE', `Usuario actualizado con id ${id}`);
      return response.status(200).json({ message: "Usuario actualizado con éxito" });
    } catch (error: any) {
      const msg = String(error?.message || "");
      if (msg.includes("ya está en uso")) {
        return response.status(409).json({ message: "Ese email ya está en uso" });
      }
      if (msg.includes("Usuario no encontrado")) {
        return response.status(404).json({ message: "Usuario no encontrado" });
      }
      console.error("updateUser error:", error);
      return response.status(500).json({ message: "Error en el servidor" });
    }
  }
}