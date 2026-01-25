/**
 * AI Service for Field-to-Invoice Workflow
 * Tool-calling AI service with guardrails for field-to-invoice operations
 * 
 * This service provides AI-powered tools for:
 * - PriceBook search (RAG/keyword)
 * - Scope drafting from transcript
 * - Media summarization
 * - Quote line suggestions (without prices)
 * - Dashboard action recommendations
 */

import { supabase } from './supabase'
import { searchPriceItems, getPriceItems } from './api-field-to-invoice'
import type { PriceItem, SiteMeasurement, MediaAsset } from '@/types/field-to-invoice'

// ===== AI TOOLS =====

export interface AITool {
  name: string
  description: string
  parameters: Record<string, any>
}

export interface AIResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  toolCalls?: AITool[]
  reasoning?: string
}

// ===== TOOL DEFINITIONS =====

const TOOLS: AITool[] = [
  {
    name: 'SearchPriceItems',
    description: 'Search price items in the price book by keyword, SKU, category, or description. Returns matching items with prices.',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query for price items'
        },
        priceBookId: {
          type: 'string',
          description: 'Optional price book ID to search within'
        }
      },
      required: ['query']
    }
  },
  {
    name: 'DraftScopeFromTranscript',
    description: 'Draft a scope document from a voice transcript. Returns structured scope text, assumptions made, and questions to ask.',
    parameters: {
      type: 'object',
      properties: {
        transcript: {
          type: 'string',
          description: 'Voice transcript from field visit'
        },
        context: {
          type: 'object',
          description: 'Additional context like customer info, site type, measurements'
        }
      },
      required: ['transcript']
    }
  },
  {
    name: 'SummarizeMedia',
    description: 'Summarize media assets (photos). Returns summary of visible elements and missing data.',
    parameters: {
      type: 'object',
      properties: {
        mediaAssets: {
          type: 'array',
          description: 'Array of media asset objects with URLs and labels'
        }
      },
      required: ['mediaAssets']
    }
  },
  {
    name: 'ProposeQuoteLines',
    description: 'Propose quote line items based on scope, measurements, and matched price items. Returns line suggestions WITHOUT prices.',
    parameters: {
      type: 'object',
      properties: {
        scope: {
          type: 'string',
          description: 'Scope description from transcript'
        },
        measurements: {
          type: 'array',
          description: 'Site measurements'
        },
        matchedItems: {
          type: 'array',
          description: 'Price items matched from search'
        }
      },
      required: ['scope']
    }
  },
  {
    name: 'RecommendNextActions',
    description: 'Recommend 3-5 next actions based on dashboard state. Returns prioritized actions with rationale.',
    parameters: {
      type: 'object',
      properties: {
        dashboardState: {
          type: 'object',
          description: 'Current dashboard state including pending quotes, active projects, overdue invoices'
        }
      },
      required: ['dashboardState']
    }
  }
]

// ===== TOOL IMPLEMENTATIONS =====

/**
 * Search price items in the price book
 */
export async function aiSearchPriceItems(
  query: string,
  priceBookId?: string
): Promise<AIResponse<PriceItem[]>> {
  try {
    // Guardrails: Validate query length
    if (!query || query.trim().length < 2) {
      return {
        success: false,
        error: 'Query must be at least 2 characters long'
      }
    }

    // Guardrails: Sanitize query
    const sanitizedQuery = query.trim().slice(0, 200)

    // Call actual search function
    const results = await searchPriceItems(sanitizedQuery, priceBookId)

    return {
      success: true,
      data: results,
      toolCalls: [{ name: 'SearchPriceItems', parameters: { query: sanitizedQuery, priceBookId } }],
      reasoning: `Found ${results.length} price items matching "${sanitizedQuery}"`
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to search price items'
    }
  }
}

/**
 * Draft scope from transcript
 */
export async function aiDraftScopeFromTranscript(
  transcript: string,
  context?: Record<string, any>
): Promise<AIResponse<{
  scopeText: string
  assumptions: string[]
  questions: string[]
}>> {
  try {
    // Guardrails: Validate transcript
    if (!transcript || transcript.trim().length < 10) {
      return {
        success: false,
        error: 'Transcript must be at least 10 characters long'
      }
    }

    // Guardrails: Limit transcript length
    const sanitizedTranscript = transcript.trim().slice(0, 5000)

    // For now, use a simple heuristic-based approach
    // In production, this would call an actual AI service
    const scopeText = generateScopeText(sanitizedTranscript, context)
    const assumptions = extractAssumptions(sanitizedTranscript)
    const questions = extractQuestions(sanitizedTranscript)

    return {
      success: true,
      data: { scopeText, assumptions, questions },
      toolCalls: [{ name: 'DraftScopeFromTranscript', parameters: { transcript: sanitizedTranscript, context } }],
      reasoning: 'Generated scope based on transcript analysis'
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to draft scope'
    }
  }
}

/**
 * Summarize media assets
 */
export async function aiSummarizeMedia(
  mediaAssets: MediaAsset[]
): Promise<AIResponse<{
  summary: string
  visibleElements: string[]
  missingData: string[]
}>> {
  try {
    // Guardrails: Validate input
    if (!mediaAssets || mediaAssets.length === 0) {
      return {
        success: false,
        error: 'No media assets provided'
      }
    }

    // Guardrails: Limit number of assets
    const limitedAssets = mediaAssets.slice(0, 20)

    // For now, use simple heuristic-based approach
    // In production, this would call an actual AI vision service
    const summary = generateMediaSummary(limitedAssets)
    const visibleElements = extractVisibleElements(limitedAssets)
    const missingData = extractMissingData(limitedAssets)

    return {
      success: true,
      data: { summary, visibleElements, missingData },
      toolCalls: [{ name: 'SummarizeMedia', parameters: { mediaAssets: limitedAssets } }],
      reasoning: `Analyzed ${limitedAssets.length} media assets`
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to summarize media'
    }
  }
}

/**
 * Propose quote lines based on scope and measurements
 */
export async function aiProposeQuoteLines(
  scope: string,
  measurements?: SiteMeasurement[],
  matchedItems?: PriceItem[]
): Promise<AIResponse<{
  suggestions: Array<{
    description: string
    quantity: number
    unit: string
    reason: string
    confidence: number
  }>
}>> {
  try {
    // Guardrails: Validate scope
    if (!scope || scope.trim().length < 10) {
      return {
        success: false,
        error: 'Scope must be at least 10 characters long'
      }
    }

    // Guardrails: Limit scope length
    const sanitizedScope = scope.trim().slice(0, 2000)

    // Get all price items if none provided
    const allItems = matchedItems || await getPriceItems()

    // Generate suggestions based on scope, measurements, and available items
    const suggestions = generateQuoteLineSuggestions(sanitizedScope, measurements, allItems)

    return {
      success: true,
      data: { suggestions },
      toolCalls: [{ name: 'ProposeQuoteLines', parameters: { scope: sanitizedScope, measurements, matchedItems } }],
      reasoning: `Generated ${suggestions.length} quote line suggestions`
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to propose quote lines'
    }
  }
}

/**
 * Recommend next actions based on dashboard state
 */
export async function aiRecommendNextActions(
  dashboardState: {
    pendingQuotes?: number
    activeProjects?: number
    overdueInvoices?: number
    upcomingAppointments?: number
    recentActivities?: any[]
  }
): Promise<AIResponse<{
  actions: Array<{
    title: string
    description: string
    priority: 'high' | 'medium' | 'low'
    category: string
  }>
}>> {
  try {
    // Guardrails: Validate state
    if (!dashboardState) {
      return {
        success: false,
        error: 'Dashboard state is required'
      }
    }

    // Generate recommendations based on state
    const actions = generateActionRecommendations(dashboardState)

    return {
      success: true,
      data: { actions },
      toolCalls: [{ name: 'RecommendNextActions', parameters: { dashboardState } }],
      reasoning: `Generated ${actions.length} action recommendations based on dashboard state`
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to recommend actions'
    }
  }
}

// ===== HELPER FUNCTIONS (Heuristic-based for MVP) =====

function generateScopeText(transcript: string, context?: Record<string, any>): string {
  const customerName = context?.customerName || 'Klant'
  const siteType = context?.siteType || 'locatie'
  
  // Extract key phrases from transcript
  const keywords = extractKeywords(transcript)
  
  return `Werkzaamheden voor ${customerName} (${siteType})\n\n` +
    `Op basis van het bezoek zijn de volgende werkzaamheden geïdentificeerd:\n\n` +
    keywords.map(k => `- ${k}`).join('\n') +
    '\n\nLet op: Dit is een automatisch gegenereerde samenvatting op basis van transcriptie.'
}

function extractAssumptions(transcript: string): string[] {
  const assumptions: string[] = []
  
  // Common assumptions based on keywords
  if (transcript.toLowerCase().includes('dak')) {
    assumptions.push('Er wordt aangenomen dat het dak toegankelijk is voor werkzaamheden')
  }
  if (transcript.toLowerCase().includes('zonnepanelen')) {
    assumptions.push('Er wordt aangenomen dat de elektrische installatie voldoet aan de eisen')
  }
  if (transcript.toLowerCase().includes('isolatie')) {
    assumptions.push('Er wordt aangenomen dat de isolatie dikte voldoet aan de eisen')
  }
  
  return assumptions
}

function extractQuestions(transcript: string): string[] {
  const questions: string[] = []
  
  // Common questions based on missing information
  if (!transcript.toLowerCase().includes('oppervlakte')) {
    questions.push('Wat is de totale oppervlakte van het werkgebied?')
  }
  if (!transcript.toLowerCase().includes('toegang')) {
    questions.push('Is het werkgebied goed toegankelijk?')
  }
  if (!transcript.toLowerCase().includes('stroom')) {
    questions.push('Is er stroomaansluiting beschikbaar op de locatie?')
  }
  
  return questions
}

function generateMediaSummary(mediaAssets: MediaAsset[]): string {
  const labels = mediaAssets.flatMap(m => m.labels || [])
  const uniqueLabels = [...new Set(labels)]
  
  return `Samenvatting van ${mediaAssets.length} media bestanden.\n` +
    `Labels: ${uniqueLabels.join(', ') || 'Geen labels'}.\n` +
    `Bestandstypes: ${[...new Set(mediaAssets.map(m => m.mime_type))].join(', ')}`
}

function extractVisibleElements(mediaAssets: MediaAsset[]): string[] {
  const elements: string[] = []
  
  // Extract from labels
  mediaAssets.forEach(asset => {
    if (asset.labels) {
      elements.push(...asset.labels)
    }
  })
  
  return [...new Set(elements)]
}

function extractMissingData(mediaAssets: MediaAsset[]): string[] {
  const missing: string[] = []
  
  mediaAssets.forEach(asset => {
    if (!asset.description || asset.description.length < 10) {
      missing.push('Beschrijving ontbreekt voor foto')
    }
    if (!asset.labels || asset.labels.length === 0) {
      missing.push('Labels ontbreken voor foto')
    }
  })
  
  return [...new Set(missing)]
}

function generateQuoteLineSuggestions(
  scope: string,
  measurements?: SiteMeasurement[],
  priceItems?: PriceItem[]
): Array<{
  description: string
  quantity: number
  unit: string
  reason: string
  confidence: number
}> {
  const suggestions: any[] = []
  
  // Extract keywords from scope
  const keywords = extractKeywords(scope)
  
  // Match with price items
  if (priceItems) {
    keywords.forEach(keyword => {
      const matches = priceItems.filter(item =>
        item.name.toLowerCase().includes(keyword.toLowerCase()) ||
        item.description?.toLowerCase().includes(keyword.toLowerCase()) ||
        item.category?.toLowerCase().includes(keyword.toLowerCase())
      )
      
      matches.forEach(match => {
        // Calculate quantity from measurements if available
        const quantity = calculateQuantityFromMeasurements(measurements, match.unit)
        
        suggestions.push({
          description: match.name,
          quantity,
          unit: match.unit,
          reason: `Gevonden in scope: "${keyword}"`,
          confidence: 0.8
        })
      })
    })
  }
  
  // Remove duplicates and sort by confidence
  const uniqueSuggestions = suggestions.filter((s, i, a) => 
    a.findIndex(t => t.description === s.description) === i
  )
  
  return uniqueSuggestions.sort((a, b) => b.confidence - a.confidence).slice(0, 10)
}

function calculateQuantityFromMeasurements(measurements?: SiteMeasurement[], unit?: string): number {
  if (!measurements || measurements.length === 0) return 1
  
  // Simple heuristic: sum values for matching units
  const relevantMeasurements = measurements.filter(m => 
    m.measurementItem?.unit === unit || unit?.includes('m2')
  )
  
  if (relevantMeasurements.length === 0) return 1
  
  return relevantMeasurements.reduce((sum, m) => sum + (m.value || 0), 0) || 1
}

function generateActionRecommendations(dashboardState: any): Array<{
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  category: string
}> {
  const actions: any[] = []
  
  // High priority: overdue invoices
  if (dashboardState.overdueInvoices && dashboardState.overdueInvoices > 0) {
    actions.push({
      title: 'Verstuur herinneringen voor vervallen facturen',
      description: `${dashboardState.overdueInvoices} facturen zijn vervallen en vereisen aandacht`,
      priority: 'high',
      category: 'Facturen'
    })
  }
  
  // High priority: pending quotes
  if (dashboardState.pendingQuotes && dashboardState.pendingQuotes > 0) {
    actions.push({
      title: 'Volg openstaande offertes op',
      description: `${dashboardState.pendingQuotes} offertes wachten op reactie van klanten`,
      priority: 'high',
      category: 'Offertes'
    })
  }
  
  // Medium priority: active projects
  if (dashboardState.activeProjects && dashboardState.activeProjects > 0) {
    actions.push({
      title: 'Controleer projectvoortgang',
      description: `${dashboardState.activeProjects} projecten zijn actief en vereisen follow-up`,
      priority: 'medium',
      category: 'Projecten'
    })
  }
  
  // Medium priority: upcoming appointments
  if (dashboardState.upcomingAppointments && dashboardState.upcomingAppointments > 0) {
    actions.push({
      title: 'Bereid afspraken voor',
      description: `${dashboardState.upcomingAppointments} afspraken staan gepland voor de komende dagen`,
      priority: 'medium',
      category: 'Afspraken'
    })
  }
  
  // Low priority: general tasks
  actions.push({
    title: 'Update prijzenlijst',
    description: 'Controleer of alle prijzen in de prijslijst nog actueel zijn',
    priority: 'low',
    category: 'Beheer'
  })
  
  return actions
}

function extractKeywords(text: string): string[] {
  // Simple keyword extraction (Dutch and English)
  const stopWords = ['de', 'het', 'een', 'van', 'voor', 'met', 'op', 'aan', 'in', 'bij', 'door', 'naar', 'uit', 'over', 'the', 'a', 'an', 'and', 'or', 'for', 'to', 'of', 'in', 'with', 'on', 'at', 'by']
  
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.includes(word))
  
  return [...new Set(words)]
}

// ===== EXPORT =====

export const AI_TOOLS = TOOLS
export type { AITool, AIResponse }
