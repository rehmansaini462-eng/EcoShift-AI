import { PRESET_VEHICLES, REGIONAL_GRID_INTENSITIES } from '../constants/gridData';
import {
  calculateAnnualOperationalFootprint,
  calculateLifecycleEmissions,
  calculateManufacturingFootprint,
} from './lcaCalculator';

console.log('--- EcoShift AI LCA Engine Sanity Test ---');

const tesla = PRESET_VEHICLES.TESLA_MODEL_3;
const camry = PRESET_VEHICLES.TOYOTA_CAMRY_HYBRID;
const civic = PRESET_VEHICLES.HONDA_CIVIC_PETROL;

console.log('\nManufacturing Footprints:');
console.log(`Tesla Model 3: ${calculateManufacturingFootprint(tesla)} kg CO2e`);
console.log(`Camry Hybrid: ${calculateManufacturingFootprint(camry)} kg CO2e`);
console.log(`Civic Petrol: ${calculateManufacturingFootprint(civic)} kg CO2e`);

console.log('\nAnnual Operational (15,000 km, US Grid 370 g/kWh):');
console.log(`Tesla Model 3: ${calculateAnnualOperationalFootprint(tesla, 15000, 370).toFixed(1)} kg CO2e/year`);
console.log(`Camry Hybrid: ${calculateAnnualOperationalFootprint(camry, 15000, 370).toFixed(1)} kg CO2e/year`);
console.log(`Civic Petrol: ${calculateAnnualOperationalFootprint(civic, 15000, 370).toFixed(1)} kg CO2e/year`);

console.log('\nSimulation (Tesla vs Civic over 10 Years @ 15,000 km/yr, US Grid):');
const simResult = calculateLifecycleEmissions({
  vehicleA: tesla,
  vehicleB: civic,
  annualKm: 15000,
  lifespanYears: 10,
  gridIntensityGramsPerKWh: REGIONAL_GRID_INTENSITIES[1].intensityGramsPerKWh, // US Avg
});

console.log('Break-even Year:', simResult.breakevenYear);
console.log('Break-even Km:', simResult.breakevenKm);
console.log('Insight:', simResult.summaryInsight);
console.log('Vehicle A Breakdown:', simResult.vehicleA_Breakdown);
console.log('Vehicle B Breakdown:', simResult.vehicleB_Breakdown);
console.log('--- Test Finished Successfully ---');
