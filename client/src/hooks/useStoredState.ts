import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export const useStoredState = <T,>(key: string, initialValue: T) => {
  const { user, loading: authLoading } = useAuth();
  const [state, setState] = useState<T>(initialValue);
  const loadedRef = useRef(false);

  useEffect(() => {
    loadedRef.current = false;

    if (authLoading) {
      return;
    }

    if (!user) {
      setState(initialValue);
      loadedRef.current = true;
      return;
    }

    let active = true;

    const load = async () => {
      try {
        const isDemoMode = import.meta.env.VITE_DEMO_MODE === "true";
        
        if (isDemoMode) {
          // In demo mode, use localStorage
          const storageKey = `demo_state_${user.id}_${key}`;
          const stored = localStorage.getItem(storageKey);
          if (stored) {
            const value = JSON.parse(stored) as T;
            setState(value);
          } else {
            setState(initialValue);
          }
          loadedRef.current = true;
          return;
        }

        // Use Supabase for non-demo mode
        const { data, error } = await supabase
          .from('user_state')
          .select('value')
          .eq('user_id', user.id)
          .eq('key', key)
          .single();

        if (!active) {
          return;
        }

        if (data && !error) {
          setState(data.value as T);
        } else {
          setState(initialValue);
        }
      } catch {
        if (active) {
          setState(initialValue);
        }
      } finally {
        if (active) {
          loadedRef.current = true;
        }
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [authLoading, user?.id, key, initialValue]);

  useEffect(() => {
    if (authLoading || !user || !loadedRef.current) {
      return;
    }

    const save = async () => {
      try {
        const isDemoMode = import.meta.env.VITE_DEMO_MODE === "true";
        
        if (isDemoMode) {
          // In demo mode, use localStorage
          const storageKey = `demo_state_${user.id}_${key}`;
          localStorage.setItem(storageKey, JSON.stringify(state));
          return;
        }

        // Use Supabase for non-demo mode
        await supabase
          .from('user_state')
          .upsert({
            user_id: user.id,
            key: key,
            value: state,
            updated_at: new Date().toISOString()
          });
      } catch (error) {
        console.error('Failed to save state:', error);
      }
    };

    save();
  }, [authLoading, user, key, state]);

  return [state, setState] as const;
};
