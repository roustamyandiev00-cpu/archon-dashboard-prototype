import { useEffect, useRef, useState } from "react";
import { doc, getDoc, serverTimestamp, setDoc } from "@/lib/firebase";
import { db } from "@/lib/firebase";
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
        const ref = doc(db, "users", user.uid, "state", key);
        const snapshot = await getDoc(ref);

        if (!active) {
          return;
        }

        if (snapshot.exists()) {
          const value = snapshot.data()?.value as T | undefined;
          if (value !== undefined) {
            setState(value);
          }
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
  }, [authLoading, user?.uid, key, initialValue]);

  useEffect(() => {
    if (authLoading || !user || !loadedRef.current) {
      return;
    }

    const ref = doc(db, "users", user.uid, "state", key);
    setDoc(
      ref,
      {
        value: state,
        updatedAt: serverTimestamp()
      },
      { merge: true }
    );
  }, [authLoading, user, key, state]);

  return [state, setState] as const;
};
