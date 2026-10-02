import React from 'react';
import { Bookmark, Trash2, ArrowRight, Calendar } from 'lucide-react';
import { SavedPlan } from '../types/index.ts';

interface SavedPlansViewProps {
  plans: SavedPlan[];
  onLoadPlan: (plan: SavedPlan) => void;
  onDeletePlan: (planId: string) => void;
  activePlanId?: string;
}

export const SavedPlansView: React.FC<SavedPlansViewProps> = ({
  plans,
  onLoadPlan,
  onDeletePlan,
  activePlanId
}) => {
  if (plans.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-[#e5e8e1] p-12 text-center space-y-3">
        <Bookmark className="h-8 w-8 text-[#868e83] mx-auto" />
        <h3 className="font-bold text-[#1a1e1b] text-base">No Saved Farm Plans Yet</h3>
        <p className="text-xs text-[#6b736c] max-w-sm mx-auto">
          Navigate to the LP Optimization tab and click &quot;Save Plan&quot; to archive optimal allocations for season-over-season comparison.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-[#e5e8e1] p-5 shadow-xs flex justify-between items-center">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#1b4324]"></span>
            <h2 className="text-base font-bold text-[#1a1e1b]">Saved Farm Plans & Optimization History</h2>
          </div>
          <p className="text-xs text-[#6b736c] mt-0.5">
            Archived mathematical allocations with preserved resource bounds and projected net margins.
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 bg-[#f4f6f2] text-[#3d453e] rounded-md border border-[#e0e3dd]">
          {plans.length} Saved Plans
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {plans.map((p) => {
          const isActive = activePlanId === p.id;
          const formattedDate = new Date(p.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          });

          return (
            <div
              key={p.id}
              className={`bg-white rounded-xl border p-5 shadow-xs flex flex-col justify-between transition-all ${
                isActive ? 'border-[#1b4324] ring-1 ring-[#1b4324]' : 'border-[#e5e8e1] hover:border-[#ccd1c6]'
              }`}
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-[#1a1e1b] text-sm leading-snug">{p.plan_name}</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-[#f0f4ee] text-[#1b4324] border border-[#d6e3d3]">
                    {p.strategy}
                  </span>
                </div>

                <div className="flex items-center space-x-1.5 text-[11px] text-[#757d74] mb-3">
                  <Calendar className="h-3 w-3" />
                  <span>{formattedDate} • {p.farm_name}</span>
                </div>

                {p.scenario_note && (
                  <div className="p-2.5 bg-[#fbfbf9] rounded-md border border-[#edf0ea] text-[11px] text-[#4a524b] mb-3 italic">
                    &quot;{p.scenario_note}&quot;
                  </div>
                )}

                {/* 4 KPIs */}
                <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-[#edf0ea]">
                  <div>
                    <span className="text-[#757d74] text-[10px] block">Net Profit</span>
                    <span className="font-extrabold text-[#1b4324]">${p.summary?.total_profit?.toLocaleString() || 0}</span>
                  </div>
                  <div>
                    <span className="text-[#757d74] text-[10px] block">Land</span>
                    <span className="font-semibold text-[#1a1e1b]">{p.summary?.used_land_ha || 0} ha</span>
                  </div>
                  <div>
                    <span className="text-[#757d74] text-[10px] block">Water</span>
                    <span className="font-semibold text-[#1a1e1b]">{p.summary?.used_water_m3?.toLocaleString() || 0} m³</span>
                  </div>
                  <div>
                    <span className="text-[#757d74] text-[10px] block">Harvest</span>
                    <span className="font-semibold text-[#1a1e1b]">{p.summary?.expected_production_tons || 0} Tons</span>
                  </div>
                </div>

                {/* Crop Allocations List */}
                <div className="mt-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#636c64] block mb-1">Crops:</span>
                  <div className="flex flex-wrap gap-1">
                    {p.allocations?.map((a) => (
                      <span key={a.crop_id} className="text-[11px] bg-[#f4f6f2] text-[#2d332e] px-2 py-0.5 rounded-sm font-medium border border-[#e2e6de]">
                        {a.crop_name} ({a.allocated_ha} ha)
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 mt-4 border-t border-[#edf0ea] flex justify-between items-center">
                <button
                  onClick={() => onDeletePlan(p.id)}
                  className="text-[#757d74] hover:text-[#b91c1c] p-1.5 rounded-lg transition-colors"
                  title="Delete saved plan"
                >
                  <Trash2 className="h-4 w-4" />
                </button>

                <button
                  onClick={() => onLoadPlan(p)}
                  className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#1b4324] hover:bg-[#163b20] text-white transition-colors"
                >
                  <span>Load Into Optimizer</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
