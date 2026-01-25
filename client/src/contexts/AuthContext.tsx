import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from '@supabase/supabase-js';

type AuthStatus = "idle" | "loading" | "authed" | "guest";

interface AuthContextValue {
  user: User | null;
  status: AuthStatus;
  loading: boolean; // Keep for backward compatibility, same as status === 'loading'
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>("idle");

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      // Status update will be handled by the auth state listener
    } catch (error) {
      console.error("Logout failed:", error);
      // Force local cleanup even if server call fails
      setUser(null);
      setStatus("guest");
    }
  };

  useEffect(() => {
    const isDemoMode = import.meta.env.VITE_DEMO_MODE === "true";
    setStatus("loading");
    console.log("🚀 AuthProvider: Setting up auth state listener", { isDemoMode });

    if (isDemoMode) {
      // In demo mode, immediately set mock user without any Supabase calls
      console.log("🧪 AuthProvider: Demo mode active, providing mock user");
      const mockUser = {
        id: "00000000-0000-0000-0000-000000000123", // Valid UUID format
        email: "demo@archon.ai",
        user_metadata: {
          display_name: "Demo Gebruiker",
          avatar_url: "https://i.pravatar.cc/150?u=demo",
        },
        app_metadata: {},
        aud: "authenticated",
        created_at: new Date().toISOString(),
      } as User;
      setUser(mockUser);
      setStatus("authed");
      return; // Exit early, no cleanup needed
    }

    // Only set up Supabase auth in non-demo mode
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("🚀 AuthProvider: Initial session:", session ? "User found" : "No user");
      
      if (session?.user) {
        setUser(session.user);
        setStatus("authed");
      } else {
        setUser(null);
        setStatus("guest");
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("🚀 AuthProvider: Auth state changed:", event, session ? "User found" : "No user");

      if (session?.user) {
        setUser(session.user);
        setStatus("authed");
      } else {
        setUser(null);
        setStatus("guest");
      }
    });

    return () => {
      console.log("🚀 AuthProvider: Cleaning up auth listener");
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(() => {
    const derivedLoading = status === "idle" || status === "loading";
    // console.log("🚀 AuthProvider: State update -", { status, hasUser: !!user });
    return {
      user,
      status,
      loading: derivedLoading,
      logout
    };
  }, [user, status]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
