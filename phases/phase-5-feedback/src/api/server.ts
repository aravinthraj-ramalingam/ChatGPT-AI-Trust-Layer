import http from "node:http";
import { FeedbackEngine, FeedbackValidationError } from "../feedback-engine.js";
import { validateFeedbackInput } from "../validation.js";
import {
  InMemoryJudgmentApiStore,
  runJudgmentForTurn,
} from "../judgment-api.js";
import type { RunJudgmentInput } from "../types.js";

export interface ApiServerOptions {
  port?: number;
  feedbackEngine?: FeedbackEngine;
  judgmentStore?: InMemoryJudgmentApiStore;
}

export function createApiServer(options: ApiServerOptions = {}) {
  const feedbackEngine = options.feedbackEngine ?? new FeedbackEngine();
  const judgmentStore = options.judgmentStore ?? new InMemoryJudgmentApiStore();

  const server = http.createServer(async (req, res) => {
    setCors(res);

    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    try {
      const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
      const path = url.pathname;

      if (req.method === "POST" && path === "/feedback") {
        await handlePostFeedback(req, res, feedbackEngine);
        return;
      }

      const judgmentMatch = path.match(/^\/turns\/([^/]+)\/judgment$/);
      if (judgmentMatch) {
        const answerId = decodeURIComponent(judgmentMatch[1]!);
        if (req.method === "GET") {
          handleGetJudgment(res, judgmentStore, answerId);
          return;
        }
        if (req.method === "POST") {
          await handlePostJudgment(req, res, judgmentStore, answerId);
          return;
        }
      }

      if (req.method === "GET" && path === "/feedback/aggregate") {
        const answerId = url.searchParams.get("answerId") ?? undefined;
        json(res, 200, feedbackEngine.getAggregates(answerId ?? undefined));
        return;
      }

      json(res, 404, { error: "Not found" });
    } catch (err) {
      json(res, 500, { error: "Internal server error" });
      console.error(err);
    }
  });

  return { server, feedbackEngine, judgmentStore };
}

export function startApiServer(port = 8787, options?: ApiServerOptions) {
  const { server } = createApiServer(options);
  server.listen(port, () => {
    console.log(`Trust Through Judgment API listening on http://localhost:${port}`);
  });
  return server;
}

async function handlePostFeedback(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  engine: FeedbackEngine
) {
  const body = await readJson(req);
  const validated = validateFeedbackInput(body, { layerOnly: true });
  if (!validated.ok) {
    json(res, 400, { ok: false, errors: validated.errors });
    return;
  }
  try {
    const feedback = engine.ingest(validated.data);
    json(res, 201, { ok: true, feedback: serializeFeedback(feedback) });
  } catch (e) {
    if (e instanceof FeedbackValidationError) {
      json(res, 400, { ok: false, errors: e.errors });
      return;
    }
    throw e;
  }
}

function handleGetJudgment(
  res: http.ServerResponse,
  store: InMemoryJudgmentApiStore,
  answerId: string
) {
  const judgment = store.get(answerId);
  if (!judgment) {
    json(res, 404, { error: "Judgment not found" });
    return;
  }
  json(res, 200, { judgment });
}

async function handlePostJudgment(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  store: InMemoryJudgmentApiStore,
  answerId: string
) {
  const body = (await readJson(req)) as Partial<RunJudgmentInput>;

  if (!body.promptContent || !body.answerContent) {
    json(res, 400, { error: "promptContent and answerContent are required" });
    return;
  }

  const judgment = await runJudgmentForTurn(
    {
      answerId,
      promptContent: body.promptContent,
      answerContent: body.answerContent,
      metadata: body.metadata,
    },
    store
  );

  json(res, 200, { judgment });
}

function serializeFeedback(feedback: {
  id: string;
  answerId: string;
  targetType: string;
  targetId: string | null;
  signal: string;
  comment?: string;
  createdAt: Date;
}) {
  return {
    ...feedback,
    createdAt: feedback.createdAt.toISOString(),
  };
}

function setCors(res: http.ServerResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function json(res: http.ServerResponse, status: number, body: unknown) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
}

function readJson(req: http.IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });
    req.on("error", reject);
  });
}

