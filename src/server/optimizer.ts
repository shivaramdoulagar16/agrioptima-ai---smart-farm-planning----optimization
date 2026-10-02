/**
 * AgriOptima AI - Constrained Farm Resource Optimization Engine
 * Formulates and solves linear programming models for agricultural land, water,
 * fertilizer, and capital allocation across candidate crops.
 */

// @ts-ignore
import solver from 'javascript-lp-solver';

export interface CropData {
  id: string;
  name: string;
  category: string;
  season: string;
  soil_types: string[];
  min_ph: number;
  max_ph: number;
  optimal_ph: number;
  min_temp: number;
  max_temp: number;
  optimal_temp: number;
  min_rainfall: number;
  max_rainfall: number;
  water_req_m3_ha: number;
  fert_req_kg_ha: number;
  cost_per_ha: number;
  base_yield_tons_ha: number;
  market_price_ton: number;
  duration_days: number;
  risk_level: 'Low' | 'Medium' | 'High';
  risk_score: number; // 0.0 to 1.0
  drought_tolerance: number;
  description: string;
}

export interface FarmConstraints {
  total_land_ha: number;
  total_water_m3: number;
  total_fertilizer_kg: number;
  total_budget_usd: number;
  strategy: 'profit_focus' | 'water_saver' | 'balanced' | 'risk_aware';
  selected_crops?: string[];
  min_crop_diversity?: number; // minimum number of crops if feasible
}

export interface CropAllocation {
  crop_id: string;
  crop_name: string;
  allocated_ha: number;
  percentage_of_land: number;
  predicted_yield_tons: number;
  cultivation_cost: number;
  expected_revenue: number;
  expected_profit: number;
  water_used_m3: number;
  fertilizer_used_kg: number;
  risk_score: number;
}

export interface OptimizationResult {
  feasible: boolean;
  strategy: string;
  status_message: string;
  bottleneck_constraint?: string;
  allocations: CropAllocation[];
  summary: {
    total_land_ha: number;
    used_land_ha: number;
    land_utilization_pct: number;
    unallocated_land_ha: number;

    total_water_m3: number;
    used_water_m3: number;
    water_utilization_pct: number;

    total_fert_kg: number;
    used_fert_kg: number;
    fert_utilization_pct: number;

    total_budget_usd: number;
    used_budget_usd: number;
    budget_utilization_pct: number;

    expected_production_tons: number;
    total_cost: number;
    total_revenue: number;
    total_profit: number;
    profit_margin_pct: number;
    composite_risk: 'Low' | 'Medium' | 'High';
    composite_risk_score: number;
  };
  infeasibility_diagnosis?: {
    cause: string;
    limiting_resource: string;
    current_value: number;
    minimum_required: number;
    recommended_action: string;
  };
}

export function runOptimization(
  crops: CropData[],
  constraints: FarmConstraints,
  yieldEstimates?: Record<string, number>
): OptimizationResult {
  const {
    total_land_ha,
    total_water_m3,
    total_fertilizer_kg,
    total_budget_usd,
    strategy = 'balanced',
    selected_crops
  } = constraints;

  // Filter crops if specific subset requested
  const candidateCrops = selected_crops && selected_crops.length > 0
    ? crops.filter(c => selected_crops.includes(c.id))
    : crops;

  if (candidateCrops.length === 0) {
    return {
      feasible: false,
      strategy,
      status_message: 'No eligible candidate crops provided for optimization.',
      allocations: [],
      summary: createEmptySummary(constraints),
      infeasibility_diagnosis: {
        cause: 'Empty crop candidate list',
        limiting_resource: 'Crops',
        current_value: 0,
        minimum_required: 1,
        recommended_action: 'Select at least one suitable crop.'
      }
    };
  }

  // Pre-check for severe infeasibility (e.g. 0 water or 0 budget)
  const minCostPerHa = Math.min(...candidateCrops.map(c => c.cost_per_ha));
  const minWaterPerHa = Math.min(...candidateCrops.map(c => c.water_req_m3_ha));
  const minFertPerHa = Math.min(...candidateCrops.map(c => c.fert_req_kg_ha));

  const minAcreagePossibleBudget = total_budget_usd / minCostPerHa;
  const minAcreagePossibleWater = total_water_m3 / minWaterPerHa;
  const minAcreagePossibleFert = total_fertilizer_kg / minFertPerHa;

  const minFeasibleArea = Math.min(minAcreagePossibleBudget, minAcreagePossibleWater, minAcreagePossibleFert);

  if (minFeasibleArea < 0.05) {
    // Infeasible
    let limiting = 'Budget';
    let minReq = minCostPerHa * 0.1;
    let currVal = total_budget_usd;
    let action = `Increase budget above $${Math.ceil(minReq)} or switch to lower cost crops.`;

    if (minAcreagePossibleWater < minAcreagePossibleBudget && minAcreagePossibleWater < minAcreagePossibleFert) {
      limiting = 'Water';
      minReq = minWaterPerHa * 0.1;
      currVal = total_water_m3;
      action = `Available water (${total_water_m3} m³) is insufficient for even 0.1 hectare. Increase water supply or install drip irrigation.`;
    } else if (minAcreagePossibleFert < minAcreagePossibleBudget) {
      limiting = 'Fertilizer';
      minReq = minFertPerHa * 0.1;
      currVal = total_fertilizer_kg;
      action = `Available fertilizer (${total_fertilizer_kg} kg) is insufficient. Increase fertilizer reserves.`;
    }

    return {
      feasible: false,
      strategy,
      status_message: `Optimization Infeasible: Constrained by critically low ${limiting}.`,
      bottleneck_constraint: limiting,
      allocations: [],
      summary: createEmptySummary(constraints),
      infeasibility_diagnosis: {
        cause: `Critically insufficient ${limiting}`,
        limiting_resource: limiting,
        current_value: currVal,
        minimum_required: Math.ceil(minReq),
        recommended_action: action
      }
    };
  }

  // Build LP Model
  // Objective: Maximize synthetic score according to strategy
  const variables: Record<string, Record<string, number>> = {};
  const lpConstraints: Record<string, { max?: number; min?: number }> = {
    land: { max: total_land_ha },
    water: { max: total_water_m3 },
    fertilizer: { max: total_fertilizer_kg },
    budget: { max: total_budget_usd }
  };

  // Optional diversification constraint: no single crop can take more than 75% of land if balanced
  const maxSingleCropLand = strategy === 'balanced' && total_land_ha >= 3
    ? total_land_ha * 0.70
    : total_land_ha;

  for (const crop of candidateCrops) {
    const yieldPerHa = (yieldEstimates && yieldEstimates[crop.id])
      ? yieldEstimates[crop.id]
      : crop.base_yield_tons_ha;

    const revPerHa = yieldPerHa * crop.market_price_ton;
    const costPerHa = crop.cost_per_ha;
    const netProfitPerHa = revPerHa - costPerHa;

    // Strategy-specific objective coefficient calculation:
    let objectiveCoeff = netProfitPerHa;

    if (strategy === 'profit_focus') {
      objectiveCoeff = netProfitPerHa;
    } else if (strategy === 'water_saver') {
      // Heavily incentivize high profit per m³ of water
      const waterCostPenalty = (crop.water_req_m3_ha / 1000) * 80;
      objectiveCoeff = netProfitPerHa - waterCostPenalty + (crop.drought_tolerance * 400);
    } else if (strategy === 'balanced') {
      // Balanced: profit + resource sustainability + moderate risk mitigation
      const riskDeduction = netProfitPerHa * (crop.risk_score * 0.35);
      const waterPenalty = (crop.water_req_m3_ha / 1000) * 30;
      objectiveCoeff = netProfitPerHa - riskDeduction - waterPenalty;
    } else if (strategy === 'risk_aware') {
      // Severe risk penalty
      const riskDeduction = netProfitPerHa * (crop.risk_score * 0.75);
      objectiveCoeff = Math.max(10, netProfitPerHa - riskDeduction);
    }

    variables[crop.id] = {
      objective: Math.round(objectiveCoeff),
      land: 1,
      water: crop.water_req_m3_ha,
      fertilizer: crop.fert_req_kg_ha,
      budget: crop.cost_per_ha
    };

    // Add cap per single crop to promote resilience
    if (strategy === 'balanced' || strategy === 'risk_aware') {
      lpConstraints[`max_${crop.id}`] = { max: maxSingleCropLand };
      variables[crop.id][`max_${crop.id}`] = 1;
    }
  }

  const model = {
    optimize: 'objective',
    opType: 'max' as const,
    constraints: lpConstraints,
    variables
  };

  const solution = solver.Solve(model);

  if (!solution.feasible || solution.result <= 0) {
    // Diagnose bottleneck
    return diagnoseBottleneck(candidateCrops, constraints);
  }

  // Parse allocations
  const allocations: CropAllocation[] = [];
  let totalUsedLand = 0;
  let totalUsedWater = 0;
  let totalUsedFert = 0;
  let totalUsedBudget = 0;
  let totalProductionTons = 0;
  let totalCost = 0;
  let totalRevenue = 0;
  let weightedRiskSum = 0;

  for (const crop of candidateCrops) {
    const allocatedHa = solution[crop.id] ? Number(solution[crop.id]) : 0;
    if (allocatedHa > 0.01) {
      const roundedHa = Math.round(allocatedHa * 100) / 100;
      const yieldPerHa = (yieldEstimates && yieldEstimates[crop.id])
        ? yieldEstimates[crop.id]
        : crop.base_yield_tons_ha;

      const prodTons = Math.round(roundedHa * yieldPerHa * 10) / 10;
      const cost = Math.round(roundedHa * crop.cost_per_ha);
      const rev = Math.round(prodTons * crop.market_price_ton);
      const profit = rev - cost;
      const waterUsed = Math.round(roundedHa * crop.water_req_m3_ha);
      const fertUsed = Math.round(roundedHa * crop.fert_req_kg_ha);

      totalUsedLand += roundedHa;
      totalUsedWater += waterUsed;
      totalUsedFert += fertUsed;
      totalUsedBudget += cost;
      totalProductionTons += prodTons;
      totalCost += cost;
      totalRevenue += rev;
      weightedRiskSum += (crop.risk_score * roundedHa);

      allocations.push({
        crop_id: crop.id,
        crop_name: crop.name,
        allocated_ha: roundedHa,
        percentage_of_land: Math.round((roundedHa / total_land_ha) * 1000) / 10,
        predicted_yield_tons: prodTons,
        cultivation_cost: cost,
        expected_revenue: rev,
        expected_profit: profit,
        water_used_m3: waterUsed,
        fertilizer_used_kg: fertUsed,
        risk_score: crop.risk_score
      });
    }
  }

  // Sort allocations descending by allocated land
  allocations.sort((a, b) => b.allocated_ha - a.allocated_ha);

  totalUsedLand = Math.min(total_land_ha, Math.round(totalUsedLand * 100) / 100);
  const totalProfit = totalRevenue - totalCost;
  const profitMargin = totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 1000) / 10 : 0;
  const compositeRiskScore = totalUsedLand > 0 ? Math.round((weightedRiskSum / totalUsedLand) * 100) / 100 : 0.3;
  const compositeRiskLevel: 'Low' | 'Medium' | 'High' =
    compositeRiskScore < 0.35 ? 'Low' : compositeRiskScore < 0.55 ? 'Medium' : 'High';

  return {
    feasible: true,
    strategy,
    status_message: `Optimal resource allocation found under ${formatStrategyName(strategy)} strategy.`,
    allocations,
    summary: {
      total_land_ha,
      used_land_ha: totalUsedLand,
      land_utilization_pct: Math.round((totalUsedLand / total_land_ha) * 1000) / 10,
      unallocated_land_ha: Math.max(0, Math.round((total_land_ha - totalUsedLand) * 100) / 100),

      total_water_m3,
      used_water_m3: totalUsedWater,
      water_utilization_pct: Math.min(100, Math.round((totalUsedWater / total_water_m3) * 1000) / 10),

      total_fert_kg: total_fertilizer_kg,
      used_fert_kg: totalUsedFert,
      fert_utilization_pct: Math.min(100, Math.round((totalUsedFert / total_fertilizer_kg) * 1000) / 10),

      total_budget_usd,
      used_budget_usd: totalUsedBudget,
      budget_utilization_pct: Math.min(100, Math.round((totalUsedBudget / total_budget_usd) * 1000) / 10),

      expected_production_tons: Math.round(totalProductionTons * 10) / 10,
      total_cost: totalCost,
      total_revenue: totalRevenue,
      total_profit: totalProfit,
      profit_margin_pct: profitMargin,
      composite_risk: compositeRiskLevel,
      composite_risk_score: compositeRiskScore
    }
  };
}

function createEmptySummary(c: FarmConstraints) {
  return {
    total_land_ha: c.total_land_ha,
    used_land_ha: 0,
    land_utilization_pct: 0,
    unallocated_land_ha: c.total_land_ha,
    total_water_m3: c.total_water_m3,
    used_water_m3: 0,
    water_utilization_pct: 0,
    total_fert_kg: c.total_fertilizer_kg,
    used_fert_kg: 0,
    fert_utilization_pct: 0,
    total_budget_usd: c.total_budget_usd,
    used_budget_usd: 0,
    budget_utilization_pct: 0,
    expected_production_tons: 0,
    total_cost: 0,
    total_revenue: 0,
    total_profit: 0,
    profit_margin_pct: 0,
    composite_risk: 'High' as const,
    composite_risk_score: 0.8
  };
}

function diagnoseBottleneck(crops: CropData[], c: FarmConstraints): OptimizationResult {
  const avgWater = crops.reduce((sum, x) => sum + x.water_req_m3_ha, 0) / crops.length;
  const avgCost = crops.reduce((sum, x) => sum + x.cost_per_ha, 0) / crops.length;

  const waterDeficit = c.total_water_m3 < avgWater * (c.total_land_ha * 0.2);
  const budgetDeficit = c.total_budget_usd < avgCost * (c.total_land_ha * 0.2);

  let limiting = 'Water';
  let minReq = Math.round(avgWater * 0.5);
  let action = 'Increase available irrigation or choose dryland crops like Chickpea or Millets.';

  if (budgetDeficit) {
    limiting = 'Budget';
    minReq = Math.round(avgCost * 0.5);
    action = 'Increase working capital or prioritize low-input crops like Soybean or Mustard.';
  }

  return {
    feasible: false,
    strategy: c.strategy,
    status_message: `Optimization Infeasible: Insufficient ${limiting} to cultivate minimum viable parcel.`,
    bottleneck_constraint: limiting,
    allocations: [],
    summary: createEmptySummary(c),
    infeasibility_diagnosis: {
      cause: `Constraint binding: ${limiting} ceiling too low`,
      limiting_resource: limiting,
      current_value: limiting === 'Water' ? c.total_water_m3 : c.total_budget_usd,
      minimum_required: minReq,
      recommended_action: action
    }
  };
}

export function formatStrategyName(s: string): string {
  switch (s) {
    case 'profit_focus':
      return 'Profit Focus (Max ROI)';
    case 'water_saver':
      return 'Water Saver (Eco-Efficient)';
    case 'risk_aware':
      return 'Risk Aware (Staple Resilient)';
    case 'balanced':
    default:
      return 'Balanced (Optimal Diversity)';
  }
}
