import {
  BATTERY_MFG_CO2_PER_KWH,
  DIESEL_CO2_PER_LITER,
  PETROL_CO2_PER_LITER,
} from '../constants/gridData';
import {
  LCADataPoint,
  LCAResult,
  SimulationParams,
  VehicleSpec,
} from '../types/vehicle';

/**
 * Calculates the upfront manufacturing carbon footprint of a vehicle (in kg CO2e).
 * Combines base vehicle assembly footprint with battery pack manufacturing emissions.
 */
export function calculateManufacturingFootprint(spec: VehicleSpec): number {
  if (!spec) return 0;
  const batteryCO2 = (spec.batteryKWh || 0) * BATTERY_MFG_CO2_PER_KWH;
  const baseMfgCO2 = Math.max(0, spec.baselineManufacturingCO2Kg || 0);
  return baseMfgCO2 + batteryCO2;
}

/**
 * Calculates the annual operational carbon footprint of a vehicle (in kg CO2e).
 * Safely handles edge cases like zero efficiency or invalid values.
 */
export function calculateAnnualOperationalFootprint(
  spec: VehicleSpec,
  annualKm: number,
  gridIntensityGramsPerKWh: number
): number {
  if (!spec || spec.efficiencyKmPerUnit <= 0 || annualKm <= 0) {
    return 0;
  }

  const distance = Math.max(0, annualKm);
  const efficiency = spec.efficiencyKmPerUnit;

  switch (spec.type) {
    case 'ICE_PETROL':
      return (distance / efficiency) * PETROL_CO2_PER_LITER;

    case 'ICE_DIESEL':
      return (distance / efficiency) * DIESEL_CO2_PER_LITER;

    case 'HYBRID':
      return (distance / efficiency) * PETROL_CO2_PER_LITER;

    case 'BEV': {
      // Grid intensity is provided in g CO2e / kWh.
      // Dividing by 1000 converts g -> kg CO2e / kWh.
      const kgCO2PerKWh = Math.max(0, gridIntensityGramsPerKWh) / 1000;
      return (distance / efficiency) * kgCO2PerKWh;
    }

    default:
      return 0;
  }
}

/**
 * Executes a deterministic year-by-year Lifecycle Assessment (LCA) simulation.
 * Determines total emissions trajectory, exact break-even points, and summary insights.
 */
export function calculateLifecycleEmissions(
  params: SimulationParams
): LCAResult {
  const {
    vehicleA,
    vehicleB,
    annualKm = 15000,
    lifespanYears = 10,
    gridIntensityGramsPerKWh = 370,
  } = params;

  // 1. Initial Manufacturing Footprint (Year 0)
  const mfgA = calculateManufacturingFootprint(vehicleA);
  const mfgB = calculateManufacturingFootprint(vehicleB);

  // 2. Annual Operational Footprint
  const annualOpsA = calculateAnnualOperationalFootprint(
    vehicleA,
    annualKm,
    gridIntensityGramsPerKWh
  );
  const annualOpsB = calculateAnnualOperationalFootprint(
    vehicleB,
    annualKm,
    gridIntensityGramsPerKWh
  );

  // 3. Operational Footprint per Kilometer
  const opsPerKmA = calculateAnnualOperationalFootprint(
    vehicleA,
    1,
    gridIntensityGramsPerKWh
  );
  const opsPerKmB = calculateAnnualOperationalFootprint(
    vehicleB,
    1,
    gridIntensityGramsPerKWh
  );

  const dataPoints: LCADataPoint[] = [];

  // Year 0 Data Point
  dataPoints.push({
    year: 0,
    mileageKm: 0,
    vehicleA_TotalCO2Kg: Math.round(mfgA),
    vehicleB_TotalCO2Kg: Math.round(mfgB),
  });

  // Generate Year-by-Year Trajectory
  let cumulativeA = mfgA;
  let cumulativeB = mfgB;

  for (let year = 1; year <= lifespanYears; year++) {
    cumulativeA += annualOpsA;
    cumulativeB += annualOpsB;

    dataPoints.push({
      year,
      mileageKm: year * annualKm,
      vehicleA_TotalCO2Kg: Math.round(cumulativeA),
      vehicleB_TotalCO2Kg: Math.round(cumulativeB),
    });
  }

  // 4. Calculate Exact Line Intersection (Break-even Point)
  // Equation: mfgA + opsPerKmA * km = mfgB + opsPerKmB * km
  // (opsPerKmB - opsPerKmA) * km = mfgA - mfgB
  // km = (mfgA - mfgB) / (opsPerKmB - opsPerKmA)
  const deltaMfg = mfgA - mfgB; // positive if vehicle A started higher
  const deltaOpsPerKm = opsPerKmB - opsPerKmA; // positive if vehicle A is cleaner per km

  let breakevenKm: number | null = null;
  let breakevenYear: number | null = null;

  if (deltaOpsPerKm !== 0) {
    const rawBreakevenKm = deltaMfg / deltaOpsPerKm;

    // Break-even is valid only if it occurs at positive mileage
    if (rawBreakevenKm > 0) {
      const rawBreakevenYear = annualKm > 0 ? rawBreakevenKm / annualKm : null;

      // Only record break-even if within reasonable lifetime bounds (e.g. 50 years max)
      if (rawBreakevenYear !== null && rawBreakevenYear <= lifespanYears * 3) {
        breakevenKm = Math.round(rawBreakevenKm);
        breakevenYear = Number(rawBreakevenYear.toFixed(1));
      }
    }
  }

  // 5. Lifespan Totals & Breakdown
  const totalOpsA = annualOpsA * lifespanYears;
  const totalOpsB = annualOpsB * lifespanYears;

  const totalCO2A = mfgA + totalOpsA;
  const totalCO2B = mfgB + totalOpsB;

  // 6. Generate Contextual Summary Insight
  let summaryInsight = '';
  const diffCO2 = Math.abs(totalCO2A - totalCO2B);
  const diffTonnes = (diffCO2 / 1000).toFixed(1);

  if (totalCO2A < totalCO2B) {
    const cleanerName = vehicleA.name;
    const higherName = vehicleB.name;
    if (breakevenYear !== null && breakevenYear <= lifespanYears) {
      summaryInsight = `${cleanerName} achieves carbon parity after ${breakevenYear} years (${breakevenKm?.toLocaleString()} km) and avoids ${diffTonnes} tonnes of CO2e over a ${lifespanYears}-year lifespan compared to ${higherName}.`;
    } else if (mfgA <= mfgB) {
      summaryInsight = `${cleanerName} produces lower emissions both in manufacturing and operation, saving ${diffTonnes} tonnes of CO2e over ${lifespanYears} years compared to ${higherName}.`;
    } else {
      summaryInsight = `${cleanerName} is cleaner overall by ${diffTonnes} tonnes CO2e over ${lifespanYears} years, though break-even occurs beyond the primary ${lifespanYears}-year evaluation period.`;
    }
  } else if (totalCO2B < totalCO2A) {
    const cleanerName = vehicleB.name;
    const higherName = vehicleA.name;
    if (breakevenYear !== null && breakevenYear <= lifespanYears) {
      summaryInsight = `${cleanerName} achieves carbon parity after ${breakevenYear} years (${breakevenKm?.toLocaleString()} km) and avoids ${diffTonnes} tonnes of CO2e over a ${lifespanYears}-year lifespan compared to ${higherName}.`;
    } else if (mfgB <= mfgA) {
      summaryInsight = `${cleanerName} produces lower emissions both in manufacturing and operation, saving ${diffTonnes} tonnes of CO2e over ${lifespanYears} years compared to ${higherName}.`;
    } else {
      summaryInsight = `${cleanerName} is cleaner overall by ${diffTonnes} tonnes CO2e over ${lifespanYears} years, though break-even occurs beyond the primary ${lifespanYears}-year evaluation period.`;
    }
  } else {
    summaryInsight = `Both ${vehicleA.name} and ${vehicleB.name} yield identical total lifecycle carbon footprints of ${(totalCO2A / 1000).toFixed(1)} tonnes of CO2e over ${lifespanYears} years.`;
  }

  return {
    dataPoints,
    breakevenKm,
    breakevenYear,
    summaryInsight,
    vehicleA_Breakdown: {
      manufacturing: Math.round(mfgA),
      operational: Math.round(totalOpsA),
      total: Math.round(totalCO2A),
    },
    vehicleB_Breakdown: {
      manufacturing: Math.round(mfgB),
      operational: Math.round(totalOpsB),
      total: Math.round(totalCO2B),
    },
  };
}
