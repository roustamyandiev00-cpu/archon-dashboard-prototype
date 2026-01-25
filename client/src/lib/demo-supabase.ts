/**
 * Demo mode fallback for Supabase API
 * Uses localStorage when Supabase is not available or in demo mode
 */

import { useState, useEffect } from 'react'
import { toast } from 'sonner'

// Demo user ID
const DEMO_USER_ID = "00000000-0000-0000-0000-000000000123"

// Helper functions for localStorage
const getStorageKey = (table: string) => `demo_${table}_${DEMO_USER_ID}`

const getFromStorage = <T>(table: string): T[] => {
  try {
    const data = localStorage.getItem(getStorageKey(table))
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

const saveToStorage = <T>(table: string, data: T[]) => {
  localStorage.setItem(getStorageKey(table), JSON.stringify(data))
}

// Generate demo data if not exists
const initializeDemoData = () => {
  const tables = ['klanten', 'facturen', 'projecten', 'offertes', 'transacties', 'appointments']
  
  tables.forEach(table => {
    if (!localStorage.getItem(getStorageKey(table))) {
      saveToStorage(table, [])
    }
  })
  
  // Initialize user profile if not exists
  const profileKey = `demo_user_profiles_${DEMO_USER_ID}`
  if (!localStorage.getItem(profileKey)) {
    const demoProfile = {
      id: DEMO_USER_ID,
      user_id: DEMO_USER_ID,
      uid: DEMO_USER_ID,
      email: "demo@archon.ai",
      display_name: "Demo Gebruiker",
      name: "Demo Gebruiker",
      photo_url: "https://i.pravatar.cc/150?u=demo",
      country: "Nederland",
      billing_status: "trialing",
      plan_id: "growth",
      plan: "growth",
      modules: ["crm", "invoicing", "projects"],
      onboarding_complete: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    localStorage.setItem(profileKey, JSON.stringify(demoProfile))
  }
}

// Initialize demo data on import
initializeDemoData()

// Generic CRUD operations for demo mode
export const createDemoHook = <T extends { id?: string }>(tableName: string) => {
  return () => {
    const [data, setData] = useState<T[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
      // Simulate loading delay
      setTimeout(() => {
        const storedData = getFromStorage<T>(tableName)
        setData(storedData)
        setLoading(false)
      }, 100)
    }, [])

    const create = async (item: Omit<T, 'id' | 'createdAt' | 'updatedAt'>) => {
      try {
        const newItem = {
          ...item,
          id: `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as unknown as T

        const currentData = getFromStorage<T>(tableName)
        const updatedData = [newItem, ...currentData]
        saveToStorage(tableName, updatedData)
        setData(updatedData)
        
        toast.success(`${tableName} succesvol aangemaakt`)
      } catch (err: any) {
        toast.error(`Kon ${tableName} niet aanmaken`)
        throw err
      }
    }

    const update = async (id: string, updates: Partial<T>) => {
      try {
        const currentData = getFromStorage<T>(tableName)
        const updatedData = currentData.map(item => 
          item.id === id 
            ? { ...item, ...updates, updatedAt: new Date().toISOString() }
            : item
        )
        saveToStorage(tableName, updatedData)
        setData(updatedData)
        
        toast.success(`${tableName} succesvol bijgewerkt`)
      } catch (err: any) {
        toast.error(`Kon ${tableName} niet bijwerken`)
        throw err
      }
    }

    const remove = async (id: string) => {
      try {
        const currentData = getFromStorage<T>(tableName)
        const updatedData = currentData.filter(item => item.id !== id)
        saveToStorage(tableName, updatedData)
        setData(updatedData)
        
        toast.success(`${tableName} succesvol verwijderd`)
      } catch (err: any) {
        toast.error(`Kon ${tableName} niet verwijderen`)
        throw err
      }
    }

    return {
      data,
      loading,
      error,
      create,
      update,
      delete: remove
    }
  }
}