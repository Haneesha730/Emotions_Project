import React from 'react';
import { History, ArrowRight, RefreshCw, AlertCircle, Trash2, CheckCircle2 } from 'lucide-react';

/**
 * Polished History Table Component
 * Displays SQLite analysis history records and provides Delete All History controls.
 */
export default function HistoryTable({
  history = [],
  isLoading = false,
  error = '',
  onRetry,
  onSelectRecord,
  onClearHistory,
  isDeleting = false,
  deleteMessage = '',
  deleteError = '',
}) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center text-slate-500 min-h-[240px] flex flex-col items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent mb-3" />
        <p className="text-sm font-semibold text-slate-700">Loading history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-rose-200 p-6 text-center">
        <div className="w-12 h-12 mx-auto mb-3 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center border border-rose-100">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-rose-800 mb-1">Unable to load analysis history</h3>
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

  const hasRecords = history && history.length > 0;

  return (
    <div className="space-y-4">
      {/* Delete Feedback Alerts */}
      {deleteMessage && (
        <div className="flex items-center space-x-2 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg animate-fadeIn" role="status">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span className="font-semibold">{deleteMessage}</span>
        </div>
      )}

      {deleteError && (
        <div className="flex items-center space-x-2 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg animate-fadeIn" role="alert">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span className="font-semibold">{deleteError}</span>
        </div>
      )}

      {/* Main Table Container */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header Controls */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <h3 className="text-base font-bold text-slate-800">Analysis History Log</h3>
            <p className="text-xs text-slate-500">
              {hasRecords
                ? `Showing ${history.length} record(s) directly from SQLite database (newest first)`
                : 'No analysis history records available'}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {onRetry && (
              <button
                onClick={onRetry}
                disabled={isDeleting}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh</span>
              </button>
            )}

            {/* Delete All History Button - Visible ONLY when history has records */}
            {hasRecords && onClearHistory && (
              <button
                onClick={onClearHistory}
                disabled={isDeleting}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                {isDeleting ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete All History</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Empty State or Table Content */}
        {!hasRecords ? (
          <div className="p-8 text-center text-slate-500 min-h-[200px] flex flex-col items-center justify-center">
            <div className="w-12 h-12 mb-3 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
              <History className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">No analyses yet</h3>
            <p className="text-xs text-slate-500 max-w-sm">
              No analysis history records exist in the database. Use the Analyzer tab to process text and record results.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 text-slate-700 uppercase font-bold tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Text Snippet</th>
                  <th className="px-4 py-3">Sentiment</th>
                  <th className="px-4 py-3">Emotion</th>
                  <th className="px-4 py-3">Sent. Conf.</th>
                  <th className="px-4 py-3">Emo. Conf.</th>
                  <th className="px-4 py-3">Date / Time</th>
                  {onSelectRecord && <th className="px-4 py-3 text-right">View</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium text-slate-700">
                {history.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">
                      #{record.id}
                    </td>
                    <td className="px-4 py-3 max-w-xs truncate" title={record.text}>
                      {record.text}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-bold ${
                          record.sentiment === 'Positive'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : record.sentiment === 'Negative'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : 'bg-slate-100 text-slate-800 border border-slate-200'
                        }`}
                      >
                        {record.sentiment}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block px-2.5 py-0.5 bg-indigo-50 text-indigo-700 rounded border border-indigo-200 text-[11px] font-bold">
                        {record.emotion}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono font-semibold">
                      {(record.sentiment_confidence * 100).toFixed(1)}%
                    </td>
                    <td className="px-4 py-3 font-mono font-semibold">
                      {(record.emotion_confidence * 100).toFixed(1)}%
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {record.created_at ? new Date(record.created_at).toLocaleString() : 'N/A'}
                    </td>
                    {onSelectRecord && (
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => onSelectRecord(record)}
                          className="inline-flex items-center space-x-1 px-2.5 py-1 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded-md font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400"
                          title="View Analysis Details"
                        >
                          <span>View</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
