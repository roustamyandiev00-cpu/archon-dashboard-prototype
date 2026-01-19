import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { auth, onAuthStateChanged, signOut, type User } from "@/lib/firebase";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = async () => {
    await signOut(auth);
  };

  useEffect(() => {
    console.log("🔥 AuthProvider: Setting up auth state listener");

    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      console.log("🔥 AuthProvider: Auth state changed:", nextUser);
      setUser(nextUser ?? null);
      setLoading(false);
    });

    return () => {
      console.log("🔥 AuthProvider: Cleaning up auth listener");
      unsubscribe();
    };
  }, []);

  const value = useMemo(() => {
    console.log("🔥 AuthProvider: Current auth state - user:", user, "loading:", loading);
    return { user, loading, logout };
  }, [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
