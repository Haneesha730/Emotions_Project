import React, { useState, useCallback } from 'react';
import Navbar from './components/Navbar';
import AnalysisForm from './components/AnalysisForm';
import ResultCard from './components/ResultCard';
import HistoryTable from './components/HistoryTable';
import StatsDashboard from './components/StatsDashboard';
import { analyzeText, getHistory, getHistoryById, getStats, deleteHistory } from './api/client';

/**
 * Main React Application Component
 * Coordinates Tab Navigation, API calls to FastAPI, and accessible UI layout.
 */
export default function App() {
  const [activeTab, setActiveTab] = useState('analyzer');

  // Analyzer state
  const [currentResult, setCurrentResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [apiError, setApiError] = useState('');

  // History state
  const [history, setHistory] = useState([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState('');

  // Delete history state
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState('');
  const [deleteError, setDeleteError] = useState('');

  // Statistics state
  const [stats, setStats] = useState(null);
  const [isStatsLoading, setIsStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState('');

  // Fetch history from GET /api/history
  const fetchHistoryData = useCallback(async () => {
    setIsHistoryLoading(true);
    setHistoryError('');
    try {
      const data = await getHistory(50);
      setHistory(data);
      setHistoryError('');
    } catch (err) {
      console.error('[History API Error]', err);
      setHistoryError('Unable to load analysis history. Please make sure the backend is running.');
    } finally {
      setIsHistoryLoading(false);
    }
  }, []);

  // Fetch stats from GET /api/stats
  const fetchStatsData = useCallback(async () => {
    setIsStatsLoading(true);
    setStatsError('');
    try {
      const data = await getStats();
      setStats(data);
      setStatsError('');
    } catch (err) {
      console.error('[Stats API Error]', err);
      setStatsError('Unable to load statistics. Please make sure the backend is running.');
    } finally {
      setIsStatsLoading(false);
    }
  }, []);

  // Tab switching handler
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setDeleteMessage('');
    setDeleteError('');
    if (tab === 'history') {
      fetchHistoryData();
    } else if (tab === 'stats') {
      fetchStatsData();
    }
  };

  // Real text analysis handler (POST /api/analyze)
  const handleAnalyze = async (text) => {
    setIsAnalyzing(true);
    setApiError('');

    try {
      const responseData = await analyzeText(text);
      setCurrentResult(responseData);
      setApiError('');
    } catch (err) {
      console.error('[Analyze API Error]', err);
      if (err.response && err.response.data && err.response.data.detail) {
        setApiError(err.response.data.detail);
      } else if (err.code === 'ERR_NETWORK' || !err.response) {
        setApiError('Unable to connect to the analysis server. Please make sure the FastAPI backend is running on http://localhost:8000.');
      } else {
        setApiError('Analysis request failed due to a server error. Please try again.');
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  // View individual record details via GET /api/history/{id}
  const handleSelectRecord = async (record) => {
    try {
      const fullRecord = await getHistoryById(record.id);
      setCurrentResult(fullRecord);
      setActiveTab('analyzer');
    } catch (err) {
      console.error('[Single Record GET Error]', err);
      setCurrentResult(record);
      setActiveTab('analyzer');
    }
  };

  // Delete history handler (DELETE /api/history with confirmation)
  const handleClearHistory = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete all analysis history? This action cannot be undone.'
    );

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    setDeleteMessage('');
    setDeleteError('');

    try {
      const res = await deleteHistory();
      const messageText = res.message || `Successfully cleared ${res.deleted_count || 0} analysis record(s).`;
      setDeleteMessage(messageText);
      setHistory([]);
      setDeleteError('');
    } catch (err) {
      console.error('[Delete History Error]', err);
      setDeleteError('Unable to delete analysis history. Please make sure the backend is running.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900 flex flex-col">
      {/* Navigation Header */}
      <Navbar activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Tab 1: Analyzer View */}
        {activeTab === 'analyzer' && (
          <div id="analyzer-panel" role="tabpanel" aria-labelledby="analyzer-tab" className="space-y-6">
            <div className="bg-slate-900 text-white rounded-xl p-5 sm:p-6 shadow-sm border border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900">
              <h2 className="text-xl sm:text-2xl font-bold mb-1 tracking-tight">Text Sentiment & Emotion Analysis</h2>
              <p className="text-xs sm:text-sm text-indigo-200/90 leading-relaxed">
                Enter text below to evaluate positive/negative sentiment, detect 7 core emotion probabilities, and extract key terms using local Hugging Face transformer models running on PyTorch.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              {/* Left Column: Input Form */}
              <AnalysisForm
                onAnalyze={handleAnalyze}
                isLoading={isAnalyzing}
                apiError={apiError}
              />

              {/* Right Column: Real Result Display */}
              <ResultCard result={currentResult} />
            </div>
          </div>
        )}

        {/* Tab 2: History View */}
        {activeTab === 'history' && (
          <div id="history-panel" role="tabpanel" aria-labelledby="history-tab" className="space-y-6">
            <HistoryTable
              history={history}
              isLoading={isHistoryLoading}
              error={historyError}
              onRetry={fetchHistoryData}
              onSelectRecord={handleSelectRecord}
              onClearHistory={handleClearHistory}
              isDeleting={isDeleting}
              deleteMessage={deleteMessage}
              deleteError={deleteError}
            />
          </div>
        )}

        {/* Tab 3: Statistics View */}
        {activeTab === 'stats' && (
          <div id="stats-panel" role="tabpanel" aria-labelledby="stats-tab" className="space-y-6">
            <StatsDashboard
              stats={stats}
              isLoading={isStatsLoading}
              error={statsError}
              onRetry={fetchStatsData}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500 font-medium">
        Smart Sentiment & Emotion Analyzer • Academic AI/NLP Full-Stack Web Application
      </footer>
    </div>
  );
}
