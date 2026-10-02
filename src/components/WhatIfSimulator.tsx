import React, { useState } from 'react';
import { RefreshCw, ArrowRight, TrendingUp, TrendingDown, Layers, Droplets } from 'lucide-react';
import { Farm, OptimizationResult, ScenarioSimulationResult } from '../types/index.ts';
import { DigitalFarmMap } from './DigitalFarmMap.tsx';
import { CROP_THEMES } from '../utils/cropAssets.ts';

interface WhatIfSimulatorProps {
  farm: Farm;
  baselineOptimization: OptimizationResult | null;
  onSimulate: (modifiers: any) => Promise<ScenarioSimulationResult | null>;
}

const PRESET_SCENARIOS = [
  {
    id: 'water_shortage',
    name: 'Water Shortage (-40%)',
    desc: 'Simulate severe canal water restriction',
    modifiers: { water_pct: -40, budget_pct: 0, land_pct: 0, fert_pct: 0, price_pct: 0 }
  },
  {
    id: 'budget_reduction',
    name: 'Budget Crunch (-30%)',
    desc: 'Simulate working capital constraints',
    modifiers: { water_pct: 0, budget_pct: -30, land_pct: 0, fert_pct: 0, price_pct: 0 }
  },
  {
    id: 'low_rainfall',
    name: 'Severe Drought (-50% Water)',
    desc: 'Simulate acute arid dry spell',
    modifiers: { water_pct: -50, budget_pct: -10, land_pct: 0, fert_pct: 0, price_pct: 10 }
  },
  {
    id: 'fertilizer_reduction',
    name: 'Fertilizer Cap (-35%)',
    desc: 'Simulate supply rationing',
    modifiers: { water_pct: 0, budget_pct: 0, land_pct: 0, fert_pct: -35, price_pct: 0 }
  },
  {
    id: 'price_boom',
    name: 'Commodity Price Boom (+25%)',
    desc: 'Simulate market price inflation',
    modifiers: { water_pct: 0, budget_pct: 0, land_pct: 0, fert_pct: 0, price_pct: 25 }
  },
  {
    id: 'expanded_land',
    name: 'Expanded Acreage (+50% Land)',
    desc: 'Evaluate leasing adjoining acreage',
    modifiers: { water_pct: 30, budget_pct: 40, land_pct: 50, fert_pct: 30, price_pct: 0 }
  }
];

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({
  farm,
  baselineOptimization,
  onSimulate
}) => {
  const [waterPct, setWaterPct] = useState<number>(-40);
  const [budgetPct, setBudgetPct] = useState<number>(0);
  const [landPct, setLandPct] = useState<number>(0);
  const [fertPct, setFertPct] = useState<number>(0);
  const [pricePct, setPricePct] = useState<number>(0);

  const [activePreset, setActivePreset] = useState<string>('water_shortage');
  const [simulationResult, setSimulationResult] = useState<ScenarioSimulationResult | null>(null);
  const [simulating, setSimulating] = useState<boolean>(false);

  const applyPreset = (preset: typeof PRESET_SCENARIOS[0]) => {
    setActivePreset(preset.id);
    setWaterPct(preset.modifiers.water_pct);
    setBudgetPct(preset.modifiers.budget_pct);
    setLandPct(preset.modifiers.land_pct);
    setFertPct(preset.modifiers.fert_pct);
    setPricePct(preset.modifiers.price_pct);
  };

  const handleRecalculate = async () => {
    setSimulating(true);
    const modifiers = {
      water_pct: waterPct,
      budget_pct: budgetPct,
      land_pct: landPct,
      fert_pct: fertPct,
      price_pct: pricePct
    };
    const res = await onSimulate(modifiers);
    if (res) {
      setSimulationResult(res);
    }
    setSimulating(false);
  };

  React.useEffect(() => {
    if (baselineOptimization && !simulationResult) {
      handleRecalculate();
    }
  }, [baselineOptimization]);

  const baselineSummary = baselineOptimization?.summary;
  const scenarioSummary = simulationResult?.scenario?.summary;
  const delta = simulationResult?.delta;

  return (
    <div className="space-y-6">
      {/* Header & Clean Sliders */}
      <div className="bg-white rounded-xl border border-[#e5e8e1] p-5 shadow-xs space-y-5">
        <div className="flex flex-wrap justify-between items-center gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-[#1b4324]"></span>
              <h2 className="text-base font-bold text-[#1a1e1b]">WHAT IF YOUR RESOURCES CHANGE?</h2>
            </div>
            <p className="text-xs text-[#6b736c] mt-0.5">
              Simulate dynamic resource fluctuations: evaluate crop mix migration and financial risk before committing seasonal capital.
            </p>
          </div>

          <button
            onClick={handleRecalculate}
            disabled={simulating}
            className="inline-flex items-center px-4 py-2 rounded-lg text-xs font-semibold bg-[#1b4324] hover:bg-[#163b20] text-white shadow-2xs transition-all active:scale-98"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${simulating ? 'animate-spin' : ''}`} />
            <span>{simulating ? 'Recalculating Plan...' : 'Recalculate Plan'}</span>
          </button>
        </div>

        {/* Clean Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 pt-4 border-t border-[#edf0ea] text-xs">
          {/* Water Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-[#3d453e]">Water Reserve</span>
              <span className={`font-bold ${waterPct < 0 ? 'text-[#b45309]' : 'text-[#1b4324]'}`}>
                {waterPct > 0 ? `+${waterPct}` : waterPct}%
              </span>
            </div>
            <input
              type="range"
              min="-60"
              max="50"
              step="5"
              value={waterPct}
              onChange={(e) => {
                setWaterPct(parseInt(e.target.value, 10));
                setActivePreset('');
              }}
              className="w-full accent-[#1b4324] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#757d74]">
              <span>-60%</span>
              <span>Baseline</span>
              <span>+50%</span>
            </div>
          </div>

          {/* Budget Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-[#3d453e]">Working Budget</span>
              <span className={`font-bold ${budgetPct < 0 ? 'text-[#b45309]' : 'text-[#1b4324]'}`}>
                {budgetPct > 0 ? `+${budgetPct}` : budgetPct}%
              </span>
            </div>
            <input
              type="range"
              min="-50"
              max="50"
              step="5"
              value={budgetPct}
              onChange={(e) => {
                setBudgetPct(parseInt(e.target.value, 10));
                setActivePreset('');
              }}
              className="w-full accent-[#1b4324] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#757d74]">
              <span>-50%</span>
              <span>Baseline</span>
              <span>+50%</span>
            </div>
          </div>

          {/* Land Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-[#3d453e]">Land Area</span>
              <span className="font-bold text-[#1a1e1b]">{landPct > 0 ? `+${landPct}` : landPct}%</span>
            </div>
            <input
              type="range"
              min="-40"
              max="100"
              step="10"
              value={landPct}
              onChange={(e) => {
                setLandPct(parseInt(e.target.value, 10));
                setActivePreset('');
              }}
              className="w-full accent-[#1b4324] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#757d74]">
              <span>-40%</span>
              <span>Baseline</span>
              <span>+100%</span>
            </div>
          </div>

          {/* Fertilizer Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-[#3d453e]">Fertilizer</span>
              <span className="font-bold text-[#1a1e1b]">{fertPct > 0 ? `+${fertPct}` : fertPct}%</span>
            </div>
            <input
              type="range"
              min="-50"
              max="50"
              step="5"
              value={fertPct}
              onChange={(e) => {
                setFertPct(parseInt(e.target.value, 10));
                setActivePreset('');
              }}
              className="w-full accent-[#1b4324] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#757d74]">
              <span>-50%</span>
              <span>Baseline</span>
              <span>+50%</span>
            </div>
          </div>

          {/* Market Price Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-[#3d453e]">Market Price</span>
              <span className="font-bold text-[#1a1e1b]">{pricePct > 0 ? `+${pricePct}` : pricePct}%</span>
            </div>
            <input
              type="range"
              min="-30"
              max="50"
              step="5"
              value={pricePct}
              onChange={(e) => {
                setPricePct(parseInt(e.target.value, 10));
                setActivePreset('');
              }}
              className="w-full accent-[#1b4324] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#757d74]">
              <span>-30%</span>
              <span>Baseline</span>
              <span>+50%</span>
            </div>
          </div>
        </div>

        {/* Clean Benchmark Presets */}
        <div className="pt-3 border-t border-[#edf0ea]">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#636c64] block mb-2">
            One-Click Scenarios:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {PRESET_SCENARIOS.map((p) => {
              const isActive = activePreset === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => applyPreset(p)}
                  className={`p-2.5 rounded-lg text-left text-xs transition-all border ${
                    isActive
                      ? 'border-[#1b4324] bg-[#f4f7f3] text-[#1a1e1b] font-semibold'
                      : 'border-[#e5e8e1] bg-white hover:bg-[#fafbf9] text-[#4a524b]'
                  }`}
                >
                  <div className="font-semibold truncate text-[11px]">{p.name}</div>
                  <div className="text-[10px] text-[#6b736c] mt-0.5 truncate">{p.desc}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Delta KPI Chips */}
      {delta && (
        <div className="bg-[#f7f9f6] border border-[#dce2d8] rounded-xl p-4 sm:p-5 text-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#3d453e]">
              Simulation Impact Summary
            </span>
            <span className="text-[11px] text-[#1b4324] font-semibold">
              Recalculated via Simplex LP
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Profit Delta */}
            <div className="bg-white p-3 rounded-lg border border-[#e2e7df]">
              <span className="text-[#6b736c] block text-[10px]">Net Profit Shift</span>
              <div className="flex items-center space-x-1.5 mt-0.5">
                {delta.profit >= 0 ? (
                  <TrendingUp className="h-3.5 w-3.5 text-[#1b4324]" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5 text-[#b91c1c]" />
                )}
                <span className={`text-base font-extrabold ${delta.profit >= 0 ? 'text-[#1b4324]' : 'text-[#b91c1c]'}`}>
                  {delta.profit >= 0 ? `+$${delta.profit.toLocaleString()}` : `-$${Math.abs(delta.profit).toLocaleString()}`}
                </span>
              </div>
              <span className="text-[10px] text-[#757d74]">{delta.profit_pct >= 0 ? `+${delta.profit_pct}` : delta.profit_pct}% variance</span>
            </div>

            {/* Water Delta */}
            <div className="bg-white p-3 rounded-lg border border-[#e2e7df]">
              <span className="text-[#6b736c] block text-[10px]">Water Consumed</span>
              <div className="text-base font-extrabold text-[#1a1e1b] mt-0.5">
                {delta.water_used_m3 >= 0 ? `+${delta.water_used_m3.toLocaleString()}` : delta.water_used_m3.toLocaleString()} m³
              </div>
              <span className="text-[10px] text-[#757d74]">Canal volume delta</span>
            </div>

            {/* Yield Delta */}
            <div className="bg-white p-3 rounded-lg border border-[#e2e7df]">
              <span className="text-[#6b736c] block text-[10px]">Expected Harvest</span>
              <div className="text-base font-extrabold text-[#1a1e1b] mt-0.5">
                {delta.yield_tons >= 0 ? `+${delta.yield_tons}` : delta.yield_tons} Tons
              </div>
              <span className="text-[10px] text-[#757d74]">Physical tonnage delta</span>
            </div>

            {/* Risk Delta */}
            <div className="bg-white p-3 rounded-lg border border-[#e2e7df]">
              <span className="text-[#6b736c] block text-[10px]">Risk Migration</span>
              <div className="text-base font-bold text-[#1a1e1b] mt-0.5">
                {delta.risk_before} → <span className="font-extrabold">{delta.risk_after}</span>
              </div>
              <span className="text-[10px] text-[#757d74]">Environmental exposure</span>
            </div>
          </div>

          {delta.allocation_shifts.length > 0 && (
            <div className="pt-2 border-t border-[#e2e7df] text-[11px] text-[#363e37] flex items-start space-x-1.5">
              <strong className="text-[#1a1e1b] shrink-0">Crop Mix Migration:</strong>
              <span>{delta.allocation_shifts.join(' • ')}</span>
            </div>
          )}
        </div>
      )}

      {/* CURRENT PLAN vs SCENARIO PLAN */}
      {baselineSummary && scenarioSummary && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* CURRENT PLAN */}
          <div className="bg-white rounded-xl border border-[#e5e8e1] p-5 shadow-xs space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-[#edf0ea]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#636c64]">BASELINE</span>
                <h3 className="font-extrabold text-[#1a1e1b] text-sm">CURRENT PLAN</h3>
              </div>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#f4f6f2] text-[#3d453e]">
                100% Conditions
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-[#f0f2ed]">
                <span className="text-[#6b736c]">Cultivated Land:</span>
                <span className="font-semibold text-[#1a1e1b]">{baselineSummary.used_land_ha} ha ({baselineSummary.land_utilization_pct}%)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#f0f2ed]">
                <span className="text-[#6b736c]">Water Requirement:</span>
                <span className="font-semibold text-[#1a1e1b]">{baselineSummary.used_water_m3.toLocaleString()} m³</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#f0f2ed]">
                <span className="text-[#6b736c]">Total Cultivation Cost:</span>
                <span className="font-semibold text-[#1a1e1b]">${baselineSummary.total_cost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#f0f2ed]">
                <span className="text-[#6b736c]">Expected Harvest:</span>
                <span className="font-semibold text-[#1a1e1b]">{baselineSummary.expected_production_tons} Tons</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#f0f2ed]">
                <span className="text-[#6b736c]">Projected Net Profit:</span>
                <span className="font-bold text-[#1b4324] text-sm">${baselineSummary.total_profit.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-[#6b736c]">Farm Risk:</span>
                <span className="font-semibold text-[#1a1e1b]">{baselineSummary.composite_risk}</span>
              </div>
            </div>

            {/* Baseline Crop Mix */}
            <div className="pt-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#636c64] block mb-1.5">
                Current Crop Mix:
              </span>
              <div className="space-y-1 text-xs">
                {baselineOptimization?.allocations.map((a) => (
                  <div key={a.crop_id} className="flex justify-between items-center py-1 px-2.5 rounded-md bg-[#fafbf9] border border-[#edf0ea]">
                    <span className="font-medium text-[#1a1e1b]">{a.crop_name}</span>
                    <span className="text-[#5c645d]">{a.allocated_ha} ha ({a.percentage_of_land}%)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SCENARIO PLAN */}
          <div className="bg-white rounded-xl border-2 border-[#1b4324] p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-[#edf0ea]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#1b4324]">SIMULATED</span>
                <h3 className="font-extrabold text-[#1a1e1b] text-sm">SCENARIO PLAN</h3>
              </div>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#eef4ed] text-[#1b4324]">
                Recalculated
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-[#f0f2ed]">
                <span className="text-[#6b736c]">Cultivated Land:</span>
                <span className="font-semibold text-[#1a1e1b]">{scenarioSummary.used_land_ha} ha ({scenarioSummary.land_utilization_pct}%)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#f0f2ed]">
                <span className="text-[#6b736c]">Water Requirement:</span>
                <span className="font-semibold text-[#1a1e1b]">{scenarioSummary.used_water_m3.toLocaleString()} m³</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#f0f2ed]">
                <span className="text-[#6b736c]">Total Cultivation Cost:</span>
                <span className="font-semibold text-[#1a1e1b]">${scenarioSummary.total_cost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#f0f2ed]">
                <span className="text-[#6b736c]">Expected Harvest:</span>
                <span className="font-semibold text-[#1a1e1b]">{scenarioSummary.expected_production_tons} Tons</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#f0f2ed]">
                <span className="text-[#6b736c]">Projected Net Profit:</span>
                <span className="font-bold text-[#1b4324] text-sm">${scenarioSummary.total_profit.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-[#6b736c]">Farm Risk:</span>
                <span className="font-semibold text-[#1a1e1b]">{scenarioSummary.composite_risk}</span>
              </div>
            </div>

            {/* Scenario Crop Mix */}
            <div className="pt-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#1b4324] block mb-1.5">
                Scenario Crop Mix:
              </span>
              <div className="space-y-1 text-xs">
                {simulationResult?.scenario?.allocations.map((a) => (
                  <div key={a.crop_id} className="flex justify-between items-center py-1 px-2.5 rounded-md bg-[#f6f9f5] border border-[#d6e3d3]">
                    <span className="font-bold text-[#1a1e1b]">{a.crop_name}</span>
                    <span className="font-semibold text-[#1b4324]">{a.allocated_ha} ha ({a.percentage_of_land}%)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Digital Farm Parcel Map for the Simulated State */}
      {simulationResult?.scenario && (
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#4a524b]">
            <span>Digital Farm Parcel Layout Under This Scenario</span>
          </div>
          <DigitalFarmMap
            optimization={simulationResult.scenario}
            farmName={`${farm.name} (Simulated Scenario)`}
            totalLand={simulationResult.scenario.summary.total_land_ha}
          />
        </div>
      )}
    </div>
  );
};
