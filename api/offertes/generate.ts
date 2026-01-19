import type { VercelRequest, VercelResponse } from '@vercel/node';

interface OfferteRequest {
  client: string;
  projectType: string;
  description?: string;
  images?: string[]; // Base64 encoded images
  imageUrls?: string[]; // URLs van geüploade foto's
  dimensions?: {
    width?: number;
    height?: number;
    area?: number;
  };
  manualPrice?: number;
}

async function analyzeImageWithAI(imageBase64: string, projectType: string): Promise<{
  dimensions?: { width: number; height: number; area: number };
  materials?: string[];
  description?: string;
} | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    // Fallback: return mock data if no API key
    return {
      dimensions: {
        width: Math.floor(Math.random() * 5) + 3,
        height: Math.floor(Math.random() * 3) + 2.5,
        area: 0
      },
      materials: ["Beton", "Staal", "Hout"],
      description: `${projectType} project gedetecteerd`
    };
  }

  try {
    // Use Gemini Vision API for image analysis
    const model = process.env.GEMINI_VISION_MODEL || "gemini-1.5-pro";
    
    const prompt = `Analyseer deze bouwfoto en geef me:
1. Afmetingen in meters (breedte × hoogte × oppervlakte in m²) - als je geen referentiepunt ziet, schat dan op basis van standaard bouwmaten
2. Gedetecteerde materialen (bijv. beton, staal, hout, baksteen, etc.)
3. Een korte beschrijving van wat je ziet

Antwoord in JSON formaat:
{
  "dimensions": {"width": X, "height": Y, "area": Z},
  "materials": ["materiaal1", "materiaal2"],
  "description": "korte beschrijving"
}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{
            role: "user",
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: "image/jpeg",
                  data: imageBase64.replace(/^data:image\/\w+;base64,/, "")
                }
              }
            ]
          }],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    if (!response.ok) {
      console.error("Gemini API error:", await response.text());
      return null;
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) return null;

    // Try to parse JSON from response
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch {
      // If JSON parsing fails, extract dimensions from text
      const widthMatch = text.match(/breedte[:\s]+(\d+\.?\d*)/i);
      const heightMatch = text.match(/hoogte[:\s]+(\d+\.?\d*)/i);
      const areaMatch = text.match(/oppervlakte[:\s]+(\d+\.?\d*)/i) || text.match(/(\d+\.?\d*)\s*m²/i);
      
      if (widthMatch || heightMatch) {
        const width = widthMatch ? parseFloat(widthMatch[1]) : 4;
        const height = heightMatch ? parseFloat(heightMatch[1]) : 3;
        const area = areaMatch ? parseFloat(areaMatch[1]) : width * height;
        
        return {
          dimensions: { width, height, area },
          description: text.substring(0, 200)
        };
      }
    }

    return {
      description: text.substring(0, 200)
    };
  } catch (error) {
    console.error("Image analysis error:", error);
    return null;
  }
}

async function generateOfferteWithAI(
  client: string,
  projectType: string,
  description?: string,
  dimensions?: { width?: number; height?: number; area?: number },
  images?: string[],
  imageUrls?: string[] // URLs van geüploade foto's
): Promise<{
  description: string;
  items: { desc: string; price: number }[];
  total: number;
  dimensions?: { width: number; height: number; area: number };
  imageUrls?: string[]; // Return imageUrls in response
}> {
  const apiKey = process.env.GEMINI_API_KEY;
  
  // Analyze images if provided
  let detectedDimensions = dimensions;
  let imageAnalysis: string[] = [];
  
  if (images && images.length > 0) {
    const analyses = await Promise.all(
      images.map(img => analyzeImageWithAI(img, projectType))
    );
    
    // Use first detected dimensions
    const firstAnalysis = analyses.find(a => a?.dimensions);
    if (firstAnalysis?.dimensions) {
      detectedDimensions = firstAnalysis.dimensions;
    }
    
    // Collect all descriptions
    imageAnalysis = analyses
      .map(a => a?.description)
      .filter((d): d is string => !!d);
  }

  // Build prompt for offerte generation
  let prompt = `Genereer een professionele offerte voor een bouwproject.

Klant: ${client}
Type werkzaamheden: ${projectType}`;

  if (detectedDimensions) {
    prompt += `\nAfmetingen: ${detectedDimensions.width}m breed × ${detectedDimensions.height}m hoog (${detectedDimensions.area}m²)`;
  }

  if (description) {
    prompt += `\nBeschrijving: ${description}`;
  }

  if (imageAnalysis.length > 0) {
    prompt += `\n\nFoto analyse:\n${imageAnalysis.join('\n')}`;
  }

  prompt += `\n\nGenereer een offerte met:
1. Een professionele beschrijving van het project
2. Een lijst met werkzaamheden en materialen (minimaal 3 items)
3. Realistische prijzen per item gebaseerd op Nederlandse marktprijzen voor bouwprojecten
4. Een totaalprijs

Antwoord in JSON formaat:
{
  "description": "volledige beschrijving",
  "items": [
    {"desc": "werkzaamheid 1", "price": X},
    {"desc": "werkzaamheid 2", "price": Y}
  ],
  "total": Z
}`;

  if (apiKey) {
    try {
      const model = process.env.GEMINI_MODEL || "gemini-pro";
      
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [{
              role: "user",
              parts: [{ text: prompt }]
            }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 2048,
            },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (text) {
          // Try to parse JSON
          try {
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const parsed = JSON.parse(jsonMatch[0]);
              return {
                description: parsed.description || description || `${projectType} voor ${client}`,
                items: parsed.items || [],
                total: parsed.total || 0,
                dimensions: detectedDimensions
              };
            }
          } catch {
            // Fallback: extract info from text
          }
        }
      }
    } catch (error) {
      console.error("AI generation error:", error);
    }
  }

  // Fallback: generate basic offerte
  const basePrice = detectedDimensions?.area 
    ? detectedDimensions.area * 120 // €120 per m²
    : 5000; // Default €5000

  const items = [
    { desc: `${projectType} - Voorbereiding en planning`, price: Math.round(basePrice * 0.2) },
    { desc: `${projectType} - Materialen en grondstoffen`, price: Math.round(basePrice * 0.4) },
    { desc: `${projectType} - Uitvoering en afwerking`, price: Math.round(basePrice * 0.3) },
    { desc: `${projectType} - Transport en opruiming`, price: Math.round(basePrice * 0.1) }
  ];

  const total = items.reduce((sum, item) => sum + item.price, 0);

  return {
    description: description || `${projectType} project voor ${client}${detectedDimensions ? ` (${detectedDimensions.area}m²)` : ''}`,
    items,
    total,
    dimensions: detectedDimensions,
    imageUrls: imageUrls // Return imageUrls in response
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body as OfferteRequest;
    
    if (!body.client || !body.projectType) {
      return res.status(400).json({ error: 'Client en projectType zijn verplicht' });
    }

    const result = await generateOfferteWithAI(
      body.client,
      body.projectType,
      body.description,
      body.dimensions,
      body.images,
      body.imageUrls // Pass imageUrls to function
    );

    return res.status(200).json(result);
  } catch (error) {
    console.error("Offerte generation error:", error);
    return res.status(500).json({ error: 'Fout bij genereren offerte' });
  }
}
