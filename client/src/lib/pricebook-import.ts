/**
 * PriceBook Import Pipeline
 * CSV/XLSX import, normalization, validation, mapping, and commit
 * 
 * Pipeline steps:
 * 1. Upload file
 * 2. Parse CSV/XLSX
 * 3. Normalize data (decimal, currency, units, VAT)
 * 4. Validate (duplicate SKU, empty price, invalid unit)
 * 5. Column mapping UI
 * 6. Preview and commit as new PriceBook version
 * 7. Index for search
 */

import { createPriceBook, createPriceItems, getPriceBooks } from './api-field-to-invoice'
import { toast } from 'sonner'

// ===== TYPES =====

export interface ImportColumn {
  name: string
  type: 'string' | 'number' | 'boolean'
  required: boolean
  mappedTo?: string
}

export interface ImportRow {
  [key: string]: any
}

export interface ParsedPriceItem {
  sku: string
  name: string
  description?: string
  category?: string
  unit: string
  unitPrice: number
  vatRate: number
  active: boolean
}

export interface ImportResult {
  success: boolean
  totalRows: number
  parsedRows: number
  validRows: number
  invalidRows: number
  errors: Array<{ row: number; field: string; message: string }>
  warnings: string[]
  priceBookId?: string
}

export interface ColumnMapping {
  sku: string
  name: string
  description?: string
  category?: string
  unit: string
  unitPrice: string
  vatRate?: string
}

// ===== DEFAULT COLUMN MAPPINGS =====

const DEFAULT_MAPPINGS: Record<string, ColumnMapping> = {
  dutch: {
    sku: 'SKU',
    name: 'Naam',
    description: 'Beschrijving',
    category: 'Categorie',
    unit: 'Eenheid',
    unitPrice: 'Prijs',
    vatRate: 'BTW tarief'
  },
  english: {
    sku: 'SKU',
    name: 'Name',
    description: 'Description',
    category: 'Category',
    unit: 'Unit',
    unitPrice: 'Price',
    vatRate: 'VAT rate'
  }
}

// ===== STEP 1: PARSE FILE =====

export async function parsePriceBookFile(
  file: File
): Promise<{
  headers: string[]
  rows: ImportRow[]
  format: 'csv' | 'xlsx'
}> {
  const extension = file.name.split('.').pop()?.toLowerCase()

  if (extension === 'csv') {
    return await parseCSV(file)
  } else if (extension === 'xlsx' || extension === 'xls') {
    return await parseExcel(file)
  } else {
    throw new Error('Ongeldig bestandsformaat. Alleen CSV en XLSX zijn ondersteund.')
  }
}

async function parseCSV(file: File): Promise<{ headers: string[]; rows: ImportRow[]; format: 'csv' }> {
  const text = await file.text()
  const lines = text.split('\n').filter(line => line.trim())

  if (lines.length === 0) {
    throw new Error('Bestand is leeg')
  }

  // Parse headers
  const headers = parseCSVLine(lines[0])

  // Parse rows
  const rows: ImportRow[] = []
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i])
    const row: ImportRow = {}
    headers.forEach((header, index) => {
      row[header] = values[index]
    })
    rows.push(row)
  }

  return { headers, rows, format: 'csv' }
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  
  result.push(current.trim())
  return result
}

async function parseExcel(file: File): Promise<{ headers: string[]; rows: ImportRow[]; format: 'xlsx' }> {
  // For MVP, we'll use a simple approach
  // In production, use xlsx library: https://www.npmjs.com/package/xlsx
  
  const arrayBuffer = await file.arrayBuffer()
  const data = new Uint8Array(arrayBuffer)
  
  // Simple parser for basic Excel files
  // This is a placeholder - actual implementation would use xlsx library
  throw new Error('Excel import vereist xlsx library. Gebruik CSV voor nu.')
  
  // return { headers: [], rows: [], format: 'xlsx' }
}

// ===== STEP 2: DETECT COLUMNS =====

export function detectColumns(
  headers: string[]
): { language: 'dutch' | 'english'; mapping: ColumnMapping } {
  const normalizedHeaders = headers.map(h => h.toLowerCase().trim())
  
  // Check for Dutch keywords
  const dutchKeywords = ['naam', 'prijs', 'eenheid', 'sku', 'categorie', 'beschrijving', 'btw']
  const dutchMatches = normalizedHeaders.filter(h => 
    dutchKeywords.some(k => h.includes(k))
  ).length
  
  // Check for English keywords
  const englishKeywords = ['name', 'price', 'unit', 'sku', 'category', 'description', 'vat']
  const englishMatches = normalizedHeaders.filter(h => 
    englishKeywords.some(k => h.includes(k))
  ).length
  
  const language = dutchMatches >= englishMatches ? 'dutch' : 'english'
  const defaultMapping = DEFAULT_MAPPINGS[language]
  
  // Auto-detect column mapping
  const mapping: ColumnMapping = {
    sku: findColumn(normalizedHeaders, ['sku', 'artikelnummer', 'art. nr.', 'item number']),
    name: findColumn(normalizedHeaders, ['naam', 'name', 'omschrijving', 'description']),
    description: findColumn(normalizedHeaders, ['beschrijving', 'description', 'details']),
    category: findColumn(normalizedHeaders, ['categorie', 'category', 'groep', 'group']),
    unit: findColumn(normalizedHeaders, ['eenheid', 'unit', 'maateenheid']),
    unitPrice: findColumn(normalizedHeaders, ['prijs', 'price', 'bedrag', 'amount']),
    vatRate: findColumn(normalizedHeaders, ['btw', 'vat', 'btw tarief', 'vat rate'])
  }
  
  return { language, mapping }
}

function findColumn(headers: string[], possibleNames: string[]): string {
  for (const name of possibleNames) {
    const match = headers.find(h => h === name.toLowerCase())
    if (match) return match
  }
  // Return first possible name as fallback
  return possibleNames[0]
}

// ===== STEP 3: NORMALIZE DATA =====

export function normalizePriceItem(
  row: ImportRow,
  mapping: ColumnMapping
): ParsedPriceItem | null {
  try {
    // Get values from row
    const sku = row[mapping.sku]?.toString().trim()
    const name = row[mapping.name]?.toString().trim()
    const description = mapping.description ? row[mapping.description]?.toString().trim() : undefined
    const category = mapping.category ? row[mapping.category]?.toString().trim() : undefined
    const unit = row[mapping.unit]?.toString().trim()
    const unitPriceRaw = row[mapping.unitPrice]
    const vatRateRaw = mapping.vatRate ? row[mapping.vatRate] : undefined

    // Normalize price
    const unitPrice = normalizePrice(unitPriceRaw)
    
    // Normalize VAT rate
    const vatRate = normalizeVATRate(vatRateRaw)

    // Normalize unit
    const normalizedUnit = normalizeUnit(unit)

    return {
      sku,
      name,
      description,
      category,
      unit: normalizedUnit,
      unitPrice,
      vatRate,
      active: true
    }
  } catch (error) {
    return null
  }
}

function normalizePrice(value: any): number {
  if (value === null || value === undefined || value === '') return 0
  
  // Handle European decimal format (comma as separator)
  let strValue = value.toString().trim()
  
  // Replace comma with dot for decimal
  strValue = strValue.replace(',', '.')
  
  // Remove currency symbols and spaces
  strValue = strValue.replace(/[€$£\s]/g, '')
  
  const parsed = parseFloat(strValue)
  
  if (isNaN(parsed)) {
    throw new Error(`Ongeldige prijs: ${value}`)
  }
  
  return parsed
}

function normalizeVATRate(value: any): number {
  if (value === null || value === undefined || value === '') return 0.21 // Default VAT
  
  let strValue = value.toString().trim()
  
  // Handle percentage
  if (strValue.includes('%')) {
    strValue = strValue.replace('%', '')
  }
  
  // Replace comma with dot
  strValue = strValue.replace(',', '.')
  
  const parsed = parseFloat(strValue)
  
  if (isNaN(parsed) || parsed < 0 || parsed > 1) {
    // Assume percentage if > 1
    if (parsed > 1 && parsed <= 100) {
      return parsed / 100
    }
    throw new Error(`Ongeldig BTW tarief: ${value}`)
  }
  
  return parsed
}

function normalizeUnit(value: string): string {
  if (!value) return 'stuk' // Default unit
  
  const normalized = value.toLowerCase().trim()
  
  // Common unit mappings
  const unitMappings: Record<string, string> = {
    'st': 'stuk',
    'stuks': 'stuk',
    'stuk': 'stuk',
    'm': 'meter',
    'm2': 'm2',
    'm²': 'm2',
    'meter': 'meter',
    'uur': 'uur',
    'h': 'uur',
    'kg': 'kg',
    'kilo': 'kg',
    'l': 'liter',
    'liter': 'liter'
  }
  
  return unitMappings[normalized] || normalized
}

// ===== STEP 4: VALIDATE DATA =====

export function validatePriceItem(
  item: ParsedPriceItem,
  index: number,
  existingSKUs: Set<string>
): { valid: boolean; errors: Array<{ row: number; field: string; message: string }> } {
  const errors: Array<{ row: number; field: string; message: string }> = []
  
  // Validate SKU
  if (!item.sku || item.sku.trim().length === 0) {
    errors.push({ row: index, field: 'sku', message: 'SKU is verplicht' })
  } else if (existingSKUs.has(item.sku)) {
    errors.push({ row: index, field: 'sku', message: `SKU "${item.sku}" bestaat al` })
  } else {
    existingSKUs.add(item.sku)
  }
  
  // Validate name
  if (!item.name || item.name.trim().length === 0) {
    errors.push({ row: index, field: 'name', message: 'Naam is verplicht' })
  }
  
  // Validate unit
  if (!item.unit || item.unit.trim().length === 0) {
    errors.push({ row: index, field: 'unit', message: 'Eenheid is verplicht' })
  }
  
  // Validate price
  if (item.unitPrice <= 0) {
    errors.push({ row: index, field: 'unitPrice', message: 'Prijs moet groter zijn dan 0' })
  }
  
  // Validate VAT rate
  if (item.vatRate < 0 || item.vatRate > 1) {
    errors.push({ row: index, field: 'vatRate', message: 'BTW tarief moet tussen 0 en 1 zijn' })
  }
  
  return { valid: errors.length === 0, errors }
}

// ===== STEP 5: IMPORT TO DATABASE =====

export async function importPriceBook(
  name: string,
  items: ParsedPriceItem[],
  options?: {
    deactivatePrevious?: boolean
    currency?: string
  }
): Promise<ImportResult> {
  try {
    // Get existing price books to determine version
    const existingBooks = await getPriceBooks()
    const nextVersion = existingBooks.length > 0 
      ? Math.max(...existingBooks.map(b => b.version)) + 1 
      : 1
    
    // Create new price book
    const priceBook = await createPriceBook({
      name,
      version: nextVersion,
      isActive: true,
      currency: options?.currency || 'EUR'
    })
    
    // Deactivate previous price books if requested
    if (options?.deactivatePrevious) {
      for (const book of existingBooks) {
        if (book.isActive) {
          await createPriceBook({
            ...book,
            isActive: false
          })
        }
      }
    }
    
    // Import items
    const itemsWithBookId = items.map(item => ({
      ...item,
      priceBookId: priceBook.id
    }))
    
    await createPriceItems(itemsWithBookId)
    
    toast.success(`Prijsboek "${name}" geïmporteerd met ${items.length} items`)
    
    return {
      success: true,
      totalRows: items.length,
      parsedRows: items.length,
      validRows: items.length,
      invalidRows: 0,
      errors: [],
      warnings: [],
      priceBookId: priceBook.id
    }
  } catch (error: any) {
    toast.error('Kon prijsboek niet importeren', {
      description: error.message
    })
    
    return {
      success: false,
      totalRows: items.length,
      parsedRows: items.length,
      validRows: 0,
      invalidRows: items.length,
      errors: [{ row: 0, field: 'import', message: error.message }],
      warnings: []
    }
  }
}

// ===== STEP 6: PREVIEW =====

export function generatePreview(
  items: ParsedPriceItem[],
  limit: number = 10
): ParsedPriceItem[] {
  return items.slice(0, limit)
}

// ===== UTILITY FUNCTIONS =====

export function downloadTemplateCSV(): void {
  const headers = ['SKU', 'Naam', 'Beschrijving', 'Categorie', 'Eenheid', 'Prijs', 'BTW tarief']
  const sampleData = [
    ['SKU001', 'Dakpannen', 'Keramische dakpannen bruin', 'Dakbedekking', 'm2', '45.00', '0.21'],
    ['SKU002', 'Zonnepaneel', '400W monokristallijn zonnepaneel', 'Zonnepanelen', 'stuk', '250.00', '0.21'],
    ['SKU003', 'Omvormer', '3kW string omvormer', 'Zonnepanelen', 'stuk', '800.00', '0.21']
  ]
  
  const csvContent = [
    headers.join(','),
    ...sampleData.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n')
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', 'prijsboek_template.csv')
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function calculateImportStats(
  items: ParsedPriceItem[]
): {
  totalItems: number
  categories: Record<string, number>
  averagePrice: number
  priceRange: { min: number; max: number }
} {
  if (items.length === 0) {
    return {
      totalItems: 0,
      categories: {},
      averagePrice: 0,
      priceRange: { min: 0, max: 0 }
    }
  }
  
  const prices = items.map(i => i.unitPrice)
  const categories: Record<string, number> = {}
  
  items.forEach(item => {
    if (item.category) {
      categories[item.category] = (categories[item.category] || 0) + 1
    }
  })
  
  return {
    totalItems: items.length,
    categories,
    averagePrice: prices.reduce((sum, p) => sum + p, 0) / prices.length,
    priceRange: {
      min: Math.min(...prices),
      max: Math.max(...prices)
    }
  }
}
