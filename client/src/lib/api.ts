import { supabase } from "@/lib/supabase";

// Base API configuration
const API_BASE_URL = import.meta.env.DEV
  ? 'http://localhost:3000/api'  // Local development
  : '/api';  // Production

// Generic API client with authentication
class ApiClient {
  private async getAuthHeaders(): Promise<HeadersInit> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      throw new Error('User not authenticated');
    }

    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`
    };
  }

  async get<T>(endpoint: string): Promise<T> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async delete<T>(endpoint: string): Promise<T> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async uploadAvatar(file: File): Promise<{ url: string; message: string }> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token || !session.user) {
      throw new Error('User not authenticated');
    }

    // Create a unique file path: userId/timestamp.ext
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${session.user.id}/${fileName}`;

    // Upload to Supabase Storage 'avatars' bucket
    // Note: The bucket 'avatars' must exist and RLS policies must allow the user to upload to their folder
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      console.error('Supabase storage upload error:', uploadError);
      throw new Error(uploadError.message || 'Fout bij uploaden naar storage');
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    return { url: publicUrl, message: 'Avatar succesvol geüpload' };
  }
}

export const apiClient = new ApiClient();

// ===== KLANTEN API =====

export interface Klant extends Record<string, unknown> {
  id?: string;
  naam: string;
  email: string;
  telefoon?: string;
  adres?: string;
  postcode?: string;
  plaats?: string;
  land?: string;
  bedrijf?: string;
  kvkNummer?: string;
  btwNummer?: string;
  contactpersoon?: string;
  notities?: string;
  type?: "particulier" | "zakelijk";
  status?: "actief" | "inactief";
  totaalOmzet?: number;
  laatsteFactuur?: string;
  avatar?: string;
  createdAt?: any;
  updatedAt?: any;
}

export const klantenApi = {
  // Haal alle klanten op
  getAll: (): Promise<{ klanten: Klant[] }> =>
    apiClient.get('/klanten'),

  // Maak nieuwe klant aan
  create: (klant: Omit<Klant, 'id' | 'createdAt' | 'updatedAt'>): Promise<Klant> =>
    apiClient.post('/klanten', klant),

  // Update klant
  update: (id: string, klant: Partial<Klant>): Promise<Klant> =>
    apiClient.put(`/klanten/${id}`, klant),

  // Verwijder klant
  delete: (id: string): Promise<{ message: string }> =>
    apiClient.delete(`/klanten/${id}`)
};

// ===== FACTUREN API =====

export interface FactuurRegel {
  beschrijving: string;
  aantal: number;
  prijs: number;
  btw: number;
}

export interface Factuur {
  id?: string;
  factuurNummer?: string;
  klantId: string;
  klantNaam?: string;
  datum: string;
  vervaldatum: string;
  regels: FactuurRegel[];
  subtotaal: number;
  btwBedrag: number;
  totaal: number;
  status: 'concept' | 'verzonden' | 'betaald' | 'vervallen';
  notities?: string;
  createdAt?: any;
  updatedAt?: any;
}

export const facturenApi = {
  // Haal alle facturen op
  getAll: (): Promise<{ facturen: Factuur[] }> =>
    apiClient.get('/facturen'),

  // Maak nieuwe factuur aan
  create: (factuur: Omit<Factuur, 'id' | 'factuurNummer' | 'createdAt' | 'updatedAt'>): Promise<Factuur> =>
    apiClient.post('/facturen', factuur),

  // Update factuur
  update: (id: string, factuur: Partial<Factuur>): Promise<Factuur> =>
    apiClient.put(`/facturen/${id}`, factuur),

  // Verwijder factuur
  delete: (id: string): Promise<{ message: string }> =>
    apiClient.delete(`/facturen/${id}`)
};

// ===== REACT HOOKS =====

import { useState, useEffect } from 'react';
import { toast } from 'sonner';

// Hook voor klanten data
export function useKlanten() {
  const [klanten, setKlanten] = useState<Klant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchKlanten = async () => {
    try {
      setLoading(true);
      const response = await klantenApi.getAll();
      setKlanten(response.klanten);
      setError(null);
    } catch (err) {
      console.error('Error fetching klanten:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch klanten');
      toast.error('Kon klanten niet laden');
    } finally {
      setLoading(false);
    }
  };

  const createKlant = async (klantData: Omit<Klant, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newKlant = await klantenApi.create(klantData);
      setKlanten(prev => [newKlant, ...prev]);
      toast.success('Klant succesvol aangemaakt');
      return newKlant;
    } catch (err) {
      console.error('Error creating klant:', err);
      toast.error('Kon klant niet aanmaken');
      throw err;
    }
  };

  const updateKlant = async (id: string, klantData: Partial<Klant>) => {
    try {
      const updatedKlant = await klantenApi.update(id, klantData);
      setKlanten(prev => prev.map(k => k.id === id ? updatedKlant : k));
      toast.success('Klant succesvol bijgewerkt');
      return updatedKlant;
    } catch (err) {
      console.error('Error updating klant:', err);
      toast.error('Kon klant niet bijwerken');
      throw err;
    }
  };

  const deleteKlant = async (id: string) => {
    try {
      await klantenApi.delete(id);
      setKlanten(prev => prev.filter(k => k.id !== id));
      toast.success('Klant succesvol verwijderd');
    } catch (err) {
      console.error('Error deleting klant:', err);
      toast.error('Kon klant niet verwijderen');
      throw err;
    }
  };

  useEffect(() => {
    fetchKlanten();
  }, []);

  return {
    klanten,
    loading,
    error,
    refetch: fetchKlanten,
    createKlant,
    updateKlant,
    deleteKlant
  };
}

// Hook voor facturen data
export function useFacturen() {
  const [facturen, setFacturen] = useState<Factuur[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFacturen = async () => {
    try {
      setLoading(true);
      const response = await facturenApi.getAll();
      setFacturen(response.facturen);
      setError(null);
    } catch (err) {
      console.error('Error fetching facturen:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch facturen');
      toast.error('Kon facturen niet laden');
    } finally {
      setLoading(false);
    }
  };

  const createFactuur = async (factuurData: Omit<Factuur, 'id' | 'factuurNummer' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newFactuur = await facturenApi.create(factuurData);
      setFacturen(prev => [newFactuur, ...prev]);
      toast.success('Factuur succesvol aangemaakt');
      return newFactuur;
    } catch (err) {
      console.error('Error creating factuur:', err);
      toast.error('Kon factuur niet aanmaken');
      throw err;
    }
  };

  const updateFactuur = async (id: string, factuurData: Partial<Factuur>) => {
    try {
      const updatedFactuur = await facturenApi.update(id, factuurData);
      setFacturen(prev => prev.map(f => f.id === id ? updatedFactuur : f));
      toast.success('Factuur succesvol bijgewerkt');
      return updatedFactuur;
    } catch (err) {
      console.error('Error updating factuur:', err);
      toast.error('Kon factuur niet bijwerken');
      throw err;
    }
  };

  const deleteFactuur = async (id: string) => {
    try {
      await facturenApi.delete(id);
      setFacturen(prev => prev.filter(f => f.id !== id));
      toast.success('Factuur succesvol verwijderd');
    } catch (err) {
      console.error('Error deleting factuur:', err);
      toast.error('Kon factuur niet verwijderen');
      throw err;
    }
  };

  useEffect(() => {
    fetchFacturen();
  }, []);

  return {
    facturen,
    loading,
    error,
    refetch: fetchFacturen,
    createFactuur,
    updateFactuur,
    deleteFactuur
  };
}