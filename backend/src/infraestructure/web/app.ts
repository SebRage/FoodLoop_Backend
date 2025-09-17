import express, { Response, Request } from "express";
import userRoutes from "../routes/UserRoutes";
import reporteRoutes from "../routes/ReporteRoutes";
import auditoriaRoutes from "../routes/AuditoriaRoutes";
import categoriaRoutes from "../routes/CategoriaRoutes";
import publicacionRoutes from "../routes/PublicacionRoutes";
import transaccionRoutes from "../routes/TransaccionRoutes";
import cors from "cors";
class App {
  private app!: express.Application;

  constructor() {
    this.app = express();
    this.middleware();
    this.routes();
  }
  private middleware():void{
    // Habilitar CORS para todas las rutas y orígenes en desarrollo
    this.app.use(cors({
      origin: true,
      credentials: true,
      methods: ["GET", "POST", "PUT"],
      allowedHeaders: ["Content-Type", "Authorization"],
      optionsSuccessStatus: 204,
    }));
    // No necesitamos app.options() global; CORS middleware ya maneja preflight automáticamente
    this.app.use(express.json())
  }

  private routes(): void {
  this.app.use("/foodloop", userRoutes);
  this.app.use("/foodloop", reporteRoutes);
  this.app.use("/foodloop", auditoriaRoutes);
  this.app.use("/foodloop", categoriaRoutes);
  this.app.use("/foodloop", publicacionRoutes);
  this.app.use("/foodloop", transaccionRoutes);
  // Endpoint de salud para verificar disponibilidad desde el navegador o PowerShell
  this.app.get('/foodloop/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'ok' });
  });
  }

  getApp() {
    return this.app;
  }
}

export default new App().getApp();
