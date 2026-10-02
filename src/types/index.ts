export interface Crop {
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
  risk_score: number;
  drought_tolerance: number;
  description: string;
}

export interface Farm {
  id: string;
  user_id: string;
  name: string;
  location: string;
  land_area_ha: number;
  season: 'Kharif' | 'Rabi' | 'Zaid';
  soil: {
    soil_type: string;
    pH: number;
    N: number;
    P: number;
    K: number;
    organic_matter?: number;
  };
  resources: {
    water_m3: number;
    fertilizer_kg: number;
    budget_usd: number;
  };
  weather: {
    temperature: number;
    rainfall: number;
    humidity: number;
  };
  created_at: string;
  updated_at: string;
}

export interface CropRecommendation {
  crop_id: string;
  crop_name: string;
  category: string;
  suitability_score: number;
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

export interface SavedPlan {
  id: string;
  farm_id: string;
  user_id: string;
  farm_name: string;
  plan_name: string;
  strategy: string;
  allocations: CropAllocation[];
  summary: OptimizationResult['summary'];
  scenario_note?: string;
  created_at: string;
}

export interface ScenarioSimulationResult {
  scenario_applied: any;
  baseline: OptimizationResult;
  scenario: OptimizationResult;
  delta: {
    profit: number;
    profit_pct: number;
    water_used_m3: number;
    yield_tons: number;
    risk_before: string;
    risk_after: string;
    allocation_shifts: string[];
  };
  insights: string[];
}
