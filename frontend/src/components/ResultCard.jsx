import React from 'react';
import { Smile, Frown, Meh, Sparkles, Tag, Clock, FileText, Hash, Layers } from 'lucide-react';

/**
 * Polished Result Card Component
 * Renders sentiment classification, confidence scores, 7-emotion probability progress bars, and keyword badges.
 */
export default function ResultCard({ result }) {
  if (!result) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center text-slate-500 min-h-[340px] flex flex-col items-center justify-center">
        <div className="w-12 h-12 mb-3 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center border border-indigo-100">
          <Sparkles className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-800 mb-1">Your analysis result will appear here</h3>
        <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
          Type or select sample text on the left and click "Analyze Text" to evaluate real sentiment, 7-emotion probabilities, and keywords.
        </p>
      </div>
    );
  }

  // Extract properties safely from backend JSON response
  const {
    id = null,
    text = '',
    sentiment = 'Neutral',
    sentiment_confidence = 0,
    positive_score = 0,
    negative_score = 0,
    emotion = 'Neutral',
    emotion_confidence = 0,
    emotion_scores = {},
    keywords = [],
    word_count = 0,
    character_count = 0,
    created_at = null,
  } = result;

  // Accessible Sentiment Badge mapping with icon + color
  const getSentimentBadge = (sent) => {
    switch (String(sent).toLowerCase()) {
      case 'positive':
        return { bg: 'bg-emerald-100 text-emerald-800 border-emerald-300', icon: Smile, label: 'Positive Sentiment' };
      case 'negative':
        return { bg: 'bg-rose-100 text-rose-800 border-rose-300', icon: Frown, label: 'Negative Sentiment' };
      default:
        return { bg: 'bg-slate-100 text-slate-800 border-slate-300', icon: Meh, label: 'Neutral Sentiment' };
    }
  };

  // 7-Emotion bar color palette
  const getEmotionColor = (emoName) => {
    switch (String(emoName).toLowerCase()) {
      case 'happy': return { bar: 'bg-emerald-500', text: 'text-emerald-700' };
      case 'sad': return { bar: 'bg-sky-500', text: 'text-sky-700' };
      case 'angry': return { bar: 'bg-rose-500', text: 'text-rose-700' };
      case 'fear': return { bar: 'bg-purple-500', text: 'text-purple-700' };
      case 'surprise': return { bar: 'bg-amber-500', text: 'text-amber-700' };
      case 'disgust': return { bar: 'bg-lime-600', text: 'text-lime-700' };
      default: return { bar: 'bg-slate-400', text: 'text-slate-600' };
    }
  };

  const sentimentBadge = getSentimentBadge(sentiment);
  const SentimentIcon = sentimentBadge.icon;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 sm:p-6 space-y-6 animate-fadeIn">
      {/* Header Badges & Confidence Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-400 font-mono mb-1.5">
            <Hash className="w-3.5 h-3.5 text-slate-400" />
            <span>Analysis ID #{id || 'N/A'}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {/* Sentiment Badge */}
            <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold border ${sentimentBadge.bg}`}>
              <SentimentIcon className="w-4 h-4" />
              <span>{sentimentBadge.label}</span>
            </span>

            {/* Primary Emotion Badge */}
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Emotion: {emotion}</span>
            </span>
          </div>
        </div>

        {/* Confidence Summaries */}
        <div className="flex items-center space-x-4 text-xs font-medium text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
          <div className="text-right">
            <span className="block text-[10px] uppercase text-slate-400 font-bold">Sentiment Conf.</span>
            <span className="text-sm font-extrabold text-slate-900">
              {(sentiment_confidence * 100).toFixed(1)}%
            </span>
          </div>
          <div className="h-8 w-px bg-slate-200" />
          <div className="text-right">
            <span className="block text-[10px] uppercase text-slate-400 font-bold">Emotion Conf.</span>
            <span className="text-sm font-extrabold text-slate-900">
              {(emotion_confidence * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Input Text Box */}
      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
        <span className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
          Analyzed Text Content:
        </span>
        <p className="text-sm text-slate-800 italic leading-relaxed whitespace-pre-wrap">
          "{text}"
        </p>
        <div className="flex flex-wrap items-center space-x-3 mt-3 pt-2 border-t border-slate-200/60 text-[11px] text-slate-500 font-medium">
          <span className="inline-flex items-center space-x-1">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span>{word_count} words</span>
          </span>
          <span>•</span>
          <span>{character_count} characters</span>
          {created_at && (
            <>
              <span>•</span>
              <span className="inline-flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{new Date(created_at).toLocaleString()}</span>
              </span>
            </>
          )}
        </div>
      </div>

      {/* Grid: Sentiment Comparison & 7-Emotion Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sentiment Score Comparison */}
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center space-x-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            <span>Sentiment Scores</span>
          </h4>
          <div className="space-y-3.5">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span className="flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                  <span>Positive Score</span>
                </span>
                <span className="font-mono">{(positive_score * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${positive_score * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span className="flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                  <span>Negative Score</span>
                </span>
                <span className="font-mono">{(negative_score * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-rose-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${negative_score * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 7-Emotion Distribution Progress Bars */}
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>7-Emotion Distribution</span>
          </h4>
          <div className="space-y-2">
            {Object.keys(emotion_scores).length > 0 ? (
              Object.entries(emotion_scores).map(([emoName, score]) => {
                const scorePct = (Number(score || 0) * 100).toFixed(1);
                const colorInfo = getEmotionColor(emoName);
                return (
                  <div key={emoName}>
                    <div className="flex justify-between text-[11px] font-semibold text-slate-700 mb-0.5">
                      <span>{emoName}</span>
                      <span className="font-mono text-slate-500">{scorePct}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full ${colorInfo.bar} transition-all duration-300`}
                        style={{ width: `${scorePct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-400 italic">No emotion breakdown available.</p>
            )}
          </div>
        </div>
      </div>

      {/* Extracted Keywords Badges */}
      <div>
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
          <Tag className="w-3.5 h-3.5 text-indigo-600" />
          <span>Extracted Key Terms ({keywords.length})</span>
        </h4>
        {keywords && keywords.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {keywords.map((kw, i) => (
              <span
                key={i}
                className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-md border border-indigo-100 shadow-2xs"
              >
                #{kw}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">No keywords detected.</p>
        )}
      </div>
    </div>
  );
}
