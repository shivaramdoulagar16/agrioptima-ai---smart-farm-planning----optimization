import React from 'react';
import { Download, Sparkles, SlidersHorizontal, BookOpen, Layers, ChevronDown } from 'lucide-react';
import { Farm } from '../types/index.ts';

interface HeaderProps {
  farms: Farm[];
  activeFarm: Farm | null;
  onSelectFarm: (farm: Farm) => void;
  onTryDemo: () => void;
  onDownloadPDF: () => void;
  onOpenAuth: () => void;
  onOpenModelInfo: () => void;
  user: { name: string; email: string } | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  farms,
  activeFarm,
  onSelectFarm,
  onTryDemo,
  onDownloadPDF,
  onOpenAuth,
  onOpenModelInfo,
  user,
  activeTab,
  setActiveTab
}) => {
  return (
    <header className="bg-white border-b border-[#e8eae4] sticky top-0 z-40">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Brand Identity */}
          <div
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => setActiveTab('overview')}
          >
            {/* Minimal Agricultural + Data Geometry Logo */}
            <div className="w-9 h-9 rounded-lg bg-[#1b4324] flex items-center justify-center text-white shadow-xs group-hover:bg-[#163b20] transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="8" height="8" rx="1.5" />
                <rect x="13" y="3" width="8" height="8" rx="1.5" />
                <rect x="3" y="13" width="8" height="8" rx="1.5" />
                <path d="M17 13v8M13 17h8" />
              </svg>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-tight text-[#1a1e1b]">
                  AgriOptima<span className="text-[#1b4324]">.ai</span>
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-[#eef4ed] text-[#1b4324] rounded-md border border-[#d6e4d4]">
                  Decision Engine
                </span>
              </div>
              <p className="text-[11px] text-[#6b736c] font-medium tracking-normal hidden sm:block">
                Intelligence for Every Acre
              </p>
            </div>
          </div>

          {/* Center: Farm Selector */}
          {farms.length > 0 && (
            <div className="relative hidden md:block">
              <div className="flex items-center space-x-2 bg-[#f6f7f4] border border-[#e2e5df] rounded-lg px-3 py-1.5 hover:border-[#cbd0c7] transition-colors">
                <span className="w-2 h-2 rounded-full bg-[#1b4324]"></span>
                <span className="text-xs text-[#5c645d]">Farm:</span>
                <select
                  value={activeFarm?.id || ''}
                  onChange={(e) => {
                    const found = farms.find(f => f.id === e.target.value);
                    if (found) onSelectFarm(found);
                  }}
                  className="bg-transparent text-xs font-semibold text-[#1a1e1b] focus:outline-hidden cursor-pointer pr-1"
                >
                  {farms.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.land_area_ha} ha)
                    </option>
                  ))}
                </select>
                <ChevronDown className="h-3.5 w-3.5 text-[#737c73] pointer-events-none" />
              </div>
            </div>
          )}

          {/* Right: Actions & Tools */}
          <div className="flex items-center space-x-2 sm:space-x-2.5">
            {/* Try Demo */}
            <button
              onClick={onTryDemo}
              className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#1b4324] hover:bg-[#163b20] text-white shadow-2xs transition-all hover:shadow-xs active:scale-98"
              title="Load preloaded benchmark farm data"
            >
              <Sparkles className="h-3.5 w-3.5 mr-1.5 text-emerald-300" />
              <span>Try Demo</span>
            </button>

            {/* Download PDF */}
            <button
              onClick={onDownloadPDF}
              className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium text-[#2d332e] bg-[#f4f6f2] hover:bg-[#eaece7] border border-[#dce0d8] transition-colors"
              title="Download Farm Decision Report PDF"
            >
              <Download className="h-3.5 w-3.5 mr-1 text-[#5c645d]" />
              <span className="hidden sm:inline">Report PDF</span>
            </button>

            {/* Technical View for Judges / Mentors */}
            <button
              onClick={onOpenModelInfo}
              className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#404741] hover:text-[#1a1e1b] hover:bg-[#f2f4f0] border border-transparent hover:border-[#dde1d8] transition-colors"
              title="View Model Metrics, Architecture & Simplex Formulation"
            >
              <Layers className="h-3.5 w-3.5 mr-1 text-[#6b736c]" />
              <span className="hidden lg:inline">Technical View</span>
            </button>

            {/* API Docs Link */}
            <a
              href="/docs"
              target="_blank"
              rel="noreferrer"
              className="p-1.5 text-[#5c645d] hover:text-[#1a1e1b] rounded-lg hover:bg-[#f2f4f0] transition-colors hidden sm:block"
              title="Swagger REST API Docs"
            >
              <BookOpen className="h-4 w-4" />
            </a>

            {/* User Profile */}
            <button
              onClick={onOpenAuth}
              className="inline-flex items-center space-x-1.5 pl-2 pr-2.5 py-1 rounded-lg text-xs font-medium text-[#2d332e] hover:bg-[#f2f4f0] border border-[#e2e5df] transition-colors"
            >
              <div className="w-5 h-5 rounded-full bg-[#1b4324] text-white font-bold flex items-center justify-center text-[10px]">
                {user ? user.name.charAt(0) : 'F'}
              </div>
              <span className="hidden md:inline max-w-[90px] truncate">{user?.name || 'Farmer'}</span>
            </button>
          </div>
        </div>

        {/* Clean Minimalist Horizontal Tab Bar */}
        <nav className="flex space-x-1 border-t border-[#edf0ea] overflow-x-auto py-2 text-xs font-medium scrollbar-none">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'farm_input', label: 'Farm & Soil Data' },
            { id: 'recommendations', label: 'AI Crop Suitability' },
            { id: 'optimizer', label: 'LP Optimization' },
            { id: 'what_if', label: 'What-If Simulator' },
            { id: 'strategies', label: 'Strategy Comparison' },
            { id: 'saved_plans', label: 'Saved Plans' }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors text-xs ${
                  isActive
                    ? 'bg-[#1b4324] text-white font-semibold'
                    : 'text-[#505751] hover:text-[#1a1e1b] hover:bg-[#f2f4f0]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
