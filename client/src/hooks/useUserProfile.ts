import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
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

    const isDemoMode = import.meta.env.VITE_DEMO_MODE === "true";

    if (isDemoMode) {
      // In demo mode, use localStorage only - no Supabase calls
      console.log("🧪 useUserProfile: Demo mode - using localStorage only");

      const profileKey = `demo_user_profiles_${user.id}`;
      let demoProfile = null;

      try {
        const stored = localStorage.getItem(profileKey);
        if (stored) {
          demoProfile = JSON.parse(stored);
        }
      } catch (e) {
        console.error("Failed to parse demo profile:", e);
      }

      if (!demoProfile) {
        // Create default demo profile
        demoProfile = {
          uid: user.id,
          id: user.id,
          userId: user.id,
          name: user.user_metadata?.display_name || 'Demo Gebruiker',
          email: user.email || 'demo@archon.ai',
          displayName: user.user_metadata?.display_name || 'Demo Gebruiker',
          photoUrl: user.user_metadata?.avatar_url || 'https://i.pravatar.cc/150?u=demo',
          companyName: 'Demo Bedrijf',
          phone: '',
          address: '',
          postalCode: '',
          city: '',
          country: 'Nederland',
          kvkNumber: '',
          btwNumber: '',
          billingStatus: 'trialing',
          stripeCustomerId: '',
          subscriptionId: '',
          planId: 'growth',
          plan: 'growth',
          modules: ["crm", "invoicing", "projects"],
          onboardingComplete: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        localStorage.setItem(profileKey, JSON.stringify(demoProfile));
      }

      setProfile(demoProfile);
      setLoading(false);
      return; // Exit early - no Supabase setup needed
    }

    // Original Supabase implementation for non-demo mode
    let subscription: any;

    const setupProfile = async () => {
      try {
        // Fetch initial profile
        const { data, error: fetchError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows returned
          throw fetchError;
        }

        if (data) {
          // Convert snake_case to camelCase
          const camelCaseProfile: UserProfile = {
            uid: user.id, // Keep uid for compatibility
            id: data.id,
            userId: data.user_id,
            name: data.display_name || user.user_metadata?.display_name || '',
            email: data.email || user.email || '',
            displayName: data.display_name || user.user_metadata?.display_name || '',
            photoUrl: data.photo_url || user.user_metadata?.avatar_url || '',
            companyName: data.company_name || '',
            phone: data.phone || '',
            address: data.address || '',
            postalCode: data.postal_code || '',
            city: data.city || '',
            country: data.country || 'Nederland',
            kvkNumber: data.kvk_number || '',
            btwNumber: data.btw_number || '',
            billingStatus: data.billing_status || 'none',
            stripeCustomerId: data.stripe_customer_id || '',
            subscriptionId: data.subscription_id || '',
            planId: data.plan_id || '',
            plan: data.plan_id || null,
            modules: [], // Will be derived from plan
            onboardingComplete: !!data.display_name, // Simple heuristic
            trialEndsAt: data.trial_ends_at,
            subscriptionEndsAt: data.subscription_ends_at,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
          };
          setProfile(camelCaseProfile);

          // Sync to localStorage for offline access
          localStorage.setItem('userProfile', JSON.stringify(camelCaseProfile));
        } else {
          // Try localStorage fallback first
          const localData = localStorage.getItem('userProfile');
          if (localData) {
            try {
              const parsedData = JSON.parse(localData);
              if (parsedData.uid === user.id || parsedData.userId === user.id || parsedData.uid === "00000000-0000-0000-0000-000000000123") {
                console.log("📦 Using localStorage profile fallback");
                setProfile(parsedData);
                setLoading(false);
                return;
              }
            } catch (e) {
              console.error("Failed to parse localStorage profile:", e);
            }
          }

          // Create default profile if none exists
          const isDemoMode = import.meta.env.VITE_DEMO_MODE === "true";
          const defaultProfile: Partial<UserProfile> = {
            uid: user.id, // Keep uid for compatibility
            userId: user.id,
            name: user.user_metadata?.display_name || '',
            email: user.email || '',
            displayName: user.user_metadata?.display_name || '',
            photoUrl: user.user_metadata?.avatar_url || '',
            country: 'Nederland',
            billingStatus: isDemoMode ? 'trialing' : 'none',
            plan: isDemoMode ? 'growth' : null,
            modules: isDemoMode ? ["crm", "invoicing", "projects"] : [],
            onboardingComplete: isDemoMode
          };

          const { data: newProfile, error: createError } = await supabase
            .from('user_profiles')
            .insert({
              user_id: user.id,
              email: defaultProfile.email,
              display_name: defaultProfile.displayName,
              photo_url: defaultProfile.photoUrl,
              country: defaultProfile.country,
              billing_status: defaultProfile.billingStatus,
            })
            .select()
            .single();

          if (createError) {
            console.error('Error creating profile, using default:', createError);
            setProfile(defaultProfile as UserProfile);
          } else {
            const camelCaseProfile: UserProfile = {
              uid: user.id,
              id: newProfile.id,
              userId: newProfile.user_id,
              name: newProfile.display_name || '',
              email: newProfile.email || '',
              displayName: newProfile.display_name || '',
              photoUrl: newProfile.photo_url || '',
              companyName: newProfile.company_name || '',
              phone: newProfile.phone || '',
              address: newProfile.address || '',
              postalCode: newProfile.postal_code || '',
              city: newProfile.city || '',
              country: newProfile.country || 'Nederland',
              kvkNumber: newProfile.kvk_number || '',
              btwNumber: newProfile.btw_number || '',
              billingStatus: newProfile.billing_status || 'none',
              stripeCustomerId: newProfile.stripe_customer_id || '',
              subscriptionId: newProfile.subscription_id || '',
              planId: newProfile.plan_id || '',
              plan: newProfile.plan_id || null,
              modules: isDemoMode ? ["crm", "invoicing", "projects"] : [],
              onboardingComplete: isDemoMode,
              trialEndsAt: newProfile.trial_ends_at,
              subscriptionEndsAt: newProfile.subscription_ends_at,
              createdAt: newProfile.created_at,
              updatedAt: newProfile.updated_at,
            };
            setProfile(camelCaseProfile);
            localStorage.setItem('userProfile', JSON.stringify(camelCaseProfile));
          }
        }

        setLoading(false);

        // Set up real-time subscription
        subscription = supabase
          .channel('user_profile_changes')
          .on('postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'user_profiles',
              filter: `user_id=eq.${user.id}`
            },
            (payload) => {
              console.log('Profile change received:', payload);

              if (payload.eventType === 'UPDATE') {
                const updatedData = payload.new;
                const camelCaseProfile: UserProfile = {
                  uid: user.id,
                  id: updatedData.id,
                  userId: updatedData.user_id,
                  name: updatedData.display_name || '',
                  email: updatedData.email || '',
                  displayName: updatedData.display_name || '',
                  photoUrl: updatedData.photo_url || '',
                  companyName: updatedData.company_name || '',
                  phone: updatedData.phone || '',
                  address: updatedData.address || '',
                  postalCode: updatedData.postal_code || '',
                  city: updatedData.city || '',
                  country: updatedData.country || 'Nederland',
                  kvkNumber: updatedData.kvk_number || '',
                  btwNumber: updatedData.btw_number || '',
                  billingStatus: updatedData.billing_status || 'none',
                  stripeCustomerId: updatedData.stripe_customer_id || '',
                  subscriptionId: updatedData.subscription_id || '',
                  planId: updatedData.plan_id || '',
                  plan: updatedData.plan_id || null,
                  modules: profile?.modules || [],
                  onboardingComplete: profile?.onboardingComplete || false,
                  trialEndsAt: updatedData.trial_ends_at,
                  subscriptionEndsAt: updatedData.subscription_ends_at,
                  createdAt: updatedData.created_at,
                  updatedAt: updatedData.updated_at,
                };
                setProfile(camelCaseProfile);
                localStorage.setItem('userProfile', JSON.stringify(camelCaseProfile));

                // Dispatch event for other hooks/components
                window.dispatchEvent(new CustomEvent('userProfileUpdated', {
                  detail: camelCaseProfile
                }));
              }
            }
          )
          .subscribe();

      } catch (err: any) {
        console.error('Error setting up user profile:', err);

        // Fallback to localStorage
        const localData = localStorage.getItem('userProfile');
        if (localData) {
          try {
            const parsedData = JSON.parse(localData);
            if (parsedData.uid === user.id || parsedData.userId === user.id || parsedData.uid === "00000000-0000-0000-0000-000000000123") {
              console.log("📦 Using localStorage profile after error");
              setProfile(parsedData);
              setLoading(false);
              return;
            }
          } catch (e) {
            console.error("Failed to parse localStorage profile:", e);
          }
        }

        // Complete failure, use default
        const isDemoMode = import.meta.env.VITE_DEMO_MODE === "true";
        const defaultProfile: UserProfile = {
          uid: user.id,
          userId: user.id,
          name: user.user_metadata?.display_name || '',
          email: user.email || '',
          displayName: user.user_metadata?.display_name || '',
          photoUrl: user.user_metadata?.avatar_url || '',
          companyName: '',
          phone: '',
          address: '',
          postalCode: '',
          city: '',
          country: 'Nederland',
          kvkNumber: '',
          btwNumber: '',
          billingStatus: isDemoMode ? 'trialing' : 'none',
          stripeCustomerId: '',
          subscriptionId: '',
          planId: '',
          plan: isDemoMode ? 'growth' : null,
          modules: isDemoMode ? ["crm", "invoicing", "projects"] : [],
          onboardingComplete: isDemoMode,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setProfile(defaultProfile);
        setLoading(false);
      }
    };

    setupProfile();

    // Listen for custom userProfileUpdated event
    const handleProfileUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail && (customEvent.detail.uid === user.id || customEvent.detail.userId === user.id)) {
        console.log("📡 Received userProfileUpdated event:", customEvent.detail);
        setProfile(customEvent.detail);
      }
    };

    window.addEventListener('userProfileUpdated', handleProfileUpdate);

    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
      window.removeEventListener('userProfileUpdated', handleProfileUpdate);
    };
  }, [authLoading, user?.id, user?.email]);

  const updateProfile = useMemo(() => {
    return async (updates: Partial<UserProfile>) => {
      if (!user) {
        return;
      }

      const isDemoMode = import.meta.env.VITE_DEMO_MODE === "true";

      if (isDemoMode) {
        // Demo mode - update localStorage only
        console.log("🧪 updateProfile: Demo mode - updating localStorage");

        const profileKey = `demo_user_profiles_${user.id}`;
        const currentProfile = profile || {
          uid: user.id,
          userId: user.id,
          name: user.user_metadata?.display_name || '',
          email: user.email || '',
          displayName: user.user_metadata?.display_name || '',
          photoUrl: user.user_metadata?.avatar_url || '',
          companyName: '',
          phone: '',
          address: '',
          postalCode: '',
          city: '',
          country: 'Nederland',
          kvkNumber: '',
          btwNumber: '',
          billingStatus: 'trialing',
          stripeCustomerId: '',
          subscriptionId: '',
          planId: 'growth',
          plan: 'growth',
          modules: ["crm", "invoicing", "projects"],
          onboardingComplete: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const updatedProfile = {
          ...currentProfile,
          ...updates,
          updatedAt: new Date().toISOString()
        };

        localStorage.setItem(profileKey, JSON.stringify(updatedProfile));
        setProfile(updatedProfile);

        // Dispatch event for other hooks/components
        window.dispatchEvent(new CustomEvent('userProfileUpdated', {
          detail: updatedProfile
        }));

        console.log("✅ Profile updated in localStorage (demo mode)");
        return;
      }

      // Original Supabase implementation for non-demo mode
      try {
        // Convert camelCase to snake_case for database
        // Convert camelCase to snake_case for database
        const snakeCaseUpdates: any = {};

        // Explicit mappings for known fields
        if (updates.name !== undefined) snakeCaseUpdates.display_name = updates.name;
        if (updates.displayName !== undefined) snakeCaseUpdates.display_name = updates.displayName;
        if (updates.photoUrl !== undefined) snakeCaseUpdates.photo_url = updates.photoUrl;
        if (updates.companyName !== undefined) snakeCaseUpdates.company_name = updates.companyName;
        if (updates.kvkNumber !== undefined) snakeCaseUpdates.kvk_number = updates.kvkNumber;
        if (updates.btwNumber !== undefined) snakeCaseUpdates.btw_number = updates.btwNumber;
        if (updates.stripeCustomerId !== undefined) snakeCaseUpdates.stripe_customer_id = updates.stripeCustomerId;
        if (updates.subscriptionId !== undefined) snakeCaseUpdates.subscription_id = updates.subscriptionId;
        if (updates.planId !== undefined) snakeCaseUpdates.plan_id = updates.planId;
        if (updates.billingStatus !== undefined) snakeCaseUpdates.billing_status = updates.billingStatus;
        if (updates.trialEndsAt !== undefined) snakeCaseUpdates.trial_ends_at = updates.trialEndsAt;
        if (updates.subscriptionEndsAt !== undefined) snakeCaseUpdates.subscription_ends_at = updates.subscriptionEndsAt;

        // Generic mapping for other fields (address, city, etc which are simple lowercase)
        const knownMappedKeys = ['name', 'displayName', 'photoUrl', 'companyName', 'kvkNumber', 'btwNumber', 'stripeCustomerId', 'subscriptionId', 'planId', 'billingStatus', 'trialEndsAt', 'subscriptionEndsAt', 'uid', 'userId', 'id', 'user_id', 'created_at', 'updated_at', 'modules', 'onboardingComplete', 'plan'];

        Object.entries(updates).forEach(([key, value]) => {
          if (knownMappedKeys.includes(key)) return; // Skip already handled keys

          const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
          snakeCaseUpdates[snakeKey] = value;
        });

        const { error } = await supabase
          .from('user_profiles')
          .update(snakeCaseUpdates)
          .eq('user_id', user.id);

        if (error) throw error;

        console.log('✅ Profile updated in Supabase');
      } catch (error) {
        console.error("Supabase update failed, using localStorage:", error);

        // Fallback to localStorage
        const currentProfile = profile || {
          uid: user.id,
          userId: user.id,
          name: user.user_metadata?.display_name || '',
          email: user.email || '',
          displayName: user.user_metadata?.display_name || '',
          photoUrl: user.user_metadata?.avatar_url || '',
          companyName: '',
          phone: '',
          address: '',
          postalCode: '',
          city: '',
          country: 'Nederland',
          kvkNumber: '',
          btwNumber: '',
          billingStatus: 'none',
          stripeCustomerId: '',
          subscriptionId: '',
          planId: '',
          plan: null,
          modules: [],
          onboardingComplete: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const updatedProfile = {
          ...currentProfile,
          ...updates,
          updatedAt: new Date().toISOString()
        };

        localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
        setProfile(updatedProfile);

        // Dispatch event for other hooks/components
        window.dispatchEvent(new CustomEvent('userProfileUpdated', {
          detail: updatedProfile
        }));

        console.log("✅ Profile updated in localStorage");
      }
    };
  }, [user, profile]);

  return { profile, loading: authLoading || loading, updateProfile };
}