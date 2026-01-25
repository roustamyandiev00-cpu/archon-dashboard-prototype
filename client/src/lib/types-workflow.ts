// Workflow types for Supabase
export type OfferteStatus = 'concept' | 'verzonden' | 'bekeken' | 'onderhandelen' | 'geaccepteerd' | 'verlopen' | 'afgewezen' | 'verloren';

export interface OfferteItem {
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    total: number;
    vatRate: number; // e.g., 21
}

export interface Offerte {
    id: string;
    number: string;
    clientId: string;
    clientName: string;
    projectDescription: string;

    // Financials
    items: OfferteItem[];
    totalExcl: number;
    totalVat: number;
    totalIncl: number;
    currency: string;

    // Dates
    date: string; // ISO date
    validUntil: string; // ISO date

    // Status & Workflow
    status: OfferteStatus;
    statusHistory: Array<{
        status: OfferteStatus;
        changedBy: string;
        changedAt: string; // ISO datetime
        reason?: string;
    }>;

    // AI Metadata
    aiGenerated: boolean;
    aiRationale?: string;
    winProbability?: number; // 0-100

    // Audit
    createdAt: string;
    updatedAt: string;
    createdBy: string;
}

export interface ActivityLog {
    id: string;
    entityId: string; // Offerte ID, Project ID, etc.
    entityType: 'offerte' | 'factuur' | 'project';
    action: string; // e.g., 'created', 'sent', 'viewed'
    performer: string; // User ID or 'system' or 'ai'
    timestamp: string;
    details?: Record<string, any>;
    aiConfidence?: number;
}
