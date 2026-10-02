/**
 * AgriOptima AI - ML Inference & Agronomic Intelligence Service
 * Performs crop suitability scoring, yield prediction, explainability analysis,
 * and transparent risk assessment.
 */

import { CropData } from './optimizer.ts';

export interface SoilInput {
  soil_type: string;
  pH: number;
  N: number; // kg/ha
  P: number;
  K: number;
  organic_matter?: number;
}

export interface WeatherInput {
  temperature: number; // °C
  rainfall: number; // mm
  humidity: number; // %
}

export interface ResourceInput {
  water_m3: number;
  fertilizer_kg: number;
  budget_usd: number;
  land_ha: number;
}

export interface CropRecommendation {
  crop_id: string;
  crop_name: string;
  category: string;
  suitability_score: number; // 0 to 100
  suitability_tier: 'Highly Suitable' | 'Suitable' | 'Marginal' | 'Not Recommended';
  predicted_yield_tons_ha: number;
  expected_revenue_per_ha: number;
  cultivation_cost_per_ha: number;
  net_profit_per_ha: number;
  water_req_m3_ha: number;
  fertilizer_req_kg_ha: number;
  duration_days: number;
  risk_level: 'Low' | 'Medium' | 'High';
  farmer_explanation: {
    pros: string[];
    cons: string[];
    summary: string;
  };
  technical_explanation: {
    ph_score: number;
    temp_score: number;
    water_compatibility: number;
    nutrient_score: number;
    soil_match: boolean;
    season_match: boolean;
  };
  resource_feasibility: {
    water_feasible: boolean;
    budget_feasible: boolean;
    fertilizer_feasible: boolean;
  };
}

export function evaluateCropSuitability(
  crop: CropData,
  soil: SoilInput,
  weather: WeatherInput,
  resources: ResourceInput,
  season: string
): CropRecommendation {
  // 1. pH suitability (bell curve around optimal_ph)
  const phDiff = Math.abs(soil.pH - crop.optimal_ph);
  const phTolerance = (crop.max_ph - crop.min_ph) / 2;
  const phScore = Math.max(0, Math.min(100, Math.round((1 - Math.pow(phDiff / (phTolerance * 1.2), 2)) * 100)));

  // 2. Temperature suitability
  const tempDiff = Math.abs(weather.temperature - crop.optimal_temp);
  const tempTolerance = (crop.max_temp - crop.min_temp) / 2;
  const tempScore = Math.max(0, Math.min(100, Math.round((1 - Math.pow(tempDiff / (tempTolerance * 1.2), 2)) * 100)));

  // 3. Soil type match
  const soilMatch = crop.soil_types.some(s => s.toLowerCase() === soil.soil_type.toLowerCase());
  const soilScore = soilMatch ? 100 : 45;

  // 4. Season match
  const seasonMatch = crop.season === 'All Season' || crop.season.toLowerCase() === season.toLowerCase();
  const seasonScore = seasonMatch ? 100 : 30;

  // 5. Nutrient match (N, P, K)
  const totalSoilNutrient = soil.N + soil.P + soil.K;
  const fertRatio = totalSoilNutrient / Math.max(50, crop.fert_req_kg_ha);
  const nutrientScore = Math.min(100, Math.round(Math.min(fertRatio, 1.2) * 85));

  // 6. Water feasibility check
  const waterAvailablePerHa = resources.land_ha > 0 ? resources.water_m3 / resources.land_ha : 0;
  const waterCompatibility = Math.min(100, Math.round(Math.min(waterAvailablePerHa / crop.water_req_m3_ha, 1.2) * 90));

  // Composite Weighted Suitability Score (0 - 100)
  const compositeScore = Math.round(
    phScore * 0.20 +
    tempScore * 0.20 +
    soilScore * 0.20 +
    seasonScore * 0.15 +
    nutrientScore * 0.15 +
    (waterCompatibility > 50 ? 10 : 0)
  );

  const finalScore = Math.max(5, Math.min(99, compositeScore));

  let tier: 'Highly Suitable' | 'Suitable' | 'Marginal' | 'Not Recommended' = 'Not Recommended';
  if (finalScore >= 80) tier = 'Highly Suitable';
  else if (finalScore >= 65) tier = 'Suitable';
  else if (finalScore >= 45) tier = 'Marginal';

  // Predict Yield
  const predictedYield = predictCropYield(crop, soil, weather, resources);
  const revenuePerHa = Math.round(predictedYield * crop.market_price_ton);
  const netProfitPerHa = revenuePerHa - crop.cost_per_ha;

  // Resource feasibility for this crop on full farm
  const waterFeasible = resources.water_m3 >= crop.water_req_m3_ha * 0.5;
  const budgetFeasible = resources.budget_usd >= crop.cost_per_ha * 0.5;
  const fertFeasible = resources.fertilizer_kg >= crop.fert_req_kg_ha * 0.5;

  // Generate explainability points
  const pros: string[] = [];
  const cons: string[] = [];

  if (soilMatch) pros.push(`Ideal soil compatibility for ${soil.soil_type}`);
  else cons.push(`Sub-optimal soil: prefers ${crop.soil_types.slice(0, 2).join(' or ')}`);

  if (phScore >= 75) pros.push(`Soil pH (${soil.pH}) is within prime range (${crop.min_ph} - ${crop.max_ph})`);
  else cons.push(`Soil pH (${soil.pH}) is slightly outside ideal zone`);

  if (tempScore >= 75) pros.push(`Current temperature (${weather.temperature}°C) matches optimal vegetative growth`);
  else cons.push(`Temperature deviates from optimal (${crop.optimal_temp}°C)`);

  if (waterCompatibility >= 70) pros.push(`Water supply comfortably satisfies crop evapotranspiration demand`);
  else cons.push(`Water requirement (${crop.water_req_m3_ha.toLocaleString()} m³/ha) may stress available irrigation`);

  if (crop.risk_level === 'Low') pros.push('Low historical price volatility and high pest resilience');
  else if (crop.risk_level === 'High') cons.push('Higher market price volatility or pest vulnerability requires monitoring');

  const summary = `${crop.name} is ${tier.toLowerCase()} for your farm with an estimated yield of ${predictedYield} t/ha and net profit of $${netProfitPerHa.toLocaleString()}/ha.`;

  return {
    crop_id: crop.id,
    crop_name: crop.name,
    category: crop.category,
    suitability_score: finalScore,
    suitability_tier: tier,
    predicted_yield_tons_ha: predictedYield,
    expected_revenue_per_ha: revenuePerHa,
    cultivation_cost_per_ha: crop.cost_per_ha,
    net_profit_per_ha: netProfitPerHa,
    water_req_m3_ha: crop.water_req_m3_ha,
    fertilizer_req_kg_ha: crop.fert_req_kg_ha,
    duration_days: crop.duration_days,
    risk_level: crop.risk_level,
    farmer_explanation: { pros, cons, summary },
    technical_explanation: {
      ph_score: phScore,
      temp_score: tempScore,
      water_compatibility: waterCompatibility,
      nutrient_score: nutrientScore,
      soil_match: soilMatch,
      season_match: seasonMatch
    },
    resource_feasibility: {
      water_feasible: waterFeasible,
      budget_feasible: budgetFeasible,
      fertilizer_feasible: fertFeasible
    }
  };
}

export function predictCropYield(
  crop: CropData,
  soil: SoilInput,
  weather: WeatherInput,
  resources: ResourceInput
): number {
  // Agronomic Mitscherlich-Baule Yield Response
  // 1. Water response factor with crop-specific drought resilience
  const waterPerHa = resources.land_ha > 0 ? (resources.water_m3 / resources.land_ha) : crop.water_req_m3_ha;
  const waterRatio = Math.min(1.2, waterPerHa / crop.water_req_m3_ha);
  let waterFactor = 1.0;
  if (waterRatio < 1.0) {
    // Water stress modulated by drought tolerance index
    const stressSensitivity = 1.0 - (crop.drought_tolerance * 0.7);
    waterFactor = Math.max(0.60, 1.0 - stressSensitivity * (1.0 - waterRatio));
  } else {
    // Diminishing returns above 100% water
    waterFactor = Math.min(1.08, 1.0 + 0.05 * (waterRatio - 1.0));
  }

  // 2. Fertilizer response factor
  const fertPerHa = resources.land_ha > 0 ? (resources.fertilizer_kg / resources.land_ha) : crop.fert_req_kg_ha;
  const fertRatio = fertPerHa / crop.fert_req_kg_ha;
  const fertFactor = Math.min(1.08, (1 - Math.exp(-2.2 * Math.max(0.2, fertRatio))) / 0.89);

  // 3. pH factor
  const phDev = Math.abs(soil.pH - crop.optimal_ph);
  const phFactor = Math.max(0.65, 1.0 - 0.15 * phDev);

  // 4. Temperature factor
  const tempDev = Math.abs(weather.temperature - crop.optimal_temp);
  const tempFactor = Math.max(0.70, 1.0 - 0.035 * tempDev);

  // 5. Rainfall support factor
  const rainSupport = Math.min(1.05, Math.max(0.85, weather.rainfall / ((crop.min_rainfall + crop.max_rainfall) / 2)));

  const predicted = crop.base_yield_tons_ha * waterFactor * fertFactor * phFactor * tempFactor * rainSupport;
  return Math.max(0.2, Math.round(predicted * 10) / 10);
}
