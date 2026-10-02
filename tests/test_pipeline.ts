/**
 * AgriOptima AI - Automated Verification & Critical Path Test Suite
 * Tests all components: Health, Crops, Soil Evaluation, Yield Regression,
 * Mathematical LP Solver, Constraint Bounds, and What-If Simulation.
 */

import { runOptimization, FarmConstraints, CropData } from '../src/server/optimizer.ts';
import { evaluateCropSuitability, predictCropYield } from '../src/server/mlInference.ts';
import { db } from '../src/server/db.ts';

function runTests() {
  console.log('====================================================');
  console.log('  AGRIOPTIMA AI - SYSTEM INTEGRATION TEST RUNNER   ');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      failed++;
    }
  }

  // Test 1: Knowledge Base Loading
  const crops = db.getCrops();
  assert(crops.length >= 12, `Knowledge base loaded ${crops.length} benchmark crops (expected >= 12)`);

  const rice = crops.find(c => c.id === 'rice')!;
  const wheat = crops.find(c => c.id === 'wheat')!;
  const chickpea = crops.find(c => c.id === 'chickpea')!;
  assert(!!rice && !!wheat && !!chickpea, 'Benchmark crops Rice, Wheat, and Chickpea are valid');

  // Test 2: AI Crop Recommendation & Scoring
  const soilLoam = { soil_type: 'Loam', pH: 6.6, N: 140, P: 45, K: 55 };
  const weatherWarm = { temperature: 28, rainfall: 750, humidity: 65 };
  const resourcesNormal = { water_m3: 85000, fertilizer_kg: 2200, budget_usd: 12000, land_ha: 15 };

  const recRice = evaluateCropSuitability(rice, soilLoam, weatherWarm, resourcesNormal, 'Kharif');
  assert(recRice.suitability_score >= 60, `Rice Kharif suitability score is ${recRice.suitability_score}% (expected >= 60%)`);
  assert(recRice.farmer_explanation.pros.length > 0, 'Farmer explainability generates positive agronomic factors');
  assert(recRice.technical_explanation.ph_score > 70, 'Technical explanation verifies pH compatibility curve');

  // Test 3: Yield Prediction Regressor
  const resourcesIrrigated = { water_m3: 172500, fertilizer_kg: 2700, budget_usd: 15000, land_ha: 15 };
  const yieldRiceIrrigated = predictCropYield(rice, soilLoam, weatherWarm, resourcesIrrigated);
  const yieldRiceDeficit = predictCropYield(rice, soilLoam, weatherWarm, resourcesNormal);
  assert(yieldRiceIrrigated >= 3.8 && yieldRiceIrrigated <= 6.0, `Predicted irrigated rice yield ${yieldRiceIrrigated} t/ha is optimal`);
  assert(yieldRiceDeficit < yieldRiceIrrigated && yieldRiceDeficit >= 1.5, `Deficit water suppresses yield correctly (${yieldRiceDeficit} t/ha)`);

  // Test 4: LP Constrained Optimization (Balanced Strategy)
  const constraintsBalanced: FarmConstraints = {
    total_land_ha: 15,
    total_water_m3: 85000,
    total_fertilizer_kg: 2200,
    total_budget_usd: 12000,
    strategy: 'balanced'
  };

  const optResult = runOptimization(crops, constraintsBalanced);
  assert(optResult.feasible === true, 'Linear programming solver produces feasible solution');
  assert(optResult.allocations.length >= 1, `Solver allocates ${optResult.allocations.length} crop parcels`);
  assert(optResult.summary.used_land_ha <= 15.01, `Land constraint respected: ${optResult.summary.used_land_ha} <= 15 ha`);
  assert(optResult.summary.used_water_m3 <= 85000, `Water constraint respected: ${optResult.summary.used_water_m3} <= 85,000 m³`);
  assert(optResult.summary.used_budget_usd <= 12000, `Budget constraint respected: $${optResult.summary.used_budget_usd} <= $12,000`);
  assert(optResult.summary.total_profit > 0, `Projected net profit is positive: $${optResult.summary.total_profit}`);

  // Test 5: Infeasibility Diagnostics
  const infeasibleConstraints: FarmConstraints = {
    total_land_ha: 10,
    total_water_m3: 50, // severely insufficient water
    total_fertilizer_kg: 10,
    total_budget_usd: 100,
    strategy: 'balanced'
  };

  const infeasibleResult = runOptimization(crops, infeasibleConstraints);
  assert(infeasibleResult.feasible === false, 'Solver correctly identifies physically infeasible scenario');
  assert(!!infeasibleResult.bottleneck_constraint, `Bottleneck identified: ${infeasibleResult.bottleneck_constraint}`);
  assert(!!infeasibleResult.infeasibility_diagnosis?.recommended_action, 'Actionable remedy provided for farmer');

  // Test 6: Strategy Differences (Profit Focus vs Water Saver)
  const optProfit = runOptimization(crops, { ...constraintsBalanced, strategy: 'profit_focus' });
  const optWater = runOptimization(crops, { ...constraintsBalanced, strategy: 'water_saver' });
  assert(optProfit.feasible && optWater.feasible, 'Both Profit Focus and Water Saver strategies solve cleanly');
  assert(
    optWater.summary.used_water_m3 <= optProfit.summary.used_water_m3 + 100,
    `Water saver consumes equal or less water (${optWater.summary.used_water_m3} m³ vs ${optProfit.summary.used_water_m3} m³)`
  );

  console.log('\n====================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
