/**
 * Core domain types for EcoShift AI Lifecycle Assessment (LCA) Carbon Calculator.
 */

export type VehicleType = 'ICE_PETROL' | 'ICE_DIESEL' | 'HYBRID' | 'BEV';

export interface VehicleSpec {
  name: string;
  type: VehicleType;
  batteryKWh: number; // 0 for pure ICE
  curbWeightKg: number;
  efficiencyKmPerUnit: number; // km/L for ICE & Hybrid, km/kWh for BEV
  baselineManufacturingCO2Kg: number; // Base chassis & vehicle assembly carbon footprint (kg CO2e)
}

export interface SimulationParams {
  vehicleA: VehicleSpec;
  vehicleB: VehicleSpec;
  annualKm: number;
  lifespanYears: number;
  gridIntensityGramsPerKWh: number; // g CO2e/kWh
}

export interface LCADataPoint {
  year: number;
  mileageKm: number;
  vehicleA_TotalCO2Kg: number;
  vehicleB_TotalCO2Kg: number;
}

export interface VehicleCO2Breakdown {
  manufacturing: number; // Cumulative manufacturing CO2 (kg)
  operational: number; // Cumulative operational CO2 over full lifespan (kg)
  total: number; // Total lifecycle CO2 (kg)
}

export interface LCAResult {
  dataPoints: LCADataPoint[];
  breakevenKm: number | null;
  breakevenYear: number | null;
  summaryInsight: string;
  vehicleA_Breakdown: VehicleCO2Breakdown;
  vehicleB_Breakdown: VehicleCO2Breakdown;
}
