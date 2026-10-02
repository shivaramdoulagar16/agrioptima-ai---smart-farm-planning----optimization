import React from 'react';
import { Layers, Droplets, Compass } from 'lucide-react';
import { OptimizationResult } from '../types/index.ts';
import { CROP_THEMES } from '../utils/cropAssets.ts';

interface DigitalFarmMapProps {
  optimization: OptimizationResult | null;
  farmName: string;
  totalLand: number;
}

export const DigitalFarmMap: React.FC<DigitalFarmMapProps> = ({ optimization, farmName, totalLand }) => {
  if (!optimization || !optimization.feasible || optimization.allocations.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-[#e5e8e1] p-8 text-center">
        <Compass className="h-6 w-6 text-[#757d74] mx-auto mb-2" />
        <h4 className="font-semibold text-[#1a1e1b] text-sm">Digital Farm Map Idle</h4>
        <p className="text-xs text-[#6b736c] mt-0.5">Run resource optimization to generate architectural field parcels.</p>
      </div>
    );
  }

  const { allocations, summary } = optimization;
  const unallocatedHa = summary.unallocated_land_ha;

  return (
    <div className="bg-white rounded-xl border border-[#e5e8e1] p-5 shadow-xs">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#1b4324]"></span>
            <h3 className="font-bold text-[#1a1e1b] text-sm">Digital Farm • 2D Spatial Parcel Allocation</h3>
          </div>
          <p className="text-xs text-[#6b736c]">
            {farmName} — {summary.used_land_ha} ha active of {totalLand} ha total acreage
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs">
          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#f2f5f1] text-[#1b4324] border border-[#dbe3d8] font-medium text-[11px]">
            <Droplets className="h-3 w-3 mr-1 text-[#2d5f38]" />
            {summary.used_water_m3.toLocaleString()} m³ active canal flow
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#f6f7f4] text-[#4a524b] border border-[#e0e3dd] font-medium text-[11px]">
            {allocations.length} Active Field Parcels
          </span>
        </div>
      </div>

      {/* 2D Architectural Field Layout */}
      <div className="border border-[#dce0d8] rounded-xl p-3 bg-[#fafbf9] space-y-3">
        {/* Subtle Canal Header */}
        <div className="flex items-center justify-between px-3 py-1.5 bg-[#eef3ec] text-[#224828] rounded-lg text-xs border border-[#d6e2d3]">
          <div className="flex items-center space-x-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1b4324]"></span>
            <span className="font-medium text-[11px]">Drip & Canal Irrigation Network</span>
          </div>
          <span className="text-[11px] font-semibold text-[#1b4324]">{summary.water_utilization_pct}% Efficiency Index</span>
        </div>

        {/* Parcels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 min-h-[180px]">
          {allocations.map((alloc, idx) => {
            const theme = CROP_THEMES[alloc.crop_id] || {
              bg: '#f4f6f2',
              text: '#1b4324',
              border: '#dbe1d6',
              badge: 'bg-[#eef3ec] text-[#1b4324]'
            };

            // Grid column share based on acreage percentage
            const colSpan = Math.max(4, Math.min(12, Math.round((alloc.percentage_of_land / 100) * 12)));

            return (
              <div
                key={alloc.crop_id}
                style={{
                  gridColumn: `span ${colSpan} / span ${colSpan}`,
                  backgroundColor: theme.bg,
                  borderColor: theme.border
                }}
                className="rounded-lg border p-4 flex flex-col justify-between transition-all duration-200 hover:shadow-xs relative"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#636c64]">
                      FIELD {idx + 1}
                    </span>
                    <h4 className="font-extrabold text-base tracking-tight text-[#1a1e1b] mt-0.5" style={{ color: theme.text }}>
                      {alloc.crop_name}
                    </h4>
                    <span className="text-xs font-semibold text-[#3d453e] mt-0.5 block">
                      {alloc.allocated_ha} ha ({alloc.percentage_of_land}% of farm)
                    </span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border border-black/10 ${theme.badge}`}>
                    {alloc.predicted_yield_tons} T Yield
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-black/10 grid grid-cols-3 gap-2 text-[11px]">
                  <div>
                    <span className="text-[#636c64] block text-[10px]">Water:</span>
                    <span className="font-semibold text-[#1a1e1b]">{alloc.water_used_m3.toLocaleString()} m³</span>
                  </div>
                  <div>
                    <span className="text-[#636c64] block text-[10px]">Cost:</span>
                    <span className="font-semibold text-[#1a1e1b]">${alloc.cultivation_cost.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[#636c64] block text-[10px]">Net Profit:</span>
                    <span className="font-bold text-[#1b4324]">${alloc.expected_profit.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Fallow / Unallocated Reserve */}
          {unallocatedHa > 0.1 && (
            <div
              style={{
                gridColumn: `span ${Math.max(3, Math.min(12, Math.round((unallocatedHa / totalLand) * 12)))} / span 12`
              }}
              className="rounded-lg border border-dashed border-[#ccd1c7] bg-[#f2f4ef] p-4 flex flex-col justify-center items-center text-center text-xs"
            >
              <Layers className="h-4 w-4 text-[#868e83] mb-1" />
              <span className="font-semibold text-[#3d453e]">Fallow / Reserve</span>
              <span className="text-[#687066] text-[11px]">{unallocatedHa} ha ({Math.round((unallocatedHa / totalLand) * 100)}%)</span>
              <span className="text-[10px] text-[#868e83] mt-1">Conserving water reserves</span>
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-between mt-3 text-xs text-[#6b736c] gap-2 pt-2 border-t border-[#edf0ea]">
        <div className="flex items-center space-x-3">
          {allocations.map((a) => (
            <div key={a.crop_id} className="flex items-center space-x-1.5">
              <span
                className="w-2.5 h-2.5 rounded-sm"
                style={{ backgroundColor: CROP_THEMES[a.crop_id]?.text || '#1b4324' }}
              ></span>
              <span className="text-[11px] font-medium text-[#2d332e]">{a.crop_name}</span>
            </div>
          ))}
        </div>
        <span className="text-[11px] text-[#868e84]">
          Optimal multi-crop division mathematically guaranteed feasible
        </span>
      </div>
    </div>
  );
};
