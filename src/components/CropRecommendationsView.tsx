import React, { useState } from 'react';
import { Check, AlertCircle, Filter, RefreshCw, ChevronRight, Sliders, Droplets, DollarSign } from 'lucide-react';
import { CropRecommendation } from '../types/index.ts';
import { CROP_IMAGES } from '../utils/cropAssets.ts';

interface CropRecommendationsViewProps {
  recommendations: CropRecommendation[];
  loading: boolean;
  onRefresh: () => void;
}

export const CropRecommendationsView: React.FC<CropRecommendationsViewProps> = ({
  recommendations,
  loading,
  onRefresh
}) => {
  const [selectedCropId, setSelectedCropId] = useState<string | null>(
    recommendations.length > 0 ? recommendations[0].crop_id : null
  );
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [showTechnicalDetails, setShowTechnicalDetails] = useState<boolean>(false);

  const categories = ['All', ...Array.from(new Set(recommendations.map(r => r.category)))];

  const filtered = filterCategory === 'All'
    ? recommendations
    : recommendations.filter(r => r.category === filterCategory);

  const selectedCrop = recommendations.find(r => r.crop_id === (selectedCropId || recommendations[0]?.crop_id));

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-[#e5e8e1] p-5 shadow-xs flex flex-wrap justify-between items-center gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#1b4324]"></span>
            <h2 className="text-base font-bold text-[#1a1e1b]">AI Crop Suitability & Agronomic Recommendations</h2>
          </div>
          <p className="text-xs text-[#6b736c] mt-0.5">
            Ranked multi-class Random Forest evaluation integrating soil NPK, pH reaction, thermal window, and irrigation stress thresholds.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Filter */}
          <div className="flex items-center space-x-1.5 bg-[#f6f7f4] border border-[#e0e3dd] px-2.5 py-1.5 rounded-lg text-xs">
            <Filter className="h-3 w-3 text-[#6b736c]" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-transparent text-xs font-semibold text-[#1a1e1b] focus:outline-hidden cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c === 'All' ? 'All Crop Categories' : c}</option>
              ))}
            </select>
          </div>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={loading}
            className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#1b4324] hover:bg-[#163b20] text-white transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Evaluating...' : 'Recalculate AI'}</span>
          </button>
        </div>
      </div>

      {/* Selected Crop Deep-Dive: Horizontal "WHY DID AI RECOMMEND THIS?" Explainability */}
      {selectedCrop && (
        <div className="bg-white rounded-xl border border-[#e5e8e1] p-5 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#edf0ea]">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-lg overflow-hidden border border-[#e5e8e1] shrink-0 bg-[#f4f6f2]">
                <img
                  src={CROP_IMAGES[selectedCrop.crop_id] || CROP_IMAGES.wheat}
                  alt={selectedCrop.crop_name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-bold text-[#1a1e1b]">{selectedCrop.crop_name}</h3>
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#f0f4ee] text-[#1b4324] border border-[#d6e3d3]">
                    {selectedCrop.suitability_score}% Suitable
                  </span>
                </div>
                <p className="text-xs text-[#6b736c]">{selectedCrop.category} • {selectedCrop.duration_days} Days Duration</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-xs">
              <div className="text-right">
                <span className="text-[#6b736c] block text-[11px]">Expected Yield</span>
                <span className="text-sm font-bold text-[#1a1e1b]">{selectedCrop.predicted_yield_tons_ha} t/ha</span>
              </div>
              <div className="text-right">
                <span className="text-[#6b736c] block text-[11px]">Net Margin</span>
                <span className="text-sm font-extrabold text-[#1b4324]">${selectedCrop.net_profit_per_ha.toLocaleString()}/ha</span>
              </div>
            </div>
          </div>

          {/* Horizontal "WHY DID AI RECOMMEND THIS?" Section */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#4a524b] block">
              Why Did AI Recommend This?
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {/* Soil */}
              <div className="p-2.5 rounded-lg border border-[#e2e6de] bg-[#f9faf8] flex items-center space-x-2 text-xs">
                <span className="w-4 h-4 rounded-full bg-[#1b4324] text-white flex items-center justify-center text-[10px] shrink-0 font-bold">
                  ✓
                </span>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#687067] block">Soil</span>
                  <span className="font-semibold text-[#1a1e1b] text-[11px]">
                    {selectedCrop.technical_explanation.soil_match ? 'Good Match' : 'Compatible'}
                  </span>
                </div>
              </div>

              {/* Weather */}
              <div className="p-2.5 rounded-lg border border-[#e2e6de] bg-[#f9faf8] flex items-center space-x-2 text-xs">
                <span className="w-4 h-4 rounded-full bg-[#1b4324] text-white flex items-center justify-center text-[10px] shrink-0 font-bold">
                  ✓
                </span>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#687067] block">Weather</span>
                  <span className="font-semibold text-[#1a1e1b] text-[11px]">
                    {selectedCrop.technical_explanation.temp_score >= 70 ? 'Suitable' : 'Tolerable'}
                  </span>
                </div>
              </div>

              {/* Water */}
              <div className="p-2.5 rounded-lg border border-[#e2e6de] bg-[#f9faf8] flex items-center space-x-2 text-xs">
                <span className="w-4 h-4 rounded-full bg-[#1b4324] text-white flex items-center justify-center text-[10px] shrink-0 font-bold">
                  ✓
                </span>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#687067] block">Water</span>
                  <span className="font-semibold text-[#1a1e1b] text-[11px]">
                    {selectedCrop.resource_feasibility.water_feasible ? 'Feasible' : 'Tight Margin'}
                  </span>
                </div>
              </div>

              {/* Budget */}
              <div className="p-2.5 rounded-lg border border-[#e2e6de] bg-[#f9faf8] flex items-center space-x-2 text-xs">
                <span className="w-4 h-4 rounded-full bg-[#1b4324] text-white flex items-center justify-center text-[10px] shrink-0 font-bold">
                  ✓
                </span>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#687067] block">Budget</span>
                  <span className="font-semibold text-[#1a1e1b] text-[11px]">Within Limit</span>
                </div>
              </div>

              {/* Yield */}
              <div className="p-2.5 rounded-lg border border-[#dce3d8] bg-[#f2f6f1] flex items-center space-x-2 text-xs">
                <span className="w-4 h-4 rounded-full bg-[#1b4324] text-white flex items-center justify-center text-[10px] shrink-0 font-bold">
                  ↑
                </span>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#1b4324] block">Yield</span>
                  <span className="font-bold text-[#1b4324] text-[11px]">High Potential</span>
                </div>
              </div>
            </div>
          </div>

          {/* Farmer Summary & Toggle Technical Details */}
          <div className="bg-[#f8f9f6] p-3.5 rounded-lg border border-[#e5e8e1] flex flex-wrap justify-between items-center gap-2 text-xs">
            <p className="text-[#363e37] leading-relaxed max-w-3xl">
              <strong>Agronomic Guidance:</strong> {selectedCrop.farmer_explanation.summary}
            </p>
            <button
              onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
              className="text-xs font-semibold text-[#1b4324] hover:underline shrink-0"
            >
              {showTechnicalDetails ? 'Hide Technical Details' : 'Show Technical Details →'}
            </button>
          </div>

          {/* Collapsible Technical Details */}
          {showTechnicalDetails && (
            <div className="pt-3 border-t border-[#edf0ea] space-y-3 text-xs">
              <span className="font-bold text-[#1a1e1b] block text-[11px] uppercase tracking-wider">
                Technical Feature Importance & Sub-Indices
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-2.5 rounded-md border border-[#e0e3dc] bg-white">
                  <span className="text-[#6b736c] block text-[10px]">pH Compatibility:</span>
                  <span className="font-bold text-[#1a1e1b] text-sm">{selectedCrop.technical_explanation.ph_score}%</span>
                  <div className="w-full bg-[#edf0ea] rounded-full h-1 mt-1.5">
                    <div className="bg-[#1b4324] h-1 rounded-full" style={{ width: `${selectedCrop.technical_explanation.ph_score}%` }}></div>
                  </div>
                </div>

                <div className="p-2.5 rounded-md border border-[#e0e3dc] bg-white">
                  <span className="text-[#6b736c] block text-[10px]">Thermal Window:</span>
                  <span className="font-bold text-[#1a1e1b] text-sm">{selectedCrop.technical_explanation.temp_score}%</span>
                  <div className="w-full bg-[#edf0ea] rounded-full h-1 mt-1.5">
                    <div className="bg-[#1b4324] h-1 rounded-full" style={{ width: `${selectedCrop.technical_explanation.temp_score}%` }}></div>
                  </div>
                </div>

                <div className="p-2.5 rounded-md border border-[#e0e3dc] bg-white">
                  <span className="text-[#6b736c] block text-[10px]">Water Matching Index:</span>
                  <span className="font-bold text-[#1a1e1b] text-sm">{selectedCrop.technical_explanation.water_compatibility}%</span>
                  <div className="w-full bg-[#edf0ea] rounded-full h-1 mt-1.5">
                    <div className="bg-[#1b4324] h-1 rounded-full" style={{ width: `${selectedCrop.technical_explanation.water_compatibility}%` }}></div>
                  </div>
                </div>

                <div className="p-2.5 rounded-md border border-[#e0e3dc] bg-white">
                  <span className="text-[#6b736c] block text-[10px]">Nutrient Sufficiency (NPK):</span>
                  <span className="font-bold text-[#1a1e1b] text-sm">{selectedCrop.technical_explanation.nutrient_score}%</span>
                  <div className="w-full bg-[#edf0ea] rounded-full h-1 mt-1.5">
                    <div className="bg-[#1b4324] h-1 rounded-full" style={{ width: `${selectedCrop.technical_explanation.nutrient_score}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Grid of Clean White Crop Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((crop) => {
          const isSelected = selectedCrop?.crop_id === crop.crop_id;
          const imageSrc = CROP_IMAGES[crop.crop_id] || CROP_IMAGES.wheat;

          return (
            <div
              key={crop.crop_id}
              onClick={() => setSelectedCropId(crop.crop_id)}
              className={`bg-white rounded-xl border overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-xs flex flex-col justify-between ${
                isSelected
                  ? 'border-[#1b4324] ring-1 ring-[#1b4324]'
                  : 'border-[#e5e8e1] hover:border-[#ccd1c6]'
              }`}
            >
              <div>
                {/* Crop Photo Header */}
                <div className="h-32 w-full overflow-hidden relative bg-[#f2f4ef]">
                  <img
                    src={imageSrc}
                    alt={crop.crop_name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute top-2.5 right-2.5">
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-white/95 text-[#1b4324] shadow-xs backdrop-blur-xs border border-[#d6dfd3]">
                      {crop.suitability_score}% suitable
                    </span>
                  </div>
                  <div className="absolute bottom-2.5 left-2.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-black/60 text-white backdrop-blur-xs">
                      {crop.category}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-3">
                  <div>
                    <h4 className="font-extrabold text-[#1a1e1b] text-base leading-tight">
                      {crop.crop_name}
                    </h4>
                    <span className="text-[11px] text-[#6b736c]">{crop.duration_days} days crop cycle</span>
                  </div>

                  {/* Clean 4-Metric Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-[#edf0ea]">
                    <div>
                      <span className="text-[#757d74] text-[10px] block">Expected yield</span>
                      <span className="font-bold text-[#1a1e1b]">{crop.predicted_yield_tons_ha} t/ha</span>
                    </div>
                    <div>
                      <span className="text-[#757d74] text-[10px] block">Water need</span>
                      <span className="font-semibold text-[#1a1e1b]">
                        {crop.water_req_m3_ha < 4000 ? 'Low' : crop.water_req_m3_ha < 8000 ? 'Medium' : 'High'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#757d74] text-[10px] block">Estimated cost</span>
                      <span className="font-semibold text-[#1a1e1b]">${crop.cultivation_cost_per_ha}/ha</span>
                    </div>
                    <div>
                      <span className="text-[#757d74] text-[10px] block">Risk level</span>
                      <span className="font-semibold text-[#1a1e1b]">{crop.risk_level}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Link Footer */}
              <div className="p-4 pt-0">
                <button
                  type="button"
                  className={`w-full py-2 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1 transition-colors ${
                    isSelected
                      ? 'bg-[#1b4324] text-white'
                      : 'bg-[#f6f7f4] hover:bg-[#edf0ea] text-[#2d332e] border border-[#e0e3dd]'
                  }`}
                >
                  <span>{isSelected ? 'Active Selection' : 'View Analysis'}</span>
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
