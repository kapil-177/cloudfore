export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "CloudFore API",
    version: "1.0.0",
    description:
      "OpenAPI documentation for CloudFore authentication, service management, metrics, and forecast endpoints."
  },
  servers: [
    {
      url: "/api",
      description: "Relative API base URL"
    }
  ],
  tags: [
    { name: "Auth" },
    { name: "Projects" },
    { name: "Metrics" },
    { name: "Forecast" }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT"
      }
    },
    schemas: {
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email", example: "demo@cloudfore.dev" },
          password: { type: "string", example: "demo12345" }
        }
      },
      ServiceInput: {
        type: "object",
        required: ["name"],
        properties: {
          name: { type: "string", example: "Forecast Engine" },
          desc: { type: "string", example: "Runs short-term resource predictions." },
          type: { type: "string", example: "API" },
          env: { type: "string", example: "Production" },
          region: { type: "string", example: "Asia South" },
          autoStart: { type: "boolean", example: true }
        }
      },
      Service: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          desc: { type: "string" },
          status: { type: "string", enum: ["Running", "Stopped", "Paused"] },
          type: { type: "string" },
          env: { type: "string" },
          region: { type: "string" },
          autoStart: { type: "boolean" },
          createdAt: { type: "string", format: "date-time" }
        }
      }
    }
  },
  paths: {
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Log in and receive a JWT",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginRequest" }
            }
          }
        },
        responses: {
          "200": {
            description: "Authenticated successfully"
          }
        }
      }
    },
    "/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Get current authenticated user",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Current user payload"
          }
        }
      }
    },
    "/projects": {
      get: {
        tags: ["Projects"],
        summary: "List projects with search, filters, sorting, and pagination",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", minimum: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 24 } },
          { name: "search", in: "query", schema: { type: "string" } },
          {
            name: "status",
            in: "query",
            schema: { type: "string", enum: ["Running", "Stopped", "Paused"] }
          },
          { name: "type", in: "query", schema: { type: "string" } },
          {
            name: "sort",
            in: "query",
            schema: { type: "string", enum: ["newest", "oldest", "name-asc", "name-desc"] }
          }
        ],
        responses: {
          "200": {
            description: "Paginated service list"
          }
        }
      },
      post: {
        tags: ["Projects"],
        summary: "Create a new service/project",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ServiceInput" }
            }
          }
        },
        responses: {
          "201": {
            description: "Service created"
          }
        }
      }
    },
    "/projects/{id}": {
      get: {
        tags: ["Projects"],
        summary: "Get a single service/project",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } }
        ],
        responses: {
          "200": {
            description: "Service detail"
          }
        }
      },
      put: {
        tags: ["Projects"],
        summary: "Update a service/project",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ServiceInput" }
            }
          }
        },
        responses: {
          "200": {
            description: "Service updated"
          }
        }
      },
      delete: {
        tags: ["Projects"],
        summary: "Delete a service/project",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } }
        ],
        responses: {
          "200": {
            description: "Service deleted"
          }
        }
      }
    },
    "/metrics/live": {
      get: {
        tags: ["Metrics"],
        summary: "Capture and return a live metrics snapshot",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Current CPU, memory, and load data"
          }
        }
      }
    },
    "/metrics/history": {
      get: {
        tags: ["Metrics"],
        summary: "Return recent metrics history",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 200 } }
        ],
        responses: {
          "200": {
            description: "Historical metric samples"
          }
        }
      }
    },
    "/forecast": {
      get: {
        tags: ["Forecast"],
        summary: "Return forecast summary, confidence, and recommendations",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Forecast overview"
          }
        }
      }
    }
  }
};
