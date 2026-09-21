import React from 'react';
import { Activity, History, BarChart2, Brain, Sparkles } from 'lucide-react';

/**
 * Enhanced Top Navigation Bar Component
 * Provides responsive, accessible tab navigation for the NLP Analyzer dashboard.
 */
export default function Navbar({ activeTab = 'analyzer', onTabChange }) {
  const navItems = [
    { id: 'analyzer', label: 'Analyzer', icon: Activity },
    { id: 'history', label: 'History', icon: History },
    { id: 'stats', label: 'Statistics', icon: BarChart2 },
  ];

  return (
    <header className="bg-slate-900 text-white shadow-lg border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Academic Title */}
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-tr from-indigo-600 to-indigo-500 rounded-xl text-white shadow-md shadow-indigo-500/20">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-100 tracking-tight">
                  Smart Sentiment & Emotion Analyzer
                </h1>
                <span className="hidden md:inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-950 text-indigo-300 border border-indigo-800/60">
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                  <span>PyTorch • Transformers</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block font-medium">
                Full-Stack AI/NLP Web Application
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex space-x-1 sm:space-x-2" role="tablist" aria-label="Main Navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`${item.id}-panel`}
                  onClick={() => onTabChange && onTabChange(item.id)}
                  className={`flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
