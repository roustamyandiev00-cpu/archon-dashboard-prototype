import { doc, getDoc, serverTimestamp, setDoc } from "@/lib/firebase";
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
}

export async function ensureUserProfile(
  user: User,
  extra?: { name?: string; companyName?: string }
) {
  const ref = doc(db, "users", user.uid);
  const snapshot = await getDoc(ref);

  if (snapshot.exists()) {
    return;
  }

  await setDoc(ref, {
    uid: user.uid,
    name: extra?.name ?? user.displayName ?? "",
    email: user.email ?? "",
    company: {
      name: extra?.companyName ?? ""
    },
    billingStatus: "none",
    plan: null,
    modules: [],
    onboardingComplete: false,
    createdAt: serverTimestamp()
  });
}
