import { z } from "zod";

// Shared Type Definitions for ArchonPro

// Enums
export const UserRole = {
  ADMIN: "admin",
  EMPLOYEE: "employee",
  VIEWER: "viewer",
} as const;

export const ProjectStatus = {
  PLANNING: "Planning",
  ACTIVE: "Actief",
  COMPLETED: "Afgerond",
  ON_HOLD: "On Hold",
} as const;

export const InvoiceStatus = {
  DRAFT: "draft",
  SENT: "openstaand",
  PAID: "betaald",
  OVERDUE: "overtijd",
} as const;

// Zod Schemas for Runtime Validation & Type Inference

export const UserSchema = z.object({
  uid: z.string(),
  email: z.string().email(),
  displayName: z.string().optional(),
  role: z.nativeEnum(UserRole).default(UserRole.ADMIN),
  companyId: z.string().optional(),
  createdAt: z.date().or(z.string()),
});

export const ClientSchema = z.object({
  id: z.string(),
  userId: z.string(), // Link to the user who owns this client
  name: z.string(),
  company: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  type: z.enum(["zakelijk", "particulier"]),
  status: z.enum(["actief", "inactief"]),
  avatar: z.string().optional(),
  createdAt: z.date().or(z.string()).optional(),
});

export const MilestoneSchema = z.object({
  id: z.string(),
  name: z.string(),
  amount: z.number(),
  dueDate: z.string(),
  status: z.enum(["open", "verzonden", "betaald"]),
  percentage: z.number(),
});

export const ProjectSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  clientId: z.string(),
  clientName: z.string(), // Denormalized for display
  location: z.string().optional(),
  budget: z.number(),
  spent: z.number().default(0),
  status: z.nativeEnum(ProjectStatus),
  progress: z.number().default(0),
  deadline: z.string().optional(),
  image: z.string().optional(),
  paymentMilestones: z.array(MilestoneSchema).optional(),
});

export const InvoiceSchema = z.object({
  id: z.string(),
  userId: z.string(),
  number: z.string(),
  clientId: z.string(),
  clientName: z.string(),
  amount: z.number(),
  date: z.string(),
  dueDate: z.string(),
  status: z.nativeEnum(InvoiceStatus),
  items: z.array(z.any()).optional(), // Detailed items would go here
});

// TypeScript Types derived from Zod Schemas
export type User = z.infer<typeof UserSchema>;
export type Client = z.infer<typeof ClientSchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type Invoice = z.infer<typeof InvoiceSchema>;
export type Milestone = z.infer<typeof MilestoneSchema>;
