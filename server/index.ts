import dotenv from 'dotenv';
dotenv.config();
import express, { Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";

const app = express();
const httpServer = createServer(app);

/* -------------------- MIDDLEWARE -------------------- */

declare module "http" {
  interface IncomingMessage {
    rawBody?: Buffer;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  })
);

app.use(express.urlencoded({ extended: false }));

/* -------------------- LOGGER -------------------- */

function log(message: string, source = "express") {
  const time = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${time} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let responseBody: any;

  const originalJson = res.json.bind(res);
  res.json = (body: any) => {
    responseBody = body;
    return originalJson(body);
  };

  res.on("finish", () => {
    if (path.startsWith("/api")) {
      const duration = Date.now() - start;
      log(
        `${req.method} ${path} ${res.statusCode} in ${duration}ms${
          responseBody ? ` :: ${JSON.stringify(responseBody)}` : ""
        }`
      );
    }
  });

  next();
});

/* -------------------- BOOTSTRAP -------------------- */

async function startServer() {
  try {
    // register API routes
    await registerRoutes(httpServer, app);

    // error handler
    app.use(
      (err: any, _req: Request, res: Response, _next: NextFunction) => {
        const status = err.status || err.statusCode || 500;
        const message = err.message || "Internal Server Error";
        res.status(status).json({ message });
      }
    );

    // PRODUCTION ONLY: serve built frontend
    if (process.env.NODE_ENV === "production") {
      serveStatic(app);
    }

    const port = Number(process.env.PORT);

    httpServer.listen(port, "0.0.0.0", () => {
      log(`API server running on http://localhost:${port}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

startServer();
