export type JsonRecord = Record<string, unknown>;

export interface CrudEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

export type CrudCreateInput<T extends CrudEntity> = Omit<T, "id" | "createdAt" | "updatedAt">;
export type CrudUpdateInput<T extends CrudEntity> = Partial<Omit<T, "id" | "createdAt" | "updatedAt">>;

export interface CrudService<T extends CrudEntity> {
  list(): Promise<T[]>;
  get(id: string): Promise<T | null>;
  create(input: CrudCreateInput<T>): Promise<T>;
  update(id: string, input: CrudUpdateInput<T>): Promise<T | null>;
  remove(id: string): Promise<boolean>;
}

export interface CrudRegistry {
  resource<T extends CrudEntity = CrudEntity>(name: string): CrudService<T>;
}

export interface RealtimeEvent<T = unknown> {
  id: string;
  channel: string;
  type: string;
  payload: T;
  createdAt: string;
}

export interface RealtimeService {
  publish<T = unknown>(event: Omit<RealtimeEvent<T>, "id" | "createdAt">): Promise<RealtimeEvent<T>>;
  subscribe<T = unknown>(channel: string, handler: (event: RealtimeEvent<T>) => void): () => void;
  listRecent(channel?: string): Promise<RealtimeEvent[]>;
}

export interface EmailMessage {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  from?: string;
  cc?: string | string[];
  bcc?: string | string[];
}

export interface EmailSendResult {
  id: string;
  status: "queued" | "sent";
  provider: string;
}

export interface EmailMessageLog extends EmailSendResult {
  message: EmailMessage;
  createdAt: string;
}

export interface EmailService {
  send(message: EmailMessage): Promise<EmailSendResult>;
  list(): Promise<EmailMessageLog[]>;
}

export interface BankAccount {
  id: string;
  name: string;
  currency: string;
  provider: string;
}

export interface BankTransaction {
  id: string;
  accountId: string;
  amount: number;
  currency: string;
  description: string;
  date: string;
  status: "pending" | "posted";
}

export interface BankingService {
  listAccounts(): Promise<BankAccount[]>;
  syncTransactions(accountId: string): Promise<BankTransaction[]>;
  listTransactions(accountId?: string): Promise<BankTransaction[]>;
}

export interface StoredFile {
  id: string;
  name: string;
  contentType?: string;
  size: number;
  url: string;
  createdAt: string;
}

export interface StorageUploadInput {
  name: string;
  contentType?: string;
  size?: number;
}

export interface StorageService {
  upload(input: StorageUploadInput): Promise<StoredFile>;
  get(id: string): Promise<StoredFile | null>;
  remove(id: string): Promise<boolean>;
  list(): Promise<StoredFile[]>;
}

export interface NotificationMessage {
  id: string;
  userId?: string;
  title: string;
  body?: string;
  type?: string;
  createdAt: string;
  read: boolean;
}

export interface NotificationService {
  send(
    input: Omit<NotificationMessage, "id" | "createdAt" | "read"> & { read?: boolean }
  ): Promise<NotificationMessage>;
  list(userId?: string): Promise<NotificationMessage[]>;
  markRead(id: string): Promise<NotificationMessage | null>;
}

export interface AuditEvent {
  id: string;
  actorId?: string;
  action: string;
  entity?: string;
  entityId?: string;
  metadata?: JsonRecord;
  createdAt: string;
}

export interface AuditService {
  log(input: Omit<AuditEvent, "id" | "createdAt">): Promise<AuditEvent>;
  list(): Promise<AuditEvent[]>;
}

export interface WebhookEvent {
  id: string;
  provider: string;
  type: string;
  payload: JsonRecord;
  createdAt: string;
}

export interface WebhookService {
  handle(input: Omit<WebhookEvent, "id" | "createdAt">): Promise<WebhookEvent>;
  list(): Promise<WebhookEvent[]>;
}

export interface BackendIntegrations {
  crud: CrudRegistry;
  realtime: RealtimeService;
  email: EmailService;
  banking: BankingService;
  storage: StorageService;
  notifications: NotificationService;
  audit: AuditService;
  webhooks: WebhookService;
}
