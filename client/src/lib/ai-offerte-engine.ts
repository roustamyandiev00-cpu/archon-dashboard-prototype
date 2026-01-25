/**
 * 🧠 AI Offerte Engine
 * Simuleert geavanceerde AI functionaliteit voor offerte generatie
 * In productie zou dit echte AI API's aanroepen (OpenAI, Claude, etc.)
 */

export interface AIAnalysisRequest {
  images?: string[]; // Base64 encoded images
  description: string;
  projectType: string;
  client: string;
}

export interface AIAnalysisResponse {
  dimensions?: {
    width: number;
    height: number;
    area: number;
    confidence: number;
  };
  materials: {
    name: string;
    quantity: number;
    unit: string;
    confidence: number;
  }[];
  workTypes: {
    category: string;
    description: string;
    timeEstimate: number;
    complexity: "low" | "medium" | "high";
  }[];
  risks: string[];
  opportunities: string[];
  priceEstimate: {
    low: number;
    high: number;
    recommended: number;
  };
  confidence: number;
}

export interface PricingRequest {
  workTypes: string[];
  dimensions?: { width: number; height: number; area: number };
  materials: string[];
  complexity: "low" | "medium" | "high";
  region?: string;
}

export interface PricingResponse {
  items: {
    id: string;
    category: string;
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    totalPrice: number;
    margin: number;
    confidence: number;
  }[];
  subtotal: number;
  recommendations: string[];
  marketPosition: "below" | "average" | "above";
  winProbability: number;
}

// 🎨 Mock AI Vision Analysis
export async function analyzeImages(request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  const { images, description, projectType } = request;

  // Mock analysis based on project type
  const mockAnalysis: AIAnalysisResponse = {
    confidence: Math.floor(Math.random() * 20) + 80,
    risks: [],
    opportunities: [],
    materials: [],
    workTypes: [],
    priceEstimate: { low: 0, high: 0, recommended: 0 }
  };

  // Analyze project type for dimensions
  if (projectType.toLowerCase().includes('badkamer')) {
    mockAnalysis.dimensions = {
      width: 2.5 + Math.random() * 2,
      height: 2.0 + Math.random() * 1.5,
      area: 0,
      confidence: 85
    };
    mockAnalysis.dimensions.area = Math.round(mockAnalysis.dimensions.width * mockAnalysis.dimensions.height * 10) / 10;
    
    mockAnalysis.materials = [
      { name: "Tegels wand", quantity: mockAnalysis.dimensions.area * 1.2, unit: "m²", confidence: 90 },
      { name: "Tegels vloer", quantity: mockAnalysis.dimensions.area, unit: "m²", confidence: 95 },
      { name: "Sanitair", quantity: 1, unit: "set", confidence: 80 },
      { name: "Leidingwerk", quantity: 15, unit: "m", confidence: 75 }
    ];

    mockAnalysis.workTypes = [
      { category: "Sloop", description: "Oude badkamer uitbreken", timeEstimate: 8, complexity: "medium" },
      { category: "Loodgieter", description: "Leidingen aanleggen", timeEstimate: 12, complexity: "high" },
      { category: "Tegelwerk", description: "Wand en vloer betegelen", timeEstimate: 16, complexity: "medium" },
      { category: "Afwerking", description: "Sanitair plaatsen en afwerken", timeEstimate: 6, complexity: "low" }
    ];

    mockAnalysis.risks = [
      "Mogelijk asbest in oude lijm",
      "Leidingen kunnen verouderd zijn",
      "Vloer mogelijk niet waterpas"
    ];

    mockAnalysis.opportunities = [
      "Vloerverwarming installeren (+€850)",
      "Luxe sanitair upgrade (+€1200)",
      "Extra opbergruimte (+€450)"
    ];

  } else if (projectType.toLowerCase().includes('schilder')) {
    const estimatedArea = 40 + Math.random() * 60;
    
    mockAnalysis.dimensions = {
      width: Math.sqrt(estimatedArea * 1.2),
      height: 2.5,
      area: estimatedArea,
      confidence: 75
    };

    mockAnalysis.materials = [
      { name: "Muurverf", quantity: Math.ceil(estimatedArea / 10), unit: "liter", confidence: 90 },
      { name: "Primer", quantity: Math.ceil(estimatedArea / 12), unit: "liter", confidence: 85 },
      { name: "Afplaktape", quantity: 5, unit: "rol", confidence: 95 },
      { name: "Kwasten/rollen", quantity: 1, unit: "set", confidence: 100 }
    ];

    mockAnalysis.workTypes = [
      { category: "Voorbereiding", description: "Afplakken en voorbehandelen", timeEstimate: 4, complexity: "low" },
      { category: "Schilderen", description: "Muren en plafond schilderen", timeEstimate: 12, complexity: "medium" }
    ];

    mockAnalysis.risks = [
      "Ondergrond mogelijk niet egaal",
      "Extra voorbehandeling nodig"
    ];

    mockAnalysis.opportunities = [
      "Plafond meeschilderen (+€" + Math.round(estimatedArea * 0.6) + ")",
      "Kozijnen behandelen (+€350)"
    ];

  } else {
    // Generic project
    const estimatedArea = 25 + Math.random() * 50;
    
    mockAnalysis.dimensions = {
      width: Math.sqrt(estimatedArea),
      height: Math.sqrt(estimatedArea),
      area: estimatedArea,
      confidence: 60
    };

    mockAnalysis.materials = [
      { name: "Algemene materialen", quantity: 1, unit: "set", confidence: 70 }
    ];

    mockAnalysis.workTypes = [
      { category: "Algemeen", description: projectType, timeEstimate: 16, complexity: "medium" }
    ];

    mockAnalysis.risks = ["Onvoorziene omstandigheden"];
    mockAnalysis.opportunities = ["Uitbreiding mogelijk"];
  }

  // Calculate price estimate
  const totalHours = mockAnalysis.workTypes.reduce((sum, work) => sum + work.timeEstimate, 0);
  const materialCost = mockAnalysis.materials.reduce((sum, mat) => sum + (mat.quantity * 25), 0); // €25 avg per unit
  const laborCost = totalHours * 45; // €45 per hour
  
  const baseCost = materialCost + laborCost;
  mockAnalysis.priceEstimate = {
    low: Math.round(baseCost * 0.8),
    high: Math.round(baseCost * 1.3),
    recommended: Math.round(baseCost * 1.1)
  };

  return mockAnalysis;
}

// 🧮 Mock Pricing Engine
export async function calculatePricing(request: PricingRequest): Promise<PricingResponse> {
  await new Promise(resolve => setTimeout(resolve, 1500));

  const { workTypes, dimensions, materials, complexity } = request;

  const items: PricingResponse['items'] = [];
  let itemId = 1;

  // Base pricing database
  const pricingRates = {
    schilderwerk: { rate: 12, unit: "m²", margin: 0.35 },
    tegelwerk: { rate: 45, unit: "m²", margin: 0.30 },
    loodgieter: { rate: 65, unit: "uur", margin: 0.40 },
    elektra: { rate: 55, unit: "uur", margin: 0.45 },
    sloop: { rate: 35, unit: "uur", margin: 0.50 },
    afwerking: { rate: 40, unit: "uur", margin: 0.35 }
  };

  // Generate items based on work types
  workTypes.forEach(workType => {
    const lowerType = workType.toLowerCase();
    let rate = pricingRates.schilderwerk; // default
    
    // Match work type to pricing
    Object.entries(pricingRates).forEach(([key, value]) => {
      if (lowerType.includes(key)) {
        rate = value;
      }
    });

    // Calculate quantity based on dimensions or default
    let quantity = 1;
    if (rate.unit === "m²" && dimensions) {
      quantity = dimensions.area;
    } else if (rate.unit === "uur") {
      quantity = complexity === "high" ? 16 : complexity === "medium" ? 12 : 8;
    }

    // Apply complexity multiplier
    const complexityMultiplier = complexity === "high" ? 1.3 : complexity === "medium" ? 1.1 : 1.0;
    const adjustedRate = rate.rate * complexityMultiplier;

    items.push({
      id: `item-${itemId++}`,
      category: workType,
      description: `${workType} werkzaamheden`,
      quantity: Math.round(quantity * 10) / 10,
      unit: rate.unit,
      unitPrice: Math.round(adjustedRate),
      totalPrice: Math.round(quantity * adjustedRate),
      margin: rate.margin,
      confidence: 85 + Math.floor(Math.random() * 15)
    });
  });

  // Add materials
  materials.forEach(material => {
    const materialCost = dimensions ? dimensions.area * 3.5 : 150; // €3.50 per m² or €150 default
    
    items.push({
      id: `item-${itemId++}`,
      category: "Materiaal",
      description: material,
      quantity: 1,
      unit: "set",
      unitPrice: Math.round(materialCost),
      totalPrice: Math.round(materialCost),
      margin: 0.25,
      confidence: 90
    });
  });

  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);

  // Calculate win probability based on various factors
  let winProbability = 75; // base
  
  if (complexity === "low") winProbability += 10;
  if (complexity === "high") winProbability -= 5;
  
  // Market position simulation
  const marketAverage = subtotal * (0.9 + Math.random() * 0.2);
  const marketPosition: "below" | "average" | "above" = 
    subtotal < marketAverage * 0.95 ? "below" :
    subtotal > marketAverage * 1.05 ? "above" : "average";

  if (marketPosition === "below") winProbability += 15;
  if (marketPosition === "above") winProbability -= 10;

  winProbability = Math.max(20, Math.min(95, winProbability));

  const recommendations = [
    `Gemiddelde marge: ${Math.round(items.reduce((sum, item) => sum + item.margin, 0) / items.length * 100)}%`,
    `Marktpositie: ${marketPosition === "below" ? "Competitief geprijsd" : marketPosition === "above" ? "Boven marktgemiddelde" : "Marktconform"}`,
    `Geschatte kans op succes: ${winProbability}%`
  ];

  if (complexity === "high") {
    recommendations.push("Overweeg risico-opslag van 10-15%");
  }

  return {
    items,
    subtotal,
    recommendations,
    marketPosition,
    winProbability
  };
}

// 🎯 Conversation AI (Mock)
export async function processConversation(message: string, context: any): Promise<string> {
  await new Promise(resolve => setTimeout(resolve, 800));

  const lowerMessage = message.toLowerCase();

  // Simple response logic
  if (lowerMessage.includes("prijs") || lowerMessage.includes("kosten")) {
    return "Ik ga nu de prijzen berekenen op basis van de geanalyseerde gegevens. Dit duurt even...";
  }
  
  if (lowerMessage.includes("ja") || lowerMessage.includes("akkoord") || lowerMessage.includes("goed")) {
    return "Perfect! Laten we doorgaan met de volgende stap.";
  }
  
  if (lowerMessage.includes("meer") || lowerMessage.includes("extra") || lowerMessage.includes("toevoegen")) {
    return "Ik kan verschillende extra opties voorstellen. Bijvoorbeeld een garantie-uitbreiding of premium materialen. Wat heeft je interesse?";
  }
  
  if (lowerMessage.includes("tijd") || lowerMessage.includes("planning")) {
    return "Op basis van de analyse schat ik de werkzaamheden op ongeveer " + (8 + Math.floor(Math.random() * 16)) + " uur. We kunnen meestal binnen 2 weken starten.";
  }
  
  if (lowerMessage.includes("garantie")) {
    return "Standaard bieden we 2 jaar garantie. Voor €125 extra kunnen we dit uitbreiden naar 5 jaar garantie. Zal ik dat toevoegen?";
  }

  // Default responses
  const responses = [
    "Ik begrijp het. Heb je nog andere vragen over het project?",
    "Dat is een goede vraag. Laat me weten als je meer details wilt over een specifiek onderdeel.",
    "Zeker! Is er iets specifieks waar je meer over wilt weten?",
    "Ik help je graag verder. Wil je dat ik de offerte ga berekenen of heb je nog andere vragen?"
  ];

  return responses[Math.floor(Math.random() * responses.length)];
}

// 🔍 Upsell Engine
export function generateUpsellSuggestions(projectType: string, dimensions?: { area: number }): string[] {
  const suggestions: string[] = [];
  const area = dimensions?.area || 20;

  if (projectType.toLowerCase().includes('badkamer')) {
    suggestions.push(`Vloerverwarming installeren (+€${Math.round(area * 45)})`);
    suggestions.push("Luxe sanitair upgrade (+€1200)");
    suggestions.push("Inbouwspots plaatsen (+€350)");
    suggestions.push("Extra opbergruimte (+€450)");
  } else if (projectType.toLowerCase().includes('schilder')) {
    suggestions.push(`Plafond meeschilderen (+€${Math.round(area * 15)})`);
    suggestions.push("Kozijnen behandelen (+€350)");
    suggestions.push("Primer extra laag (+€125)");
  }

  // Universal suggestions
  suggestions.push("Garantie uitbreiding 2→5 jaar (+€125)");
  suggestions.push("Express service - 1 week eerder (+€200)");

  return suggestions;
}