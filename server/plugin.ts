import type { IncomingMessage, ServerResponse } from "node:http";
import type { Plugin } from "vite";
import { analyzeTransactions } from "./analyze";

function readJsonBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let size = 0;
    req.on("data", (chunk: Buffer) => {
      size += chunk.length;
      if (size > 1_000_000) {
        reject(new Error("too_large"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8").trim();
      if (!raw) {
        resolve(null);
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error("invalid_json"));
      }
    });
    req.on("error", reject);
  });
}

function pathOf(url: string | undefined) {
  return (url ?? "").split("?")[0];
}

async function handleAnalyze(
  req: IncomingMessage,
  res: ServerResponse,
  apiKey: string | undefined,
) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== "POST") {
    res.statusCode = 405;
    res.end(JSON.stringify({ error: "We couldn't analyze this data. Try again." }));
    return;
  }

  try {
    const body = await readJsonBody(req);
    const result = await analyzeTransactions(body, apiKey);
    res.statusCode = result.status;
    res.end(JSON.stringify(result.body));
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "invalid_json") {
      res.statusCode = 400;
      res.end(
        JSON.stringify({
          error:
            "We couldn't find enough information to identify meaningful patterns.",
        }),
      );
      return;
    }
    if (message === "too_large") {
      res.statusCode = 413;
      res.end(JSON.stringify({ error: "We couldn't analyze this data. Try again." }));
      return;
    }
    res.statusCode = 500;
    res.end(JSON.stringify({ error: "We couldn't analyze this data. Try again." }));
  }
}

export function analyzeApiPlugin(apiKey: string | undefined): Plugin {
  return {
    name: "leaks-analyze-api",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (pathOf(req.url) !== "/api/analyze") {
          next();
          return;
        }
        void handleAnalyze(req, res, apiKey);
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        if (pathOf(req.url) !== "/api/analyze") {
          next();
          return;
        }
        void handleAnalyze(req, res, apiKey);
      });
    },
  };
}
