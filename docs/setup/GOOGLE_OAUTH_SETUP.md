# Google OAuth Configuration for Archon Dashboard

## Google OAuth Credentials
- **Client ID**: YOUR_CLIENT_ID_HERE
- **Client Secret**: YOUR_CLIENT_SECRET_HERE

## Required Redirect URIs

### Production
https://bpgcfjrxtjcmjruhcngn.supabase.co/auth/v1/callback

### Development (localhost)
http://localhost:3007/auth/v1/callback

## Setup Instructions

### 1. Google Cloud Console
1. Go to: https://console.cloud.google.com/
2. Select your project or create new one
3. Go to: APIs & Services → Credentials
4. Find your OAuth 2.0 Client ID
5. Edit the client and add redirect URIs:
   - `https://bpgcfjrxtjcmjruhcngn.supabase.co/auth/v1/callback`
   - `http://localhost:3007/auth/v1/callback`

### 2. Supabase Dashboard
1. Go to: https://bpgcfjrxtjcmjruhcngn.supabase.co
2. Authentication → Providers → Google
3. Enable Google provider
4. Enter credentials:
   - Client ID: YOUR_CLIENT_ID_HERE
   - Client Secret: YOUR_CLIENT_SECRET_HERE
5. Save configuration

### 3. Test Google Login
1. Go to: http://localhost:3007/login
2. Click Google login button
3. Authenticate with Google

## Notes
- Make sure both redirect URIs are added in Google Cloud Console
- The client ID and secret are already configured for this project
- Test both development and production environments
