import { supabase } from "@/lib/supabase";

const API_BASE = '/api';

async function getAuthHeaders(): Promise<HeadersInit> {
    const isDemoMode = import.meta.env.VITE_DEMO_MODE === "true";
    
    if (isDemoMode) {
        // In demo mode, return mock headers
        return {
            Authorization: `Bearer demo-token`,
            'Content-Type': 'application/json',
        };
    }
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
        throw new Error("Not authenticated");
    }
    
    return {
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
    };
}

/**
 * Download a PDF for an offerte
 */
export async function downloadOffertePdf(offerteId: string, offerteNummer?: string): Promise<void> {
    const isDemoMode = import.meta.env.VITE_DEMO_MODE === "true";
    
    if (isDemoMode) {
        // In demo mode, simulate PDF download
        console.log("🧪 Demo mode: Simulating PDF download for offerte", offerteId);
        
        // Create a mock PDF blob
        const mockPdfContent = `Mock PDF content for offerte ${offerteNummer || offerteId}`;
        const blob = new Blob([mockPdfContent], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `offerte-${offerteNummer || offerteId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) throw new Error("Not authenticated");

    const response = await fetch(`${API_BASE}/offertes/pdf?id=${offerteId}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
    });

    if (!response.ok) {
        throw new Error("Failed to generate PDF");
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `offerte-${offerteNummer || offerteId}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}

/**
 * Download a PDF for a factuur
 */
export async function downloadFactuurPdf(factuurId: string, factuurNummer?: string): Promise<void> {
    const isDemoMode = import.meta.env.VITE_DEMO_MODE === "true";
    
    if (isDemoMode) {
        // In demo mode, simulate PDF download
        console.log("🧪 Demo mode: Simulating PDF download for factuur", factuurId);
        
        // Create a mock PDF blob
        const mockPdfContent = `Mock PDF content for factuur ${factuurNummer || factuurId}`;
        const blob = new Blob([mockPdfContent], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `factuur-${factuurNummer || factuurId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) throw new Error("Not authenticated");

    const response = await fetch(`${API_BASE}/facturen/pdf?id=${factuurId}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
    });

    if (!response.ok) {
        throw new Error("Failed to generate PDF");
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `factuur-${factuurNummer || factuurId}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}

interface SendDocumentOptions {
    type: 'offerte' | 'factuur' | 'reminder';
    documentId: string;
    recipientEmail: string;
    recipientName?: string;
}

interface SendResult {
    success: boolean;
    id?: string;
    status: string;
    provider: string;
    message: string;
}

/**
 * Send an offerte or factuur via email
 */
export async function sendDocumentEmail(options: SendDocumentOptions): Promise<SendResult> {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_BASE}/email/send-document`, {
        method: 'POST',
        headers,
        body: JSON.stringify(options),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to send email");
    }

    return response.json();
}

/**
 * Send offerte email
 */
export async function sendOfferteEmail(
    offerteId: string,
    recipientEmail: string,
    recipientName?: string
): Promise<SendResult> {
    return sendDocumentEmail({
        type: 'offerte',
        documentId: offerteId,
        recipientEmail,
        recipientName,
    });
}

/**
 * Send factuur email
 */
export async function sendFactuurEmail(
    factuurId: string,
    recipientEmail: string,
    recipientName?: string
): Promise<SendResult> {
    return sendDocumentEmail({
        type: 'factuur',
        documentId: factuurId,
        recipientEmail,
        recipientName,
    });
}

/**
 * Send payment reminder email
 */
export async function sendReminderEmail(
    factuurId: string,
    recipientEmail: string,
    recipientName?: string
): Promise<SendResult> {
    return sendDocumentEmail({
        type: 'reminder',
        documentId: factuurId,
        recipientEmail,
        recipientName,
    });
}
