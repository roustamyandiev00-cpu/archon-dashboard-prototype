/**
 * Firestore API Implementation
 * Real-time data sync met Firebase Firestore
 * 
 * Gebruik dit in plaats van api-demo.ts voor productie
 */

import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  where,
  Timestamp,
  getDocs
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { toast } from 'sonner';

// Types copied from api-demo.ts to remove dependency
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

// ===== KLANTEN (CUSTOMERS) =====

export function useKlanten() {
  const [klanten, setKlanten] = useState<Klant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      setError('Not authenticated');
      return;
    }

    // Real-time listener voor klanten
    const klantenRef = collection(db, 'users', user.uid, 'klanten');
    const q = query(klantenRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map(doc => {
          const docData = doc.data();
          return {
            id: doc.id,
            ...docData,
            // Convert Firestore Timestamps to ISO strings
            createdAt: docData.createdAt instanceof Timestamp 
              ? docData.createdAt.toDate().toISOString() 
              : docData.createdAt,
            updatedAt: docData.updatedAt instanceof Timestamp 
              ? docData.updatedAt.toDate().toISOString() 
              : docData.updatedAt,
          };
        }) as Klant[];
        
        setKlanten(data);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error fetching klanten:', err);
        setError(err.message);
        setLoading(false);
        toast.error('Kon klanten niet laden');
      }
    );

    return () => unsubscribe();
  }, []);

  const createKlant = async (klantData: Omit<Klant, 'id' | 'createdAt' | 'updatedAt'>) => {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');

    try {
      const klantenRef = collection(db, 'users', user.uid, 'klanten');
      await addDoc(klantenRef, {
        ...klantData,
        userId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      toast.success('Klant succesvol aangemaakt');
    } catch (err) {
      console.error('Error creating klant:', err);
      toast.error('Kon klant niet aanmaken');
      throw err;
    }
  };

  const updateKlant = async (id: string, klantData: Partial<Klant>) => {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');

    try {
      const klantRef = doc(db, 'users', user.uid, 'klanten', id);
      
      // Remove undefined values
      const cleanData = Object.fromEntries(
        Object.entries(klantData).filter(([_, v]) => v !== undefined)
      );
      
      await updateDoc(klantRef, {
        ...cleanData,
        updatedAt: serverTimestamp()
      });
      toast.success('Klant succesvol bijgewerkt');
    } catch (err) {
      console.error('Error updating klant:', err);
      toast.error('Kon klant niet bijwerken');
      throw err;
    }
  };

  const deleteKlant = async (id: string) => {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');

    try {
      const klantRef = doc(db, 'users', user.uid, 'klanten', id);
      await deleteDoc(klantRef);
      toast.success('Klant succesvol verwijderd');
    } catch (err) {
      console.error('Error deleting klant:', err);
      toast.error('Kon klant niet verwijderen');
      throw err;
    }
  };

  return {
    klanten,
    loading,
    error,
    createKlant,
    updateKlant,
    deleteKlant
  };
}

// ===== FACTUREN (INVOICES) =====

export function useFacturen() {
  const [facturen, setFacturen] = useState<Factuur[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      setError('Not authenticated');
      return;
    }

    // Real-time listener voor facturen
    const facturenRef = collection(db, 'users', user.uid, 'facturen');
    const q = query(facturenRef, orderBy('datum', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map(doc => {
          const docData = doc.data();
          return {
            id: doc.id,
            ...docData,
            createdAt: docData.createdAt instanceof Timestamp 
              ? docData.createdAt.toDate().toISOString() 
              : docData.createdAt,
            updatedAt: docData.updatedAt instanceof Timestamp 
              ? docData.updatedAt.toDate().toISOString() 
              : docData.updatedAt,
          };
        }) as Factuur[];
        
        setFacturen(data);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error fetching facturen:', err);
        setError(err.message);
        setLoading(false);
        toast.error('Kon facturen niet laden');
      }
    );

    return () => unsubscribe();
  }, []);

  const createFactuur = async (factuurData: Omit<Factuur, 'id' | 'factuurNummer' | 'createdAt' | 'updatedAt'>) => {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');

    try {
      const facturenRef = collection(db, 'users', user.uid, 'facturen');
      
      // Generate factuur nummer (simple implementation)
      const year = new Date().getFullYear();
      const timestamp = Date.now();
      const factuurNummer = `F${year}-${timestamp.toString().slice(-6)}`;
      
      await addDoc(facturenRef, {
        ...factuurData,
        factuurNummer,
        userId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      toast.success('Factuur succesvol aangemaakt');
    } catch (err) {
      console.error('Error creating factuur:', err);
      toast.error('Kon factuur niet aanmaken');
      throw err;
    }
  };

  const updateFactuur = async (id: string, factuurData: Partial<Factuur>) => {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');

    try {
      const factuurRef = doc(db, 'users', user.uid, 'facturen', id);
      
      const cleanData = Object.fromEntries(
        Object.entries(factuurData).filter(([_, v]) => v !== undefined)
      );
      
      await updateDoc(factuurRef, {
        ...cleanData,
        updatedAt: serverTimestamp()
      });
      toast.success('Factuur succesvol bijgewerkt');
    } catch (err) {
      console.error('Error updating factuur:', err);
      toast.error('Kon factuur niet bijwerken');
      throw err;
    }
  };

  const deleteFactuur = async (id: string) => {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');

    try {
      const factuurRef = doc(db, 'users', user.uid, 'facturen', id);
      await deleteDoc(factuurRef);
      toast.success('Factuur succesvol verwijderd');
    } catch (err) {
      console.error('Error deleting factuur:', err);
      toast.error('Kon factuur niet verwijderen');
      throw err;
    }
  };

  return {
    facturen,
    loading,
    error,
    createFactuur,
    updateFactuur,
    deleteFactuur
  };
}

// ===== HELPER FUNCTIONS =====

/**
 * Get klanten by status
 */
export async function getKlantenByStatus(status: 'actief' | 'inactief'): Promise<Klant[]> {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');

  const klantenRef = collection(db, 'users', user.uid, 'klanten');
  const q = query(
    klantenRef, 
    where('status', '==', status),
    orderBy('naam', 'asc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Klant[];
}

/**
 * Get facturen by status
 */
export async function getFacturenByStatus(status: Factuur['status']): Promise<Factuur[]> {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');

  const facturenRef = collection(db, 'users', user.uid, 'facturen');
  const q = query(
    facturenRef,
    where('status', '==', status),
    orderBy('datum', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Factuur[];
}

// ===== PROJECTEN (PROJECTS) =====

export interface Project {
  id?: string;
  name: string;
  client?: string;
  clientName?: string;
  location?: string;
  budget: number;
  spent?: number;
  status: string;
  progress?: number;
  deadline?: string;
  image?: string;
  paymentMilestones?: {
    id: string;
    name: string;
    amount: number;
    dueDate: string;
    status: "open" | "verzonden" | "betaald";
    percentage: number;
  }[];
  team?: any[];
  archived?: boolean;
  createdAt?: any;
  updatedAt?: any;
  userId?: string;
}

export function useProjecten() {
  const [projecten, setProjecten] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      setError('Not authenticated');
      return;
    }

    // Real-time listener voor projecten
    const projectenRef = collection(db, 'users', user.uid, 'projecten');
    const q = query(projectenRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map(doc => {
          const docData = doc.data();
          return {
            id: doc.id,
            ...docData,
            createdAt: docData.createdAt instanceof Timestamp 
              ? docData.createdAt.toDate().toISOString() 
              : docData.createdAt,
            updatedAt: docData.updatedAt instanceof Timestamp 
              ? docData.updatedAt.toDate().toISOString() 
              : docData.updatedAt,
          };
        }) as Project[];
        
        setProjecten(data);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error fetching projecten:', err);
        setError(err.message);
        setLoading(false);
        toast.error('Kon projecten niet laden');
      }
    );

    return () => unsubscribe();
  }, []);

  const createProject = async (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');

    try {
      const projectenRef = collection(db, 'users', user.uid, 'projecten');
      await addDoc(projectenRef, {
        ...projectData,
        userId: user.uid,
        spent: projectData.spent || 0,
        progress: projectData.progress || 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      toast.success('Project succesvol aangemaakt');
    } catch (err) {
      console.error('Error creating project:', err);
      toast.error('Kon project niet aanmaken');
      throw err;
    }
  };

  const updateProject = async (id: string, projectData: Partial<Project>) => {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');

    try {
      const projectRef = doc(db, 'users', user.uid, 'projecten', id);
      
      const cleanData = Object.fromEntries(
        Object.entries(projectData).filter(([_, v]) => v !== undefined)
      );
      
      await updateDoc(projectRef, {
        ...cleanData,
        updatedAt: serverTimestamp()
      });
      toast.success('Project succesvol bijgewerkt');
    } catch (err) {
      console.error('Error updating project:', err);
      toast.error('Kon project niet bijwerken');
      throw err;
    }
  };

  const deleteProject = async (id: string) => {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');

    try {
      const projectRef = doc(db, 'users', user.uid, 'projecten', id);
      await deleteDoc(projectRef);
      toast.success('Project succesvol verwijderd');
    } catch (err) {
      console.error('Error deleting project:', err);
      toast.error('Kon project niet verwijderen');
      throw err;
    }
  };

  return {
    projecten,
    loading,
    error,
    createProject,
    updateProject,
    deleteProject
  };
}

// ===== OFFERTES (QUOTES) =====

export interface Offerte {
  id?: string;
  nummer: string;
  klant: string;
  bedrag: number;
  datum: string;
  geldigTot: string;
  status: "concept" | "verzonden" | "geaccepteerd" | "afgewezen" | "verlopen";
  beschrijving: string;
  items?: number;
  winProbability?: number;
  aiInsight?: string;
  createdAt?: any;
  updatedAt?: any;
}

export function useOffertes() {
  const [offertes, setOffertes] = useState<Offerte[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      setError('Not authenticated');
      return;
    }

    // Real-time listener voor offertes
    const offertesRef = collection(db, 'users', user.uid, 'offertes');
    const q = query(offertesRef, orderBy('datum', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map(doc => {
          const docData = doc.data();
          return {
            id: doc.id,
            ...docData,
            createdAt: docData.createdAt instanceof Timestamp 
              ? docData.createdAt.toDate().toISOString() 
              : docData.createdAt,
            updatedAt: docData.updatedAt instanceof Timestamp 
              ? docData.updatedAt.toDate().toISOString() 
              : docData.updatedAt,
          };
        }) as Offerte[];
        
        setOffertes(data);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error fetching offertes:', err);
        setError(err.message);
        setLoading(false);
        toast.error('Kon offertes niet laden');
      }
    );

    return () => unsubscribe();
  }, []);

  const createOfferte = async (offerteData: Omit<Offerte, 'id' | 'nummer' | 'createdAt' | 'updatedAt'>) => {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');

    try {
      const offertesRef = collection(db, 'users', user.uid, 'offertes');
      
      // Generate offerte nummer
      const year = new Date().getFullYear();
      const timestamp = Date.now();
      const nummer = `O${year}-${timestamp.toString().slice(-6)}`;
      
      await addDoc(offertesRef, {
        ...offerteData,
        nummer,
        userId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      toast.success('Offerte succesvol aangemaakt');
    } catch (err) {
      console.error('Error creating offerte:', err);
      toast.error('Kon offerte niet aanmaken');
      throw err;
    }
  };

  const updateOfferte = async (id: string, offerteData: Partial<Offerte>) => {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');

    try {
      const offerteRef = doc(db, 'users', user.uid, 'offertes', id);
      
      const cleanData = Object.fromEntries(
        Object.entries(offerteData).filter(([_, v]) => v !== undefined)
      );
      
      await updateDoc(offerteRef, {
        ...cleanData,
        updatedAt: serverTimestamp()
      });
      toast.success('Offerte succesvol bijgewerkt');
    } catch (err) {
      console.error('Error updating offerte:', err);
      toast.error('Kon offerte niet bijwerken');
      throw err;
    }
  };

  const deleteOfferte = async (id: string) => {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');

    try {
      const offerteRef = doc(db, 'users', user.uid, 'offertes', id);
      await deleteDoc(offerteRef);
      toast.success('Offerte succesvol verwijderd');
    } catch (err) {
      console.error('Error deleting offerte:', err);
      toast.error('Kon offerte niet verwijderen');
      throw err;
    }
  };

  return {
    offertes,
    loading,
    error,
    createOfferte,
    updateOfferte,
    deleteOfferte
  };
}
