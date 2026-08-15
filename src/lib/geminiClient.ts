import { VehicleSpec } from '../types/vehicle';

export interface VehicleSpecFetchResponse {
  spec: VehicleSpec;
  isFallback?: boolean;
  notice?: string;
  error?: string;
}

/**
 * Client helper to extract vehicle specifications using the EcoShift AI Gemini API endpoint.
 */
export async function fetchVehicleSpec(query: string): Promise<VehicleSpec> {
  if (!query || !query.trim()) {
    throw new Error('Vehicle search query cannot be empty.');
  }

  const response = await fetch('/api/vehicle-spec', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ vehicleQuery: query.trim() }),
  });

  const data: VehicleSpecFetchResponse = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `Server error: ${response.status}`);
  }

  if (data.notice) {
    console.info(`[EcoShift AI] ${data.notice}`);
  }

  return data.spec;
}
