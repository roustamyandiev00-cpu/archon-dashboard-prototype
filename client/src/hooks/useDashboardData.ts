/**
 * Dashboard Data Hook
 * Haalt alle data op die het Dashboard nodig heeft en converteert naar het juiste formaat
 */

import {
  useKlanten,
  useFacturen,
  useProjecten,
  useTransacties,
  useAppointments,
  useOffertes,
  type Appointment,
  type Transactie
} from '@/lib/api-supabase';
import { demoData } from '@/lib/demo-data';

// Ensure demoData is always available
const safeDemoData = demoData || {
  facturen: [],
  transacties: [],
  klanten: [],
  projecten: [],
  appointments: []
};

// Dashboard data types
export interface DashboardFactuur {
  bedrag: number;
  status: string;
  datum?: string;
}

export interface DashboardTransactie {
  bedrag: number;
  type: "inkomst" | "uitgave";
  datum: string;
}

export interface DashboardKlant {
  id: string;
}

export interface DashboardProject {
  id: string;
  name: string;
  client: string;
  status: string;
  progress: number;
  deadline: string;
  budget?: number;
}

export interface DashboardAppointment {
  id: string;
  title: string;
  type: string;
  date: string;
  time: string;
}

export function useDashboardData() {
  // Hooks kunnen crashen bij permission errors, dus gebruik safe defaults
  const klantenHook = useKlanten();
  const facturenHook = useFacturen();
  const projectenHook = useProjecten();
  const transactiesHook = useTransacties();
  const appointmentsHook = useAppointments();
  const offertesHook = useOffertes();

  // Safe extraction met fallbacks
  const supabaseKlanten = klantenHook?.klanten || [];
  const supabaseFacturen = facturenHook?.facturen || [];
  const supabaseProjecten = projectenHook?.projecten || [];
  const supabaseTransacties = transactiesHook?.transacties || [];
  const supabaseAppointments = appointmentsHook?.appointments || [];
  const supabaseOffertes = offertesHook?.offertes || [];

  const klantenLoading = klantenHook?.loading ?? false;
  const facturenLoading = facturenHook?.loading ?? false;
  const projectenLoading = projectenHook?.loading ?? false;
  const transactiesLoading = transactiesHook?.loading ?? false;
  const appointmentsLoading = appointmentsHook?.loading ?? false;
  const offertesLoading = offertesHook?.loading ?? false;

  // Expliciete demo mode check via context/env
  const isDemoMode = import.meta.env.VITE_DEMO_MODE === "true";

  // Converteer Supabase appointments naar Dashboard formaat
  const appointments: DashboardAppointment[] = supabaseAppointments && supabaseAppointments.length > 0
    ? supabaseAppointments.map((a: Appointment) => ({
      id: a.id || '',
      title: a.title || '',
      type: a.type || '',
      date: a.date || '',
      time: a.time || ''
    }))
    : (isDemoMode && !appointmentsLoading)
      ? (safeDemoData?.appointments || []).map((a: any) => ({
        id: a.id || '',
        title: a.title || '',
        type: a.type || '',
        date: a.date || '',
        time: a.time || ''
      }))
      : [];

  // Converteer Supabase facturen naar Dashboard formaat
  const facturen: DashboardFactuur[] = supabaseFacturen && supabaseFacturen.length > 0
    ? supabaseFacturen.map(f => ({
      bedrag: f.amount || 0,
      status: f.status,
      datum: f.date || f.created_at || ''
    }))
    : (isDemoMode && !facturenLoading)
      ? (safeDemoData?.facturen || []).map(f => ({
        bedrag: f.bedrag,
        status: f.status === 'betaald' ? 'betaald' :
          f.status === 'overtijd' ? 'overtijd' : 'openstaand',
        datum: f.datum
      }))
      : [];

  // Converteer Supabase klanten naar Dashboard formaat
  const klanten: DashboardKlant[] = supabaseKlanten && supabaseKlanten.length > 0
    ? supabaseKlanten.map(k => ({
      id: k.id || ''
    }))
    : (isDemoMode && !klantenLoading)
      ? (safeDemoData?.klanten || []).map(k => ({ id: k.id || '' }))
      : [];

  // Converteer Supabase projecten naar Dashboard formaat
  const projects: DashboardProject[] = supabaseProjecten && supabaseProjecten.length > 0
    ? supabaseProjecten.map(p => ({
      id: p.id || '',
      name: p.name || '',
      client: p.client_name || '',
      status: p.status || 'Planning',
      progress: p.progress || 0,
      deadline: p.deadline || '',
      budget: p.budget || 0
    }))
    : (isDemoMode && !projectenLoading)
      ? (safeDemoData?.projects || []).map((p: any) => ({
        id: p.id || '',
        name: p.name || '',
        client: p.client || '',
        status: p.status || 'Planning',
        progress: p.progress || 0,
        deadline: p.deadline || '',
        budget: p.budget || 0
      }))
      : [];

  // Converteer Supabase transacties naar Dashboard formaat
  const finalTransacties: DashboardTransactie[] = supabaseTransacties && supabaseTransacties.length > 0
    ? supabaseTransacties.map((t: Transactie) => ({
      bedrag: t.bedrag || 0,
      type: t.type,
      datum: t.datum || ''
    }))
    : (isDemoMode && !transactiesLoading)
      ? (safeDemoData?.transacties || []).map(t => ({
        bedrag: t.bedrag,
        type: t.type as "inkomst" | "uitgave",
        datum: t.datum
      }))
      : [];

  return {
    facturen,
    transacties: finalTransacties,
    klanten,
    projects,
    appointments,
    offertes: supabaseOffertes,
    loading: facturenLoading || klantenLoading || projectenLoading || transactiesLoading || appointmentsLoading || offertesLoading
  };
}