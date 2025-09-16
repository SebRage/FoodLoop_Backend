import express, { Response, Request } from "express";
import userRoutes from "../routes/UserRoutes";
import cors from "cors";
class App {
  private app!: express.Application;

  constructor() {
    this.app = express();
    this.middleware();
    this.routes();
  }
  private middleware():void{
    this.app.use(cors());
    this.app.use(express.json())
  }

  private routes(): void {
    this.app.use("/foodloop", userRoutes);
  }

  getApp() {
    return this.app;
  }
}

export default new App().getApp();
