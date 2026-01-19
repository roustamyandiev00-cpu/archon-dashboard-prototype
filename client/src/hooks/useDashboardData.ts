/**
 * Dashboard Data Hook
 * Haalt alle data op die het Dashboard nodig heeft en converteert naar het juiste formaat
 */

import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot,
  Timestamp,
  getDocs
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useKlanten, useFacturen, useProjecten } from '@/lib/api-firestore';
import { useStoredState } from './useStoredState';

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
  const { klanten: firestoreKlanten } = useKlanten();
  const { facturen: firestoreFacturen } = useFacturen();
  const { projecten: firestoreProjecten } = useProjecten();
  
  // Transacties en appointments gebruiken nog useStoredState (kunnen later ook naar Firestore)
  const [transacties] = useStoredState<DashboardTransactie[]>("transacties", []);
  const [appointments] = useStoredState<DashboardAppointment[]>("appointments", []);

  // Converteer Firestore facturen naar Dashboard formaat
  const facturen: DashboardFactuur[] = firestoreFacturen.map(f => ({
    bedrag: f.totaal || 0,
    status: f.status === 'betaald' ? 'betaald' : 
            f.status === 'verzonden' ? 'openstaand' : 
            f.status === 'vervallen' ? 'overtijd' : 'concept',
    datum: f.datum || (typeof f.createdAt === 'string' ? f.createdAt : '')
  }));

  // Converteer Firestore klanten naar Dashboard formaat
  const klanten: DashboardKlant[] = firestoreKlanten.map(k => ({
    id: k.id || ''
  }));

  // Converteer Firestore projecten naar Dashboard formaat
  const projects: DashboardProject[] = firestoreProjecten.map(p => ({
    id: p.id || '',
    name: p.name || '',
    client: p.client || p.clientName || '',
    status: p.status || 'Planning',
    progress: p.progress || 0,
    deadline: p.deadline || '',
    budget: p.budget || 0
  }));

  return {
    facturen,
    transacties,
    klanten,
    projects,
    appointments,
    loading: false // Firestore hooks hebben hun eigen loading states
  };
}
