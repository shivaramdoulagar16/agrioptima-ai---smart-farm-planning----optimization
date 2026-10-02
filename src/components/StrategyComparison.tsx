import React, { useState, useEffect } from 'react';
import { Farm, OptimizationResult } from '../types/index.ts';

interface StrategyComparisonProps {
  farm: Farm;
  onApplyStrategy: (strategy: string) => void;
  currentStrategy: string;
}

interface StrategyEval {
  id: string;
  name: string;
  badge: string;
  desc: string;
  result: OptimizationResult | null;
  loading: boolean;
}

export const StrategyComparison: React.FC<StrategyComparisonProps> = ({
  farm,
  onApplyStrategy,
  currentStrategy
}) => {
  const [strategies, setStrategies] = useState<StrategyEval[]>([
    { id: 'balanced', name: 'Balanced', badge: 'Default', desc: 'Diversification & resource longevity', result: null, loading: true },
    { id: 'profit_focus', name: 'Profit Focus', badge: 'High ROI', desc: 'Maximum commercial cash return', result: null, loading: true },
    { id: 'water_saver', name: 'Water Saver', badge: 'Eco-Resilient', desc: 'Minimizes water intensity per $ earned', result: null, loading: true },
    { id: 'risk_aware', name: 'Risk Aware', badge: 'Defensive', desc: 'Domestic staples against market volatility', result: null, loading: true }
  ]);

  useEffect(() => {
    let isMounted = true;

    async function evaluateAll() {
      const updated = [...strategies];
      for (let i = 0; i < updated.length; i++) {
        try {
          const res = await fetch('/api/optimize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              total_land_ha: farm.land_area_ha,
              total_water_m3: farm.resources.water_m3,
              total_fertilizer_kg: farm.resources.fertilizer_kg,
              total_budget_usd: farm.resources.budget_usd,
              strategy: updated[i].id
            })
          });
          const data = await res.json();
          if (isMounted) {
            updated[i].result = data;
            updated[i].loading = false;
          }
        } catch (err) {
          console.error('Failed evaluating strategy:', err);
          if (isMounted) updated[i].loading = false;
        }
      }
      if (isMounted) setStrategies([...updated]);
    }

    evaluateAll();

    return () => {
      isMounted = false;
    };
  }, [farm]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-[#e5e8e1] p-5 shadow-xs">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-[#1b4324]"></span>
          <h2 className="text-base font-bold text-[#1a1e1b]">Strategy Comparison & Trade-Off Matrix</h2>
        </div>
        <p className="text-xs text-[#6b736c] mt-0.5">
          Evaluate how shifting agricultural objectives from pure profit to drought resilience alters farm economics and resource consumption.
        </p>
      </div>

      {/* Comparative Table */}
      <div className="bg-white rounded-xl border border-[#e5e8e1] p-5 shadow-xs overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse min-w-[720px]">
          <thead>
            <tr className="border-b border-[#e5e8e1] text-[#6b736c] font-semibold">
              <th className="py-2.5 px-3">Strategy</th>
              <th className="py-2.5 px-2">Land Area</th>
              <th className="py-2.5 px-2">Water Consumption</th>
              <th className="py-2.5 px-2">Working Capital</th>
              <th className="py-2.5 px-2">Expected Harvest</th>
              <th className="py-2.5 px-2">Projected Profit</th>
              <th className="py-2.5 px-2">Margin</th>
              <th className="py-2.5 px-2">Risk</th>
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f0f2ed]">
            {strategies.map((st) => {
              const summary = st.result?.summary;
              const isCurrent = currentStrategy === st.id;

              return (
                <tr key={st.id} className={`hover:bg-[#fafbf9] transition-colors ${isCurrent ? 'bg-[#f4f7f3]' : ''}`}>
                  <td className="py-3.5 px-3">
                    <div className="font-bold text-[#1a1e1b] flex items-center space-x-1.5">
                      <span>{st.name}</span>
                      {isCurrent && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] bg-[#1b4324] text-white font-semibold">
                          Active
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-[#757d74]">{st.desc}</span>
                  </td>

                  <td className="py-3.5 px-2 text-[#1a1e1b] font-medium">
                    {summary ? `${summary.used_land_ha} ha (${summary.land_utilization_pct}%)` : '...'}
                  </td>

                  <td className="py-3.5 px-2 text-[#3d453e]">
                    {summary ? `${summary.used_water_m3.toLocaleString()} m³ (${summary.water_utilization_pct}%)` : '...'}
                  </td>

                  <td className="py-3.5 px-2 text-[#3d453e]">
                    {summary ? `$${summary.used_budget_usd.toLocaleString()}` : '...'}
                  </td>

                  <td className="py-3.5 px-2 text-[#1a1e1b] font-medium">
                    {summary ? `${summary.expected_production_tons} Tons` : '...'}
                  </td>

                  <td className="py-3.5 px-2 font-bold text-[#1b4324] text-sm">
                    {summary ? `$${summary.total_profit.toLocaleString()}` : '...'}
                  </td>

                  <td className="py-3.5 px-2 text-[#5c645d]">
                    {summary ? `${summary.profit_margin_pct}%` : '...'}
                  </td>

                  <td className="py-3.5 px-2">
                    {summary ? (
                      <span className="text-[11px] font-semibold text-[#1a1e1b]">
                        {summary.composite_risk}
                      </span>
                    ) : (
                      '...'
                    )}
                  </td>

                  <td className="py-3.5 px-3 text-right">
                    <button
                      onClick={() => onApplyStrategy(st.id)}
                      disabled={isCurrent}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        isCurrent
                          ? 'bg-transparent text-[#757d74] border border-[#dce0d8] cursor-default'
                          : 'bg-[#1b4324] hover:bg-[#163b20] text-white shadow-2xs'
                      }`}
                    >
                      {isCurrent ? 'Current' : 'Select'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Decision Guidance Footer */}
      <div className="bg-[#fbfbf9] rounded-xl border border-[#e5e8e1] p-5 text-xs text-[#505751] space-y-2">
        <h4 className="font-bold text-[#1a1e1b] text-sm">Strategic Decision Guidance:</h4>
        <ul className="list-disc list-inside space-y-1 leading-relaxed">
          <li><strong>Balanced:</strong> Recommended default for sustainable agriculture; maintains multi-crop resilience and preserves aquifer buffers.</li>
          <li><strong>Profit Focus:</strong> Prioritizes top market cash yields within physical resource bounds; optimal when market prices are favorable.</li>
          <li><strong>Water Saver:</strong> Sacrifices minor revenue to reduce water consumption by up to 30%, prioritizing drought-tolerant pulses.</li>
          <li><strong>Risk Aware:</strong> Protects working capital by avoiding price-volatile vegetables and pest-susceptible cash varieties.</li>
        </ul>
      </div>
    </div>
  );
};
