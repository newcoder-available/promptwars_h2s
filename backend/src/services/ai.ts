import { GoogleGenAI } from '@google/genai';

export interface SeismicData {
  magnitude: number;
  depth: number;
  location: string;
}

export interface RiskPrediction {
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  probabilityPercentage: number;
  estimatedWaveHeightMeters: number;
  analysis: string;
}

export async function predictTsunamiRisk(data: SeismicData): Promise<RiskPrediction> {
  const prompt = `
    Analyze the following seismic event and predict the theoretical tsunami risk based on historical patterns.
    Magnitude: ${data.magnitude}
    Depth (km): ${data.depth}
    Location Category: ${data.location} (e.g. Near Coast, Offshore, Inland)

    Respond ONLY with a valid JSON document matching this schema:
    {
      "riskLevel": "LOW" | "MODERATE" | "HIGH" | "CRITICAL",
      "probabilityPercentage": number,
      "estimatedWaveHeightMeters": number,
      "analysis": "Brief string explaining the reasoning"
    }
  `;

  try {
    if (!process.env.GEMINI_API_KEY) {
      // Fallback if no key during development or tests
      return mockPrediction(data);
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
        }
    });

    const text = response.text || "{}";
    const result = JSON.parse(text) as RiskPrediction;
    return result;
  } catch (error) {
    console.warn("AI Generation failed, falling back to heuristic mock:", error);
    return mockPrediction(data);
  }
}

function mockPrediction(data: SeismicData): RiskPrediction {
  // Simple heuristic algorithm based on parameters
  let riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' = 'LOW';
  let probability = 5;
  let waveHeight = 0;

  if (data.magnitude > 7.5 && data.depth < 50 && data.location.toLowerCase().includes('offshore')) {
    riskLevel = 'CRITICAL';
    probability = 85;
    waveHeight = (data.magnitude - 7) * 2;
  } else if (data.magnitude > 6.5 && data.depth < 100) {
    riskLevel = 'HIGH';
    probability = 60;
    waveHeight = 1.5;
  } else if (data.magnitude > 5.5) {
      riskLevel = 'MODERATE';
      probability = 30;
      waveHeight = 0.5;
  }

  return {
    riskLevel,
    probabilityPercentage: probability,
    estimatedWaveHeightMeters: waveHeight,
    analysis: `Mock Analysis: Heuristic evaluation for magnitude ${data.magnitude} and depth ${data.depth} in ${data.location}.`
  };
}
