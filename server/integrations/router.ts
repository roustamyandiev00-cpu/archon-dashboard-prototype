import express from "express";
import type { BackendIntegrations, JsonRecord } from "../../shared/integrations";
import { createStubIntegrations } from "./stubs";

const isRecord = (value: unknown): value is JsonRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const toRecord = (value: unknown): JsonRecord => (isRecord(value) ? value : { value });

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

const toStringOrArray = (value: unknown): string | string[] | null => {
  if (typeof value === "string") {
    return value;
  }
  if (isStringArray(value)) {
    return value;
  }
  return null;
};

export const createStubIntegrationsRouter = (integrations?: BackendIntegrations) => {
  const router = express.Router();
  const services = integrations ?? createStubIntegrations();

  router.get("/health", (_req, res) => {
    res.json({
      status: "ok",
      services: ["crud", "realtime", "email", "banking", "storage", "notifications", "audit", "webhooks"],
    });
  });

  router.get("/crud/:resource", async (req, res) => {
    const service = services.crud.resource(req.params.resource);
    const items = await service.list();
    res.json({ items });
  });

  router.post("/crud/:resource", async (req, res) => {
    const service = services.crud.resource(req.params.resource);
    const input = isRecord(req.body) ? req.body : {};
    const item = await service.create(input);
    res.status(201).json(item);
  });

  router.get("/crud/:resource/:id", async (req, res) => {
    const service = services.crud.resource(req.params.resource);
    const item = await service.get(req.params.id);
    if (!item) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json(item);
  });

  router.patch("/crud/:resource/:id", async (req, res) => {
    const service = services.crud.resource(req.params.resource);
    const input = isRecord(req.body) ? req.body : {};
    const item = await service.update(req.params.id, input);
    if (!item) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json(item);
  });

  router.delete("/crud/:resource/:id", async (req, res) => {
    const service = services.crud.resource(req.params.resource);
    const removed = await service.remove(req.params.id);
    res.json({ removed });
  });

  router.get("/realtime/events", async (req, res) => {
    const channel = typeof req.query.channel === "string" ? req.query.channel : undefined;
    const items = await services.realtime.listRecent(channel);
    res.json({ items });
  });

  router.post("/realtime/publish", async (req, res) => {
    const body = isRecord(req.body) ? req.body : {};
    const channel = typeof body.channel === "string" ? body.channel : null;
    const type = typeof body.type === "string" ? body.type : null;
    if (!channel || !type) {
      res.status(400).json({ error: "Missing channel or type" });
      return;
    }
    const event = await services.realtime.publish({
      channel,
      type,
      payload: body.payload,
    });
    res.json(event);
  });

  router.post("/email/send", async (req, res) => {
    const body = isRecord(req.body) ? req.body : {};
    const to = toStringOrArray(body.to);
    const subject = body.subject;
    if (!to || typeof subject !== "string") {
      res.status(400).json({ error: "Missing to or subject" });
      return;
    }
    const cc = toStringOrArray(body.cc);
    const bcc = toStringOrArray(body.bcc);
    const result = await services.email.send({
      to,
      subject,
      text: typeof body.text === "string" ? body.text : undefined,
      html: typeof body.html === "string" ? body.html : undefined,
      from: typeof body.from === "string" ? body.from : undefined,
      cc: cc ?? undefined,
      bcc: bcc ?? undefined,
    });
    res.json(result);
  });

  router.get("/email/outbox", async (_req, res) => {
    const items = await services.email.list();
    res.json({ items });
  });

  router.get("/banking/accounts", async (_req, res) => {
    const items = await services.banking.listAccounts();
    res.json({ items });
  });

  router.post("/banking/sync", async (req, res) => {
    const body = isRecord(req.body) ? req.body : {};
    const accountId = typeof body.accountId === "string" ? body.accountId : null;
    if (!accountId) {
      res.status(400).json({ error: "Missing accountId" });
      return;
    }
    const items = await services.banking.syncTransactions(accountId);
    res.json({ items });
  });

  router.get("/banking/transactions", async (req, res) => {
    const accountId = typeof req.query.accountId === "string" ? req.query.accountId : undefined;
    const items = await services.banking.listTransactions(accountId);
    res.json({ items });
  });

  router.post("/storage/upload", async (req, res) => {
    const body = isRecord(req.body) ? req.body : {};
    const name = typeof body.name === "string" ? body.name : null;
    if (!name) {
      res.status(400).json({ error: "Missing name" });
      return;
    }
    const file = await services.storage.upload({
      name,
      contentType: typeof body.contentType === "string" ? body.contentType : undefined,
      size: typeof body.size === "number" ? body.size : undefined,
    });
    res.status(201).json(file);
  });

  router.get("/storage", async (_req, res) => {
    const items = await services.storage.list();
    res.json({ items });
  });

  router.get("/storage/:id", async (req, res) => {
    const file = await services.storage.get(req.params.id);
    if (!file) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json(file);
  });

  router.delete("/storage/:id", async (req, res) => {
    const removed = await services.storage.remove(req.params.id);
    res.json({ removed });
  });

  router.post("/notifications/send", async (req, res) => {
    const body = isRecord(req.body) ? req.body : {};
    const title = typeof body.title === "string" ? body.title : null;
    if (!title) {
      res.status(400).json({ error: "Missing title" });
      return;
    }
    const notification = await services.notifications.send({
      userId: typeof body.userId === "string" ? body.userId : undefined,
      title,
      body: typeof body.body === "string" ? body.body : undefined,
      type: typeof body.type === "string" ? body.type : undefined,
      read: typeof body.read === "boolean" ? body.read : false,
    });
    res.json(notification);
  });

  router.get("/notifications", async (req, res) => {
    const userId = typeof req.query.userId === "string" ? req.query.userId : undefined;
    const items = await services.notifications.list(userId);
    res.json({ items });
  });

  router.post("/notifications/:id/read", async (req, res) => {
    const notification = await services.notifications.markRead(req.params.id);
    if (!notification) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json(notification);
  });

  router.post("/audit/log", async (req, res) => {
    const body = isRecord(req.body) ? req.body : {};
    const action = typeof body.action === "string" ? body.action : null;
    if (!action) {
      res.status(400).json({ error: "Missing action" });
      return;
    }
    const event = await services.audit.log({
      action,
      actorId: typeof body.actorId === "string" ? body.actorId : undefined,
      entity: typeof body.entity === "string" ? body.entity : undefined,
      entityId: typeof body.entityId === "string" ? body.entityId : undefined,
      metadata: toRecord(body.metadata),
    });
    res.json(event);
  });

  router.get("/audit", async (_req, res) => {
    const items = await services.audit.list();
    res.json({ items });
  });

  router.post("/webhooks/ingest", async (req, res) => {
    const body = isRecord(req.body) ? req.body : {};
    const provider = typeof body.provider === "string" ? body.provider : null;
    const type = typeof body.type === "string" ? body.type : null;
    if (!provider || !type) {
      res.status(400).json({ error: "Missing provider or type" });
      return;
    }
    const event = await services.webhooks.handle({
      provider,
      type,
      payload: toRecord(body.payload),
    });
    res.json(event);
  });

  router.get("/webhooks", async (_req, res) => {
    const items = await services.webhooks.list();
    res.json({ items });
  });

  router.post("/errors", async (req, res) => {
    const body = isRecord(req.body) ? req.body : {};
    const metadata = {
      error: body.error,
      stack: body.stack,
      componentStack: body.componentStack,
      timestamp: body.timestamp,
      userAgent: body.userAgent,
      url: body.url,
    };
    await services.audit.log({
      action: "client_error",
      entity: "client",
      entityId: typeof body.url === "string" ? body.url : undefined,
      metadata: toRecord(metadata),
    });
    res.status(202).json({ ok: true });
  });

  return router;
};
