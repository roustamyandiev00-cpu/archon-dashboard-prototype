/**
 * Migration utilities for transitioning to generated API types
 * Helps bridge the gap between existing code and new OpenAPI types
 */

import type { components } from './api'

// Extract types from components
type ApiKlant = components['schemas']['Klant']
type ApiProject = components['schemas']['Project']
type ApiFactuur = components['schemas']['Factuur']
type ApiTransactie = components['schemas']['Transactie']
type PaymentMilestone = components['schemas']['PaymentMilestone']

// Extended types that maintain backward compatibility
export interface Klant extends Omit<ApiKlant, 'created_at' | 'updated_at'> {
  // Legacy field mappings
  createdAt?: string
  updatedAt?: string
  
  // Convert API fields to legacy format
  [key: string]: any
}

export interface Project extends Omit<ApiProject, 'created_at' | 'updated_at' | 'payment_milestones'> {
  // Legacy field mappings
  createdAt?: string
  updatedAt?: string
  client?: string
  clientName?: string
  paymentMilestones?: PaymentMilestone[]
  team?: any[]
  archived?: boolean
}

export interface Factuur extends Omit<ApiFactuur, 'created_at' | 'updated_at'> {
  // Legacy field mappings
  createdAt?: string
  updatedAt?: string
  factuurNummer?: string
  klantId?: string
  klantNaam?: string
  vervaldatum?: string
  regels?: any[]
  subtotaal?: number
  btwBedrag?: number
}

export interface Transactie extends Omit<ApiTransactie, 'created_at' | 'updated_at'> {
  // Legacy field mappings
  createdAt?: string
  updatedAt?: string
  userId?: string
  titel?: string
}

// Helper functions to convert between API and legacy formats
export function convertApiKlantToLegacy(apiKlant: ApiKlant): Klant {
  return {
    ...apiKlant,
    createdAt: apiKlant.created_at,
    updatedAt: apiKlant.updated_at,
  }
}

export function convertLegacyKlantToApi(legacyKlant: Partial<Klant>): Partial<ApiKlant> {
  const { createdAt, updatedAt, ...apiKlant } = legacyKlant
  return {
    ...apiKlant,
    created_at: createdAt,
    updated_at: updatedAt,
  }
}

export function convertApiProjectToLegacy(apiProject: ApiProject): Project {
  return {
    ...apiProject,
    createdAt: apiProject.created_at,
    updatedAt: apiProject.updated_at,
    client: apiProject.client_name,
    clientName: apiProject.client_name,
    paymentMilestones: apiProject.payment_milestones || [],
    archived: false, // Default value
  }
}

export function convertLegacyProjectToApi(legacyProject: Partial<Project>): Partial<ApiProject> {
  const { createdAt, updatedAt, client, clientName, paymentMilestones, archived, ...apiProject } = legacyProject
  return {
    ...apiProject,
    created_at: createdAt,
    updated_at: updatedAt,
    client_name: clientName || client,
    payment_milestones: paymentMilestones,
  }
}

// Type guards for migration
export function isLegacyKlant(obj: any): obj is Klant {
  return obj && (obj.createdAt !== undefined || obj.updatedAt !== undefined)
}

export function isApiKlant(obj: any): obj is ApiKlant {
  return obj && (obj.created_at !== undefined || obj.updated_at !== undefined)
}

export function normalizeKlant(klant: Klant | ApiKlant): Klant {
  if (isApiKlant(klant)) {
    return convertApiKlantToLegacy(klant)
  }
  return klant
}

export function normalizeProject(project: Project | ApiProject): Project {
  if (project && 'created_at' in project) {
    return convertApiProjectToLegacy(project as ApiProject)
  }
  return project
}
