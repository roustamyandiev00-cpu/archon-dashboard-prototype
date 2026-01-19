import { useEffect, useMemo, useState } from "react";
import { doc, onSnapshot, serverTimestamp, setDoc } from "@/lib/firebase";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import type { UserProfile } from "@/lib/userProfile";

interface UseUserProfileResult {
  profile: UserProfile | null;
  loading: boolean;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

export function useUserProfile(): UseUserProfileResult {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const ref = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(
      ref,
      (snapshot) => {
        if (snapshot.exists()) {
          setProfile({ ...(snapshot.data() as UserProfile), uid: user.uid });
        } else {
          setProfile({
            uid: user.uid,
            name: user.displayName ?? "",
            email: user.email ?? "",
            billingStatus: "none",
            plan: null,
            modules: [],
            onboardingComplete: false
          });
        }
        setLoading(false);
      },
      () => {
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [authLoading, user?.uid]);

  const updateProfile = useMemo(() => {
    return async (updates: Partial<UserProfile>) => {
      if (!user) {
        return;
      }

      const ref = doc(db, "users", user.uid);
      await setDoc(
        ref,
        {
          ...updates,
          updatedAt: serverTimestamp()
        },
        { merge: true }
      );
    };
  }, [user]);

  return { profile, loading: authLoading || loading, updateProfile };
}
