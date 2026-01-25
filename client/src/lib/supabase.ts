import { createClient } from '@supabase/supabase-js'

// ============================================
// SUPABASE CONFIGURATION VALIDATION
// ============================================

// Check if we're accidentally on production domain during development
if (window.location.hostname === "archonpro.com") {
  console.warn("🔄 Detected production domain during development, redirecting to localhost...")
  window.location.href = "http://localhost:3007"
  // This will stop execution and redirect
}

// Check if we have access token in URL (coming from OAuth)
if (window.location.hash.includes('access_token') && window.location.hostname === "archonpro.com") {
  console.warn("🔄 OAuth redirect detected, redirecting to localhost with tokens...")
  const hash = window.location.hash
  window.location.href = `http://localhost:3007${hash}`
  // This will stop execution and redirect
}

const requiredEnvVars = {
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
}

// Check for missing or invalid env vars
const missingVars = Object.entries(requiredEnvVars)
  .filter(([key, value]) => !value || value.includes("your-"))
  .map(([key]) => key)

if (missingVars.length > 0) {
  console.error("❌ Missing or invalid Supabase environment variables:", missingVars)
  console.error("📋 Current config:", {
    url: requiredEnvVars.VITE_SUPABASE_URL,
    anonKeyPrefix: requiredEnvVars.VITE_SUPABASE_ANON_KEY?.substring(0, 10) + "...",
  })
}

// Check if we're in development
const isDev = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"

// Helper to clean environment variables
const clean = (val: string | undefined) => {
  if (!val) return ""
  return val.split(/[ #]/)[0].trim()
}

// Supabase configuration
const supabaseUrl = clean(requiredEnvVars.VITE_SUPABASE_URL)
const supabaseAnonKey = clean(requiredEnvVars.VITE_SUPABASE_ANON_KEY)

// Log configuration (without secrets)
console.log("🚀 Supabase initialized:", {
  environment: isDev ? "development" : "production",
  url: supabaseUrl,
  anonKeyValid: supabaseAnonKey.startsWith("eyJ"),
  configComplete: missingVars.length === 0,
})

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true  // Enable URL session detection for OAuth
  }
})

// Warn if configuration seems incomplete
if (missingVars.length > 0) {
  console.warn("⚠️ Supabase configuration incomplete - some features may not work correctly")
}

// Export auth helpers for compatibility
export const auth = supabase.auth
export const db = supabase

// Export types
export type { User } from '@supabase/supabase-js'