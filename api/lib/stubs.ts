import { randomUUID } from "crypto";
import type {
  AuditEvent,
  AuditService,
  BackendIntegrations,
  BankAccount,
  BankingService,
  BankTransaction,
  CrudEntity,
  CrudRegistry,
  CrudService,
  EmailMessageLog,
  EmailService,
  EmailSendResult,
  NotificationMessage,
  NotificationService,
  RealtimeEvent,
  RealtimeService,
  StorageService,
  StoredFile,
  WebhookEvent,
  WebhookService,
} from "../../shared/integrations";

const now = () => new Date().toISOString();

const createCrudService = <T extends CrudEntity>(): CrudService<T> => {
  const store = new Map<string, T>();

  return {
    async list() {
      return Array.from(store.values());
    },
    async get(id) {
      return store.get(id) ?? null;
    },
    async create(input) {
      const createdAt = now();
      const record = {
        id: randomUUID(),
        createdAt,
        updatedAt: createdAt,
        ...input,
      } as T;
      store.set(record.id, record);
      return record;
    },
    async update(id, input) {
      const existing = store.get(id);
      if (!existing) {
        return null;
      }
      const updated = {
        ...existing,
        ...input,
        id: existing.id,
        createdAt: existing.createdAt,
        updatedAt: now(),
      } as T;
      store.set(id, updated);
      return updated;
    },
    async remove(id) {
      return store.delete(id);
    },
  };
};

const createCrudRegistry = (): CrudRegistry => {
  const services = new Map<string, CrudService<CrudEntity>>();

  return {
    resource<T extends CrudEntity = CrudEntity>(name: string) {
      const existing = services.get(name);
      if (existing) {
        return existing as CrudService<T>;
      }
      const service = createCrudService<CrudEntity>();
      services.set(name, service);
      return service as CrudService<T>;
    },
  };
};

const createRealtimeService = (): RealtimeService => {
  const listeners = new Map<string, Set<(event: RealtimeEvent) => void>>();
  const events: RealtimeEvent[] = [];
  const maxEvents = 100;

  return {
    async publish<T = unknown>(event: Omit<RealtimeEvent<T>, "id" | "createdAt">) {
      const record: RealtimeEvent<T> = {
        id: randomUUID(),
        createdAt: now(),
        channel: event.channel,
        type: event.type,
        payload: event.payload,
      };
      events.push(record);
      if (events.length > maxEvents) {
        events.shift();
      }
      const channelListeners = listeners.get(record.channel);
      if (channelListeners) {
        channelListeners.forEach((handler) => handler(record));
      }
      return record;
    },
    subscribe(channel, handler) {
      const channelListeners = listeners.get(channel) ?? new Set();
      channelListeners.add(handler as (event: RealtimeEvent) => void);
      listeners.set(channel, channelListeners);
      return () => {
        channelListeners.delete(handler as (event: RealtimeEvent) => void);
      };
    },
    async listRecent(channel) {
      if (!channel) {
        return [...events];
      }
      return events.filter((event) => event.channel === channel);
    },
  };
};

const createEmailService = (): EmailService => {
  const outbox: EmailMessageLog[] = [];

  return {
    async send(message) {
      const id = randomUUID();
      const result: EmailSendResult = {
        id,
        status: "queued",
        provider: "stub",
      };
      outbox.unshift({
        ...result,
        message,
        createdAt: now(),
      });
      return result;
    },
    async list() {
      return [...outbox];
    },
  };
};

const createBankingService = (): BankingService => {
  const accounts = new Map<string, BankAccount>();
  const transactions: BankTransaction[] = [];

  const ensureDefaultAccount = () => {
    if (accounts.size > 0) {
      return;
    }
    const account: BankAccount = {
      id: "stub-account-eur",
      name: "Primary Account",
      currency: "EUR",
      provider: "stub",
    };
    accounts.set(account.id, account);
  };

  const seedTransactions = (accountId: string) => {
    if (transactions.some((txn) => txn.accountId === accountId)) {
      return;
    }
    const samples: BankTransaction[] = [
      {
        id: randomUUID(),
        accountId,
        amount: 1250.0,
        currency: "EUR",
        description: "Invoice payment",
        date: now(),
        status: "posted",
      },
      {
        id: randomUUID(),
        accountId,
        amount: -320.45,
        currency: "EUR",
        description: "Materials supplier",
        date: now(),
        status: "posted",
      },
      {
        id: randomUUID(),
        accountId,
        amount: -89.99,
        currency: "EUR",
        description: "Subscription fee",
        date: now(),
        status: "pending",
      },
    ];
    transactions.push(...samples);
  };

  return {
    async listAccounts() {
      ensureDefaultAccount();
      return Array.from(accounts.values());
    },
    async syncTransactions(accountId) {
      ensureDefaultAccount();
      if (!accounts.has(accountId)) {
        accounts.set(accountId, {
          id: accountId,
          name: "Linked Account",
          currency: "EUR",
          provider: "stub",
        });
      }
      seedTransactions(accountId);
      return transactions.filter((txn) => txn.accountId === accountId);
    },
    async listTransactions(accountId) {
      if (!accountId) {
        return [...transactions];
      }
      return transactions.filter((txn) => txn.accountId === accountId);
    },
  };
};

const createStorageService = (): StorageService => {
  const files = new Map<string, StoredFile>();

  return {
    async upload(input) {
      const createdAt = now();
      const id = randomUUID();
      const file: StoredFile = {
        id,
        name: input.name,
        contentType: input.contentType,
        size: input.size ?? 0,
        url: `stub://files/${id}`,
        createdAt,
      };
      files.set(file.id, file);
      return file;
    },
    async get(id) {
      return files.get(id) ?? null;
    },
    async remove(id) {
      return files.delete(id);
    },
    async list() {
      return Array.from(files.values());
    },
  };
};

const createNotificationService = (): NotificationService => {
  const notifications: NotificationMessage[] = [];

  return {
    async send(input) {
      const notification: NotificationMessage = {
        id: randomUUID(),
        createdAt: now(),
        read: input.read ?? false,
        userId: input.userId,
        title: input.title,
        body: input.body,
        type: input.type,
      };
      notifications.unshift(notification);
      return notification;
    },
    async list(userId) {
      if (!userId) {
        return [...notifications];
      }
      return notifications.filter((notification) => notification.userId === userId);
    },
    async markRead(id) {
      const index = notifications.findIndex((notification) => notification.id === id);
      if (index === -1) {
        return null;
      }
      notifications[index] = { ...notifications[index], read: true };
      return notifications[index];
    },
  };
};

const createAuditService = (): AuditService => {
  const events: AuditEvent[] = [];

  return {
    async log(input) {
      const event: AuditEvent = {
        id: randomUUID(),
        createdAt: now(),
        ...input,
      };
      events.unshift(event);
      return event;
    },
    async list() {
      return [...events];
    },
  };
};

const createWebhookService = (): WebhookService => {
  const events: WebhookEvent[] = [];

  return {
    async handle(input) {
      const event: WebhookEvent = {
        id: randomUUID(),
        createdAt: now(),
        ...input,
      };
      events.unshift(event);
      return event;
    },
    async list() {
      return [...events];
    },
  };
};

export const createStubIntegrations = (): BackendIntegrations => ({
  crud: createCrudRegistry(),
  realtime: createRealtimeService(),
  email: createEmailService(),
  banking: createBankingService(),
  storage: createStorageService(),
  notifications: createNotificationService(),
  audit: createAuditService(),
  webhooks: createWebhookService(),
});

let singleton: BackendIntegrations | null = null;

export const getStubIntegrations = (): BackendIntegrations => {
  if (!singleton) {
    singleton = createStubIntegrations();
  }
  return singleton;
};
