import { DataSource } from "typeorm";
import { UserEntity } from "../entities/UserEntity";
import { CategoriaEntity } from "../entities/CategoriaEntity";
import { PublicacionEntity } from "../entities/PublicacionEntity";
import { TransaccionEntity } from "../entities/TransaccionEntity";
import { ReporteEntity } from "../entities/ReporteEntity";
import { AuditoriaEntity } from "../entities/AuditoriaEntity";
import envs from "../config/environment-vars";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: envs.DB_HOST,
  port: Number(envs.DB_PORT),
  username: envs.DB_USER,
  password: envs.DB_PASSWORD,
  database: envs.DB_NAME,
  schema: envs.DB_SCHEMA,
  synchronize: false, 
  logging: false,
  entities: [
    UserEntity,
    CategoriaEntity,
    PublicacionEntity,
    TransaccionEntity,
    ReporteEntity,
    AuditoriaEntity,
  ],
});

// Conexion a la base de datos
export const conectDB = async () => {
  try {
    await AppDataSource.initialize();
    console.log("Database connected successfully");
  } catch (error) {
    console.log("Error connecting to the database", error);
    process.exit(1);
  }
};