import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from "@/lib/firebase";
import type { User } from "@/lib/firebase";
import { db } from "@/lib/firebase";

export type BillingStatus = "none" | "pending" | "trialing" | "active" | "past_due" | "canceled";

export interface UserProfile {
  uid: string;
  name?: string;
  email?: string;
  phone?: string;
  avatar?: string;
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
  plan?: string | null;
  modules?: string[];
  onboardingComplete?: boolean;
  onboardingImport?: "fresh" | "file";
  onboardingImportFilename?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
  lastLoginAt?: unknown;
  registrationMethod?: "email" | "google" | "github" | "apple";
}

export async function ensureUserProfile(
  user: User,
  extra?: { name?: string; companyName?: string; registrationMethod?: "email" | "google" | "github" | "apple" }
) {
  const ref = doc(db, "users", user.uid);
  const snapshot = await getDoc(ref);

  const now = serverTimestamp();
  const userData: Partial<UserProfile> = {
    uid: user.uid,
    name: extra?.name ?? user.displayName ?? "",
    email: user.email ?? "",
    avatar: user.photoURL ?? undefined,
    lastLoginAt: now,
    updatedAt: now,
  };

  // Add company name if provided
  if (extra?.companyName) {
    userData.company = {
      name: extra.companyName
    };
  }

  // Add registration method if provided
  if (extra?.registrationMethod) {
    userData.registrationMethod = extra.registrationMethod;
  }

  if (snapshot.exists()) {
    // Profile exists - update missing fields and always update lastLoginAt and updatedAt
    const existingData = snapshot.data() as UserProfile;
    
    // Only update fields that are missing or have changed
    const updates: Partial<UserProfile> = {
      updatedAt: now,
      lastLoginAt: now,
    };

    // Update name if it's missing or empty
    if (!existingData.name && userData.name) {
      updates.name = userData.name;
    }

    // Update email if it's missing or empty
    if (!existingData.email && userData.email) {
      updates.email = userData.email;
    }

    // Update avatar if it's missing or if user has a new photo URL
    if (userData.avatar && (!existingData.avatar || existingData.avatar !== userData.avatar)) {
      updates.avatar = userData.avatar;
    }

    // Update registration method if not set
    if (!existingData.registrationMethod && userData.registrationMethod) {
      updates.registrationMethod = userData.registrationMethod;
    }

    // Preserve existing company data, but add company name if provided and missing
    if (extra?.companyName && (!existingData.company?.name || existingData.company.name === "")) {
      updates.company = {
        ...existingData.company,
        name: extra.companyName
      };
    }

    // Only update if there are actual changes
    if (Object.keys(updates).length > 2) { // More than just updatedAt and lastLoginAt
      await updateDoc(ref, updates);
    } else {
      // Still update timestamps even if nothing else changed
      await updateDoc(ref, {
        updatedAt: now,
        lastLoginAt: now,
      });
    }
  } else {
    // Profile doesn't exist - create new profile with all data
    await setDoc(ref, {
      ...userData,
      company: userData.company ?? {
        name: ""
      },
      billingStatus: "none" as BillingStatus,
      plan: null,
      modules: [],
      onboardingComplete: false,
      createdAt: now,
    });
  }
}
