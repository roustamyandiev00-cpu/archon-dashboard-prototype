/**
 * Field-to-Invoice API Client
 * Real-time Supabase integration for mobile field-to-invoice workflow
 * 
 * Features:
 * - Draft session management with autosave
 * - Media upload with Supabase Storage
 * - PriceBook import and search
 * - Quote approval with snapshot
 * - Invoice generation with tenant numbering
 * - Project auto-creation
 * - AI service integration
 * - Audit logging
 */

import { supabase } from './supabase'
import { toast } from 'sonner'
import type { User } from '@supabase/supabase-js'
import type {
  DraftSession,
  Site,
  SiteMeasurement,
  MeasurementItem,
  MediaAsset,
  PriceBook,
  PriceItem,
  PriceModifier,
  Quote,
  QuoteLine,
  Approval,
  Invoice,
  Project,
  Task,
  AuditLog
} from '@/types/field-to-invoice'

// ===== HELPER FUNCTIONS =====

const getCurrentUser = async (): Promise<User> => {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    throw new Error('Not authenticated')
  }
  return user
}

const getCurrentTenant = async (): Promise<string> => {
  const user = await getCurrentUser()
  // Assuming tenant_id is in user metadata or a separate query
  // For now, use user.id as tenant_id
  return user.id
}

const toCamelCase = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(toCamelCase)
  } else if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((result, key) => {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
      result[camelKey] = toCamelCase(obj[key])
      return result
    }, {} as any)
  }
  return obj
}

const toSnakeCase = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(toSnakeCase)
  } else if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((result, key) => {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
      result[snakeKey] = toSnakeCase(obj[key])
      return result
    }, {} as any)
  }
  return obj
}

// ===== DRAFT SESSIONS =====

export interface DraftSessionPayload {
  step1?: { customerId?: string; newCustomer?: any }
  step2?: { siteId?: string; newSite?: any }
  step3?: { measurements: SiteMeasurement[] }
  step4?: { mediaAssets: MediaAsset[] }
  step5?: { description: string; transcript?: string; aiSummary?: string }
  step6?: { quoteLines: QuoteLine[]; totalAmount: number }
}

export async function createDraftSession(
  currentStep: number,
  payload: DraftSessionPayload
): Promise<DraftSession> {
  const user = await getCurrentUser()
  const tenantId = await getCurrentTenant()

  const { data, error } = await supabase
    .from('draft_sessions')
    .insert({
      user_id: user.id,
      tenant_id: tenantId,
      current_step: currentStep,
      payload_json: payload
    })
    .select()
    .single()

  if (error) throw error
  return toCamelCase(data) as DraftSession
}

export async function updateDraftSession(
  sessionId: string,
  currentStep: number,
  payload: DraftSessionPayload
): Promise<DraftSession> {
  const user = await getCurrentUser()

  const { data, error } = await supabase
    .from('draft_sessions')
    .update({
      current_step: currentStep,
      payload_json: payload,
      updated_at: new Date().toISOString()
    })
    .eq('id', sessionId)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  return toCamelCase(data) as DraftSession
}

export async function getDraftSession(sessionId: string): Promise<DraftSession | null> {
  const user = await getCurrentUser()

  const { data, error } = await supabase
    .from('draft_sessions')
    .select('*')
    .eq('id', sessionId)
    .eq('user_id', user.id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // Not found
    throw error
  }
  return toCamelCase(data) as DraftSession
}

export async function getActiveDraftSessions(): Promise<DraftSession[]> {
  const user = await getCurrentUser()

  const { data, error } = await supabase
    .from('draft_sessions')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  if (error) throw error
  return (data || []).map(toCamelCase) as DraftSession[]
}

export async function deleteDraftSession(sessionId: string): Promise<void> {
  const user = await getCurrentUser()

  const { error } = await supabase
    .from('draft_sessions')
    .delete()
    .eq('id', sessionId)
    .eq('user_id', user.id)

  if (error) throw error
}

// ===== SITES =====

export async function createSite(siteData: Omit<Site, 'id' | 'createdAt' | 'updatedAt'>): Promise<Site> {
  const user = await getCurrentUser()
  const tenantId = await getCurrentTenant()
  const snakeCaseData = toSnakeCase(siteData)

  const { data, error } = await supabase
    .from('sites')
    .insert({
      ...snakeCaseData,
      user_id: user.id,
      tenant_id: tenantId
    })
    .select()
    .single()

  if (error) throw error
  return toCamelCase(data) as Site
}

export async function getSites(customerId?: string): Promise<Site[]> {
  const user = await getCurrentUser()

  let query = supabase
    .from('sites')
    .select('*')
    .eq('user_id', user.id)

  if (customerId) {
    query = query.eq('customer_id', customerId)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) throw error
  return (data || []).map(toCamelCase) as Site[]
}

export async function getSite(siteId: string): Promise<Site | null> {
  const user = await getCurrentUser()

  const { data, error } = await supabase
    .from('sites')
    .select('*')
    .eq('id', siteId)
    .eq('user_id', user.id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return toCamelCase(data) as Site
}

export async function updateSite(siteId: string, siteData: Partial<Site>): Promise<Site> {
  const user = await getCurrentUser()
  const snakeCaseData = toSnakeCase(siteData)

  const { data, error } = await supabase
    .from('sites')
    .update(snakeCaseData)
    .eq('id', siteId)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  return toCamelCase(data) as Site
}

// ===== MEASUREMENTS =====

export async function createMeasurementItem(
  itemData: Omit<MeasurementItem, 'id' | 'createdAt' | 'updatedAt'>
): Promise<MeasurementItem> {
  const user = await getCurrentUser()
  const tenantId = await getCurrentTenant()
  const snakeCaseData = toSnakeCase(itemData)

  const { data, error } = await supabase
    .from('measurement_items')
    .insert({
      ...snakeCaseData,
      user_id: user.id,
      tenant_id: tenantId
    })
    .select()
    .single()

  if (error) throw error
  return toCamelCase(data) as MeasurementItem
}

export async function getMeasurementItems(workType?: string): Promise<MeasurementItem[]> {
  const user = await getCurrentUser()

  let query = supabase
    .from('measurement_items')
    .select('*')
    .eq('user_id', user.id)

  if (workType) {
    query = query.eq('work_type', workType)
  }

  const { data, error } = await query.order('sort_order', { ascending: true })

  if (error) throw error
  return (data || []).map(toCamelCase) as MeasurementItem[]
}

export async function createSiteMeasurements(
  measurements: Omit<SiteMeasurement, 'id' | 'createdAt' | 'updatedAt'>[]
): Promise<SiteMeasurement[]> {
  const user = await getCurrentUser()
  const snakeCaseData = measurements.map(toSnakeCase)

  const { data, error } = await supabase
    .from('site_measurements')
    .insert(snakeCaseData)
    .select()

  if (error) throw error
  return (data || []).map(toCamelCase) as SiteMeasurement[]
}

export async function getSiteMeasurements(siteId: string): Promise<SiteMeasurement[]> {
  const { data, error } = await supabase
    .from('site_measurements')
    .select('*')
    .eq('site_id', siteId)

  if (error) throw error
  return (data || []).map(toCamelCase) as SiteMeasurement[]
}

// ===== MEDIA ASSETS =====

export async function getUploadUrl(fileName: string, contentType: string): Promise<{ url: string; path: string }> {
  const user = await getCurrentUser()
  const tenantId = await getCurrentTenant()
  const timestamp = Date.now()
  const path = `${tenantId}/${user.id}/${timestamp}-${fileName}`

  const { data, error } = await supabase
    .storage
    .from('field-to-invoice-media')
    .createSignedUploadUrl(path, {
      upsert: false
    })

  if (error) throw error

  return {
    url: data.signedUrl,
    path
  }
}

export async function uploadMedia(
  file: File,
  labels?: string[]
): Promise<MediaAsset> {
  const user = await getCurrentUser()
  const tenantId = await getCurrentTenant()
  const timestamp = Date.now()
  const path = `${tenantId}/${user.id}/${timestamp}-${file.name}`

  // Upload file
  const { data: uploadData, error: uploadError } = await supabase
    .storage
    .from('field-to-invoice-media')
    .upload(path, file, {
      contentType: file.type,
      upsert: false
    })

  if (uploadError) throw uploadError

  // Get public URL
  const { data: { publicUrl } } = supabase
    .storage
    .from('field-to-invoice-media')
    .getPublicUrl(path)

  // Create media asset record
  const { data, error } = await supabase
    .from('media_assets')
    .insert({
      user_id: user.id,
      tenant_id: tenantId,
      storage_path: path,
      public_url: publicUrl,
      mime_type: file.type,
      file_size: file.size,
      labels: labels || []
    })
    .select()
    .single()

  if (error) throw error
  return toCamelCase(data) as MediaAsset
}

export async function getMediaAssets(siteId?: string): Promise<MediaAsset[]> {
  const user = await getCurrentUser()

  let query = supabase
    .from('media_assets')
    .select('*')
    .eq('user_id', user.id)

  if (siteId) {
    query = query.eq('site_id', siteId)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) throw error
  return (data || []).map(toCamelCase) as MediaAsset[]
}

export async function updateMediaAsset(
  assetId: string,
  updates: Partial<Pick<MediaAsset, 'labels' | 'description'>>
): Promise<MediaAsset> {
  const user = await getCurrentUser()
  const snakeCaseData = toSnakeCase(updates)

  const { data, error } = await supabase
    .from('media_assets')
    .update(snakeCaseData)
    .eq('id', assetId)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  return toCamelCase(data) as MediaAsset
}

export async function deleteMediaAsset(assetId: string): Promise<void> {
  const user = await getCurrentUser()

  // Get asset info first
  const { data: asset } = await supabase
    .from('media_assets')
    .select('storage_path')
    .eq('id', assetId)
    .eq('user_id', user.id)
    .single()

  if (!asset) throw new Error('Asset not found')

  // Delete from storage
  const { error: storageError } = await supabase
    .storage
    .from('field-to-invoice-media')
    .remove([asset.storage_path])

  if (storageError) throw storageError

  // Delete record
  const { error } = await supabase
    .from('media_assets')
    .delete()
    .eq('id', assetId)
    .eq('user_id', user.id)

  if (error) throw error
}

// ===== PRICE BOOK =====

export async function createPriceBook(
  priceBookData: Omit<PriceBook, 'id' | 'createdAt' | 'updatedAt'>
): Promise<PriceBook> {
  const user = await getCurrentUser()
  const tenantId = await getCurrentTenant()
  const snakeCaseData = toSnakeCase(priceBookData)

  const { data, error } = await supabase
    .from('price_books')
    .insert({
      ...snakeCaseData,
      user_id: user.id,
      tenant_id: tenantId
    })
    .select()
    .single()

  if (error) throw error
  return toCamelCase(data) as PriceBook
}

export async function getPriceBooks(): Promise<PriceBook[]> {
  const user = await getCurrentUser()

  const { data, error } = await supabase
    .from('price_books')
    .select('*')
    .eq('user_id', user.id)
    .order('version', { ascending: false })

  if (error) throw error
  return (data || []).map(toCamelCase) as PriceBook[]
}

export async function getActivePriceBook(): Promise<PriceBook | null> {
  const user = await getCurrentUser()

  const { data, error } = await supabase
    .from('price_books')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return toCamelCase(data) as PriceBook
}

export async function createPriceItems(
  items: Omit<PriceItem, 'id' | 'createdAt' | 'updatedAt'>[]
): Promise<PriceItem[]> {
  const snakeCaseData = items.map(toSnakeCase)

  const { data, error } = await supabase
    .from('price_items')
    .insert(snakeCaseData)
    .select()

  if (error) throw error
  return (data || []).map(toCamelCase) as PriceItem[]
}

export async function getPriceItems(priceBookId?: string): Promise<PriceItem[]> {
  const user = await getCurrentUser()

  let query = supabase
    .from('price_items')
    .select('*')
    .eq('user_id', user.id)

  if (priceBookId) {
    query = query.eq('price_book_id', priceBookId)
  }

  const { data, error } = await query.order('name', { ascending: true })

  if (error) throw error
  return (data || []).map(toCamelCase) as PriceItem[]
}

export async function searchPriceItems(
  query: string,
  priceBookId?: string
): Promise<PriceItem[]> {
  const user = await getCurrentUser()

  let dbQuery = supabase
    .from('price_items')
    .select('*')
    .eq('user_id', user.id)

  if (priceBookId) {
    dbQuery = dbQuery.eq('price_book_id', priceBookId)
  }

  // Text search on name, description, sku, category
  dbQuery = dbQuery.or(`name.ilike.%${query}%,description.ilike.%${query}%,sku.ilike.%${query}%,category.ilike.%${query}%`)

  const { data, error } = await dbQuery.limit(50)

  if (error) throw error
  return (data || []).map(toCamelCase) as PriceItem[]
}

export async function updatePriceItem(
  itemId: string,
  updates: Partial<Omit<PriceItem, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<PriceItem> {
  const user = await getCurrentUser()
  const snakeCaseData = toSnakeCase(updates)

  const { data, error } = await supabase
    .from('price_items')
    .update(snakeCaseData)
    .eq('id', itemId)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  return toCamelCase(data) as PriceItem
}

// ===== QUOTES =====

export async function createQuote(
  quoteData: Omit<Quote, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Quote> {
  const user = await getCurrentUser()
  const tenantId = await getCurrentTenant()
  const snakeCaseData = toSnakeCase(quoteData)

  // Generate quote number
  const year = new Date().getFullYear()
  const { data: countData } = await supabase
    .from('quotes')
    .select('id', { count: 'exact', head: true })
    .eq('tenant_id', tenantId)
    .like('quote_number', `Q${year}-%`)

  const nextNumber = (countData?.count || 0) + 1
  const quoteNumber = `Q${year}-${String(nextNumber).padStart(4, '0')}`

  const { data, error } = await supabase
    .from('quotes')
    .insert({
      ...snakeCaseData,
      user_id: user.id,
      tenant_id: tenantId,
      quote_number: quoteNumber
    })
    .select()
    .single()

  if (error) throw error
  return toCamelCase(data) as Quote
}

export async function getQuote(quoteId: string): Promise<Quote | null> {
  const user = await getCurrentUser()

  const { data, error } = await supabase
    .from('quotes')
    .select('*')
    .eq('id', quoteId)
    .eq('user_id', user.id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return toCamelCase(data) as Quote
}

export async function getQuotes(customerId?: string): Promise<Quote[]> {
  const user = await getCurrentUser()

  let query = supabase
    .from('quotes')
    .select('*')
    .eq('user_id', user.id)

  if (customerId) {
    query = query.eq('customer_id', customerId)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) throw error
  return (data || []).map(toCamelCase) as Quote[]
}

export async function updateQuote(
  quoteId: string,
  updates: Partial<Omit<Quote, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<Quote> {
  const user = await getCurrentUser()
  const snakeCaseData = toSnakeCase(updates)

  const { data, error } = await supabase
    .from('quotes')
    .update(snakeCaseData)
    .eq('id', quoteId)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  return toCamelCase(data) as Quote
}

// ===== QUOTE LINES =====

export async function createQuoteLines(
  lines: Omit<QuoteLine, 'id' | 'createdAt' | 'updatedAt'>[]
): Promise<QuoteLine[]> {
  const snakeCaseData = lines.map(toSnakeCase)

  const { data, error } = await supabase
    .from('quote_lines')
    .insert(snakeCaseData)
    .select()

  if (error) throw error
  return (data || []).map(toCamelCase) as QuoteLine[]
}

export async function getQuoteLines(quoteId: string): Promise<QuoteLine[]> {
  const { data, error } = await supabase
    .from('quote_lines')
    .select('*')
    .eq('quote_id', quoteId)
    .order('sort_order', { ascending: true })

  if (error) throw error
  return (data || []).map(toCamelCase) as QuoteLine[]
}

export async function updateQuoteLine(
  lineId: string,
  updates: Partial<Omit<QuoteLine, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<QuoteLine> {
  const snakeCaseData = toSnakeCase(updates)

  const { data, error } = await supabase
    .from('quote_lines')
    .update(snakeCaseData)
    .eq('id', lineId)
    .select()
    .single()

  if (error) throw error
  return toCamelCase(data) as QuoteLine
}

export async function deleteQuoteLine(lineId: string): Promise<void> {
  const { error } = await supabase
    .from('quote_lines')
    .delete()
    .eq('id', lineId)

  if (error) throw error
}

// ===== APPROVALS =====

export async function approveQuote(
  quoteId: string,
  approvedBy: string,
  notes?: string
): Promise<Approval> {
  const user = await getCurrentUser()

  // Get current quote state for snapshot
  const { data: quote } = await supabase
    .from('quotes')
    .select('*')
    .eq('id', quoteId)
    .single()

  if (!quote) throw new Error('Quote not found')

  // Create snapshot hash
  const snapshot = JSON.stringify(quote)
  const snapshotHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(snapshot))
    .then(hash => Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join(''))

  // Create approval record
  const { data: approval, error: approvalError } = await supabase
    .from('approvals')
    .insert({
      quote_id: quoteId,
      approved_by: approvedBy,
      approved_at: new Date().toISOString(),
      snapshot_hash: snapshotHash,
      notes
    })
    .select()
    .single()

  if (approvalError) throw approvalError

  // Update quote status
  const { error: updateError } = await supabase
    .from('quotes')
    .update({ status: 'approved' })
    .eq('id', quoteId)

  if (updateError) throw updateError

  return toCamelCase(approval) as Approval
}

export async function getApprovals(quoteId?: string): Promise<Approval[]> {
  let query = supabase
    .from('approvals')
    .select('*')

  if (quoteId) {
    query = query.eq('quote_id', quoteId)
  }

  const { data, error } = await query.order('approved_at', { ascending: false })

  if (error) throw error
  return (data || []).map(toCamelCase) as Approval[]
}

// ===== INVOICES =====

export async function createInvoiceFromQuote(
  quoteId: string,
  dueDays: number = 30
): Promise<Invoice> {
  const user = await getCurrentUser()
  const tenantId = await getCurrentTenant()

  // Get quote with lines
  const { data: quote, error: quoteError } = await supabase
    .from('quotes')
    .select(`
      *,
      quote_lines (*)
    `)
    .eq('id', quoteId)
    .single()

  if (quoteError || !quote) throw new Error('Quote not found')

  // Generate invoice number (per-tenant sequence)
  const year = new Date().getFullYear()
  const { data: countData } = await supabase
    .from('invoices')
    .select('id', { count: 'exact', head: true })
    .eq('tenant_id', tenantId)
    .like('invoice_number', `INV${year}-%`)

  const nextNumber = (countData?.count || 0) + 1
  const invoiceNumber = `INV${year}-${String(nextNumber).padStart(4, '0')}`

  // Calculate due date
  const dueDate = new Date()
  dueDate.setDate(dueDate.getDate() + dueDays)

  // Create invoice
  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .insert({
      user_id: user.id,
      tenant_id: tenantId,
      quote_id: quoteId,
      invoice_number: invoiceNumber,
      customer_id: quote.customer_id,
      site_id: quote.site_id,
      subtotal: quote.subtotal,
      vat_amount: quote.vat_amount,
      total_amount: quote.total_amount,
      vat_rate: quote.vat_rate,
      currency: quote.currency,
      status: 'draft',
      issue_date: new Date().toISOString(),
      due_date: dueDate.toISOString()
    })
    .select()
    .single()

  if (invoiceError) throw invoiceError

  // Copy quote lines to invoice lines (if invoice_lines table exists)
  if (quote.quote_lines && quote.quote_lines.length > 0) {
    const invoiceLines = quote.quote_lines.map((line: any) => ({
      invoice_id: invoice.id,
      description: line.description,
      quantity: line.quantity,
      unit_price: line.unit_price,
      vat_rate: line.vat_rate,
      total_price: line.total_price,
      sort_order: line.sort_order
    }))

    await supabase
      .from('invoice_lines')
      .insert(invoiceLines)
  }

  return toCamelCase(invoice) as Invoice
}

export async function getInvoice(invoiceId: string): Promise<Invoice | null> {
  const user = await getCurrentUser()

  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', invoiceId)
    .eq('user_id', user.id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return toCamelCase(data) as Invoice
}

export async function getInvoices(customerId?: string): Promise<Invoice[]> {
  const user = await getCurrentUser()

  let query = supabase
    .from('invoices')
    .select('*')
    .eq('user_id', user.id)

  if (customerId) {
    query = query.eq('customer_id', customerId)
  }

  const { data, error } = await query.order('issue_date', { ascending: false })

  if (error) throw error
  return (data || []).map(toCamelCase) as Invoice[]
}

export async function updateInvoice(
  invoiceId: string,
  updates: Partial<Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<Invoice> {
  const user = await getCurrentUser()
  const snakeCaseData = toSnakeCase(updates)

  const { data, error } = await supabase
    .from('invoices')
    .update(snakeCaseData)
    .eq('id', invoiceId)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  return toCamelCase(data) as Invoice
}

// ===== PROJECTS =====

export async function createProjectFromQuote(
  quoteId: string,
  projectData?: Partial<Omit<Project, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<Project> {
  const user = await getCurrentUser()
  const tenantId = await getCurrentTenant()

  // Get quote details
  const { data: quote, error: quoteError } = await supabase
    .from('quotes')
    .select('*')
    .eq('id', quoteId)
    .single()

  if (quoteError || !quote) throw new Error('Quote not found')

  // Generate project number
  const year = new Date().getFullYear()
  const { data: countData } = await supabase
    .from('projects')
    .select('id', { count: 'exact', head: true })
    .eq('tenant_id', tenantId)
    .like('project_number', `PRJ${year}-%`)

  const nextNumber = (countData?.count || 0) + 1
  const projectNumber = `PRJ${year}-${String(nextNumber).padStart(4, '0')}`

  // Create project
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .insert({
      user_id: user.id,
      tenant_id: tenantId,
      quote_id: quoteId,
      project_number: projectNumber,
      name: projectData?.name || quote.title || `Project ${projectNumber}`,
      customer_id: quote.customer_id,
      site_id: quote.site_id,
      status: 'planning',
      start_date: new Date().toISOString(),
      estimated_end_date: projectData?.estimated_end_date || null,
      budget: quote.total_amount,
      ...projectData
    })
    .select()
    .single()

  if (projectError) throw projectError

  // Create default tasks based on work type
  if (quote.work_type) {
    await createDefaultTasks(project.id, quote.work_type)
  }

  return toCamelCase(project) as Project
}

async function createDefaultTasks(projectId: string, workType: string): Promise<void> {
  const defaultTasks: Record<string, string[]> = {
    'roofing': ['Materialen bestellen', 'Daken inspecteren', 'Dakbedekking verwijderen', 'Nieuwe dakbedekking installeren', 'Afwerking en schoonmaak'],
    'solar': ['Site survey', 'Materialen bestellen', 'Panelen installeren', 'Omvormer aansluiten', 'Keuring en oplevering'],
    'insulation': ['Isolatiemateriaal bestellen', 'Voorbereiding', 'Isolatie aanbrengen', 'Afwerking', 'Eindcontrole'],
    'windows': ['Metingen bevestigen', 'Kozijnen bestellen', 'Oude kozijnen verwijderen', 'Nieuwe kozijnen plaatsen', 'Afwerking'],
    'default': ['Project kickoff', 'Materialen bestellen', 'Uitvoering werkzaamheden', 'Kwaliteitscontrole', 'Oplevering']
  }

  const tasks = (defaultTasks[workType] || defaultTasks['default']).map((name, index) => ({
    project_id: projectId,
    name,
    status: 'pending',
    sort_order: index,
    estimated_hours: null,
    assigned_to: null
  }))

  await supabase
    .from('tasks')
    .insert(tasks)
}

export async function getProject(projectId: string): Promise<Project | null> {
  const user = await getCurrentUser()

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .eq('user_id', user.id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return toCamelCase(data) as Project
}

export async function getProjects(customerId?: string): Promise<Project[]> {
  const user = await getCurrentUser()

  let query = supabase
    .from('projects')
    .select('*')
    .eq('user_id', user.id)

  if (customerId) {
    query = query.eq('customer_id', customerId)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) throw error
  return (data || []).map(toCamelCase) as Project[]
}

export async function updateProject(
  projectId: string,
  updates: Partial<Omit<Project, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<Project> {
  const user = await getCurrentUser()
  const snakeCaseData = toSnakeCase(updates)

  const { data, error } = await supabase
    .from('projects')
    .update(snakeCaseData)
    .eq('id', projectId)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  return toCamelCase(data) as Project
}

// ===== TASKS =====

export async function getTasks(projectId: string): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('project_id', projectId)
    .order('sort_order', { ascending: true })

  if (error) throw error
  return (data || []).map(toCamelCase) as Task[]
}

export async function createTask(
  taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Task> {
  const snakeCaseData = toSnakeCase(taskData)

  const { data, error } = await supabase
    .from('tasks')
    .insert(snakeCaseData)
    .select()
    .single()

  if (error) throw error
  return toCamelCase(data) as Task
}

export async function updateTask(
  taskId: string,
  updates: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<Task> {
  const snakeCaseData = toSnakeCase(updates)

  const { data, error } = await supabase
    .from('tasks')
    .update(snakeCaseData)
    .eq('id', taskId)
    .select()
    .single()

  if (error) throw error
  return toCamelCase(data) as Task
}

// ===== AUDIT LOG =====

export async function createAuditLog(
  entityType: string,
  entityId: string,
  action: string,
  userId: string,
  changes?: Record<string, any>,
  metadata?: Record<string, any>
): Promise<AuditLog> {
  const tenantId = await getCurrentTenant()

  const { data, error } = await supabase
    .from('audit_logs')
    .insert({
      user_id: userId,
      tenant_id: tenantId,
      entity_type: entityType,
      entity_id: entityId,
      action,
      changes,
      metadata
    })
    .select()
    .single()

  if (error) throw error
  return toCamelCase(data) as AuditLog
}

export async function getAuditLogs(
  entityType?: string,
  entityId?: string,
  limit: number = 100
): Promise<AuditLog[]> {
  const user = await getCurrentUser()

  let query = supabase
    .from('audit_logs')
    .select('*')
    .eq('user_id', user.id)

  if (entityType) {
    query = query.eq('entity_type', entityType)
  }

  if (entityId) {
    query = query.eq('entity_id', entityId)
  }

  const { data, error } = await query.order('created_at', { ascending: false }).limit(limit)

  if (error) throw error
  return (data || []).map(toCamelCase) as AuditLog[]
}

// ===== COMPLETE WORKFLOW FUNCTIONS =====

/**
 * Complete the full wizard workflow:
 * 1. Create quote from draft session
 * 2. Link site, measurements, media
 * 3. Create quote lines
 * 4. Optionally approve and create project
 */
export async function completeWizard(
  draftSession: DraftSession,
  approveQuote: boolean = false
): Promise<{ quote: Quote; project?: Project }> {
  const payload = draftSession.payloadJson as DraftSessionPayload

  // Create or get site
  let siteId = payload.step2?.siteId
  if (payload.step2?.newSite) {
    const site = await createSite(payload.step2.newSite)
    siteId = site.id
  }

  // Create measurements
  if (payload.step3?.measurements && siteId) {
    const measurementsWithSite = payload.step3.measurements.map(m => ({ ...m, siteId }))
    await createSiteMeasurements(measurementsWithSite)
  }

  // Upload media
  if (payload.step4?.mediaAssets && siteId) {
    for (const media of payload.step4.mediaAssets) {
      if (media.file) {
        const uploaded = await uploadMedia(media.file, media.labels)
        // Link to site
        await updateMediaAsset(uploaded.id, { siteId, description: media.description })
      }
    }
  }

  // Create quote
  const quote = await createQuote({
    customerId: payload.step1?.customerId || '',
    siteId: siteId || '',
    title: `Offerte ${payload.step1?.newCustomer?.name || 'Nieuwe klant'}`,
    description: payload.step5?.description || '',
    workType: 'general',
    status: 'draft',
    subtotal: payload.step6?.totalAmount || 0,
    vatAmount: 0,
    totalAmount: payload.step6?.totalAmount || 0,
    vatRate: 21,
    currency: 'EUR'
  })

  // Create quote lines
  if (payload.step6?.quoteLines) {
    const linesWithQuote = payload.step6.quoteLines.map((line, index) => ({
      ...line,
      quoteId: quote.id,
      sortOrder: index
    }))
    await createQuoteLines(linesWithQuote)
  }

  // Audit log
  await createAuditLog('quote', quote.id, 'create_quote', (await getCurrentUser()).id, {
    from_draft_session: draftSession.id
  })

  // Optionally approve and create project
  let project: Project | undefined
  if (approveQuote) {
    await approveQuote(quote.id, (await getCurrentUser()).id)
    project = await createProjectFromQuote(quote.id)

    await createAuditLog('project', project.id, 'create_project', (await getCurrentUser()).id, {
      from_quote: quote.id
    })
  }

  // Delete draft session
  await deleteDraftSession(draftSession.id)

  return { quote, project }
}
