/**
 * API Type Utilities for Archon Dashboard
 * Convenience types and helpers generated from OpenAPI specification
 */

// Import generated types
import type { paths, components } from './api'

// Export common schema types for easier usage
export type User = components['schemas']['User']
export type Klant = components['schemas']['Klant']
export type CreateKlantRequest = components['schemas']['CreateKlantRequest']
export type UpdateKlantRequest = components['schemas']['UpdateKlantRequest']
export type Project = components['schemas']['Project']
export type CreateProjectRequest = components['schemas']['CreateProjectRequest']
export type PaymentMilestone = components['schemas']['PaymentMilestone']
export type Factuur = components['schemas']['Factuur']
export type FactuurRegel = components['schemas']['FactuurRegel']
export type Transactie = components['schemas']['Transactie']
export type LoginRequest = components['schemas']['LoginRequest']
export type RegisterRequest = components['schemas']['RegisterRequest']
export type AuthResponse = components['schemas']['AuthResponse']
export type Error = components['schemas']['Error']

// Export API response types
export type KlantenListResponse = paths['/klanten']['get']['responses']['200']['content']['application/json']
export type KlantResponse = paths['/klanten/{id}']['get']['responses']['200']['content']['application/json']
export type ProjectenListResponse = paths['/projecten']['get']['responses']['200']['content']['application/json']
export type FacturenListResponse = paths['/facturen']['get']['responses']['200']['content']['application/json']
export type TransactiesListResponse = paths['/transacties']['get']['responses']['200']['content']['application/json']

// Export status enums
export type KlantStatus = components['schemas']['Klant']['status']
export type KlantType = components['schemas']['Klant']['type']
export type ProjectStatus = components['schemas']['Project']['status']
export type FactuurStatus = components['schemas']['Factuur']['status']
export type TransactieType = components['schemas']['Transactie']['type']

// Helper type for API responses with data wrapper
export interface ApiResponse<T> {
  data: T
  total?: number
}

// Helper type for paginated responses
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  limit: number
  offset: number
}

// Type guards
export function isKlant(obj: any): obj is Klant {
  return obj && typeof obj === 'object' && 
         typeof obj.id === 'string' && 
         typeof obj.naam === 'string' && 
         typeof obj.email === 'string'
}

export function isProject(obj: any): obj is Project {
  return obj && typeof obj === 'object' && 
         typeof obj.id === 'string' && 
         typeof obj.name === 'string' && 
         typeof obj.budget === 'number'
}

export function isFactuur(obj: any): obj is Factuur {
  return obj && typeof obj === 'object' && 
         typeof obj.id === 'string' && 
         typeof obj.number === 'string' && 
         typeof obj.amount === 'number'
}

// Common error types
export interface ApiError {
  error: string
  message: string
  code?: string
}

// Type for API client configuration
export interface ApiClientConfig {
  baseUrl: string
  apiKey?: string
  timeout?: number
}

// Export everything for convenience
export * from './api'
