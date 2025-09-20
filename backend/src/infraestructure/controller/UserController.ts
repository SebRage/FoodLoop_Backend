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

      // Audit for query-delete as well
      try {
        if (this.auditoriaApp) {
          const actorId = (request as any).user?.id ?? undefined;
          await this.auditoriaApp.createAuditoria({
            usuarioId: actorId,
            tablaAfectada: "users",
            registroId: id,
            accion: "DELETE",
            descripcion: `Usuario dado de baja con id ${id} (query)` ,
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

  // Aceptar claves tanto en español como en inglés y hacerlas opcionales
  // name | nombreEntidad, email | correo, status | estado, tipoEntidad | tipo_entidad, telefono | phone, direccion | address, ubicacion | location, password opcional
      const rawName = (request.body.nombreEntidad ?? request.body.name) as string | undefined;
      const rawEmail = (request.body.correo ?? request.body.email) as string | undefined;
      const rawPassword = (request.body.password) as string | undefined;
      const rawStatus = (request.body.estado ?? request.body.status) as number | string | undefined;
      const rawTipoEntidad = (request.body.tipoEntidad ?? request.body.tipo_entidad) as string | undefined;
  const rawTelefono = (request.body.telefono ?? request.body.phone) as string | undefined;
  const rawDireccion = (request.body.direccion ?? request.body.address) as string | undefined;
  const rawUbicacion = (request.body.ubicacion ?? request.body.location) as string | undefined;

      // Validaciones (solo si vienen presentes)
      if (typeof rawName === 'string') {
        const name = rawName.trim();
        if (!NAME_REGEX.test(name)) {
          return response.status(400).json({
            message: "El nombre debe tener al menos 3 caracteres y solo contener letras y caracteres permitidos",
          });
        }
      }

      if (typeof rawEmail === 'string') {
        const email = rawEmail.trim();
        if (!EMAIL_REGEX.test(email)) {
          return response.status(400).json({ message: "Correo electrónico no válido" });
        }
      }

      if (typeof rawPassword === 'string') {
        const password = rawPassword.trim();
        if (!PASSWORD_REGEX.test(password)) {
          return response.status(400).json({
            message: "La contraseña debe tener al menos 8 caracteres y máximo 25, incluyendo al menos una letra y un número",
          });
        }
      }

  const updatePayload: Partial<User> = {};
      if (typeof rawName === 'string') updatePayload.nombreEntidad = rawName.trim();
      if (typeof rawEmail === 'string') updatePayload.correo = rawEmail.trim();
      if (typeof rawPassword === 'string') updatePayload.password = rawPassword.trim();
      if (typeof rawStatus !== 'undefined') updatePayload.estado = Number(rawStatus);
      if (typeof rawTipoEntidad === 'string') updatePayload.tipoEntidad = rawTipoEntidad.trim();
  if (typeof rawTelefono === 'string') updatePayload.telefono = rawTelefono.trim();
  if (typeof rawDireccion === 'string') updatePayload.direccion = rawDireccion.trim();
  if (typeof rawUbicacion === 'string') updatePayload.ubicacion = rawUbicacion.trim();

      if (Object.keys(updatePayload).length === 0) {
        return response.status(400).json({ message: "No hay campos para actualizar" });
      }

      const updated = await this.app.updateUser(id, updatePayload);
      if (!updated) {
        return response.status(404).json({
          message: "Usuario no encontrado o error al actualizar",
        });
      }

      // Audit
      try {
        if (this.auditoriaApp) {
          const actorId = (request as any).user?.id ?? undefined;
          await this.auditoriaApp.createAuditoria({
            usuarioId: actorId,
            tablaAfectada: "users",
            registroId: id,
            accion: "UPDATE",
            descripcion: `Usuario actualizado con id ${id}`,
            estado: 1,
            fecha: new Date(),
          });
        }
      } catch (err) {
        console.error("Error creando auditoria (updateUser):", err);
      }

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