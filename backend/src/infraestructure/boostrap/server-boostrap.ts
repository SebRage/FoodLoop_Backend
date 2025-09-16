import { promises } from "dns";
import express from "express";
import http from "http";
import envs from "../config/environment-vars";

export class ServerBootstrap {
  private app!: express.Application;
  constructor(app: express.Application) {
    this.app = app;
  }

  init(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const server = http.createServer(this.app);
      const PORT = envs.PORT || 4100;

      server
        .listen(PORT)
        .on("listening", () => {
          console.log(`Server is running on port ${PORT}`);
          resolve(true);
        })
        .on("error", (err) => {
          console.log(`Error starting server on port ${err}`);
          reject(false);
        });
    });
  }
}
