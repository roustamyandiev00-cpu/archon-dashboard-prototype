import { Project, Client, Invoice } from "@shared/schema";

// Interface for Data Persistence
export interface IStorage {
  // Users
  getUser(uid: string): Promise<any | undefined>;
  
  // Projects
  getProjects(userId: string): Promise<Project[]>;
  getProject(id: string): Promise<Project | undefined>;
  createProject(userId: string, project: Project): Promise<Project>;
  updateProject(id: string, project: Partial<Project>): Promise<Project>;
  deleteProject(id: string): Promise<void>;

  // Clients
  getClients(userId: string): Promise<Client[]>;
  getClient(id: string): Promise<Client | undefined>;
  createClient(userId: string, client: Client): Promise<Client>;
  
  // Invoices
  getInvoices(userId: string): Promise<Invoice[]>;
  createInvoice(userId: string, invoice: Invoice): Promise<Invoice>;
}

export class MemStorage implements IStorage {
  private projects: Map<string, Project>;
  private clients: Map<string, Client>;
  private invoices: Map<string, Invoice>;

  constructor() {
    this.projects = new Map();
    this.clients = new Map();
    this.invoices = new Map();
  }

  async getUser(uid: string): Promise<any> {
    return { uid, email: "demo@archon.ai", role: "admin" };
  }

  async getProjects(userId: string): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(p => p.userId === userId);
  }

  async getProject(id: string): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async createProject(userId: string, project: Project): Promise<Project> {
    const newProject = { ...project, userId };
    this.projects.set(project.id, newProject);
    return newProject;
  }

  async updateProject(id: string, project: Partial<Project>): Promise<Project> {
    const existing = this.projects.get(id);
    if (!existing) throw new Error("Project not found");
    const updated = { ...existing, ...project };
    this.projects.set(id, updated);
    return updated;
  }

  async deleteProject(id: string): Promise<void> {
    this.projects.delete(id);
  }

  async getClients(userId: string): Promise<Client[]> {
    return Array.from(this.clients.values()).filter(c => c.userId === userId);
  }

  async getClient(id: string): Promise<Client | undefined> {
    return this.clients.get(id);
  }

  async createClient(userId: string, client: Client): Promise<Client> {
    const newClient = { ...client, userId };
    this.clients.set(client.id, newClient);
    return newClient;
  }

  async getInvoices(userId: string): Promise<Invoice[]> {
    return Array.from(this.invoices.values()).filter(i => i.userId === userId);
  }

  async createInvoice(userId: string, invoice: Invoice): Promise<Invoice> {
    const newInvoice = { ...invoice, userId };
    this.invoices.set(invoice.id, newInvoice);
    return newInvoice;
  }
}

export const storage = new MemStorage();
