import Joi from "joi";
import "dotenv/config";

export type ReturnEnvironmentVars = {
  PORT: number;
  DB_HOST: string;
  DB_PORT: number;
  DB_USER: string;
  DB_PASSWORD: string;
  DB_NAME: string;
  DB_SCHEMA: string;
};

type ValidationEnvironmentVars = {
  error: Joi.ValidationError | undefined;
  value: ReturnEnvironmentVars;
};

function validateEnvVars(vars: NodeJS.ProcessEnv): ValidationEnvironmentVars {
  const envSchema = Joi.object({
    PORT: Joi.number().required(),
    DB_HOST: Joi.string().required(),
    DB_PORT: Joi.number().default(5432), //EN CASO DE QUE NO LO DETECTE SE USA 5432
    DB_USER: Joi.string().required(),
    DB_PASSWORD: Joi.string().allow("").optional(),
    DB_NAME: Joi.string().required(),
    DB_SCHEMA: Joi.string().required(),
  }).unknown(true);
  const { error, value } = envSchema.validate(vars);
  return { error, value };
}

//Funcion tipo flecha que carga las variables de entorno
const loadEnvVars = (): ReturnEnvironmentVars => {
  const result = validateEnvVars(process.env);
  if (result.error) {
    throw new Error(`Error en la variable de entorno: ${result.error.message}`);
  }
  const value = result.value;
  return {
    PORT: value.PORT,
    DB_HOST: value.DB_HOST,
    DB_PORT: value.DB_PORT,
    DB_USER: value.DB_USER,
    DB_PASSWORD: value.DB_PASSWORD,
    DB_NAME: value.DB_NAME,
    DB_SCHEMA: value.DB_SCHEMA,
  };
};
const envs = loadEnvVars();
export default envs;
