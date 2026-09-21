import React from 'react';
import { BarChart2, TrendingUp, PieChart, Activity, AlertCircle, RefreshCw } from 'lucide-react';

/**
 * Polished Statistics Dashboard Component
 * Displays aggregate metrics computed directly by SQLite backend via GET /api/stats.
 */
export default function StatsDashboard({ stats, isLoading = false, error = '', onRetry }) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center text-slate-500 min-h-[240px] flex flex-col items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent mb-3" />
        <p className="text-sm font-semibold text-slate-700">Loading statistics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-rose-200 p-6 text-center">
        <div className="w-12 h-12 mx-auto mb-3 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center border border-rose-100">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-rose-800 mb-1">Unable to load statistics</h3>
        <p className="text-xs text-rose-600 mb-4">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Loading</span>
          </button>
        )}
      </div>
    );
  }

  if (!stats || stats.total_analyses === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center text-slate-500 min-h-[250px] flex flex-col items-center justify-center">
        <div className="w-12 h-12 mb-3 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
          <BarChart2 className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-800 mb-1">No analysis statistics available yet</h3>
        <p className="text-xs text-slate-500 max-w-sm">
          Database contains 0 records. Analyze text using the Analyzer tab to generate statistical analytics.
        </p>
      </div>
    );
  }

  const {
    total_analyses = 0,
    sentiment_counts = {},
    emotion_counts = {},
    average_sentiment_confidence = 0,
    average_emotion_confidence = 0,
  } = stats;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Analyses Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Analyses
            </span>
            <span className="text-2xl font-extrabold text-slate-900 mt-1 block">
              {total_analyses}
            </span>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        {/* Avg Sentiment Confidence */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
              Avg Sentiment Conf.
            </span>
            <span className="text-2xl font-extrabold text-slate-900 mt-1 block">
              {(average_sentiment_confidence * 100).toFixed(1)}%
            </span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Avg Emotion Confidence */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
              Avg Emotion Conf.
            </span>
            <span className="text-2xl font-extrabold text-slate-900 mt-1 block">
              {(average_emotion_confidence * 100).toFixed(1)}%
            </span>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl border border-purple-100">
            <PieChart className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Grid: Sentiment Breakdown & Emotion Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sentiment Counts */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Sentiment Breakdown
            </h4>
            {onRetry && (
              <button
                onClick={onRetry}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1"
                title="Refresh Statistics"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="space-y-3.5">
            {Object.entries(sentiment_counts).map(([sentiment, count]) => {
              const percentage = total_analyses > 0 ? ((count / total_analyses) * 100).toFixed(1) : 0;
              return (
                <div key={sentiment}>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>{sentiment}</span>
                    <span className="font-mono text-slate-600">{count} ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        sentiment === 'Positive'
                          ? 'bg-emerald-500'
                          : sentiment === 'Negative'
                          ? 'bg-rose-500'
                          : 'bg-slate-400'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 7-Emotion Distribution Counts */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">
            7-Emotion Distribution
          </h4>
          <div className="space-y-2.5">
            {Object.entries(emotion_counts).map(([emoName, count]) => {
              const percentage = total_analyses > 0 ? ((count / total_analyses) * 100).toFixed(1) : 0;
              return (
                <div key={emoName}>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>{emoName}</span>
                    <span className="font-mono text-slate-500">{count} ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
