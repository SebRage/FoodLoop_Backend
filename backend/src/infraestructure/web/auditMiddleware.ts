import { Request, Response, NextFunction } from "express";
import { AuditoriaAdapter } from "../adapter/AuditoriaAdapter";
import { AuditoriaApplication } from "../../application/AuditoriaApplication";

// Singleton to avoid creating many repositories
let auditoriaAppSingleton: AuditoriaApplication | null = null;
function getAuditoriaApp(): AuditoriaApplication {
  if (!auditoriaAppSingleton) {
    auditoriaAppSingleton = new AuditoriaApplication(new AuditoriaAdapter());
  }
  return auditoriaAppSingleton;
}

function sanitizeBody(body: any): any {
  try {
    if (!body || typeof body !== "object") return undefined;
    const clone: any = Array.isArray(body) ? [] : {};
    const redactKeys = new Set([
      "password",
      "contrasena",
      "newPassword",
      "token",
      "authorization",
    ]);
    for (const [k, v] of Object.entries(body)) {
      if (redactKeys.has(k)) {
        clone[k] = "[REDACTED]";
      } else if (typeof v === "object" && v !== null) {
        clone[k] = "[OBJECT]"; // avoid deep nesting and PII
      } else if (String(v).length > 200) {
        clone[k] = String(v).slice(0, 200) + "…";
      } else {
        clone[k] = v;
      }
    }
    return clone;
  } catch {
    return undefined;
  }
}

function deriveTablaAfectada(originalUrl: string): string {
  // Expected base path: /foodloop/<resource>/...
  const parts = originalUrl.split("?")[0].split("/").filter(Boolean);
  // parts[0] might be 'foodloop'
  if (parts.length === 0) return "root";
  if (parts[0].toLowerCase() === "foodloop") {
    const seg = parts[1] ? parts[1].toLowerCase() : "root";
    // Map common route segments to table names
    switch (seg) {
      case "users":
      case "login":
      case "register":
        return "usuarios";
      case "categorias":
        return "categorias";
      case "publicaciones":
        return "publicaciones";
      case "transacciones":
        return "transacciones";
      case "reportes":
        return "reportes";
      case "auditorias":
        return "auditorias";
      default:
        return seg;
    }
  }
  return parts[0].toLowerCase();
}

function deriveAccion(method: string, path: string): string {
  const m = method.toUpperCase();
  if (m === "POST") return path.includes("/login") ? "AUTH" : "CREATE";
  if (m === "PUT") return path.includes("/delete") ? "DELETE" : "UPDATE";
  if (m === "PATCH") return "UPDATE";
  if (m === "DELETE") return "DELETE";
  return "READ";
}

export function auditLogger(request: Request, response: Response, next: NextFunction): void {
  const start = Date.now();
  // Intercept JSON body to inspect response payload (best-effort)
  const originalJson = response.json.bind(response);
  let responsePayload: any = undefined;
  (response as any).json = (body: any) => {
    try { responsePayload = body; } catch {}
    return originalJson(body);
  };
  // Register after-response hook
  response.on("finish", async () => {
    try {
      const auditoriaApp = getAuditoriaApp();
      const userId = (request as any).user?.id as number | undefined;
      const tablaAfectada = deriveTablaAfectada(request.originalUrl || request.url);
      const accion = deriveAccion(request.method, request.originalUrl || request.url);
      const status = response.statusCode;
      const duration = Date.now() - start;

      // Try to infer an id from params if present
      let registroId = 0;
      const maybeId = (request.params && (request.params.id as any)) || undefined;
      const parsed = Number(maybeId);
      if (!isNaN(parsed) && isFinite(parsed)) registroId = parsed;
      // If none in params, try from response payload common keys
      if (!registroId && responsePayload && typeof responsePayload === 'object') {
        const keys = ["id", "userId", "reporteId", "categoriaId", "publicacionId", "transaccionId"];
        for (const k of keys) {
          const v = (responsePayload as any)[k];
          const n = Number(v);
          if (!isNaN(n) && isFinite(n) && n > 0) { registroId = n; break; }
        }
      }

        // Descripción breve sin navegador ni cuerpo de la solicitud
        const descripcion = `Solicitud ${request.method} ${request.originalUrl} -> estado ${status} (${duration} ms)`;

      await auditoriaApp.createAuditoria({
        usuarioId: userId,
        tablaAfectada,
        registroId,
        accion,
        descripcion,
        estado: 1,
        fecha: new Date(),
      });
    } catch (err) {
      // Do not block request lifecycle for audit errors
      console.error("Error creando auditoria (middleware):", err);
    }
  });

  next();
}
