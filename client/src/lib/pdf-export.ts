/**
 * PDF Export Service
 * Generates professional PDF documents for quotes and invoices
 */

import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Extend jsPDF type
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable: {
      finalY: number;
    };
  }
}

export interface QuotePDFData {
  quoteNumber: string;
  date: string;
  validUntil: string;
  customer: {
    name: string;
    address?: string;
    postalCode?: string;
    city?: string;
    email?: string;
    phone?: string;
  };
  company: {
    name: string;
    address: string;
    postalCode: string;
    city: string;
    phone: string;
    email: string;
    kvk?: string;
    btw?: string;
  };
  items: Array<{
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    totalPrice: number;
  }>;
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  total: number;
  notes?: string;
  terms?: string[];
}

export interface InvoicePDFData extends QuotePDFData {
  invoiceNumber: string;
  dueDate: string;
  paymentInfo?: {
    iban: string;
    bic?: string;
  };
}

// Default company info (should come from settings)
const DEFAULT_COMPANY = {
  name: 'Archon Pro',
  address: 'Voorbeeldstraat 123',
  postalCode: '1234 AB',
  city: 'Amsterdam',
  phone: '+31 20 123 4567',
  email: 'info@archonpro.com',
  kvk: '12345678',
  btw: 'NL123456789B01',
};

/**
 * Generate Quote PDF
 */
export async function generateQuotePDF(data: QuotePDFData): Promise<Blob> {
  const doc = new jsPDF();
  const company = data.company || DEFAULT_COMPANY;

  // Colors
  const primaryColor: [number, number, number] = [6, 182, 212]; // Cyan
  const darkColor: [number, number, number] = [15, 23, 42];
  const grayColor: [number, number, number] = [100, 116, 139];

  // Header
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(company.name, 20, 20);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('OFFERTE', 20, 30);

  // Company info (right side)
  doc.setFontSize(9);
  const companyInfo = [
    company.address,
    `${company.postalCode} ${company.city}`,
    company.phone,
    company.email,
  ];
  companyInfo.forEach((line, i) => {
    doc.text(line, 210 - 20, 15 + i * 5, { align: 'right' });
  });

  // Quote details
  doc.setTextColor(...darkColor);
  doc.setFontSize(10);
  let yPos = 50;

  doc.setFont('helvetica', 'bold');
  doc.text('Offerte nummer:', 20, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(data.quoteNumber, 70, yPos);

  yPos += 6;
  doc.setFont('helvetica', 'bold');
  doc.text('Datum:', 20, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(data.date, 70, yPos);

  yPos += 6;
  doc.setFont('helvetica', 'bold');
  doc.text('Geldig tot:', 20, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(data.validUntil, 70, yPos);

  // Customer info
  yPos += 15;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Klant', 20, yPos);

  yPos += 6;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(data.customer.name, 20, yPos);

  if (data.customer.address) {
    yPos += 5;
    doc.text(data.customer.address, 20, yPos);
  }

  if (data.customer.postalCode && data.customer.city) {
    yPos += 5;
    doc.text(`${data.customer.postalCode} ${data.customer.city}`, 20, yPos);
  }

  // Items table
  yPos += 15;
  const tableData = data.items.map((item) => [
    item.description,
    item.quantity.toString(),
    item.unit,
    `€ ${item.unitPrice.toFixed(2)}`,
    `€ ${item.totalPrice.toFixed(2)}`,
  ]);

  doc.autoTable({
    startY: yPos,
    head: [['Omschrijving', 'Aantal', 'Eenheid', 'Prijs', 'Totaal']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 10,
    },
    bodyStyles: {
      fontSize: 9,
      textColor: darkColor,
    },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 20, halign: 'right' },
      2: { cellWidth: 25 },
      3: { cellWidth: 30, halign: 'right' },
      4: { cellWidth: 30, halign: 'right' },
    },
    margin: { left: 20, right: 20 },
  });

  // Totals
  yPos = doc.lastAutoTable.finalY + 10;

  const totalsX = 210 - 20 - 60;
  doc.setFontSize(10);

  doc.setFont('helvetica', 'normal');
  doc.text('Subtotaal:', totalsX, yPos);
  doc.text(`€ ${data.subtotal.toFixed(2)}`, totalsX + 50, yPos, { align: 'right' });

  yPos += 6;
  doc.text(`BTW (${data.vatRate}%):`, totalsX, yPos);
  doc.text(`€ ${data.vatAmount.toFixed(2)}`, totalsX + 50, yPos, { align: 'right' });

  yPos += 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Totaal:', totalsX, yPos);
  doc.text(`€ ${data.total.toFixed(2)}`, totalsX + 50, yPos, { align: 'right' });

  // Notes
  if (data.notes) {
    yPos += 15;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Opmerkingen:', 20, yPos);

    yPos += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const splitNotes = doc.splitTextToSize(data.notes, 170);
    doc.text(splitNotes, 20, yPos);
    yPos += splitNotes.length * 5;
  }

  // Terms
  if (data.terms && data.terms.length > 0) {
    yPos += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Voorwaarden:', 20, yPos);

    yPos += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...grayColor);
    data.terms.forEach((term) => {
      doc.text(`• ${term}`, 20, yPos);
      yPos += 4;
    });
  }

  // Footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setFillColor(...primaryColor);
  doc.rect(0, pageHeight - 20, 210, 20, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text(
    `${company.name} | KVK: ${company.kvk || 'N/A'} | BTW: ${company.btw || 'N/A'}`,
    105,
    pageHeight - 10,
    { align: 'center' }
  );

  return doc.output('blob');
}

/**
 * Generate Invoice PDF
 */
export async function generateInvoicePDF(data: InvoicePDFData): Promise<Blob> {
  const doc = new jsPDF();
  const company = data.company || DEFAULT_COMPANY;

  // Colors
  const primaryColor: [number, number, number] = [6, 182, 212];
  const darkColor: [number, number, number] = [15, 23, 42];
  const grayColor: [number, number, number] = [100, 116, 139];

  // Header
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(company.name, 20, 20);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('FACTUUR', 20, 30);

  // Company info
  doc.setFontSize(9);
  const companyInfo = [
    company.address,
    `${company.postalCode} ${company.city}`,
    company.phone,
    company.email,
  ];
  companyInfo.forEach((line, i) => {
    doc.text(line, 210 - 20, 15 + i * 5, { align: 'right' });
  });

  // Invoice details
  doc.setTextColor(...darkColor);
  doc.setFontSize(10);
  let yPos = 50;

  doc.setFont('helvetica', 'bold');
  doc.text('Factuur nummer:', 20, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(data.invoiceNumber, 70, yPos);

  yPos += 6;
  doc.setFont('helvetica', 'bold');
  doc.text('Datum:', 20, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(data.date, 70, yPos);

  yPos += 6;
  doc.setFont('helvetica', 'bold');
  doc.text('Vervaldatum:', 20, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(data.dueDate, 70, yPos);

  // Customer info
  yPos += 15;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Klant', 20, yPos);

  yPos += 6;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(data.customer.name, 20, yPos);

  if (data.customer.address) {
    yPos += 5;
    doc.text(data.customer.address, 20, yPos);
  }

  if (data.customer.postalCode && data.customer.city) {
    yPos += 5;
    doc.text(`${data.customer.postalCode} ${data.customer.city}`, 20, yPos);
  }

  // Items table
  yPos += 15;
  const tableData = data.items.map((item) => [
    item.description,
    item.quantity.toString(),
    item.unit,
    `€ ${item.unitPrice.toFixed(2)}`,
    `€ ${item.totalPrice.toFixed(2)}`,
  ]);

  doc.autoTable({
    startY: yPos,
    head: [['Omschrijving', 'Aantal', 'Eenheid', 'Prijs', 'Totaal']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 10,
    },
    bodyStyles: {
      fontSize: 9,
      textColor: darkColor,
    },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 20, halign: 'right' },
      2: { cellWidth: 25 },
      3: { cellWidth: 30, halign: 'right' },
      4: { cellWidth: 30, halign: 'right' },
    },
    margin: { left: 20, right: 20 },
  });

  // Totals
  yPos = doc.lastAutoTable.finalY + 10;

  const totalsX = 210 - 20 - 60;
  doc.setFontSize(10);

  doc.setFont('helvetica', 'normal');
  doc.text('Subtotaal:', totalsX, yPos);
  doc.text(`€ ${data.subtotal.toFixed(2)}`, totalsX + 50, yPos, { align: 'right' });

  yPos += 6;
  doc.text(`BTW (${data.vatRate}%):`, totalsX, yPos);
  doc.text(`€ ${data.vatAmount.toFixed(2)}`, totalsX + 50, yPos, { align: 'right' });

  yPos += 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Totaal:', totalsX, yPos);
  doc.text(`€ ${data.total.toFixed(2)}`, totalsX + 50, yPos, { align: 'right' });

  // Payment info
  if (data.paymentInfo) {
    yPos += 15;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Betaalinformatie:', 20, yPos);

    yPos += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`IBAN: ${data.paymentInfo.iban}`, 20, yPos);

    if (data.paymentInfo.bic) {
      yPos += 5;
      doc.text(`BIC: ${data.paymentInfo.bic}`, 20, yPos);
    }

    yPos += 5;
    doc.text(`Onder vermelding van: ${data.invoiceNumber}`, 20, yPos);
  }

  // Notes
  if (data.notes) {
    yPos += 15;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Opmerkingen:', 20, yPos);

    yPos += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const splitNotes = doc.splitTextToSize(data.notes, 170);
    doc.text(splitNotes, 20, yPos);
  }

  // Footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setFillColor(...primaryColor);
  doc.rect(0, pageHeight - 20, 210, 20, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text(
    `${company.name} | KVK: ${company.kvk || 'N/A'} | BTW: ${company.btw || 'N/A'}`,
    105,
    pageHeight - 10,
    { align: 'center' }
  );

  return doc.output('blob');
}

/**
 * Download PDF
 */
export function downloadPDF(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Helper: Generate quote PDF and download
 */
export async function exportQuotePDF(data: QuotePDFData): Promise<void> {
  const blob = await generateQuotePDF(data);
  downloadPDF(blob, `Offerte-${data.quoteNumber}.pdf`);
}

/**
 * Helper: Generate invoice PDF and download
 */
export async function exportInvoicePDF(data: InvoicePDFData): Promise<void> {
  const blob = await generateInvoicePDF(data);
  downloadPDF(blob, `Factuur-${data.invoiceNumber}.pdf`);
}
