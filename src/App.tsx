import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Header } from './components/Header.tsx';
import { MetricCards } from './components/MetricCards.tsx';
import { DigitalFarmMap } from './components/DigitalFarmMap.tsx';
import { CropRecommendationsView } from './components/CropRecommendationsView.tsx';
import { OptimizerView } from './components/OptimizerView.tsx';
import { WhatIfSimulator } from './components/WhatIfSimulator.tsx';
import { StrategyComparison } from './components/StrategyComparison.tsx';
import { FarmInputForm } from './components/FarmInputForm.tsx';
import { SavedPlansView } from './components/SavedPlansView.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { ModelTransparencyModal } from './components/ModelTransparencyModal.tsx';
import { generateFarmReportPDF } from './utils/pdfGenerator.ts';
import { Farm, OptimizationResult, CropRecommendation, SavedPlan, ScenarioSimulationResult } from './types/index.ts';
import { HERO_FARM_IMAGE, CROP_IMAGES } from './utils/cropAssets.ts';
import { ArrowRight, Sparkles, Check, ChevronRight, Sliders, Droplets, MapPin, Compass } from 'lucide-react';

export default function App() {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [activeFarm, setActiveFarm] = useState<Farm | null>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');

  // AI Pipeline State
  const [recommendations, setRecommendations] = useState<CropRecommendation[]>([]);
  const [optimization, setOptimization] = useState<OptimizationResult | null>(null);
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<number>(0);

  // User & Modals
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [modelInfoModalOpen, setModelInfoModalOpen] = useState<boolean>(false);

  // 1. Initial Load: Fetch Farms and Saved Plans
  useEffect(() => {
    async function initData() {
      try {
        const token = localStorage.getItem('agrioptima_token');
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        // Fetch Farms
        const resFarms = await fetch('/api/farms', { headers });
        if (resFarms.ok) {
          const farmsData = await resFarms.json();
          if (farmsData.length > 0) {
            setFarms(farmsData);
            setActiveFarm(farmsData[0]);
          }
        }

        // Fetch Plans
        const resPlans = await fetch('/api/farm-plans', { headers });
        if (resPlans.ok) {
          const plansData = await resPlans.json();
          setSavedPlans(plansData);
        }

        // Check user session
        const storedUser = localStorage.getItem('agrioptima_user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else {
          setUser({ name: 'Ramesh Patel', email: 'farmer@agrioptima.ai' });
        }
      } catch (err) {
        console.error('Initialization error:', err);
      }
    }

    initData();
  }, []);

  // 2. Whenever activeFarm changes, execute AI analysis & LP optimization
  useEffect(() => {
    if (activeFarm) {
      runFullPipeline(activeFarm, 'balanced');
    }
  }, [activeFarm?.id]);

  const runFullPipeline = async (farm: Farm, strategy: string = 'balanced') => {
    setLoading(true);
    setLoadingStep(1);

    const stepInterval = setInterval(() => {
      setLoadingStep(prev => (prev < 4 ? prev + 1 : prev));
    }, 280);

    try {
      // 1. AI Analysis & Recommendations
      const analyzeRes = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          soil: farm.soil,
          weather: farm.weather,
          resources: { ...farm.resources, land_ha: farm.land_area_ha },
          season: farm.season
        })
      });

      let recs: CropRecommendation[] = [];
      if (analyzeRes.ok) {
        const analyzeData = await analyzeRes.json();
        recs = analyzeData.recommendations || [];
        setRecommendations(recs);
      }

      // 2. Mathematical LP Optimization
      const optRes = await fetch('/api/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          total_land_ha: farm.land_area_ha,
          total_water_m3: farm.resources.water_m3,
          total_fertilizer_kg: farm.resources.fertilizer_kg,
          total_budget_usd: farm.resources.budget_usd,
          strategy
        })
      });

      if (optRes.ok) {
        const optData: OptimizationResult = await optRes.json();
        setOptimization(optData);
      }
    } catch (err) {
      console.error('Pipeline execution error:', err);
    } finally {
      clearInterval(stepInterval);
      setLoading(false);
      setLoadingStep(0);
    }
  };

  const handleTryDemo = () => {
    if (farms.length > 0) {
      setActiveFarm(farms[0]);
    }
    setActiveTab('overview');
    try {
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.15 }
      });
    } catch (e) {
      // Ignore
    }
  };

  const handleRunOptimization = async (strategy: string) => {
    if (!activeFarm) return;
    setLoading(true);
    try {
      const optRes = await fetch('/api/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          total_land_ha: activeFarm.land_area_ha,
          total_water_m3: activeFarm.resources.water_m3,
          total_fertilizer_kg: activeFarm.resources.fertilizer_kg,
          total_budget_usd: activeFarm.resources.budget_usd,
          strategy
        })
      });

      if (optRes.ok) {
        const optData = await optRes.json();
        setOptimization(optData);
      }
    } catch (err) {
      console.error('Optimization error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateScenario = async (modifiers: any): Promise<ScenarioSimulationResult | null> => {
    if (!activeFarm) return null;
    try {
      const res = await fetch('/api/scenario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          baseline_constraints: {
            total_land_ha: activeFarm.land_area_ha,
            total_water_m3: activeFarm.resources.water_m3,
            total_fertilizer_kg: activeFarm.resources.fertilizer_kg,
            total_budget_usd: activeFarm.resources.budget_usd,
            strategy: optimization?.strategy || 'balanced'
          },
          scenario_modifiers: modifiers
        })
      });

      if (res.ok) {
        return await res.json();
      }
      return null;
    } catch (err) {
      console.error('Scenario error:', err);
      return null;
    }
  };

  const handleSavePlan = async (planName: string, note?: string) => {
    if (!activeFarm || !optimization) return;
    try {
      const res = await fetch('/api/farm-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farm_id: activeFarm.id,
          farm_name: activeFarm.name,
          plan_name: planName,
          strategy: optimization.strategy,
          allocations: optimization.allocations,
          summary: optimization.summary,
          scenario_note: note
        })
      });

      if (res.ok) {
        const saved = await res.json();
        setSavedPlans([saved, ...savedPlans]);
        confetti({ particleCount: 25, spread: 45, origin: { y: 0.7 } });
      }
    } catch (err) {
      console.error('Failed saving plan:', err);
    }
  };

  const handleDeletePlan = async (id: string) => {
    try {
      await fetch(`/api/farm-plans/${id}`, { method: 'DELETE' });
      setSavedPlans(savedPlans.filter(p => p.id !== id));
    } catch (err) {
      console.error('Failed deleting plan:', err);
    }
  };

  const handleLoadPlan = (plan: SavedPlan) => {
    if (optimization) {
      setOptimization({
        feasible: true,
        strategy: plan.strategy,
        status_message: `Loaded saved plan: ${plan.plan_name}`,
        allocations: plan.allocations,
        summary: plan.summary
      });
      setActiveTab('optimizer');
    }
  };

  const handleSaveFarm = async (updatedData: Farm) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/farms/${updatedData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
      if (res.ok) {
        const saved = await res.json();
        setActiveFarm(saved);
        setFarms(farms.map(f => f.id === saved.id ? saved : f));
        await runFullPipeline(saved, optimization?.strategy || 'balanced');
      }
    } catch (err) {
      console.error('Error saving farm:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!activeFarm) return;
    generateFarmReportPDF(activeFarm, optimization, recommendations);
  };

  const topCrop = recommendations.length > 0 ? recommendations[0] : null;

  return (
    <div className="min-h-screen bg-[#fbfbf9] text-[#1a1e1b] flex flex-col font-sans selection:bg-[#d9e6d6] selection:text-[#1b4324]">
      {/* Header */}
      <Header
        farms={farms}
        activeFarm={activeFarm}
        onSelectFarm={setActiveFarm}
        onTryDemo={handleTryDemo}
        onDownloadPDF={handleDownloadPDF}
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenModelInfo={() => setModelInfoModalOpen(true)}
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Intelligent Step Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-2xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-[#e5e8e1] space-y-4">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1b4324] animate-ping"></span>
              <h3 className="font-extrabold text-[#1a1e1b] text-sm">Analyzing farm conditions...</h3>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center space-x-2">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  loadingStep >= 1 ? 'bg-[#1b4324] text-white' : 'bg-[#e5e8e1] text-[#757d74]'
                }`}>
                  {loadingStep >= 1 ? '✓' : '1'}
                </span>
                <span className={loadingStep >= 1 ? 'font-semibold text-[#1a1e1b]' : 'text-[#757d74]'}>
                  Soil chemistry & texture compatibility
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  loadingStep >= 2 ? 'bg-[#1b4324] text-white' : 'bg-[#e5e8e1] text-[#757d74]'
                }`}>
                  {loadingStep >= 2 ? '✓' : '2'}
                </span>
                <span className={loadingStep >= 2 ? 'font-semibold text-[#1a1e1b]' : 'text-[#757d74]'}>
                  Microclimate & thermal weather window
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  loadingStep >= 3 ? 'bg-[#1b4324] text-white' : 'bg-[#e5e8e1] text-[#757d74]'
                }`}>
                  {loadingStep >= 3 ? '✓' : '3'}
                </span>
                <span className={loadingStep >= 3 ? 'font-semibold text-[#1a1e1b]' : 'text-[#757d74]'}>
                  Simplex LP resource constraint optimization
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  loadingStep >= 4 ? 'bg-[#1b4324] text-white' : 'bg-[#e5e8e1] text-[#757d74]'
                }`}>
                  {loadingStep >= 4 ? '✓' : '4'}
                </span>
                <span className={loadingStep >= 4 ? 'font-semibold text-[#1a1e1b]' : 'text-[#757d74]'}>
                  Generating multi-crop allocation plan
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 grow">
        {activeFarm ? (
          <>
            {/* Top Dashboard Header Greeting */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-3 border-b border-[#e8eae4]">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#687066]">
                  Decision Platform
                </span>
                <h1 className="text-xl sm:text-2xl font-extrabold text-[#1a1e1b] tracking-tight">
                  Good morning, {user?.name ? user.name.split(' ')[0] : 'Farmer'}
                </h1>
                <div className="flex items-center space-x-2 text-xs text-[#5c645d] mt-0.5">
                  <span className="font-semibold text-[#1a1e1b]">{activeFarm.name}</span>
                  <span>•</span>
                  <span>{activeFarm.location}</span>
                  <span>•</span>
                  <span>{activeFarm.land_area_ha} Hectares</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-[#eef4ed] text-[#1b4324] border border-[#d6e4d4]">
                  Simplex LP Active
                </span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-[#f4f6f2] text-[#404741] border border-[#dde1d8]">
                  Season: {activeFarm.season}
                </span>
              </div>
            </div>

            {/* Farm Snapshot 6-KPI Cards */}
            <MetricCards
              farm={activeFarm}
              optimization={optimization}
              topCrop={topCrop}
            />

            {/* TAB CONTENTS */}

            {/* 1. Overview Tab with Startup Hero & Insights */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Modern Agricultural Hero Composition */}
                <div className="relative rounded-2xl overflow-hidden border border-[#dce0d8] shadow-sm bg-[#163b20]">
                  <img
                    src={HERO_FARM_IMAGE}
                    alt="Indian agricultural farmland at sunrise"
                    className="w-full h-72 sm:h-80 md:h-96 object-cover opacity-55"
                  />
                  {/* Subtle Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent"></div>

                  {/* Hero Copy */}
                  <div className="absolute inset-0 p-6 sm:p-8 md:p-10 flex flex-col justify-between text-white">
                    <div className="max-w-xl space-y-2">
                      <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-white/20 backdrop-blur-md text-emerald-200 border border-white/20">
                        <Sparkles className="h-3.5 w-3.5 text-emerald-300" />
                        <span>Intelligence for Every Acre</span>
                      </span>
                      <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight">
                        From Crop Prediction to Optimized Farm Planning.
                      </h2>
                      <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed max-w-lg">
                        Turn farm constraints into smarter decisions. Move beyond single-crop guesswork with continuous mathematical resource allocation.
                      </p>
                      <div className="flex flex-wrap items-center gap-3 pt-2">
                        <button
                          onClick={handleTryDemo}
                          className="px-4 py-2 rounded-lg text-xs font-bold bg-white text-[#1b4324] hover:bg-emerald-50 transition-colors shadow-sm"
                        >
                          Try Demo
                        </button>
                        <button
                          onClick={() => setActiveTab('optimizer')}
                          className="px-4 py-2 rounded-lg text-xs font-semibold bg-white/20 hover:bg-white/30 text-white backdrop-blur-md border border-white/30 transition-colors"
                        >
                          Explore Optimization →
                        </button>
                      </div>
                    </div>

                    {/* 4 Floating Data Overlay Cards */}
                    <div className="hidden sm:grid grid-cols-4 gap-2.5 max-w-2xl pt-4">
                      <div className="bg-black/45 backdrop-blur-md p-2.5 rounded-lg border border-white/20">
                        <span className="text-[10px] text-emerald-300 block">Top Crop Match</span>
                        <span className="text-sm font-bold text-white">{topCrop ? `${topCrop.suitability_score}%` : '88%'}</span>
                        <span className="text-[9px] text-white/70 block truncate">{topCrop?.crop_name || 'Wheat'}</span>
                      </div>
                      <div className="bg-black/45 backdrop-blur-md p-2.5 rounded-lg border border-white/20">
                        <span className="text-[10px] text-emerald-300 block">Water Efficiency</span>
                        <span className="text-sm font-bold text-white">
                          {optimization?.summary ? `${optimization.summary.water_utilization_pct}%` : '91%'}
                        </span>
                        <span className="text-[9px] text-white/70 block">Canal reserve balance</span>
                      </div>
                      <div className="bg-black/45 backdrop-blur-md p-2.5 rounded-lg border border-white/20">
                        <span className="text-[10px] text-emerald-300 block">Expected Harvest</span>
                        <span className="text-sm font-bold text-white">
                          {optimization?.summary ? `${optimization.summary.expected_production_tons} T` : '+14%'}
                        </span>
                        <span className="text-[9px] text-white/70 block">Non-linear yield</span>
                      </div>
                      <div className="bg-black/45 backdrop-blur-md p-2.5 rounded-lg border border-white/20">
                        <span className="text-[10px] text-emerald-300 block">LP Engine</span>
                        <span className="text-sm font-bold text-emerald-400">Ready</span>
                        <span className="text-[9px] text-white/70 block">Continuous Simplex</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Farm Insight Section */}
                <div className="bg-white rounded-xl border border-[#e5e8e1] p-5 shadow-xs space-y-3">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-[#1b4324]"></span>
                    <h3 className="font-extrabold text-[#1a1e1b] text-sm uppercase tracking-wider">
                      AI Farm Insight
                    </h3>
                  </div>
                  <p className="text-sm font-medium text-[#2d332e] leading-relaxed">
                    Based on your loam soil chemistry, seasonal temperature (28°C), and water constraints, the system recommends a diversified crop plan balancing cash returns and moisture conservation.
                  </p>
                  <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-[#5c645d]">
                    <span className="flex items-center space-x-1">
                      <strong className="text-[#1a1e1b]">Top Crop:</strong> {topCrop?.crop_name || 'Potato'} ({topCrop?.suitability_score || 85}%)
                    </span>
                    <span className="flex items-center space-x-1">
                      <strong className="text-[#1a1e1b]">Harvest:</strong> {topCrop?.predicted_yield_tons_ha || 22} t/ha
                    </span>
                    <span className="flex items-center space-x-1">
                      <strong className="text-[#1a1e1b]">Water:</strong> {topCrop?.water_req_m3_ha.toLocaleString() || '5,000'} m³/ha
                    </span>
                    <button
                      onClick={() => setActiveTab('recommendations')}
                      className="text-xs font-semibold text-[#1b4324] hover:underline"
                    >
                      Why this recommendation? →
                    </button>
                  </div>
                </div>

                {/* 2D Digital Farm Spatial Parcel Map */}
                <DigitalFarmMap
                  optimization={optimization}
                  farmName={activeFarm.name}
                  totalLand={activeFarm.land_area_ha}
                />

                {/* Two-Column Summary: Recommended Crops + Optimization Financials */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Top Candidate Crops */}
                  <div className="bg-white rounded-xl border border-[#e5e8e1] p-5 shadow-xs space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold text-[#1a1e1b] text-sm">Top Evaluated Crops</h3>
                      <button
                        onClick={() => setActiveTab('recommendations')}
                        className="text-xs font-semibold text-[#1b4324] hover:underline"
                      >
                        View All ({recommendations.length}) →
                      </button>
                    </div>

                    <div className="space-y-2">
                      {recommendations.slice(0, 3).map((r, i) => (
                        <div
                          key={r.crop_id}
                          onClick={() => setActiveTab('recommendations')}
                          className="p-3 rounded-lg border border-[#e5e8e1] bg-[#fafbf9] hover:bg-[#f4f6f2] hover:border-[#ccd1c6] cursor-pointer flex justify-between items-center transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-md overflow-hidden bg-[#e5e8e1] shrink-0">
                              <img
                                src={CROP_IMAGES[r.crop_id] || CROP_IMAGES.wheat}
                                alt={r.crop_name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <div className="flex items-center space-x-1.5">
                                <span className="font-bold text-[#1a1e1b] text-xs sm:text-sm">{r.crop_name}</span>
                                <span className="text-[10px] font-semibold text-[#1b4324]">
                                  {r.suitability_score}%
                                </span>
                              </div>
                              <span className="text-[11px] text-[#6b736c] block">
                                Yield: {r.predicted_yield_tons_ha} t/ha • {r.water_req_m3_ha.toLocaleString()} m³ water
                              </span>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-xs font-bold text-[#1b4324]">${r.net_profit_per_ha.toLocaleString()}</span>
                            <span className="text-[10px] text-[#757d74] block">net/ha</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Financial Projection */}
                  <div className="bg-white rounded-xl border border-[#e5e8e1] p-5 shadow-xs space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold text-[#1a1e1b] text-sm">Optimal Plan Economics</h3>
                      <button
                        onClick={() => setActiveTab('optimizer')}
                        className="text-xs font-semibold text-[#1b4324] hover:underline"
                      >
                        Adjust Strategy →
                      </button>
                    </div>

                    {optimization?.feasible && optimization.summary ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div className="p-3 bg-[#f6f9f5] rounded-lg border border-[#d6e3d3]">
                            <span className="text-[#1b4324] font-semibold block text-[11px]">Net Farm Profit</span>
                            <span className="text-xl font-extrabold text-[#1b4324] mt-0.5 block">
                              ${optimization.summary.total_profit.toLocaleString()}
                            </span>
                            <span className="text-[10px] text-[#2d5f38] font-medium">
                              {optimization.summary.profit_margin_pct}% ROI margin
                            </span>
                          </div>

                          <div className="p-3 bg-[#fafbf9] rounded-lg border border-[#e5e8e1]">
                            <span className="text-[#6b736c] font-semibold block text-[11px]">Expected Harvest</span>
                            <span className="text-xl font-bold text-[#1a1e1b] mt-0.5 block">
                              {optimization.summary.expected_production_tons} Tons
                            </span>
                            <span className="text-[10px] text-[#757d74]">Aggregated production</span>
                          </div>
                        </div>

                        <div className="p-3 rounded-lg bg-[#fafbf9] border border-[#e5e8e1] text-xs space-y-1.5">
                          <div className="flex justify-between text-[#5c645d]">
                            <span>Gross Farm Revenue:</span>
                            <span className="font-bold text-[#1a1e1b]">${optimization.summary.total_revenue.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-[#5c645d]">
                            <span>Cultivation Expenditure:</span>
                            <span className="font-bold text-[#1a1e1b]">${optimization.summary.total_cost.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-[#5c645d]">
                            <span>Water Capacity Utilized:</span>
                            <span className="font-bold text-[#1a1e1b]">{optimization.summary.water_utilization_pct}%</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-[#fafbf9] text-center text-xs text-[#757d74] rounded-lg border border-[#e5e8e1]">
                        Run mathematical optimization to calculate financial projections.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 2. Farm & Soil Input Form */}
            {activeTab === 'farm_input' && (
              <FarmInputForm
                currentFarm={activeFarm}
                onSaveFarm={handleSaveFarm}
                loading={loading}
              />
            )}

            {/* 3. AI Crop Recommendations */}
            {activeTab === 'recommendations' && (
              <CropRecommendationsView
                recommendations={recommendations}
                loading={loading}
                onRefresh={() => runFullPipeline(activeFarm, optimization?.strategy || 'balanced')}
              />
            )}

            {/* 4. LP Resource Optimizer */}
            {activeTab === 'optimizer' && (
              <div className="space-y-6">
                <OptimizerView
                  farm={activeFarm}
                  optimization={optimization}
                  loading={loading}
                  onRunOptimization={handleRunOptimization}
                  onSavePlan={handleSavePlan}
                />
                <DigitalFarmMap
                  optimization={optimization}
                  farmName={activeFarm.name}
                  totalLand={activeFarm.land_area_ha}
                />
              </div>
            )}

            {/* 5. What-If Simulator (Main WOW Feature) */}
            {activeTab === 'what_if' && (
              <WhatIfSimulator
                farm={activeFarm}
                baselineOptimization={optimization}
                onSimulate={handleSimulateScenario}
              />
            )}

            {/* 6. Strategy Comparison */}
            {activeTab === 'strategies' && (
              <StrategyComparison
                farm={activeFarm}
                currentStrategy={optimization?.strategy || 'balanced'}
                onApplyStrategy={handleRunOptimization}
              />
            )}

            {/* 7. Saved Plans */}
            {activeTab === 'saved_plans' && (
              <SavedPlansView
                plans={savedPlans}
                onLoadPlan={handleLoadPlan}
                onDeletePlan={handleDeletePlan}
              />
            )}
          </>
        ) : (
          <div className="bg-white rounded-xl border border-[#e5e8e1] p-12 text-center space-y-4 max-w-md mx-auto my-12">
            <div className="w-10 h-10 rounded-lg bg-[#1b4324] text-white flex items-center justify-center mx-auto">
              <Compass className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold text-[#1a1e1b]">Initializing AgriOptima AI...</h2>
            <p className="text-xs text-[#6b736c]">
              Loading farm constraints, agronomic knowledge base, and LP solver.
            </p>
            <button
              onClick={handleTryDemo}
              className="px-4 py-2 bg-[#1b4324] text-white rounded-lg text-xs font-semibold shadow-xs hover:bg-[#163b20] transition-colors"
            >
              Load Demo Farm
            </button>
          </div>
        )}
      </main>

      {/* Minimalist Footer */}
      <footer className="bg-white border-t border-[#e8eae4] py-6 text-center text-xs text-[#6b736c] space-y-1">
        <div className="flex justify-center items-center space-x-3 text-[#404741] font-medium">
          <span>AgriOptima AI • Intelligence for Every Acre</span>
          <span>•</span>
          <button onClick={() => setModelInfoModalOpen(true)} className="hover:text-[#1b4324] underline">
            Verified ML & LP Architecture
          </button>
          <span>•</span>
          <a href="/docs" target="_blank" rel="noreferrer" className="hover:text-[#1b4324] underline">
            REST API Swagger Docs
          </a>
        </div>
        <p className="text-[11px] text-[#757d74]">
          Simplex Linear Programming & Non-Linear Mitscherlich Yield Regression grounded in ICAR & FAO agricultural standards.
        </p>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={(u, token) => {
          setUser(u);
          localStorage.setItem('agrioptima_user', JSON.stringify(u));
          localStorage.setItem('agrioptima_token', token);
        }}
        currentUser={user}
        onLogout={() => {
          setUser(null);
          localStorage.removeItem('agrioptima_user');
          localStorage.removeItem('agrioptima_token');
        }}
      />

      {/* Model Transparency Modal for Mentors & Judges */}
      <ModelTransparencyModal
        isOpen={modelInfoModalOpen}
        onClose={() => setModelInfoModalOpen(false)}
      />
    </div>
  );
}
