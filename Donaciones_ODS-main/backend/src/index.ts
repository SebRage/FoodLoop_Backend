import app from "./infraestructure/web/app";
import { ServerBootstrap } from "./infraestructure/boostrap/server-boostrap";
import { conectDB } from "./infraestructure/config/data-base";

const server = new ServerBootstrap(app);
//server.init();
//Autoinvocación para iniciar el servidor
(async () => {
  try {
    await conectDB();
    const instances = [server.init()];
    await Promise.all(instances);
  } catch (error) {
    console.error("Error during server initialization", error);
    process.exit(1);
  }
})();
