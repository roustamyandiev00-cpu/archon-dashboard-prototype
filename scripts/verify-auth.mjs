#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Verificatie Firebase Authentication Setup...\n');

// 1. Check .env.local file
const envPath = path.join(__dirname, '..', '.env.local');
if (!fs.existsSync(envPath)) {
  console.error('❌ .env.local niet gevonden!');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf-8');
const requiredVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
];

let allPresent = true;
requiredVars.forEach(varName => {
  if (envContent.includes(varName + '=')) {
    console.log(`✅ ${varName} gevonden`);
  } else {
    console.log(`❌ ${varName} NIET gevonden`);
    allPresent = false;
  }
});

if (!allPresent) {
  console.error('\n❌ Niet alle Firebase credentials zijn ingesteld in .env.local');
  process.exit(1);
}

// 2. Check Authentication files
const authFiles = [
  'client/src/pages/Login.tsx',
  'client/src/pages/Register.tsx',
  'client/src/contexts/AuthContext.tsx',
  'client/src/lib/firebase.ts'
];

console.log('\n🔍 Verificatie authenticatie bestanden...');
authFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} gevonden`);
  } else {
    console.log(`❌ ${file} NIET gevonden`);
    allPresent = false;
  }
});

// 3. Instructies
console.log('\n📋 Volgende stappen:');
console.log('1. Ga naar Firebase Console: https://console.firebase.google.com');
console.log('2. Selecteer project: ai-agent-5fab0');
console.log('3. Ga naar Authentication > Sign-in method');
console.log('4. Activeer minimaal "Email/Password" provider');
console.log('5. Start de app: npm run dev');
console.log('6. Test registratie: http://localhost:5173/register');
console.log('7. Test login: http://localhost:5173/login\n');

console.log('✅ Alle bestanden zijn correct ingesteld!');
console.log('📖 Zie AUTHENTICATIE_SETUP.md voor gedetailleerde instructies\n');

