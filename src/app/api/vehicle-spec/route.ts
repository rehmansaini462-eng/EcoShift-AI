import { NextResponse } from 'next/server';
import { PRESET_VEHICLES } from '@/constants/gridData';
import { VehicleSpec, VehicleType } from '@/types/vehicle';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { vehicleQuery } = body;

    if (!vehicleQuery || typeof vehicleQuery !== 'string' || !vehicleQuery.trim()) {
      return NextResponse.json(
        { error: 'vehicleQuery string is required.' },
        { status: 400 }
      );
    }

    const trimmedQuery = vehicleQuery.trim();
    const apiKey = process.env.GEMINI_API_KEY;

    // Check if API key is missing. If so, return a realistic estimated mock or helpful error.
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      console.warn('GEMINI_API_KEY not set. Using intelligent preset matching fallback.');
      const fallbackSpec = getFallbackVehicleSpec(trimmedQuery);
      return NextResponse.json({
        spec: fallbackSpec,
        isFallback: true,
        notice: 'Using estimated spec fallback because GEMINI_API_KEY is not configured in .env.local',
      });
    }

    // Call Google Gemini API (gemini-2.5-flash) with JSON Structured Output Schema
    const systemInstruction = `You are a world-class automotive engineer and environmental scientist.
Analyze the requested vehicle and extract accurate technical specifications for Lifecycle Assessment (LCA) carbon calculations.

Rules:
1. Determine vehicle type: 'ICE_PETROL', 'ICE_DIESEL', 'HYBRID', or 'BEV'.
2. If exact numbers are not publicly available for the model, estimate based on realistic automotive engineering benchmarks for that vehicle segment.
3. batteryKWh must be 0 for pure ICE (petrol/diesel).
4. efficiencyKmPerUnit MUST be:
   - km per Liter for ICE_PETROL, ICE_DIESEL, and HYBRID
   - km per kWh for BEV
5. baselineManufacturingCO2Kg is the base chassis/vehicle assembly carbon footprint (excluding battery), typically between 5000 kg and 8500 kg depending on weight and luxury tier.`;

    const prompt = `Vehicle to analyze: "${trimmedQuery}"`;

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
            parts: [{ text: `${systemInstruction}\n\n${prompt}` }],
          },
        ],
        generationConfig: {
          response_mime_type: 'application/json',
          response_schema: {
            type: 'OBJECT',
            properties: {
              name: { type: 'STRING', description: 'Clean official vehicle model name' },
              type: {
                type: 'STRING',
                enum: ['ICE_PETROL', 'ICE_DIESEL', 'HYBRID', 'BEV'],
                description: 'Powertrain classification',
              },
              batteryKWh: { type: 'NUMBER', description: 'Usable battery capacity in kWh (0 for ICE)' },
              curbWeightKg: { type: 'NUMBER', description: 'Vehicle curb weight in kg' },
              efficiencyKmPerUnit: { type: 'NUMBER', description: 'Fuel efficiency in km/L or km/kWh' },
              baselineManufacturingCO2Kg: {
                type: 'NUMBER',
                description: 'Base body manufacturing carbon footprint in kg CO2e',
              },
            },
            required: [
              'name',
              'type',
              'batteryKWh',
              'curbWeightKg',
              'efficiencyKmPerUnit',
              'baselineManufacturingCO2Kg',
            ],
          },
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error response:', errorText);
      const fallbackSpec = getFallbackVehicleSpec(trimmedQuery);
      return NextResponse.json({
        spec: fallbackSpec,
        isFallback: true,
        notice: 'Gemini API call failed. Returned fallback estimate.',
      });
    }

    const data = await response.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
      throw new Error('Empty response from Gemini API.');
    }

    const parsedSpec: VehicleSpec = JSON.parse(candidateText);

    // Sanity validation on parsed data
    const validatedSpec: VehicleSpec = {
      name: parsedSpec.name || trimmedQuery,
      type: (['ICE_PETROL', 'ICE_DIESEL', 'HYBRID', 'BEV'].includes(parsedSpec.type)
        ? parsedSpec.type
        : 'ICE_PETROL') as VehicleType,
      batteryKWh: Math.max(0, parsedSpec.batteryKWh || 0),
      curbWeightKg: Math.max(500, parsedSpec.curbWeightKg || 1500),
      efficiencyKmPerUnit: Math.max(0.1, parsedSpec.efficiencyKmPerUnit || 15),
      baselineManufacturingCO2Kg: Math.max(3000, parsedSpec.baselineManufacturingCO2Kg || 6000),
    };

    return NextResponse.json({ spec: validatedSpec, isFallback: false });
  } catch (error: any) {
    console.error('Vehicle spec route error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to extract vehicle specification.' },
      { status: 500 }
    );
  }
}

/**
 * Intelligent keyword-matching fallback function when API key is unconfigured or offline.
 */
function getFallbackVehicleSpec(query: string): VehicleSpec {
  const q = query.toLowerCase();

  if (q.includes('tesla') || q.includes('bev') || q.includes('electric') || q.includes('nexon ev') || q.includes('rivian') || q.includes('lucid')) {
    return {
      name: query.length > 2 ? query : 'Generic Electric Vehicle (BEV)',
      type: 'BEV',
      batteryKWh: q.includes('long range') || q.includes('model s') ? 82 : 60,
      curbWeightKg: 1850,
      efficiencyKmPerUnit: 6.0,
      baselineManufacturingCO2Kg: 7200,
    };
  }

  if (q.includes('hybrid') || q.includes('prius') || q.includes('camry') || q.includes('honda city e:hev')) {
    return {
      name: query.length > 2 ? query : 'Generic Hybrid Vehicle',
      type: 'HYBRID',
      batteryKWh: 1.5,
      curbWeightKg: 1620,
      efficiencyKmPerUnit: 22.0,
      baselineManufacturingCO2Kg: 6400,
    };
  }

  if (q.includes('diesel') || q.includes('tdi') || q.includes('duster') || q.includes('mahindra thar')) {
    return {
      name: query.length > 2 ? query : 'Generic Diesel Vehicle',
      type: 'ICE_DIESEL',
      batteryKWh: 0,
      curbWeightKg: 1550,
      efficiencyKmPerUnit: 16.5,
      baselineManufacturingCO2Kg: 5800,
    };
  }

  return {
    name: query.length > 2 ? query : 'Generic Petrol Vehicle',
    type: 'ICE_PETROL',
    batteryKWh: 0,
    curbWeightKg: 1380,
    efficiencyKmPerUnit: 15.0,
    baselineManufacturingCO2Kg: 5500,
  };
}
