import React, { useState } from 'react';
import { MapPin, CloudSun, Save, Sparkles, Check } from 'lucide-react';
import { Farm } from '../types/index.ts';

interface FarmInputFormProps {
  currentFarm: Farm;
  onSaveFarm: (farmData: any) => Promise<void>;
  loading: boolean;
}

const PRESET_FARMS = [
  {
    name: 'GreenAcres Irrigated Holding',
    location: 'Central Agro-Zone 4',
    land_area_ha: 15.0,
    season: 'Kharif',
    soil: { soil_type: 'Loam', pH: 6.6, N: 140, P: 45, K: 55, organic_matter: 1.8 },
    resources: { water_m3: 85000, fertilizer_kg: 2200, budget_usd: 12000 },
    weather: { temperature: 28.5, rainfall: 720, humidity: 68 }
  },
  {
    name: 'Dryland Semi-Arid Basin',
    location: 'Rainfed Arid Belt',
    land_area_ha: 10.0,
    season: 'Rabi',
    soil: { soil_type: 'Sandy Loam', pH: 7.4, N: 85, P: 30, K: 40, organic_matter: 1.0 },
    resources: { water_m3: 25000, fertilizer_kg: 900, budget_usd: 5000 },
    weather: { temperature: 22.0, rainfall: 280, humidity: 45 }
  },
  {
    name: 'Black Soil Commercial Field',
    location: 'Plateau Cotton & Pulses Zone',
    land_area_ha: 20.0,
    season: 'Kharif',
    soil: { soil_type: 'Black Soil', pH: 7.2, N: 110, P: 35, K: 60, organic_matter: 1.5 },
    resources: { water_m3: 110000, fertilizer_kg: 2800, budget_usd: 18000 },
    weather: { temperature: 30.0, rainfall: 850, humidity: 72 }
  }
];

export const FarmInputForm: React.FC<FarmInputFormProps> = ({
  currentFarm,
  onSaveFarm,
  loading
}) => {
  const [formData, setFormData] = useState<Farm>(currentFarm);
  const [liveWeatherLoading, setLiveWeatherLoading] = useState<boolean>(false);
  const [weatherNotice, setWeatherNotice] = useState<string>('');
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  React.useEffect(() => {
    setFormData(currentFarm);
  }, [currentFarm]);

  const handleApplyPreset = (p: typeof PRESET_FARMS[0]) => {
    setFormData({
      ...formData,
      name: p.name,
      location: p.location,
      land_area_ha: p.land_area_ha,
      season: p.season as any,
      soil: { ...p.soil },
      resources: { ...p.resources },
      weather: { ...p.weather }
    });
  };

  const handleSimulateLiveWeather = () => {
    setLiveWeatherLoading(true);
    setTimeout(() => {
      const temp = Math.round((24 + Math.random() * 8) * 10) / 10;
      const rain = Math.round(500 + Math.random() * 300);
      const hum = Math.round(55 + Math.random() * 25);

      setFormData(prev => ({
        ...prev,
        weather: { temperature: temp, rainfall: rain, humidity: hum }
      }));
      setLiveWeatherLoading(false);
      setWeatherNotice(`Live meteorological data simulated for ${formData.location}: ${temp}°C, ${rain}mm, ${hum}% RH.`);
    }, 500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSaveFarm(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Top Banner with Presets */}
      <div className="bg-white rounded-xl border border-[#e5e8e1] p-5 shadow-xs">
        <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-[#1b4324]"></span>
              <h2 className="text-base font-bold text-[#1a1e1b]">Farm Holding & Environmental Parameters</h2>
            </div>
            <p className="text-xs text-[#6b736c] mt-0.5">
              Enter soil test metrics, resource availability, and climate profile to personalize AI recommendations and LP allocation.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-4 py-2 rounded-lg text-xs font-semibold bg-[#1b4324] hover:bg-[#163b20] text-white shadow-2xs transition-colors"
          >
            <Save className="h-3.5 w-3.5 mr-1.5" />
            <span>{loading ? 'Saving...' : 'Save & Re-run AI'}</span>
          </button>
        </div>

        {/* Benchmark Presets */}
        <div className="pt-3 border-t border-[#edf0ea]">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#636c64] block mb-2">
            Load Benchmark Holding Preset:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {PRESET_FARMS.map((p, idx) => (
              <button
                type="button"
                key={idx}
                onClick={() => handleApplyPreset(p)}
                className="text-left p-3 rounded-lg border border-[#e5e8e1] bg-[#fafbf9] hover:bg-[#f2f5f0] hover:border-[#1b4324] text-xs transition-colors"
              >
                <div className="font-bold text-[#1a1e1b]">{p.name}</div>
                <div className="text-[11px] text-[#6b736c] mt-0.5">
                  {p.land_area_ha} ha • {p.soil.soil_type} • ${p.resources.budget_usd.toLocaleString()} capital
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {savedSuccess && (
        <div className="bg-[#f0f5ee] border border-[#cde0cb] p-3 rounded-xl text-xs font-semibold text-[#1b4324] flex items-center space-x-2">
          <Check className="h-4 w-4 text-[#1b4324]" />
          <span>Farm data updated and AI optimization pipeline recalculated successfully.</span>
        </div>
      )}

      {/* 4-Step Form Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Farm Profile */}
        <div className="bg-white rounded-xl border border-[#e5e8e1] p-5 shadow-xs space-y-3.5">
          <div className="flex items-center space-x-2 pb-2 border-b border-[#edf0ea]">
            <span className="w-5 h-5 rounded-md bg-[#f2f5f1] text-[#1b4324] flex items-center justify-center text-xs font-bold border border-[#d6e3d3]">
              1
            </span>
            <h3 className="font-bold text-[#1a1e1b] text-sm">Farm Identity & Cultivation Season</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-[#3d453e] mb-1">Farm / Holding Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-[#dce0d8] rounded-lg focus:ring-1 focus:ring-[#1b4324] focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[#3d453e] mb-1">Geographic Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 border border-[#dce0d8] rounded-lg focus:ring-1 focus:ring-[#1b4324] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#3d453e] mb-1">Land Area (Hectares)</label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  required
                  value={formData.land_area_ha}
                  onChange={(e) => setFormData({ ...formData, land_area_ha: parseFloat(e.target.value) || 1 })}
                  className="w-full px-3 py-2 border border-[#dce0d8] rounded-lg focus:ring-1 focus:ring-[#1b4324] focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#3d453e] mb-1">Target Season</label>
              <select
                value={formData.season}
                onChange={(e) => setFormData({ ...formData, season: e.target.value as any })}
                className="w-full px-3 py-2 border border-[#dce0d8] rounded-lg focus:ring-1 focus:ring-[#1b4324] focus:outline-hidden cursor-pointer"
              >
                <option value="Kharif">Kharif (Monsoon: Rice, Cotton, Soybean, Millets)</option>
                <option value="Rabi">Rabi (Winter: Wheat, Chickpea, Mustard, Potato)</option>
                <option value="Zaid">Zaid (Summer: Pulses, Maize, Vegetables)</option>
              </select>
            </div>
          </div>
        </div>

        {/* 2. Soil Chemistry */}
        <div className="bg-white rounded-xl border border-[#e5e8e1] p-5 shadow-xs space-y-3.5">
          <div className="flex items-center space-x-2 pb-2 border-b border-[#edf0ea]">
            <span className="w-5 h-5 rounded-md bg-[#f2f5f1] text-[#1b4324] flex items-center justify-center text-xs font-bold border border-[#d6e3d3]">
              2
            </span>
            <h3 className="font-bold text-[#1a1e1b] text-sm">Soil Chemistry & Texture (Lab Analysis)</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[#3d453e] mb-1">Soil Texture Type</label>
                <select
                  value={formData.soil.soil_type}
                  onChange={(e) => setFormData({
                    ...formData,
                    soil: { ...formData.soil, soil_type: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-[#dce0d8] rounded-lg focus:ring-1 focus:ring-[#1b4324] focus:outline-hidden cursor-pointer"
                >
                  <option value="Loam">Loam (Balanced)</option>
                  <option value="Clay">Clay (Heavy / Retentive)</option>
                  <option value="Clay Loam">Clay Loam</option>
                  <option value="Sandy Loam">Sandy Loam (Well-Drained)</option>
                  <option value="Black Soil">Black Soil (Regur)</option>
                  <option value="Alluvial">Alluvial (River Basin)</option>
                  <option value="Red Soil">Red Soil</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#3d453e] mb-1">Soil Reaction (pH)</label>
                <input
                  type="number"
                  step="0.1"
                  min="4.0"
                  max="9.5"
                  value={formData.soil.pH}
                  onChange={(e) => setFormData({
                    ...formData,
                    soil: { ...formData.soil, pH: parseFloat(e.target.value) || 6.5 }
                  })}
                  className="w-full px-3 py-2 border border-[#dce0d8] rounded-lg focus:ring-1 focus:ring-[#1b4324] focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-[#3d453e] mb-1">Nitrogen (N) kg/ha</label>
                <input
                  type="number"
                  min="0"
                  value={formData.soil.N}
                  onChange={(e) => setFormData({
                    ...formData,
                    soil: { ...formData.soil, N: parseFloat(e.target.value) || 0 }
                  })}
                  className="w-full px-3 py-2 border border-[#dce0d8] rounded-lg focus:ring-1 focus:ring-[#1b4324] focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#3d453e] mb-1">Phosphorus (P) kg/ha</label>
                <input
                  type="number"
                  min="0"
                  value={formData.soil.P}
                  onChange={(e) => setFormData({
                    ...formData,
                    soil: { ...formData.soil, P: parseFloat(e.target.value) || 0 }
                  })}
                  className="w-full px-3 py-2 border border-[#dce0d8] rounded-lg focus:ring-1 focus:ring-[#1b4324] focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#3d453e] mb-1">Potassium (K) kg/ha</label>
                <input
                  type="number"
                  min="0"
                  value={formData.soil.K}
                  onChange={(e) => setFormData({
                    ...formData,
                    soil: { ...formData.soil, K: parseFloat(e.target.value) || 0 }
                  })}
                  className="w-full px-3 py-2 border border-[#dce0d8] rounded-lg focus:ring-1 focus:ring-[#1b4324] focus:outline-hidden"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 3. Available Resources */}
        <div className="bg-white rounded-xl border border-[#e5e8e1] p-5 shadow-xs space-y-3.5">
          <div className="flex items-center space-x-2 pb-2 border-b border-[#edf0ea]">
            <span className="w-5 h-5 rounded-md bg-[#f2f5f1] text-[#1b4324] flex items-center justify-center text-xs font-bold border border-[#d6e3d3]">
              3
            </span>
            <h3 className="font-bold text-[#1a1e1b] text-sm">Available Resource Caps</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-[#3d453e] mb-1">
                Available Water Reserve / Canal Allocation (m³)
              </label>
              <input
                type="number"
                step="1000"
                min="1000"
                required
                value={formData.resources.water_m3}
                onChange={(e) => setFormData({
                  ...formData,
                  resources: { ...formData.resources, water_m3: parseFloat(e.target.value) || 1000 }
                })}
                className="w-full px-3 py-2 border border-[#dce0d8] rounded-lg focus:ring-1 focus:ring-[#1b4324] focus:outline-hidden"
              />
              <span className="text-[11px] text-[#757d74] mt-0.5 block">
                Standard: ~4,000 to 11,000 m³ per hectare depending on crop.
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[#3d453e] mb-1">Fertilizer Reserve (kg)</label>
                <input
                  type="number"
                  step="50"
                  min="50"
                  required
                  value={formData.resources.fertilizer_kg}
                  onChange={(e) => setFormData({
                    ...formData,
                    resources: { ...formData.resources, fertilizer_kg: parseFloat(e.target.value) || 50 }
                  })}
                  className="w-full px-3 py-2 border border-[#dce0d8] rounded-lg focus:ring-1 focus:ring-[#1b4324] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#3d453e] mb-1">Working Capital Budget ($)</label>
                <input
                  type="number"
                  step="200"
                  min="200"
                  required
                  value={formData.resources.budget_usd}
                  onChange={(e) => setFormData({
                    ...formData,
                    resources: { ...formData.resources, budget_usd: parseFloat(e.target.value) || 200 }
                  })}
                  className="w-full px-3 py-2 border border-[#dce0d8] rounded-lg focus:ring-1 focus:ring-[#1b4324] focus:outline-hidden"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 4. Weather Profile */}
        <div className="bg-white rounded-xl border border-[#e5e8e1] p-5 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between pb-2 border-b border-[#edf0ea]">
            <div className="flex items-center space-x-2">
              <span className="w-5 h-5 rounded-md bg-[#f2f5f1] text-[#1b4324] flex items-center justify-center text-xs font-bold border border-[#d6e3d3]">
                4
              </span>
              <h3 className="font-bold text-[#1a1e1b] text-sm">Meteorology & Climate Profile</h3>
            </div>
            <button
              type="button"
              onClick={handleSimulateLiveWeather}
              disabled={liveWeatherLoading}
              className="text-[11px] font-semibold text-[#1b4324] hover:text-[#163b20] bg-[#f0f4ee] hover:bg-[#e4ebdf] px-2.5 py-1 rounded-md transition-colors flex items-center space-x-1"
            >
              <CloudSun className="h-3.5 w-3.5" />
              <span>{liveWeatherLoading ? 'Syncing...' : 'Simulate Live Weather'}</span>
            </button>
          </div>

          <div className="space-y-3 text-xs">
            {weatherNotice && (
              <div className="p-2.5 bg-[#f0f5ee] border border-[#cde0cb] rounded-lg text-[11px] text-[#1b4324]">
                {weatherNotice}
              </div>
            )}

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-[#3d453e] mb-1">Temperature (°C)</label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.weather.temperature}
                  onChange={(e) => setFormData({
                    ...formData,
                    weather: { ...formData.weather, temperature: parseFloat(e.target.value) || 25 }
                  })}
                  className="w-full px-3 py-2 border border-[#dce0d8] rounded-lg focus:ring-1 focus:ring-[#1b4324] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#3d453e] mb-1">Seasonal Rain (mm)</label>
                <input
                  type="number"
                  step="10"
                  value={formData.weather.rainfall}
                  onChange={(e) => setFormData({
                    ...formData,
                    weather: { ...formData.weather, rainfall: parseFloat(e.target.value) || 500 }
                  })}
                  className="w-full px-3 py-2 border border-[#dce0d8] rounded-lg focus:ring-1 focus:ring-[#1b4324] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#3d453e] mb-1">Relative Humidity (%)</label>
                <input
                  type="number"
                  min="10"
                  max="100"
                  value={formData.weather.humidity}
                  onChange={(e) => setFormData({
                    ...formData,
                    weather: { ...formData.weather, humidity: parseFloat(e.target.value) || 60 }
                  })}
                  className="w-full px-3 py-2 border border-[#dce0d8] rounded-lg focus:ring-1 focus:ring-[#1b4324] focus:outline-hidden"
                />
              </div>
            </div>
            <span className="text-[11px] text-[#757d74] block">
              Offline fallback active when live satellite stations are unreachable.
            </span>
          </div>
        </div>
      </div>
    </form>
  );
};
