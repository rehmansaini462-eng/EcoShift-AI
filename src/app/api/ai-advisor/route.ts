import { NextResponse } from 'next/server';
import { LCAResult, SimulationParams } from '@/types/vehicle';

export interface AIAdvisorResponse {
  verdictTitle: string;
  gridSensitivityAnalysis: string;
  manufacturingFootprintNote: string;
  actionableRecommendation: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { simulationResult, params }: { simulationResult: LCAResult; params: SimulationParams } = body;

    if (!simulationResult || !params || !params.vehicleA || !params.vehicleB) {
      return NextResponse.json(
        { error: 'simulationResult and params are required.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // Fallback if API Key is not set
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      console.warn('GEMINI_API_KEY not set. Using intelligent climate advisor fallback.');
      const fallbackAdvisor = generateFallbackAdvisor(simulationResult, params);
      return NextResponse.json({ advisor: fallbackAdvisor, isFallback: true });
    }

    // Call Gemini 2.5 Flash API with JSON Mode
    const systemPrompt = `You are a Lead Climate Scientist and Automotive Lifecycle Assessment (LCA) Expert.
Analyze the provided vehicle LCA calculation results and parameters, and provide an expert, executive 4-part synthesis.

Output Schema Rules (JSON):
- verdictTitle: A crisp 1-sentence executive climate verdict.
- gridSensitivityAnalysis: 2-3 sentences analyzing how the regional electricity grid intensity (${params.gridIntensityGramsPerKWh} g CO2/kWh) impacts the break-even curve.
- manufacturingFootprintNote: 1-2 sentences comparing upfront battery mineral mining & chassis carbon vs ICE manufacturing.
- actionableRecommendation: 1-2 sentences giving a clear, actionable buyer recommendation based on their annual driving (${params.annualKm.toLocaleString()} km/yr) and lifespan (${params.lifespanYears} years).`;

    const userPrompt = `
Vehicle A: ${params.vehicleA.name} (${params.vehicleA.type}, Battery: ${params.vehicleA.batteryKWh} kWh, Efficiency: ${params.vehicleA.efficiencyKmPerUnit})
Vehicle B: ${params.vehicleB.name} (${params.vehicleB.type}, Battery: ${params.vehicleB.batteryKWh} kWh, Efficiency: ${params.vehicleB.efficiencyKmPerUnit})
Annual Distance: ${params.annualKm.toLocaleString()} km/year
Lifespan: ${params.lifespanYears} years
Grid Intensity: ${params.gridIntensityGramsPerKWh} g CO2e/kWh

Calculation Results:
- Vehicle A Total CO2: ${params.vehicleA.name} = ${(simulationResult.vehicleA_Breakdown.total / 1000).toFixed(1)} tonnes
- Vehicle B Total CO2: ${params.vehicleB.name} = ${(simulationResult.vehicleB_Breakdown.total / 1000).toFixed(1)} tonnes
- Break-even Year: ${simulationResult.breakevenYear !== null ? simulationResult.breakevenYear : 'N/A'}
- Break-even Mileage: ${simulationResult.breakevenKm !== null ? simulationResult.breakevenKm.toLocaleString() + ' km' : 'N/A'}
- Summary Insight: ${simulationResult.summaryInsight}`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
          },
        ],
        generationConfig: {
          response_mime_type: 'application/json',
          response_schema: {
            type: 'OBJECT',
            properties: {
              verdictTitle: { type: 'STRING' },
              gridSensitivityAnalysis: { type: 'STRING' },
              manufacturingFootprintNote: { type: 'STRING' },
              actionableRecommendation: { type: 'STRING' },
            },
            required: [
              'verdictTitle',
              'gridSensitivityAnalysis',
              'manufacturingFootprintNote',
              'actionableRecommendation',
            ],
          },
        },
      }),
    });

    if (!response.ok) {
      console.error('Gemini Advisor API error:', await response.text());
      const fallbackAdvisor = generateFallbackAdvisor(simulationResult, params);
      return NextResponse.json({ advisor: fallbackAdvisor, isFallback: true });
    }

    const data = await response.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
      throw new Error('Empty response from Gemini API.');
    }

    const parsedAdvisor: AIAdvisorResponse = JSON.parse(candidateText);
    return NextResponse.json({ advisor: parsedAdvisor, isFallback: false });
  } catch (error: any) {
    console.error('AI Advisor route error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to generate AI Climate Verdict.' },
      { status: 500 }
    );
  }
}

/**
 * Intelligent Fallback Generator when API key is unconfigured.
 */
function generateFallbackAdvisor(
  res: LCAResult,
  params: SimulationParams
): AIAdvisorResponse {
  const isACleaner = res.vehicleA_Breakdown.total <= res.vehicleB_Breakdown.total;
  const cleanerName = isACleaner ? params.vehicleA.name : params.vehicleB.name;
  const higherName = isACleaner ? params.vehicleB.name : params.vehicleA.name;
  const diffTonnes = (
    Math.abs(res.vehicleA_Breakdown.total - res.vehicleB_Breakdown.total) / 1000
  ).toFixed(1);

  return {
    verdictTitle: `${cleanerName} delivers a clear lifecycle carbon advantage of ${diffTonnes} tonnes CO2e over ${params.lifespanYears} years.`,
    gridSensitivityAnalysis:
      params.gridIntensityGramsPerKWh <= 250
        ? `Operating under a low-carbon grid (${params.gridIntensityGramsPerKWh} g CO2/kWh) accelerates electric vehicle decarbonization, allowing rapid offset of manufacturing emissions.`
        : `At ${params.gridIntensityGramsPerKWh} g CO2/kWh grid carbon intensity, operational emissions are heavily reliant on thermal grid power. Transitioning to renewable power would multiply carbon savings by 2.4x.`,
    manufacturingFootprintNote:
      params.vehicleA.batteryKWh > 0
        ? `${params.vehicleA.name} carries an upfront manufacturing carbon premium due to its ${params.vehicleA.batteryKWh} kWh battery pack, but high driving mileage cleanly amortizes this initial debt.`
        : `Upfront manufacturing for ${params.vehicleB.name} is lower initially, but high annual tailpipe emissions quickly exceed manufacturing penalties.`,
    actionableRecommendation:
      res.breakevenYear !== null && res.breakevenYear <= params.lifespanYears
        ? `Recommendation: Choose ${cleanerName} if your planned ownership exceeds ${res.breakevenYear} years (${res.breakevenKm?.toLocaleString()} km) to maximize net global carbon reduction.`
        : `Recommendation: Choose ${cleanerName} to eliminate operational tailpipe emissions and minimize full cradle-to-grave footprint.`,
  };
}
