import React, { useState } from 'react';
import { RefreshCw, Bookmark, AlertCircle, Layers, Droplets, DollarSign, Check } from 'lucide-react';
import { Farm, OptimizationResult } from '../types/index.ts';
import { CROP_THEMES } from '../utils/cropAssets.ts';

interface OptimizerViewProps {
  farm: Farm;
  optimization: OptimizationResult | null;
  loading: boolean;
  onRunOptimization: (strategy: string) => void;
  onSavePlan: (planName: string, note?: string) => void;
}

const STRATEGY_TABS = [
  { id: 'balanced', label: 'Balanced', desc: 'Harmonious multi-crop diversification and resource sustainability' },
  { id: 'profit_focus', label: 'Profit Focus', desc: 'Aggressive commercial return maximization' },
  { id: 'water_saver', label: 'Water Saver', desc: 'Drought-resilient conservation minimizing irrigation demand' },
  { id: 'risk_aware', label: 'Risk Aware', desc: 'Defensive staple crop allocation against volatility' }
];

export const OptimizerView: React.FC<OptimizerViewProps> = ({
  farm,
  optimization,
  loading,
  onRunOptimization,
  onSavePlan
}) => {
  const [selectedStrategy, setSelectedStrategy] = useState<string>(optimization?.strategy || 'balanced');
  const [saveModalOpen, setSaveModalOpen] = useState<boolean>(false);
  const [planName, setPlanName] = useState<string>(`Optimized Plan (${farm.name})`);
  const [planNote, setPlanNote] = useState<string>('');

  const handleStrategySelect = (st: string) => {
    setSelectedStrategy(st);
    onRunOptimization(st);
  };

  const handleSave = () => {
    if (!planName.trim()) return;
    onSavePlan(planName, planNote);
    setSaveModalOpen(false);
    setPlanNote('');
  };

  const summary = optimization?.summary;
  const numCrops = optimization?.allocations.length || 0;

  return (
    <div className="space-y-6">
      {/* Header & Clean Strategy Selector Tabs */}
      <div className="bg-white rounded-xl border border-[#e5e8e1] p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap justify-between items-center gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-[#1b4324]"></span>
              <h2 className="text-base font-bold text-[#1a1e1b]">OPTIMIZED FARM PLAN</h2>
            </div>
            <p className="text-xs text-[#6b736c] mt-0.5">
              Simplex Linear Programming algorithm allocating exact acreage parcels subject to land, water, fertilizer, and working capital constraints.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onRunOptimization(selectedStrategy)}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 rounded-lg text-xs font-semibold bg-[#1b4324] hover:bg-[#163b20] text-white shadow-2xs transition-colors"
            >
              <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Solving Model...' : 'Recalculate Optimization'}
            </button>
            {optimization?.feasible && (
              <button
                onClick={() => setSaveModalOpen(true)}
                className="inline-flex items-center px-3 py-2 rounded-lg text-xs font-medium text-[#2d332e] bg-[#f4f6f2] hover:bg-[#eaece7] border border-[#dce0d8] transition-colors"
              >
                <Bookmark className="h-3.5 w-3.5 mr-1.5 text-[#5c645d]" />
                Save Plan
              </button>
            )}
          </div>
        </div>

        {/* Minimal Strategy Tabs */}
        <div className="pt-2 border-t border-[#edf0ea]">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#636c64] block mb-2">
            Optimization Strategy:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {STRATEGY_TABS.map((tab) => {
              const isActive = selectedStrategy === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleStrategySelect(tab.id)}
                  className={`p-3 rounded-lg text-left transition-all border ${
                    isActive
                      ? 'border-[#1b4324] bg-[#f4f7f3] text-[#1a1e1b]'
                      : 'border-[#e5e8e1] bg-white hover:bg-[#fafbf9] text-[#4a524b]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs">{tab.label}</span>
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#1b4324]"></span>}
                  </div>
                  <p className="text-[11px] text-[#6b736c] mt-0.5 line-clamp-1">{tab.desc}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Infeasibility Alert if constraints cannot be satisfied */}
      {optimization && !optimization.feasible && (
        <div className="bg-[#fff8f8] border border-[#f5c6c6] rounded-xl p-5 text-[#722b2b] shadow-xs">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-[#b91c1c] shrink-0 mt-0.5" />
            <div className="space-y-2 text-xs">
              <h3 className="font-bold text-sm text-[#722b2b]">Optimization Infeasible Under Current Constraints</h3>
              <p className="text-[#883636] leading-relaxed">{optimization.status_message}</p>
              {optimization.infeasibility_diagnosis && (
                <div className="bg-white p-3 rounded-lg border border-[#f5c6c6] space-y-1">
                  <div>
                    <span className="font-bold">Limiting Constraint: </span>
                    <span>{optimization.infeasibility_diagnosis.limiting_resource}</span>
                  </div>
                  <div>
                    <span className="font-bold">Minimum Requirement: </span>
                    <span>{optimization.infeasibility_diagnosis.minimum_required.toLocaleString()}</span>
                  </div>
                  <div className="pt-1 text-[#1b4324] font-medium">
                    💡 <b>Actionable Remedy:</b> {optimization.infeasibility_diagnosis.recommended_action}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Central Insight Banner & Utilization Summary */}
      {optimization && optimization.feasible && summary && (
        <div className="bg-white rounded-xl border border-[#e5e8e1] p-5 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#edf0ea]">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#636c64] block">
                Central Farm Allocation Insight
              </span>
              <h3 className="text-base font-extrabold text-[#1a1e1b] mt-0.5">
                Your current resources support a {numCrops}-crop diversified plan.
              </h3>
            </div>
            <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-[#eef4ed] text-[#1b4324] border border-[#d6e4d4]">
              Mathematically Feasible
            </span>
          </div>

          {/* 3 Core Utilization KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-[#fbfbf9] border border-[#e5e8e1]">
              <div className="flex justify-between items-center text-xs text-[#6b736c] mb-1">
                <span>Land Utilization</span>
                <span className="font-bold text-[#1a1e1b]">{summary.land_utilization_pct}%</span>
              </div>
              <div className="w-full bg-[#edeae4] rounded-full h-1.5">
                <div className="bg-[#1b4324] h-1.5 rounded-full" style={{ width: `${Math.min(100, summary.land_utilization_pct)}%` }}></div>
              </div>
              <span className="text-[10px] text-[#757d74] mt-1.5 block">{summary.used_land_ha} of {summary.total_land_ha} hectares</span>
            </div>

            <div className="p-3 rounded-lg bg-[#fbfbf9] border border-[#e5e8e1]">
              <div className="flex justify-between items-center text-xs text-[#6b736c] mb-1">
                <span>Water Utilization</span>
                <span className="font-bold text-[#1a1e1b]">{summary.water_utilization_pct}%</span>
              </div>
              <div className="w-full bg-[#edeae4] rounded-full h-1.5">
                <div className="bg-[#2d5f38] h-1.5 rounded-full" style={{ width: `${Math.min(100, summary.water_utilization_pct)}%` }}></div>
              </div>
              <span className="text-[10px] text-[#757d74] mt-1.5 block">{summary.used_water_m3.toLocaleString()} of {summary.total_water_m3.toLocaleString()} m³</span>
            </div>

            <div className="p-3 rounded-lg bg-[#fbfbf9] border border-[#e5e8e1]">
              <div className="flex justify-between items-center text-xs text-[#6b736c] mb-1">
                <span>Budget Utilization</span>
                <span className="font-bold text-[#1a1e1b]">{summary.budget_utilization_pct}%</span>
              </div>
              <div className="w-full bg-[#edeae4] rounded-full h-1.5">
                <div className="bg-[#4a634e] h-1.5 rounded-full" style={{ width: `${Math.min(100, summary.budget_utilization_pct)}%` }}></div>
              </div>
              <span className="text-[10px] text-[#757d74] mt-1.5 block">${summary.used_budget_usd.toLocaleString()} of ${summary.total_budget_usd.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* Allocation Table & Proportional Distribution */}
      {optimization && optimization.feasible && summary && (
        <div className="bg-white rounded-xl border border-[#e5e8e1] p-5 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-[#1a1e1b] text-sm">Parcel Resource Distribution</h3>
            <span className="text-xs text-[#6b736c]">Strategy: <strong className="text-[#1a1e1b] capitalize">{optimization.strategy.replace('_', ' ')}</strong></span>
          </div>

          {/* Minimalist Proportional Land Distribution Bar */}
          <div className="space-y-1.5">
            <div className="flex h-3 w-full rounded-md overflow-hidden bg-[#edf0ea]">
              {optimization.allocations.map((a) => (
                <div
                  key={a.crop_id}
                  style={{
                    width: `${a.percentage_of_land}%`,
                    backgroundColor: CROP_THEMES[a.crop_id]?.text || '#1b4324'
                  }}
                  title={`${a.crop_name}: ${a.percentage_of_land}%`}
                  className="transition-all duration-300"
                ></div>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#6b736c]">
              {optimization.allocations.map((a) => (
                <div key={a.crop_id} className="flex items-center space-x-1.5">
                  <span
                    className="w-2 h-2 rounded-xs"
                    style={{ backgroundColor: CROP_THEMES[a.crop_id]?.text || '#1b4324' }}
                  ></span>
                  <span className="font-medium text-[#1a1e1b]">{a.crop_name}</span>
                  <span className="text-[#757d74]">({a.percentage_of_land}%)</span>
                </div>
              ))}
            </div>
          </div>

          {/* Clean Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#e5e8e1] text-[#6b736c] font-semibold">
                  <th className="py-2.5 px-3">Crop</th>
                  <th className="py-2.5 px-2">Allocated Land</th>
                  <th className="py-2.5 px-2">Land %</th>
                  <th className="py-2.5 px-2">Water (m³)</th>
                  <th className="py-2.5 px-2">Fertilizer (kg)</th>
                  <th className="py-2.5 px-2">Expected Yield</th>
                  <th className="py-2.5 px-2">Cultivation Cost</th>
                  <th className="py-2.5 px-3 text-right">Net Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f2ed]">
                {optimization.allocations.map((alloc) => (
                  <tr key={alloc.crop_id} className="hover:bg-[#fafbf9] transition-colors">
                    <td className="py-3 px-3 font-bold text-[#1a1e1b] flex items-center space-x-2">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: CROP_THEMES[alloc.crop_id]?.text || '#1b4324' }}
                      ></span>
                      <span>{alloc.crop_name}</span>
                    </td>
                    <td className="py-3 px-2 font-semibold text-[#1a1e1b]">{alloc.allocated_ha} ha</td>
                    <td className="py-3 px-2 text-[#5c645d]">{alloc.percentage_of_land}%</td>
                    <td className="py-3 px-2 text-[#5c645d]">{alloc.water_used_m3.toLocaleString()}</td>
                    <td className="py-3 px-2 text-[#5c645d]">{alloc.fertilizer_used_kg.toLocaleString()}</td>
                    <td className="py-3 px-2 font-medium text-[#1a1e1b]">{alloc.predicted_yield_tons} T</td>
                    <td className="py-3 px-2 text-[#5c645d]">${alloc.cultivation_cost.toLocaleString()}</td>
                    <td className="py-3 px-3 text-right font-bold text-[#1b4324]">
                      ${alloc.expected_profit.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-[#e5e8e1] bg-[#fbfbf9] font-bold text-[#1a1e1b]">
                  <td className="py-3 px-3">Total Allocated</td>
                  <td className="py-3 px-2">{summary.used_land_ha} ha</td>
                  <td className="py-3 px-2">{summary.land_utilization_pct}%</td>
                  <td className="py-3 px-2">{summary.used_water_m3.toLocaleString()}</td>
                  <td className="py-3 px-2">{summary.used_fert_kg.toLocaleString()}</td>
                  <td className="py-3 px-2">{summary.expected_production_tons} T</td>
                  <td className="py-3 px-2">${summary.total_cost.toLocaleString()}</td>
                  <td className="py-3 px-3 text-right text-base text-[#1b4324]">
                    ${summary.total_profit.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Save Plan Modal */}
      {saveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 space-y-4 shadow-xl border border-[#e5e8e1]">
            <h3 className="font-bold text-[#1a1e1b] text-sm">Save Farm Plan</h3>
            <p className="text-xs text-[#6b736c]">Archive this mathematically optimized resource allocation.</p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#1a1e1b] mb-1">Plan Name</label>
                <input
                  type="text"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  className="w-full px-3 py-2 border border-[#dce0d8] rounded-lg focus:ring-1 focus:ring-[#1b4324] focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#1a1e1b] mb-1">Scenario Note (Optional)</label>
                <textarea
                  rows={2}
                  value={planNote}
                  onChange={(e) => setPlanNote(e.target.value)}
                  placeholder="e.g. Kharif baseline with balanced water preservation"
                  className="w-full px-3 py-2 border border-[#dce0d8] rounded-lg focus:ring-1 focus:ring-[#1b4324] focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setSaveModalOpen(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#5c645d] hover:bg-[#f2f4ef]"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-[#1b4324] hover:bg-[#163b20] text-white"
              >
                Save Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
