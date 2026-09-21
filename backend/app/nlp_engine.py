"""
Real NLP Transformer Engine

Implements sentiment analysis (DistilBERT), 7-class emotion detection (DistilRoBERTa),
and keyword extraction (TF-IDF/stop-words) running on CPU with local disk caching.
"""
import os
import re
import math
from typing import Dict, List, Tuple
from pathlib import Path

from app.config import settings
from app.schemas import AnalysisResultData

# Set Hugging Face cache directory to project-relative models_cache folder
os.environ["HF_HOME"] = str(settings.model_cache_dir)
os.environ["TRANSFORMERS_CACHE"] = str(settings.model_cache_dir)

# Standard English stop words list for deterministic keyword extraction
ENGLISH_STOP_WORDS = {
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "aren't",
    "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but", "by", "can",
    "cannot", "could", "couldn't", "did", "didn't", "do", "does", "doesn't", "doing", "don't", "down", "during",
    "each", "few", "for", "from", "further", "had", "hadn't", "has", "hasn't", "have", "haven't", "having",
    "he", "he'd", "he'll", "he's", "her", "here", "here's", "hers", "herself", "him", "himself", "his", "how",
    "how's", "i", "i'd", "i'll", "i'm", "i've", "if", "in", "into", "is", "isn't", "it", "it's", "its", "itself",
    "let's", "me", "more", "most", "mustn't", "my", "myself", "no", "nor", "not", "of", "off", "on", "once",
    "only", "or", "other", "ought", "our", "ours", "ourselves", "out", "over", "own", "same", "shan't", "she",
    "she'd", "she'll", "she's", "should", "shouldn't", "so", "some", "such", "than", "that", "that's", "the",
    "their", "theirs", "them", "themselves", "then", "there", "there's", "these", "they", "they'd", "they'll",
    "they're", "they've", "this", "those", "through", "to", "too", "under", "until", "up", "very", "was",
    "wasn't", "we", "we'd", "we'll", "we're", "we've", "were", "weren't", "what", "what's", "when", "when's",
    "where", "where's", "which", "while", "who", "who's", "whom", "why", "why's", "with", "won't", "would",
    "wouldn't", "you", "you'd", "you'll", "you're", "you've", "your", "yours", "yourself", "yourselves",
    "will", "just", "should", "also", "get", "got", "can", "may", "must"
}


# Mapping for J-Hartmann DistilRoBERTa emotion model classes
EMOTION_LABEL_MAP: Dict[str, str] = {
    "joy": "Happy",
    "sadness": "Sad",
    "anger": "Angry",
    "fear": "Fear",
    "surprise": "Surprise",
    "disgust": "Disgust",
    "neutral": "Neutral"
}


class RealNLPEngine:
    """
    Real NLP Transformer Engine using Hugging Face pipelines for CPU inference.
    """
    def __init__(self):
        self._is_ready = False
        self._sentiment_pipeline = None
        self._emotion_pipeline = None
        self._init_error = None

    def initialize_models(self):
        """
        Loads the sentiment and emotion transformer models into memory on CPU.
        Uses cached models from backend/models_cache/ if available, or downloads them automatically.
        """
        if self._is_ready:
            return

        try:
            # Ensure model cache directory exists
            settings.model_cache_dir.mkdir(parents=True, exist_ok=True)

            from transformers import pipeline

            # Load Sentiment Analysis Pipeline (distilbert-base-uncased-finetuned-sst-2-english)
            # Forced device=-1 for CPU execution
            self._sentiment_pipeline = pipeline(
                "text-classification",
                model="distilbert-base-uncased-finetuned-sst-2-english",
                top_k=None,
                device=-1,
                model_kwargs={"cache_dir": str(settings.model_cache_dir)}
            )

            # Load Emotion Analysis Pipeline (j-hartmann/emotion-english-distilroberta-base)
            # Forced device=-1 for CPU execution
            self._emotion_pipeline = pipeline(
                "text-classification",
                model="j-hartmann/emotion-english-distilroberta-base",
                top_k=None,
                device=-1,
                model_kwargs={"cache_dir": str(settings.model_cache_dir)}
            )

            self._is_ready = True
            self._init_error = None
            print("[NLP Engine] Successfully initialized DistilBERT Sentiment and DistilRoBERTa Emotion models on CPU.")

        except Exception as e:
            self._is_ready = False
            self._init_error = str(e)
            print(f"[NLP Engine Error] Failed to load NLP transformer models: {e}")
            raise RuntimeError(f"Failed to load NLP models: {e}")

    def is_ready(self) -> bool:
        """Returns True if models are initialized and ready for inference."""
        return self._is_ready

    def _extract_keywords(self, text: str, max_keywords: int = 10) -> List[str]:
        """
        Deterministic TF-IDF & frequency-based keyword extraction.
        Removes punctuation, numbers, and common stop words.
        """
        # Tokenize words using regex (lowercase, alphabetic characters only, min length 3)
        words = re.findall(r'\b[a-zA-Z]{3,}\b', text.lower())
        
        # Filter out stop words
        filtered_words = [w for w in words if w not in ENGLISH_STOP_WORDS]
        
        if not filtered_words:
            return []

        # Calculate Term Frequency (TF)
        word_counts: Dict[str, int] = {}
        for word in filtered_words:
            word_counts[word] = word_counts.get(word, 0) + 1

        total_words = len(filtered_words)
        
        # Compute term score (TF weighted by word length for relevance)
        scores: List[Tuple[str, float]] = []
        for word, count in word_counts.items():
            tf = count / total_words
            # Boost score slightly for longer, specific words
            length_factor = 1.0 + (len(word) / 20.0)
            score = tf * length_factor
            scores.append((word, score))

        # Sort words by score descending
        scores.sort(key=lambda x: x[1], reverse=True)
        
        # Return top N unique keywords
        return [word for word, score in scores[:max_keywords]]

    def analyze(self, text: str) -> AnalysisResultData:
        """
        Executes real NLP inference on text input.
        """
        if not self._is_ready:
            # Auto-initialize models if not already loaded
            self.initialize_models()

        clean_text = text.strip()
        word_count = len(clean_text.split())
        character_count = len(clean_text)

        # ----------------------------------------------------
        # 1. SENTIMENT ANALYSIS (DistilBERT SST-2)
        # ----------------------------------------------------
        # Model outputs probabilities for 'POSITIVE' and 'NEGATIVE'
        raw_sentiment = self._sentiment_pipeline(clean_text)
        
        # Parse top_k scores list
        pos_score = 0.0
        neg_score = 0.0
        
        # Handle pipeline return structure (list of dicts)
        scores_list = raw_sentiment[0] if isinstance(raw_sentiment, list) and isinstance(raw_sentiment[0], list) else raw_sentiment
        for item in scores_list:
            lbl = item['label'].upper()
            if lbl == 'POSITIVE':
                pos_score = float(item['score'])
            elif lbl == 'NEGATIVE':
                neg_score = float(item['score'])

        # Deterministic Neutral Rule for SST-2:
        # SST-2 is binary (POSITIVE / NEGATIVE). To handle Neutral sentiment deterministically:
        # We calculate the delta between positive and negative confidence scores: delta = |pos_score - neg_score|.
        # If delta <= 0.30 (meaning neither POSITIVE nor NEGATIVE is strongly dominant),
        # the text is assigned 'Neutral' with confidence = 1.0 - delta.
        # Otherwise, the dominant class (Positive or Negative) is chosen with its actual score.
        delta = abs(pos_score - neg_score)
        if delta <= 0.30:
            sentiment = "Neutral"
            sentiment_confidence = round(1.0 - delta, 4)
        elif pos_score > neg_score:
            sentiment = "Positive"
            sentiment_confidence = round(pos_score, 4)
        else:
            sentiment = "Negative"
            sentiment_confidence = round(neg_score, 4)

        # ----------------------------------------------------
        # 2. EMOTION ANALYSIS (J-Hartmann DistilRoBERTa)
        # ----------------------------------------------------
        raw_emotions = self._emotion_pipeline(clean_text)
        emotion_scores_raw = raw_emotions[0] if isinstance(raw_emotions, list) and isinstance(raw_emotions[0], list) else raw_emotions
        
        mapped_emotion_scores: Dict[str, float] = {}
        top_emotion_raw = "neutral"
        top_emotion_score = 0.0

        for item in emotion_scores_raw:
            raw_label = item['label'].lower()
            score = float(item['score'])
            
            mapped_label = EMOTION_LABEL_MAP.get(raw_label, raw_label.capitalize())
            mapped_emotion_scores[mapped_label] = round(score, 4)
            
            if score > top_emotion_score:
                top_emotion_score = score
                top_emotion_raw = raw_label

        primary_emotion = EMOTION_LABEL_MAP.get(top_emotion_raw, top_emotion_raw.capitalize())
        emotion_confidence = round(top_emotion_score, 4)

        # ----------------------------------------------------
        # 3. KEYWORD EXTRACTION
        # ----------------------------------------------------
        keywords = self._extract_keywords(clean_text, max_keywords=10)

        return AnalysisResultData(
            sentiment=sentiment,
            sentiment_confidence=sentiment_confidence,
            positive_score=round(pos_score, 4),
            negative_score=round(neg_score, 4),
            emotion=primary_emotion,
            emotion_confidence=emotion_confidence,
            emotion_scores=mapped_emotion_scores,
            keywords=keywords,
            word_count=word_count,
            character_count=character_count
        )


# Singleton NLP Engine instance
nlp_engine = RealNLPEngine()
