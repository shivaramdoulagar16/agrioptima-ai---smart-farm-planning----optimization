import React from 'react';
import { Layers, Droplets, DollarSign, Award, TrendingUp, AlertCircle, ShieldCheck } from 'lucide-react';
import { Farm, OptimizationResult, CropRecommendation } from '../types/index.ts';

interface MetricCardsProps {
  farm: Farm;
  optimization: OptimizationResult | null;
  topCrop: CropRecommendation | null;
}

export const MetricCards: React.FC<MetricCardsProps> = ({ farm, optimization, topCrop }) => {
  const summary = optimization?.summary;

  const landUsed = summary ? summary.used_land_ha : 0;
  const landTotal = farm.land_area_ha;
  const landPct = summary ? summary.land_utilization_pct : 0;

  const waterUsed = summary ? summary.used_water_m3 : 0;
  const waterTotal = farm.resources.water_m3;
  const waterPct = summary ? summary.water_utilization_pct : 0;

  const budgetUsed = summary ? summary.used_budget_usd : 0;
  const budgetTotal = farm.resources.budget_usd;
  const budgetPct = summary ? summary.budget_utilization_pct : 0;

  const totalProfit = summary ? summary.total_profit : 0;
  const profitMargin = summary ? summary.profit_margin_pct : 0;
  const totalProduction = summary ? summary.expected_production_tons : 0;

  const riskLevel = summary ? summary.composite_risk : 'Low';
  const riskScore = summary ? summary.composite_risk_score : 0.25;

  return (
    <div className="space-y-2 mb-6">
      <div className="flex items-center justify-between text-xs text-[#6b736c] px-0.5">
        <span className="font-bold tracking-wider uppercase text-[11px] text-[#4a524b]">
          Farm Snapshot • Real-Time Allocation
        </span>
        <span className="text-[11px]">
          Target Season: <strong className="text-[#1a1e1b]">{farm.season}</strong>
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* 1. Land */}
        <div className="bg-white rounded-xl border border-[#e5e8e1] p-3.5 flex flex-col justify-between hover:border-[#cbd0c6] transition-colors">
          <div className="flex items-center justify-between text-[#6b736c] mb-1">
            <span className="text-[11px] font-semibold">Total Land</span>
            <Layers className="h-3.5 w-3.5 text-[#5c645d]" />
          </div>
          <div>
            <div className="text-xl font-bold tracking-tight text-[#1a1e1b]">
              {landUsed} <span className="text-xs font-normal text-[#757d74]">/ {landTotal} ha</span>
            </div>
            <div className="text-[11px] text-[#1b4324] font-medium mt-0.5">
              {landPct}% allocated
            </div>
          </div>
          <div className="w-full bg-[#f0f2ed] rounded-full h-1 mt-2.5">
            <div
              className="bg-[#1b4324] h-1 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, landPct)}%` }}
            ></div>
          </div>
        </div>

        {/* 2. Water */}
        <div className="bg-white rounded-xl border border-[#e5e8e1] p-3.5 flex flex-col justify-between hover:border-[#cbd0c6] transition-colors">
          <div className="flex items-center justify-between text-[#6b736c] mb-1">
            <span className="text-[11px] font-semibold">Water Reserve</span>
            <Droplets className="h-3.5 w-3.5 text-[#5c645d]" />
          </div>
          <div>
            <div className="text-xl font-bold tracking-tight text-[#1a1e1b]">
              {Math.round(waterUsed / 1000)}k <span className="text-xs font-normal text-[#757d74]">/ {Math.round(waterTotal / 1000)}k m³</span>
            </div>
            <div className="text-[11px] text-[#5c645d] font-medium mt-0.5">
              {waterPct}% utilized
            </div>
          </div>
          <div className="w-full bg-[#f0f2ed] rounded-full h-1 mt-2.5">
            <div
              className="bg-[#2d5f38] h-1 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, waterPct)}%` }}
            ></div>
          </div>
        </div>

        {/* 3. Budget */}
        <div className="bg-white rounded-xl border border-[#e5e8e1] p-3.5 flex flex-col justify-between hover:border-[#cbd0c6] transition-colors">
          <div className="flex items-center justify-between text-[#6b736c] mb-1">
            <span className="text-[11px] font-semibold">Working Capital</span>
            <DollarSign className="h-3.5 w-3.5 text-[#5c645d]" />
          </div>
          <div>
            <div className="text-xl font-bold tracking-tight text-[#1a1e1b]">
              ${Math.round(budgetUsed).toLocaleString()} <span className="text-xs font-normal text-[#757d74]">/ ${budgetTotal.toLocaleString()}</span>
            </div>
            <div className="text-[11px] text-[#5c645d] font-medium mt-0.5">
              {budgetPct}% deployed
            </div>
          </div>
          <div className="w-full bg-[#f0f2ed] rounded-full h-1 mt-2.5">
            <div
              className="bg-[#4a634e] h-1 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, budgetPct)}%` }}
            ></div>
          </div>
        </div>

        {/* 4. Expected Production */}
        <div className="bg-white rounded-xl border border-[#e5e8e1] p-3.5 flex flex-col justify-between hover:border-[#cbd0c6] transition-colors">
          <div className="flex items-center justify-between text-[#6b736c] mb-1">
            <span className="text-[11px] font-semibold">Harvest Yield</span>
            <TrendingUp className="h-3.5 w-3.5 text-[#5c645d]" />
          </div>
          <div>
            <div className="text-xl font-bold tracking-tight text-[#1a1e1b]">
              {totalProduction} <span className="text-xs font-normal text-[#757d74]">Tons</span>
            </div>
            <div className="text-[11px] text-[#5c645d] font-medium mt-0.5">
              ML Mitscherlich curve
            </div>
          </div>
          <div className="text-[10px] text-[#868e85] mt-2.5">Combined parcel yield</div>
        </div>

        {/* 5. Projected Net Profit */}
        <div className="bg-white rounded-xl border border-[#d8e2d4] p-3.5 flex flex-col justify-between hover:border-[#1b4324] transition-colors relative overflow-hidden">
          <div className="flex items-center justify-between text-[#1b4324] mb-1">
            <span className="text-[11px] font-bold">Net Farm Profit</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#1b4324]"></span>
          </div>
          <div>
            <div className="text-xl font-extrabold tracking-tight text-[#1b4324]">
              ${totalProfit.toLocaleString()}
            </div>
            <div className="text-[11px] text-[#2d5f38] font-semibold mt-0.5">
              {profitMargin}% ROI margin
            </div>
          </div>
          <div className="text-[10px] text-[#6b7d6e] mt-2.5">Revenue − cultivation costs</div>
        </div>

        {/* 6. Composite Risk */}
        <div className="bg-white rounded-xl border border-[#e5e8e1] p-3.5 flex flex-col justify-between hover:border-[#cbd0c6] transition-colors">
          <div className="flex items-center justify-between text-[#6b736c] mb-1">
            <span className="text-[11px] font-semibold">Composite Risk</span>
            {riskLevel === 'Low' ? (
              <ShieldCheck className="h-3.5 w-3.5 text-[#1b4324]" />
            ) : (
              <AlertCircle className="h-3.5 w-3.5 text-[#b45309]" />
            )}
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  riskLevel === 'Low' ? 'bg-[#1b4324]' : riskLevel === 'Medium' ? 'bg-[#d97706]' : 'bg-[#dc2626]'
                }`}
              ></span>
              <span className="text-lg font-bold tracking-tight text-[#1a1e1b]">{riskLevel}</span>
            </div>
            <div className="text-[11px] text-[#6b736c] font-medium mt-0.5">
              Index score: {riskScore}
            </div>
          </div>
          <div className="text-[10px] text-[#868e85] mt-2.5">Weather & volatility factor</div>
        </div>
      </div>
    </div>
  );
};
