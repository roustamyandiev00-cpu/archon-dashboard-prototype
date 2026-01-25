/**
 * Real AI Service Integration
 * Integrates with Google Gemini API for:
 * - Image analysis (vision)
 * - Text generation (scope drafting)
 * - Pricing suggestions
 * - Conversational AI
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';

// Initialize Gemini AI
let genAI: GoogleGenerativeAI | null = null;
if (GEMINI_API_KEY && !DEMO_MODE) {
  genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
}

// ===== TYPES =====

export interface ImageAnalysisResult {
  dimensions?: {
    width: number;
    height: number;
    area: number;
    confidence: number;
  };
  materials: Array<{
    name: string;
    quantity: number;
    unit: string;
    confidence: number;
  }>;
  workTypes: Array<{
    category: string;
    description: string;
    timeEstimate: number;
    complexity: 'low' | 'medium' | 'high';
  }>;
  risks: string[];
  opportunities: string[];
  priceEstimate: {
    low: number;
    high: number;
    recommended: number;
  };
  confidence: number;
}

export interface ScopeGenerationResult {
  scopeText: string;
  assumptions: string[];
  questions: string[];
  confidence: number;
}

export interface PricingSuggestion {
  items: Array<{
    id: string;
    category: string;
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    totalPrice: number;
    margin: number;
    confidence: number;
  }>;
  subtotal: number;
  recommendations: string[];
  marketPosition: 'below' | 'average' | 'above';
  winProbability: number;
}

// ===== IMAGE ANALYSIS =====

export async function analyzeImages(
  images: File[],
  description: string,
  projectType: string
): Promise<ImageAnalysisResult> {
  if (DEMO_MODE || !genAI) {
    return generateMockAnalysis(description, projectType);
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    // Convert images to base64
    const imageParts = await Promise.all(
      images.map(async (file) => {
        const base64 = await fileToBase64(file);
        return {
          inlineData: {
            data: base64.split(',')[1],
            mimeType: file.type,
          },
        };
      })
    );

    const prompt = `Analyseer deze bouwproject foto's en geef een gedetailleerde analyse:

Project Type: ${projectType}
Beschrijving: ${description}

Geef een JSON response met:
1. dimensions: geschatte afmetingen (width, height, area in m²)
2. materials: lijst van benodigde materialen met hoeveelheden
3. workTypes: soorten werk met tijdsinschatting in uren
4. risks: potentiële risico's
5. opportunities: upsell mogelijkheden
6. priceEstimate: prijsschatting (low, high, recommended in EUR)
7. confidence: betrouwbaarheid score (0-100)

Antwoord alleen met valid JSON.`;

    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    const text = response.text();

    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return normalizeAnalysisResult(parsed);
    }

    throw new Error('Invalid AI response format');
  } catch (error) {
    console.error('AI Analysis error:', error);
    return generateMockAnalysis(description, projectType);
  }
}

// ===== SCOPE GENERATION =====

export async function generateScope(
  transcript: string,
  context?: {
    customerName?: string;
    siteType?: string;
    measurements?: any[];
  }
): Promise<ScopeGenerationResult> {
  if (DEMO_MODE || !genAI) {
    return generateMockScope(transcript, context);
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `Genereer een professionele scope document op basis van deze transcriptie:

Transcriptie: ${transcript}
Klant: ${context?.customerName || 'Onbekend'}
Locatie Type: ${context?.siteType || 'Onbekend'}

Geef een JSON response met:
1. scopeText: gestructureerde scope tekst in Nederlands
2. assumptions: lijst van aannames
3. questions: vragen die nog beantwoord moeten worden
4. confidence: betrouwbaarheid score (0-100)

Antwoord alleen met valid JSON.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    throw new Error('Invalid AI response format');
  } catch (error) {
    console.error('Scope generation error:', error);
    return generateMockScope(transcript, context);
  }
}

// ===== PRICING SUGGESTIONS =====

export async function generatePricingSuggestions(
  scope: string,
  measurements?: any[],
  priceBook?: any[]
): Promise<PricingSuggestion> {
  if (DEMO_MODE || !genAI) {
    return generateMockPricing(scope, measurements);
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `Genereer prijssuggesties voor dit bouwproject:

Scope: ${scope}
Metingen: ${JSON.stringify(measurements || [])}
Beschikbare items: ${JSON.stringify(priceBook?.slice(0, 20) || [])}

Geef een JSON response met:
1. items: lijst van offerte regels met quantity, unit, unitPrice, totalPrice
2. subtotal: totaal bedrag
3. recommendations: aanbevelingen voor de offerte
4. marketPosition: 'below', 'average', of 'above'
5. winProbability: kans op succes (0-100)

Gebruik realistische Nederlandse bouwprijzen.
Antwoord alleen met valid JSON.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    throw new Error('Invalid AI response format');
  } catch (error) {
    console.error('Pricing generation error:', error);
    return generateMockPricing(scope, measurements);
  }
}

// ===== CONVERSATIONAL AI =====

export async function chatWithAI(
  message: string,
  context?: {
    conversationHistory?: Array<{ role: string; content: string }>;
    projectData?: any;
  }
): Promise<string> {
  if (DEMO_MODE || !genAI) {
    return generateMockChatResponse(message);
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const systemPrompt = `Je bent Archon, een AI assistent voor bouwbedrijven. 
Je helpt met het maken van offertes, analyseren van projecten, en adviseren over prijzen.
Antwoord altijd in het Nederlands, professioneel maar vriendelijk.`;

    const fullPrompt = `${systemPrompt}\n\nGebruiker: ${message}\n\nArchon:`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Chat error:', error);
    return generateMockChatResponse(message);
  }
}

// ===== HELPER FUNCTIONS =====

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function normalizeAnalysisResult(parsed: any): ImageAnalysisResult {
  return {
    dimensions: parsed.dimensions || undefined,
    materials: parsed.materials || [],
    workTypes: parsed.workTypes || [],
    risks: parsed.risks || [],
    opportunities: parsed.opportunities || [],
    priceEstimate: parsed.priceEstimate || { low: 0, high: 0, recommended: 0 },
    confidence: parsed.confidence || 70,
  };
}

// ===== MOCK FUNCTIONS (Fallback) =====

function generateMockAnalysis(description: string, projectType: string): ImageAnalysisResult {
  const area = 20 + Math.random() * 80;
  const complexity: 'low' | 'medium' | 'high' = 
    area > 60 ? 'high' : area > 30 ? 'medium' : 'low';

  return {
    dimensions: {
      width: Math.sqrt(area),
      height: Math.sqrt(area),
      area: Math.round(area * 10) / 10,
      confidence: 75,
    },
    materials: [
      { name: 'Algemene materialen', quantity: Math.ceil(area / 10), unit: 'm²', confidence: 80 },
      { name: 'Afwerkingsmaterialen', quantity: 1, unit: 'set', confidence: 70 },
    ],
    workTypes: [
      {
        category: projectType || 'Algemeen',
        description: description || 'Algemene werkzaamheden',
        timeEstimate: Math.ceil(area / 5),
        complexity,
      },
    ],
    risks: ['Onvoorziene omstandigheden mogelijk'],
    opportunities: [`Extra afwerking (+€${Math.round(area * 15)})`],
    priceEstimate: {
      low: Math.round(area * 40),
      high: Math.round(area * 80),
      recommended: Math.round(area * 60),
    },
    confidence: 75,
  };
}

function generateMockScope(
  transcript: string,
  context?: any
): ScopeGenerationResult {
  return {
    scopeText: `Werkzaamheden voor ${context?.customerName || 'klant'}

Op basis van het bezoek zijn de volgende werkzaamheden geïdentificeerd:

${transcript.split('.').slice(0, 3).map(s => `- ${s.trim()}`).join('\n')}

Dit is een automatisch gegenereerde samenvatting.`,
    assumptions: [
      'Werkgebied is toegankelijk',
      'Bestaande installaties zijn functioneel',
    ],
    questions: [
      'Wat is de gewenste startdatum?',
      'Zijn er specifieke materiaalwensen?',
    ],
    confidence: 70,
  };
}

function generateMockPricing(scope: string, measurements?: any[]): PricingSuggestion {
  const baseAmount = 1500 + Math.random() * 3000;

  return {
    items: [
      {
        id: '1',
        category: 'Arbeid',
        description: 'Algemene werkzaamheden',
        quantity: 16,
        unit: 'uur',
        unitPrice: 45,
        totalPrice: 720,
        margin: 0.35,
        confidence: 85,
      },
      {
        id: '2',
        category: 'Materiaal',
        description: 'Materialen en benodigdheden',
        quantity: 1,
        unit: 'set',
        unitPrice: Math.round(baseAmount),
        totalPrice: Math.round(baseAmount),
        margin: 0.25,
        confidence: 75,
      },
    ],
    subtotal: Math.round(baseAmount + 720),
    recommendations: [
      'Prijzen zijn marktconform',
      'Overweeg garantie-uitbreiding aan te bieden',
    ],
    marketPosition: 'average',
    winProbability: 75,
  };
}

function generateMockChatResponse(message: string): string {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('prijs') || lowerMessage.includes('kosten')) {
    return 'Ik ga de prijzen berekenen op basis van de beschikbare informatie. Dit duurt even...';
  }

  if (lowerMessage.includes('ja') || lowerMessage.includes('akkoord')) {
    return 'Perfect! Laten we doorgaan met de volgende stap.';
  }

  if (lowerMessage.includes('help') || lowerMessage.includes('hulp')) {
    return 'Ik kan je helpen met het analyseren van foto\'s, genereren van offertes, en adviseren over prijzen. Wat wil je doen?';
  }

  return 'Ik begrijp het. Heb je nog andere vragen over het project?';
}

export const AI_SERVICE = {
  analyzeImages,
  generateScope,
  generatePricingSuggestions,
  chatWithAI,
};
