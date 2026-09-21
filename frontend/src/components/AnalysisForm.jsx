import React, { useState } from 'react';
import { Send, AlertCircle, RefreshCw, Lightbulb } from 'lucide-react';

/**
 * Polished Analysis Form Component
 * Provides clean text input, character counter, sample text chips, validation error display, and loading states.
 */
export default function AnalysisForm({ onAnalyze, isLoading = false, apiError = '' }) {
  const [text, setText] = useState('');
  const [validationError, setValidationError] = useState('');

  const MAX_LENGTH = 1000;

  // Sample prompt chips for quick evaluation
  const samplePrompts = [
    { label: 'Happy Example', text: 'I am extremely happy with this amazing product!' },
    { label: 'Sad/Angry Example', text: 'I am very disappointed and angry about this broken service.' },
    { label: 'Neutral Example', text: 'The meeting is scheduled for tomorrow at 10 AM.' },
    { label: 'Surprise Example', text: 'I was completely shocked by the unexpected results!' },
  ];

  const handleChange = (e) => {
    const val = e.target.value;
    if (val.length <= MAX_LENGTH) {
      setText(val);
      if (validationError) setValidationError('');
    }
  };

  const handleSelectSample = (sampleText) => {
    setText(sampleText);
    if (validationError) setValidationError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanText = text.trim();

    if (!cleanText) {
      setValidationError('Please enter text to analyze. Empty or whitespace-only input is not allowed.');
      return;
    }

    if (cleanText.length > MAX_LENGTH) {
      setValidationError(`Text exceeds maximum allowed length of ${MAX_LENGTH} characters.`);
      return;
    }

    setValidationError('');
    if (onAnalyze) {
      onAnalyze(cleanText);
    }
  };

  const handleClear = () => {
    setText('');
    setValidationError('');
  };

  const charCount = text.length;
  const isWarning = charCount > 900;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 sm:p-6 transition-all">
      <div className="flex items-center justify-between mb-3">
        <label htmlFor="analysis-input" className="block text-sm font-bold text-slate-800">
          Enter Text for Sentiment & Emotion Analysis
        </label>
        <span
          aria-live="polite"
          className={`text-xs font-mono font-semibold px-2 py-0.5 rounded ${
            isWarning ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
          }`}
        >
          {charCount} / {MAX_LENGTH} chars
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <textarea
            id="analysis-input"
            aria-label="Text to analyze"
            value={text}
            onChange={handleChange}
            placeholder="Type or paste any text snippet here (e.g. user reviews, tweets, feedback, or essay sentences)..."
            rows={5}
            disabled={isLoading}
            className={`w-full p-3.5 text-sm text-slate-800 bg-slate-50/70 rounded-lg border focus:bg-white focus:outline-none focus:ring-2 transition-all resize-y min-h-[120px] ${
              validationError || apiError
                ? 'border-rose-400 focus:ring-rose-500'
                : 'border-slate-300 focus:ring-indigo-500 focus:border-indigo-500'
            }`}
          />
        </div>

        {/* Quick Sample Prompts */}
        <div className="space-y-1.5">
          <span className="flex items-center space-x-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            <Lightbulb className="w-3 h-3 text-amber-500" />
            <span>Quick Test Examples:</span>
          </span>
          <div className="flex flex-wrap gap-1.5">
            {samplePrompts.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectSample(p.text)}
                disabled={isLoading}
                className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 border border-slate-200 text-slate-700 text-xs font-medium rounded-md transition-colors disabled:opacity-50"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Validation or API Error Alert */}
        {(validationError || apiError) && (
          <div className="flex items-center space-x-2 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg animate-fadeIn" role="alert">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            <span>{validationError || apiError}</span>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={handleClear}
            disabled={isLoading || !text}
            className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Clear Text</span>
          </button>

          <button
            type="submit"
            disabled={isLoading || !text.trim()}
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Analyze Text</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
