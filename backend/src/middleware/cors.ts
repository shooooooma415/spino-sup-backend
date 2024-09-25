import { cors } from "hono/cors";

export class CorsConfig {
  static readonly policy = cors({
    origin: ["http://localhost:3000", "http://spino-cup.vercel.app"],
    allowHeaders: [
      "X-Custom-Header",
      "Upgrade-Insecure-Requests",
      "Content-Type",
      "Authorization",
      "Access-Control-Allow-Origin",
    ],
    allowMethods: ["POST", "GET", "OPTIONS"],
    exposeHeaders: ["Content-Length", "X-Kuma-Revision"],
    maxAge: 600,
    credentials: true,
  });
}
