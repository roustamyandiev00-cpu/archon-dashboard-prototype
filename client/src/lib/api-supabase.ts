/**
 * Supabase API Implementation
 * Real-time data sync met Supabase PostgreSQL
 * 
 * Vervangt api-firestore.ts voor Supabase migratie
 */

import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import { toast } from 'sonner'
import type { User } from '@supabase/supabase-js'
import { createDemoHook } from './demo-supabase'
import type {
  Klant,
  FactuurRegel,
  Factuur,
  Project,
  CreateKlantRequest,
  UpdateKlantRequest,
  KlantStatus,
  KlantType
} from '@/types/api-utils'

// Additional types not in OpenAPI spec yet
export interface Offerte {
  id?: string
  nummer: string
  klant: string
  bedrag: number
  datum: string
  geldigTot: string
  status: "concept" | "verzonden" | "bekeken" | "onderhandelen" | "geaccepteerd" | "afgewezen" | "verlopen" | "verloren"
  beschrijving: string
  items?: number
  winProbability?: number
  winFactors?: string[]
  aiInsight?: string
  images?: string[]
  dimensions?: { width: number; height: number; area: number }
  createdAt?: string
  updatedAt?: string
}


// Helper function to get current user
const getCurrentUser = async (): Promise<User> => {
  // Check for demo mode first
  const isDemoMode = import.meta.env.VITE_DEMO_MODE === "true"

  if (isDemoMode) {
    // Return mock user for demo mode
    return {
      id: "00000000-0000-0000-0000-000000000123",
      email: "demo@archon.ai",
      user_metadata: {
        display_name: "Demo Gebruiker",
        avatar_url: "https://i.pravatar.cc/150?u=demo",
      },
      app_metadata: {},
      aud: "authenticated",
      created_at: new Date().toISOString(),
    } as User
  }

  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    throw new Error('Not authenticated')
  }
  return user
}

// Helper function to convert snake_case to camelCase for compatibility
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

// Helper function to convert camelCase to snake_case for database
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

// ===== KLANTEN (CUSTOMERS) =====

export function useKlanten() {
  const isDemoMode = import.meta.env.VITE_DEMO_MODE === "true"

  // Use demo hook in demo mode
  if (isDemoMode) {
    const demoHook = createDemoHook<Klant>('klanten')()
    return {
      klanten: demoHook.data,
      loading: demoHook.loading,
      error: demoHook.error,
      createKlant: demoHook.create,
      updateKlant: demoHook.update,
      deleteKlant: demoHook.delete
    }
  }

  // Original Supabase implementation
  const [klanten, setKlanten] = useState<Klant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let subscription: any

    const setupSubscription = async () => {
      try {
        const user = await getCurrentUser()

        // Initial fetch
        const { data, error: fetchError } = await supabase
          .from('klanten')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (fetchError) throw fetchError

        const camelCaseData = toCamelCase(data) as Klant[]
        setKlanten(camelCaseData)
        setLoading(false)

        // Set up real-time subscription
        subscription = supabase
          .channel('klanten_changes')
          .on('postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'klanten',
              filter: `user_id=eq.${user.id}`
            },
            (payload) => {
              console.log('Klanten change received:', payload)

              if (payload.eventType === 'INSERT') {
                const newKlant = toCamelCase(payload.new) as Klant
                setKlanten(prev => [newKlant, ...prev])
              } else if (payload.eventType === 'UPDATE') {
                const updatedKlant = toCamelCase(payload.new) as Klant
                setKlanten(prev => prev.map(k => k.id === updatedKlant.id ? updatedKlant : k))
              } else if (payload.eventType === 'DELETE') {
                setKlanten(prev => prev.filter(k => k.id !== payload.old.id))
              }
            }
          )
          .subscribe()

      } catch (err: any) {
        console.error('Error setting up klanten subscription:', err)
        setError(err.message)
        setLoading(false)
      }
    }

    setupSubscription()

    return () => {
      if (subscription) {
        supabase.removeChannel(subscription)
      }
    }
  }, [])

  const createKlant = async (klantData: Omit<Klant, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const user = await getCurrentUser()
      const snakeCaseData = toSnakeCase(klantData)

      const { error } = await supabase
        .from('klanten')
        .insert({
          ...snakeCaseData,
          user_id: user.id
        })

      if (error) throw error
      toast.success('Klant succesvol aangemaakt')
    } catch (err: any) {
      console.error('Error creating klant:', err)
      toast.error('Kon klant niet aanmaken')
      throw err
    }
  }

  const updateKlant = async (id: string, klantData: Partial<Klant>) => {
    try {
      const user = await getCurrentUser()
      const snakeCaseData = toSnakeCase(klantData)

      const { error } = await supabase
        .from('klanten')
        .update(snakeCaseData)
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error
      toast.success('Klant succesvol bijgewerkt')
    } catch (err: any) {
      console.error('Error updating klant:', err)
      toast.error('Kon klant niet bijwerken')
      throw err
    }
  }

  const deleteKlant = async (id: string) => {
    try {
      const user = await getCurrentUser()

      const { error } = await supabase
        .from('klanten')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error
      toast.success('Klant succesvol verwijderd')
    } catch (err: any) {
      console.error('Error deleting klant:', err)
      toast.error('Kon klant niet verwijderen')
      throw err
    }
  }

  return {
    klanten,
    loading,
    error,
    createKlant,
    updateKlant,
    deleteKlant
  }
}

// ===== FACTUREN (INVOICES) =====

export function useFacturen() {
  const [facturen, setFacturen] = useState<Factuur[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let subscription: any

    const setupSubscription = async () => {
      try {
        const user = await getCurrentUser()

        // Initial fetch
        const { data, error: fetchError } = await supabase
          .from('facturen')
          .select('*')
          .eq('user_id', user.id)
          .order('datum', { ascending: false })

        if (fetchError) throw fetchError

        const camelCaseData = toCamelCase(data) as Factuur[]
        setFacturen(camelCaseData)
        setLoading(false)

        // Set up real-time subscription
        subscription = supabase
          .channel('facturen_changes')
          .on('postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'facturen',
              filter: `user_id=eq.${user.id}`
            },
            (payload) => {
              if (payload.eventType === 'INSERT') {
                const newFactuur = toCamelCase(payload.new) as Factuur
                setFacturen(prev => [newFactuur, ...prev])
              } else if (payload.eventType === 'UPDATE') {
                const updatedFactuur = toCamelCase(payload.new) as Factuur
                setFacturen(prev => prev.map(f => f.id === updatedFactuur.id ? updatedFactuur : f))
              } else if (payload.eventType === 'DELETE') {
                setFacturen(prev => prev.filter(f => f.id !== payload.old.id))
              }
            }
          )
          .subscribe()

      } catch (err: any) {
        console.error('Error setting up facturen subscription:', err)
        setError(err.message)
        setLoading(false)
      }
    }

    setupSubscription()

    return () => {
      if (subscription) {
        supabase.removeChannel(subscription)
      }
    }
  }, [])

  const createFactuur = async (factuurData: Omit<Factuur, 'id' | 'factuurNummer' | 'createdAt' | 'updatedAt'>) => {
    try {
      const user = await getCurrentUser()

      // Generate factuur nummer
      const year = new Date().getFullYear()
      const timestamp = Date.now()
      const factuurNummer = `F${year}-${timestamp.toString().slice(-6)}`

      const snakeCaseData = toSnakeCase({
        ...factuurData,
        factuurNummer
      })

      const { error } = await supabase
        .from('facturen')
        .insert({
          ...snakeCaseData,
          user_id: user.id
        })

      if (error) throw error
      toast.success('Factuur succesvol aangemaakt')
    } catch (err: any) {
      console.error('Error creating factuur:', err)
      toast.error('Kon factuur niet aanmaken')
      throw err
    }
  }

  const updateFactuur = async (id: string, factuurData: Partial<Factuur>) => {
    try {
      const user = await getCurrentUser()
      const snakeCaseData = toSnakeCase(factuurData)

      const { error } = await supabase
        .from('facturen')
        .update(snakeCaseData)
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error
      toast.success('Factuur succesvol bijgewerkt')
    } catch (err: any) {
      console.error('Error updating factuur:', err)
      toast.error('Kon factuur niet bijwerken')
      throw err
    }
  }

  const deleteFactuur = async (id: string) => {
    try {
      const user = await getCurrentUser()

      const { error } = await supabase
        .from('facturen')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error
      toast.success('Factuur succesvol verwijderd')
    } catch (err: any) {
      console.error('Error deleting factuur:', err)
      toast.error('Kon factuur niet verwijderen')
      throw err
    }
  }

  return {
    facturen,
    loading,
    error,
    createFactuur,
    updateFactuur,
    deleteFactuur
  }
}

// ===== HELPER FUNCTIONS =====

export async function getKlantenByStatus(status: 'actief' | 'inactief'): Promise<Klant[]> {
  const user = await getCurrentUser()

  const { data, error } = await supabase
    .from('klanten')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', status)
    .order('naam', { ascending: true })

  if (error) throw error
  return toCamelCase(data) as Klant[]
}

export async function getFacturenByStatus(status: Factuur['status']): Promise<Factuur[]> {
  const user = await getCurrentUser()

  const { data, error } = await supabase
    .from('facturen')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', status)
    .order('datum', { ascending: false })

  if (error) throw error
  return toCamelCase(data) as Factuur[]
}

// Continue with other hooks (useProjecten, useOffertes, etc.) following the same pattern...
// For brevity, I'll implement the key ones and you can extend as needed

export function useProjecten() {
  const [projecten, setProjecten] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let subscription: any

    const setupSubscription = async () => {
      try {
        const user = await getCurrentUser()

        const { data, error: fetchError } = await supabase
          .from('projecten')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (fetchError) throw fetchError

        const camelCaseData = toCamelCase(data) as Project[]
        setProjecten(camelCaseData)
        setLoading(false)

        subscription = supabase
          .channel('projecten_changes')
          .on('postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'projecten',
              filter: `user_id=eq.${user.id}`
            },
            (payload) => {
              if (payload.eventType === 'INSERT') {
                const newProject = toCamelCase(payload.new) as Project
                setProjecten(prev => [newProject, ...prev])
              } else if (payload.eventType === 'UPDATE') {
                const updatedProject = toCamelCase(payload.new) as Project
                setProjecten(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p))
              } else if (payload.eventType === 'DELETE') {
                setProjecten(prev => prev.filter(p => p.id !== payload.old.id))
              }
            }
          )
          .subscribe()

      } catch (err: any) {
        console.error('Error setting up projecten subscription:', err)
        setError(err.message)
        setLoading(false)
      }
    }

    setupSubscription()

    return () => {
      if (subscription) {
        supabase.removeChannel(subscription)
      }
    }
  }, [])

  const createProject = async (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const user = await getCurrentUser()
      const snakeCaseData = toSnakeCase({
        ...projectData,
        spent: projectData.spent || 0,
        progress: projectData.progress || 0
      })

      const { error } = await supabase
        .from('projecten')
        .insert({
          ...snakeCaseData,
          user_id: user.id
        })

      if (error) throw error
      toast.success('Project succesvol aangemaakt')
    } catch (err: any) {
      console.error('Error creating project:', err)
      toast.error('Kon project niet aanmaken')
      throw err
    }
  }

  const updateProject = async (id: string, projectData: Partial<Project>) => {
    try {
      const user = await getCurrentUser()
      const snakeCaseData = toSnakeCase(projectData)

      const { error } = await supabase
        .from('projecten')
        .update(snakeCaseData)
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error
      toast.success('Project succesvol bijgewerkt')
    } catch (err: any) {
      console.error('Error updating project:', err)
      toast.error('Kon project niet bijwerken')
      throw err
    }
  }

  const deleteProject = async (id: string) => {
    try {
      const user = await getCurrentUser()

      const { error } = await supabase
        .from('projecten')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error
      toast.success('Project succesvol verwijderd')
    } catch (err: any) {
      console.error('Error deleting project:', err)
      toast.error('Kon project niet verwijderen')
      throw err
    }
  }

  return {
    projecten,
    loading,
    error,
    createProject,
    updateProject,
    deleteProject
  }
}

// ===== AI FEEDBACK & TRAINING =====

export interface AIFeedback {
  id?: string
  userId: string
  type: "offerte" | "factuur" | "advies" | "algemeen"
  context: string
  aiResponse: string
  userFeedback: "positive" | "negative" | "corrected"
  correction?: string
  notes?: string
  createdAt?: string
  updatedAt?: string
}

export function useAIFeedback() {
  const [feedback, setFeedback] = useState<AIFeedback[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let subscription: any

    const setupSubscription = async () => {
      try {
        const user = await getCurrentUser()

        const { data, error: fetchError } = await supabase
          .from('ai_feedback')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (fetchError) throw fetchError

        const camelCaseData = toCamelCase(data) as AIFeedback[]
        setFeedback(camelCaseData)
        setLoading(false)

        subscription = supabase
          .channel('ai_feedback_changes')
          .on('postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'ai_feedback',
              filter: `user_id=eq.${user.id}`
            },
            (payload) => {
              if (payload.eventType === 'INSERT') {
                const newFeedback = toCamelCase(payload.new) as AIFeedback
                setFeedback(prev => [newFeedback, ...prev])
              } else if (payload.eventType === 'UPDATE') {
                const updatedFeedback = toCamelCase(payload.new) as AIFeedback
                setFeedback(prev => prev.map(f => f.id === updatedFeedback.id ? updatedFeedback : f))
              } else if (payload.eventType === 'DELETE') {
                setFeedback(prev => prev.filter(f => f.id !== payload.old.id))
              }
            }
          )
          .subscribe()

      } catch (err: any) {
        console.error('Error setting up AI feedback subscription:', err)
        setError(err as Error)
        setLoading(false)
      }
    }

    setupSubscription()

    return () => {
      if (subscription) {
        supabase.removeChannel(subscription)
      }
    }
  }, [])

  const addFeedback = async (feedbackData: Omit<AIFeedback, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    try {
      const user = await getCurrentUser()
      const snakeCaseData = toSnakeCase(feedbackData)

      const { error } = await supabase
        .from('ai_feedback')
        .insert({
          ...snakeCaseData,
          user_id: user.id
        })

      if (error) throw error
      toast.success('Feedback opgeslagen - AI wordt getraind')
    } catch (err: any) {
      console.error('Error saving AI feedback:', err)
      toast.error('Kon feedback niet opslaan')
      throw err
    }
  }

  const updateFeedback = async (id: string, feedbackData: Partial<AIFeedback>) => {
    try {
      const user = await getCurrentUser()
      const snakeCaseData = toSnakeCase(feedbackData)

      const { error } = await supabase
        .from('ai_feedback')
        .update(snakeCaseData)
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error
      toast.success('Feedback bijgewerkt')
    } catch (err: any) {
      console.error('Error updating AI feedback:', err)
      toast.error('Kon feedback niet bijwerken')
      throw err
    }
  }

  return {
    feedback,
    loading,
    error,
    addFeedback,
    updateFeedback
  }
}

// ===== AI KENNISBANK (KNOWLEDGE BASE) =====

export interface AIKnowledge {
  id?: string
  name: string
  url: string
  type: string
  size: number
  status: "indexing" | "trained" | "error"
  createdAt?: string
  updatedAt?: string
}

export function useAIKnowledge() {
  const [knowledgeFiles, setKnowledgeFiles] = useState<AIKnowledge[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let subscription: any

    const setupSubscription = async () => {
      try {
        const user = await getCurrentUser()

        const { data, error: fetchError } = await supabase
          .from('ai_knowledge')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (fetchError) throw fetchError

        const camelCaseData = toCamelCase(data) as AIKnowledge[]
        setKnowledgeFiles(camelCaseData)
        setLoading(false)

        subscription = supabase
          .channel('ai_knowledge_changes')
          .on('postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'ai_knowledge',
              filter: `user_id=eq.${user.id}`
            },
            (payload) => {
              if (payload.eventType === 'INSERT') {
                const newKnowledge = toCamelCase(payload.new) as AIKnowledge
                setKnowledgeFiles(prev => [newKnowledge, ...prev])
              } else if (payload.eventType === 'UPDATE') {
                const updatedKnowledge = toCamelCase(payload.new) as AIKnowledge
                setKnowledgeFiles(prev => prev.map(k => k.id === updatedKnowledge.id ? updatedKnowledge : k))
              } else if (payload.eventType === 'DELETE') {
                setKnowledgeFiles(prev => prev.filter(k => k.id !== payload.old.id))
              }
            }
          )
          .subscribe()

      } catch (err: any) {
        console.error('Error setting up AI knowledge subscription:', err)
        setError(err as Error)
        setLoading(false)
      }
    }

    setupSubscription()

    return () => {
      if (subscription) {
        supabase.removeChannel(subscription)
      }
    }
  }, [])

  const deleteKnowledgeFile = async (id: string) => {
    try {
      const user = await getCurrentUser()

      const { error } = await supabase
        .from('ai_knowledge')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error
      toast.success('Bestand verwijderd uit kennisbank')
    } catch (err: any) {
      console.error('Error deleting knowledge file:', err)
      toast.error('Kon bestand niet verwijderen')
      throw err
    }
  }

  return {
    knowledgeFiles,
    loading,
    error,
    deleteKnowledgeFile
  }
}
// ===== OFFERTES (QUOTES) =====

export function useOffertes() {
  const [offertes, setOffertes] = useState<Offerte[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let subscription: any

    const setupSubscription = async () => {
      try {
        const user = await getCurrentUser()

        const { data, error: fetchError } = await supabase
          .from('offertes')
          .select('*')
          .eq('user_id', user.id)
          .order('datum', { ascending: false })

        if (fetchError) throw fetchError

        const camelCaseData = toCamelCase(data) as Offerte[]
        setOffertes(camelCaseData)
        setLoading(false)

        subscription = supabase
          .channel('offertes_changes')
          .on('postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'offertes',
              filter: `user_id=eq.${user.id}`
            },
            (payload) => {
              if (payload.eventType === 'INSERT') {
                const newOfferte = toCamelCase(payload.new) as Offerte
                setOffertes(prev => [newOfferte, ...prev])
              } else if (payload.eventType === 'UPDATE') {
                const updatedOfferte = toCamelCase(payload.new) as Offerte
                setOffertes(prev => prev.map(o => o.id === updatedOfferte.id ? updatedOfferte : o))
              } else if (payload.eventType === 'DELETE') {
                setOffertes(prev => prev.filter(o => o.id !== payload.old.id))
              }
            }
          )
          .subscribe()

      } catch (err: any) {
        console.error('Error setting up offertes subscription:', err)
        setError(err.message)
        setLoading(false)
      }
    }

    setupSubscription()

    return () => {
      if (subscription) {
        supabase.removeChannel(subscription)
      }
    }
  }, [])

  const createOfferte = async (offerteData: Omit<Offerte, 'id' | 'nummer' | 'createdAt' | 'updatedAt'>) => {
    try {
      const user = await getCurrentUser()

      // Validation
      if (!offerteData.klant || !offerteData.klant.trim()) {
        throw new Error('Klantnaam is verplicht')
      }

      if (!offerteData.beschrijving || !offerteData.beschrijving.trim()) {
        throw new Error('Beschrijving is verplicht')
      }

      if (!offerteData.bedrag || offerteData.bedrag <= 0 || !Number.isFinite(offerteData.bedrag)) {
        throw new Error('Bedrag moet groter zijn dan 0')
      }

      // Generate offerte nummer
      const year = new Date().getFullYear()
      const timestamp = Date.now()
      const nummer = `OFF-${year}-${timestamp.toString().slice(-6)}`

      const snakeCaseData = toSnakeCase({
        ...offerteData,
        nummer
      })

      const { error } = await supabase
        .from('offertes')
        .insert({
          ...snakeCaseData,
          user_id: user.id
        })

      if (error) throw error
      toast.success('Offerte succesvol aangemaakt')
    } catch (err: any) {
      console.error('Error creating offerte:', err)
      toast.error('Kon offerte niet aanmaken', {
        description: err.message
      })
      throw err
    }
  }

  const updateOfferte = async (id: string, offerteData: Partial<Offerte>) => {
    try {
      const user = await getCurrentUser()
      const snakeCaseData = toSnakeCase(offerteData)

      const { error } = await supabase
        .from('offertes')
        .update(snakeCaseData)
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error
      toast.success('Offerte succesvol bijgewerkt')
    } catch (err: any) {
      console.error('Error updating offerte:', err)
      toast.error('Kon offerte niet bijwerken')
      throw err
    }
  }

  const deleteOfferte = async (id: string) => {
    try {
      const user = await getCurrentUser()

      const { error } = await supabase
        .from('offertes')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error
      toast.success('Offerte succesvol verwijderd')
    } catch (err: any) {
      console.error('Error deleting offerte:', err)
      toast.error('Kon offerte niet verwijderen')
      throw err
    }
  }

  return {
    offertes,
    loading,
    error,
    createOfferte,
    updateOfferte,
    deleteOfferte
  }
}

// ===== TRANSACTIES (TRANSACTIONS) =====

export interface Transactie {
  id?: string
  beschrijving: string
  bedrag: number
  type: "inkomst" | "uitgave"
  datum: string
  categorie?: string
  rekening?: string
  referentie?: string
  createdAt?: string
  updatedAt?: string
}

export function useTransacties() {
  const isDemoMode = import.meta.env.VITE_DEMO_MODE === "true"

  if (isDemoMode) {
    const demoHook = createDemoHook<Transactie>('transacties')()
    return {
      transacties: demoHook.data,
      loading: demoHook.loading,
      error: demoHook.error,
      createTransactie: demoHook.create,
      updateTransactie: demoHook.update,
      deleteTransactie: demoHook.delete
    }
  }

  const [transacties, setTransacties] = useState<Transactie[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let subscription: any

    const setupSubscription = async () => {
      try {
        const user = await getCurrentUser()

        // Initial fetch
        const { data, error: fetchError } = await supabase
          .from('transacties')
          .select('*')
          .eq('user_id', user.id)
          .order('datum', { ascending: false })

        if (fetchError) throw fetchError

        const camelCaseData = data?.map(toCamelCase) || []
        setTransacties(camelCaseData)
        setLoading(false)

        // Real-time subscription
        subscription = supabase
          .channel('transacties_changes')
          .on('postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'transacties',
              filter: `user_id=eq.${user.id}`
            },
            (payload) => {
              console.log('Transacties change received:', payload)

              if (payload.eventType === 'INSERT') {
                const newTransactie = toCamelCase(payload.new)
                setTransacties(prev => [newTransactie, ...prev])
              } else if (payload.eventType === 'UPDATE') {
                const updatedTransactie = toCamelCase(payload.new)
                setTransacties(prev => prev.map(t =>
                  t.id === updatedTransactie.id ? updatedTransactie : t
                ))
              } else if (payload.eventType === 'DELETE') {
                setTransacties(prev => prev.filter(t => t.id !== payload.old.id))
              }
            }
          )
          .subscribe()

      } catch (err: any) {
        console.error('Error setting up transacties subscription:', err)
        setError(err.message)
        setLoading(false)
      }
    }

    setupSubscription()

    return () => {
      if (subscription) {
        supabase.removeChannel(subscription)
      }
    }
  }, [])

  const createTransactie = async (transactieData: Omit<Transactie, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const user = await getCurrentUser()
      const snakeCaseData = toSnakeCase(transactieData)

      const { error } = await supabase
        .from('transacties')
        .insert({
          ...snakeCaseData,
          user_id: user.id
        })

      if (error) throw error
      toast.success('Transactie succesvol aangemaakt')
    } catch (err: any) {
      console.error('Error creating transactie:', err)
      toast.error('Kon transactie niet aanmaken')
      throw err
    }
  }

  const updateTransactie = async (id: string, transactieData: Partial<Transactie>) => {
    try {
      const user = await getCurrentUser()
      const snakeCaseData = toSnakeCase(transactieData)

      const { error } = await supabase
        .from('transacties')
        .update(snakeCaseData)
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error
      toast.success('Transactie succesvol bijgewerkt')
    } catch (err: any) {
      console.error('Error updating transactie:', err)
      toast.error('Kon transactie niet bijwerken')
      throw err
    }
  }

  const deleteTransactie = async (id: string) => {
    try {
      const user = await getCurrentUser()

      const { error } = await supabase
        .from('transacties')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error
      toast.success('Transactie succesvol verwijderd')
    } catch (err: any) {
      console.error('Error deleting transactie:', err)
      toast.error('Kon transactie niet verwijderen')
      throw err
    }
  }

  return {
    transacties,
    loading,
    error,
    createTransactie,
    updateTransactie,
    deleteTransactie
  }
}

// ===== APPOINTMENTS (AFSPRAKEN) =====

export interface Appointment {
  id?: string
  title: string
  type: string | "meeting" | "site_visit" | "call" | "deadline"
  date: string
  time: string
  duration?: number | string
  location?: string
  description?: string
  clientId?: string
  clientName?: string
  client?: string
  status?: "gepland" | "bevestigd" | "geannuleerd" | "voltooid" | "confirmed" | "pending" | "cancelled"
  platform?: "google_meet" | "zoom" | "teams"
  joinUrl?: string
  attendees?: string[]
  userId?: string
  createdAt?: string
  updatedAt?: string
}

export function useAppointments() {
  const isDemoMode = import.meta.env.VITE_DEMO_MODE === "true"

  if (isDemoMode) {
    const demoHook = createDemoHook<Appointment>('appointments')()
    return {
      appointments: demoHook.data,
      loading: demoHook.loading,
      error: demoHook.error,
      createAppointment: demoHook.create,
      updateAppointment: demoHook.update,
      deleteAppointment: demoHook.delete
    }
  }

  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let subscription: any

    const setupSubscription = async () => {
      try {
        const user = await getCurrentUser()

        // Initial fetch
        const { data, error: fetchError } = await supabase
          .from('appointments')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: true })

        if (fetchError) throw fetchError

        const camelCaseData = data?.map(toCamelCase) || []
        setAppointments(camelCaseData)
        setLoading(false)

        // Real-time subscription
        subscription = supabase
          .channel('appointments_changes')
          .on('postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'appointments',
              filter: `user_id=eq.${user.id}`
            },
            (payload) => {
              console.log('Appointments change received:', payload)

              if (payload.eventType === 'INSERT') {
                const newAppointment = toCamelCase(payload.new)
                setAppointments(prev => [...prev, newAppointment].sort((a, b) =>
                  new Date(a.date).getTime() - new Date(b.date).getTime()
                ))
              } else if (payload.eventType === 'UPDATE') {
                const updatedAppointment = toCamelCase(payload.new)
                setAppointments(prev => prev.map(a =>
                  a.id === updatedAppointment.id ? updatedAppointment : a
                ))
              } else if (payload.eventType === 'DELETE') {
                setAppointments(prev => prev.filter(a => a.id !== payload.old.id))
              }
            }
          )
          .subscribe()

      } catch (err: any) {
        console.error('Error setting up appointments subscription:', err)
        setError(err.message)
        setLoading(false)
      }
    }

    setupSubscription()

    return () => {
      if (subscription) {
        supabase.removeChannel(subscription)
      }
    }
  }, [])

  const createAppointment = async (appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const user = await getCurrentUser()
      const snakeCaseData = toSnakeCase(appointmentData)

      const { error } = await supabase
        .from('appointments')
        .insert({
          ...snakeCaseData,
          user_id: user.id
        })

      if (error) throw error
      toast.success('Afspraak succesvol aangemaakt')
    } catch (err: any) {
      console.error('Error creating appointment:', err)
      toast.error('Kon afspraak niet aanmaken')
      throw err
    }
  }

  const updateAppointment = async (id: string, appointmentData: Partial<Appointment>) => {
    try {
      const user = await getCurrentUser()
      const snakeCaseData = toSnakeCase(appointmentData)

      const { error } = await supabase
        .from('appointments')
        .update(snakeCaseData)
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error
      toast.success('Afspraak succesvol bijgewerkt')
    } catch (err: any) {
      console.error('Error updating appointment:', err)
      toast.error('Kon afspraak niet bijwerken')
      throw err
    }
  }

  const deleteAppointment = async (id: string) => {
    try {
      const user = await getCurrentUser()

      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error
      toast.success('Afspraak succesvol verwijderd')
    } catch (err: any) {
      console.error('Error deleting appointment:', err)
      toast.error('Kon afspraak niet verwijderen')
      throw err
    }
  }

  return {
    appointments,
    loading,
    error,
    createAppointment,
    updateAppointment,
    deleteAppointment
  }
}