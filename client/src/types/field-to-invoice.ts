/**
 * Field-to-Invoice Workflow Types
 * Mobile-first field-to-invoice workflow similar to Renalto
 */

// Enums
export type SiteStatus = 'planning' | 'active' | 'completed' | 'cancelled';
export type MediaLabel = 'binnen' | 'buiten' | 'detail' | 'schade' | 'overzicht';
export type QuoteLineSource = 'manual' | 'ai_suggested';
export type ModifierRuleType = 'add' | 'percent' | 'multiply';
export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'cancelled';
export type AuditActorType = 'user' | 'ai';
export type AuditAction =
  | 'approve_quote'
  | 'create_invoice'
  | 'update_totals'
  | 'ai_suggestion_apply'
  | 'ai_suggestion_remove'
  | 'create_draft'
  | 'update_draft';

export type QuoteStatus = 'draft' | 'ready' | 'approved' | 'sent' | 'archived';
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue';
export type PricebookStatus = 'draft' | 'active' | 'archived';

// Site (Werf/Locatie)
export interface Site {
  id: string;
  user_id: string;
  klant_id?: string;
  naam: string;
  adres?: string;
  postcode?: string;
  plaats?: string;
  type: string; // e.g., "Nieuwbouw", "Renovatie", "Onderhoud"
  urgentie: boolean;
  gewenste_datum?: string;
  status: SiteStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateSiteRequest {
  klant_id?: string;
  naam: string;
  adres?: string;
  postcode?: string;
  plaats?: string;
  type: string;
  urgentie?: boolean;
  gewenste_datum?: string;
  notes?: string;
}

// Measurement Item (Template)
export interface MeasurementItem {
  id: string;
  user_id: string;
  site_id: string;
  type: string; // e.g., "Raam", "Deur", "Vloer"
  template: boolean; // "Most chosen" template
  options: Record<string, any>; // e.g., {"glas": "dubbel", "kleur": "helder"}
  created_at: string;
  updated_at: string;
}

export interface CreateMeasurementItemRequest {
  site_id: string;
  type: string;
  template?: boolean;
  options?: Record<string, any>;
}

// Site Measurement
export interface SiteMeasurement {
  id: string;
  user_id: string;
  site_id: string;
  measurement_item_id: string;
  breedte: number; // width
  hoogte: number; // height
  aantal: number; // quantity
  notities?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateSiteMeasurementRequest {
  site_id: string;
  measurement_item_id: string;
  breedte: number;
  hoogte: number;
  aantal?: number;
  notities?: string;
}

// Media Asset
export interface MediaAsset {
  id: string;
  user_id: string;
  site_id: string;
  measurement_id?: string;
  label: MediaLabel;
  mime_type: string;
  file_name: string;
  storage_path: string;
  file_size?: number;
  width?: number;
  height?: number;
  created_at: string;
}

export interface CreateMediaAssetRequest {
  site_id: string;
  measurement_id?: string;
  label: MediaLabel;
  file: File;
}

// Price Book
export interface PriceBook {
  id: string;
  user_id: string;
  name: string;
  version: number;
  status: PricebookStatus;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePriceBookRequest {
  name: string;
  version?: number;
  status?: PricebookStatus;
  currency?: string;
}

// Price Item
export interface PriceItem {
  id: string;
  user_id: string;
  price_book_id: string;
  sku: string;
  naam: string;
  categorie?: string;
  eenheid: string; // e.g., "stuk", "m2", "meter"
  basisprijs: number;
  btw_tarief: number; // VAT rate
  actief: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreatePriceItemRequest {
  price_book_id: string;
  sku: string;
  naam: string;
  categorie?: string;
  eenheid: string;
  basisprijs: number;
  btw_tarief?: number;
  actief?: boolean;
}

// Price Modifier
export interface PriceModifier {
  id: string;
  user_id: string;
  price_item_id: string;
  naam: string;
  regel_type: ModifierRuleType;
  waarde: number;
  created_at: string;
}

export interface CreatePriceModifierRequest {
  price_item_id: string;
  naam: string;
  regel_type: ModifierRuleType;
  waarde: number;
}

// Quote (Offerte) - Enhanced
export interface Quote {
  id: string;
  user_id: string;
  site_id?: string;
  nummer: string;
  status: QuoteStatus;
  titel?: string;
  beschrijving?: string;
  aannames: string[]; // Assumptions
  vragen: string[]; // Open questions
  subtotaal: number;
  btw_bedrag: number;
  totaal: number;
  created_at: string;
  updated_at: string;
}

export interface CreateQuoteRequest {
  site_id?: string;
  titel?: string;
  beschrijving?: string;
}

// Quote Line
export interface QuoteLine {
  id: string;
  user_id: string;
  quote_id: string;
  sku?: string; // Optional - links to PriceItem
  beschrijving: string;
  aantal: number;
  eenheid: string;
  eenheidsprijs: number;
  btw_tarief: number;
  source: QuoteLineSource;
  confidence?: number; // AI confidence score (0-100)
  reden?: string; // AI reasoning
  created_at: string;
}

export interface CreateQuoteLineRequest {
  quote_id: string;
  sku?: string;
  beschrijving: string;
  aantal: number;
  eenheid: string;
  eenheidsprijs: number;
  btw_tarief?: number;
  source?: QuoteLineSource;
  confidence?: number;
  reden?: string;
}

// Approval
export interface Approval {
  id: string;
  user_id: string;
  quote_id: string;
  approved_by: string;
  approved_at: string;
  snapshot_hash: string;
  created_at: string;
}

// Invoice (Factuur) - Enhanced
export interface Invoice {
  id: string;
  user_id: string;
  quote_id?: string;
  klant_id?: string;
  nummer: string; // Per-tenant numbering
  datum: string;
  vervaldatum: string;
  subtotaal: number;
  btw_bedrag: number;
  totaal: number;
  status: InvoiceStatus;
  betaald_datum?: string;
  regels: any[]; // InvoiceLine[]
  created_at: string;
  updated_at: string;
}

export interface CreateInvoiceRequest {
  quote_id: string;
  klant_id?: string;
  datum: string;
  vervaldatum: string;
}

// Project (Project) - Enhanced
export interface ProjectEnhanced {
  id: string;
  user_id: string;
  site_id?: string;
  quote_id?: string;
  naam: string;
  status: string;
  voortgang: number;
  start_datum?: string;
  eind_datum?: string;
  budget: number;
  uitgegeven: number;
  fases: ProjectPhase[];
  created_at: string;
  updated_at: string;
}

export interface ProjectPhase {
  naam: string;
  status: 'planning' | 'in_progress' | 'completed';
  start?: string;
  eind?: string;
}

export interface CreateProjectFromQuoteRequest {
  quote_id: string;
  start_datum?: string;
  eind_datum?: string;
}

// Task
export interface Task {
  id: string;
  user_id: string;
  project_id: string;
  titel: string;
  beschrijving?: string;
  vervaldatum?: string;
  status: TaskStatus;
  voltooid_op?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskRequest {
  project_id: string;
  titel: string;
  beschrijving?: string;
  vervaldatum?: string;
}

// Audit Log
export interface AuditLog {
  id: string;
  user_id: string;
  actor_type: AuditActorType;
  action: AuditAction;
  entity_type: string; // e.g., "quote", "invoice"
  entity_id: string;
  before_state?: any;
  after_state?: any;
  timestamp: string;
}

// AI Tool Responses
export interface SearchPriceItemsResponse {
  matches: Array<{
    sku: string;
    naam: string;
    categorie?: string;
    eenheid: string;
    basisprijs: number;
    btw_tarief: number;
    confidence?: number;
  }>;
}

export interface DraftScopeFromTranscriptResponse {
  scope_text: string;
  aannames: string[];
  vragen: string[];
}

export interface SummarizeMediaResponse {
  summary: string;
  missing_data: string[];
}

export interface ProposeQuoteLinesResponse {
  suggestions: Array<{
    sku?: string;
    beschrijving: string;
    aantal: number;
    eenheid: string;
    eenheidsprijs: number;
    btw_tarief: number;
    confidence: number;
    reden: string;
  }>;
}

export interface RecommendNextActionsResponse {
  actions: Array<{
    id: string;
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    href?: string;
    rationale: string;
  }>;
}

// Wizard Draft State
export interface WizardDraft {
  step: number; // Current step (1-6)
  site?: Partial<Site>;
  measurements?: SiteMeasurement[];
  mediaAssets?: MediaAsset[];
  transcript?: string;
  scopeText?: string;
  quoteLines?: QuoteLine[];
  quoteId?: string;
  lastSavedAt?: number;
}

// Price Book Upload
export interface PriceBookUpload {
  file: File;
  name: string;
  version?: number;
}

export interface PriceBookColumnMapping {
  sku?: string;
  naam?: string;
  categorie?: string;
  eenheid?: string;
  basisprijs?: string;
  btw_tarief?: string;
}

export interface PriceBookValidationResult {
  valid: boolean;
  errors: Array<{
    row: number;
    field: string;
    message: string;
  }>;
  preview?: Array<{
    sku: string;
    naam: string;
    categorie?: string;
    eenheid: string;
    basisprijs: number;
    btw_tarief: number;
  }>;
}
