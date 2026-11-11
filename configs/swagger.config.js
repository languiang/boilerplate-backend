import "dotenv/config";
import swaggerJSDoc from "swagger-jsdoc";
import path from "node:path";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "My RESTful API",
      version: "1.0.0",
      description: "API documentation using Swagger",
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT}`,
        description: "Development Server",
      },
    ],
  },
  apis: [path.resolve("routes", "*.js").replace(/\\/g, "/")],
  failOnErrors: true,
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
