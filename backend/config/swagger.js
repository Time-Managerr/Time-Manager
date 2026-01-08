import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function setupSwagger(app) {
  let swaggerDocument;

  try {
    swaggerDocument = YAML.load(path.join(__dirname, "../docs/swagger.yaml"));
    console.log("Clés Swagger racine:", Object.keys(swaggerDocument));
    console.log("Nombre de paths:", Object.keys(swaggerDocument.paths || {}).length);
  } catch (error) {
    console.error("Erreur chargement Swagger:", error);
  }

  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  console.log("Swagger YAML chargé sur /api-docs");
}
