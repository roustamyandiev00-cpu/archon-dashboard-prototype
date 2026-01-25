import { supabase } from "@/lib/supabase";
import type { User } from '@supabase/supabase-js';

export type BillingStatus = "none" | "pending" | "trialing" | "active" | "past_due" | "canceled";

export interface UserProfile {
  uid: string; // Keep for compatibility
  id?: string;
  userId?: string;
  name?: string;
  email?: string;
  displayName?: string;
  photoUrl?: string;
  phone?: string;
  avatar?: string;
  companyName?: string;
  address?: string;
  postalCode?: string;
  city?: string;
  country?: string;
  kvkNumber?: string;
  btwNumber?: string;
  company?: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    kvkNumber?: string;
    btwNumber?: string;
    iban?: string;
  };
  billingStatus?: BillingStatus;
  stripeCustomerId?: string;
  subscriptionId?: string;
  planId?: string;
  plan?: string | null;
  modules?: string[];
  onboardingComplete?: boolean;
  onboardingImport?: "fresh" | "file";
  onboardingImportFilename?: string;
  stripeSubscriptionId?: string;
  trialEndsAt?: string;
  subscriptionEndsAt?: string;
  createdAt?: string;
  updatedAt?: string;
  lastLoginAt?: string;
  registrationMethod?: "email" | "google" | "github" | "apple";
}

export async function ensureUserProfile(
  user: User,
  extra?: { name?: string; companyName?: string; registrationMethod?: "email" | "google" | "github" | "apple" }
) {
  try {
    // Check if profile exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    const now = new Date().toISOString();
    const userData = {
      user_id: user.id,
      email: user.email || '',
      display_name: extra?.name || user.user_metadata?.display_name || '',
      photo_url: user.user_metadata?.avatar_url || '',
      company_name: extra?.companyName || '',
      country: 'Nederland',
    };

    if (existingProfile) {
      // Profile exists - update missing fields
      const updates: any = {};

      // Update name if it's missing or empty
      if (!existingProfile.display_name && userData.display_name) {
        updates.display_name = userData.display_name;
      }

      // Update email if it's missing or empty
      if (!existingProfile.email && userData.email) {
        updates.email = userData.email;
      }

      // Update photo if it's missing or if user has a new photo URL
      if (userData.photo_url && (!existingProfile.photo_url || existingProfile.photo_url !== userData.photo_url)) {
        updates.photo_url = userData.photo_url;
      }

      // Update company name if provided and missing
      if (extra?.companyName && (!existingProfile.company_name || existingProfile.company_name === "")) {
        updates.company_name = extra.companyName;
      }

      // Only update if there are actual changes
      if (Object.keys(updates).length > 0) {
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update(updates)
          .eq('user_id', user.id);

        if (updateError) {
          console.error('Error updating user profile:', updateError);
        }
      }
    } else {
      // Profile doesn't exist - create new profile
      const { error: createError } = await supabase
        .from('user_profiles')
        .insert({
          ...userData,
          billing_status: 'trialing', // Auto trial for new users
          plan_id: 'growth', // Default growth plan for trial
          created_at: now,
          updated_at: now,
        });

      if (createError) {
        console.error('Error creating user profile:', createError);
        throw createError;
      }
    }
  } catch (error) {
    console.error('Error in ensureUserProfile:', error);
    // Don't throw - let the app continue with default profile
  }
}