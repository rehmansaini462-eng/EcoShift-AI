import { VehicleSpec } from '../types/vehicle';

/**
 * Standard Environmental Emission Factors
 */
export const PETROL_CO2_PER_LITER = 2.31; // kg CO2 / Liter
export const DIESEL_CO2_PER_LITER = 2.68; // kg CO2 / Liter
export const BATTERY_MFG_CO2_PER_KWH = 85; // kg CO2 / kWh (average mineral extraction + cell manufacturing)

export interface GridRegion {
  id: string;
  name: string;
  intensityGramsPerKWh: number; // g CO2e / kWh
  description: string;
}

/**
 * Pre-populated Regional Electricity Grid Carbon Intensities
 */
export const REGIONAL_GRID_INTENSITIES: GridRegion[] = [
  {
    id: 'IN',
    name: 'India',
    intensityGramsPerKWh: 710,
    description: 'Coal-dominated grid (high carbon intensity)',
  },
  {
    id: 'US_AVG',
    name: 'US Average',
    intensityGramsPerKWh: 370,
    description: 'Mixed grid (natural gas, renewables, nuclear)',
  },
  {
    id: 'EU_AVG',
    name: 'European Union Average',
    intensityGramsPerKWh: 230,
    description: 'Transitioning grid with high renewable penetration',
  },
  {
    id: 'US_CA',
    name: 'California',
    intensityGramsPerKWh: 210,
    description: 'Clean regional grid (solar, wind, hydro)',
  },
  {
    id: 'NO',
    name: 'Norway / 100% Renewable',
    intensityGramsPerKWh: 30,
    description: 'Ultra-low carbon hydro and wind powered grid',
  },
];

/**
 * Preset Vehicles for Instant UI Testing & Demonstration
 */
export const PRESET_VEHICLES: Record<string, VehicleSpec> = {
  TESLA_MODEL_3: {
    name: 'Tesla Model 3',
    type: 'BEV',
    batteryKWh: 60,
    curbWeightKg: 1800,
    efficiencyKmPerUnit: 6.2, // km/kWh
    baselineManufacturingCO2Kg: 7000,
  },
  TOYOTA_CAMRY_HYBRID: {
    name: 'Toyota Camry Hybrid',
    type: 'HYBRID',
    batteryKWh: 1.5,
    curbWeightKg: 1600,
    efficiencyKmPerUnit: 21.0, // km/L
    baselineManufacturingCO2Kg: 6500,
  },
  HONDA_CIVIC_PETROL: {
    name: 'Honda Civic',
    type: 'ICE_PETROL',
    batteryKWh: 0,
    curbWeightKg: 1350,
    efficiencyKmPerUnit: 15.0, // km/L
    baselineManufacturingCO2Kg: 5500,
  },
};
