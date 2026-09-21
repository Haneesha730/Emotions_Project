# Smart Sentiment & Emotion Analyzer

An AI-powered full-stack web application that analyzes text to identify sentiment and fine-grained emotions using Transformer-based Natural Language Processing (NLP) models.

---

## 1. Problem Statement

People generate vast amounts of textual data daily in the form of customer reviews, feedback forms, social media posts, and support tickets. Manually reading and understanding the sentiment and emotional tone of thousands of text submissions is time-consuming, prone to human bias, and inefficient.

The **Smart Sentiment & Emotion Analyzer** provides an automated, objective, and real-time solution to analyze input text, classify sentiment (Positive, Negative, Neutral), evaluate 7 core emotional distributions, extract key phrases, and present the results in an interactive visual dashboard.

> [!NOTE]
> This application is designed for textual sentiment and emotion analysis for web applications. It is not intended for medical or psychological diagnosis.

---

## 2. Project Objectives

- **Automated Text Analysis**: Accept user text inputs (up to 1,000 characters) and evaluate them in real time.
- **Sentiment Classification**: Identify **Positive**, **Negative**, or **Neutral** sentiment with calculated confidence percentages.
- **7-Emotion Detection**: Map text to core emotion categories (**Happy**, **Sad**, **Angry**, **Fear**, **Surprise**, **Disgust**, **Neutral**) with complete probability distributions.
- **Sentiment Score Comparison**: Display distinct **Positive** and **Negative** score probabilities.
- **Key Term Extraction**: Automatically extract up to 10 meaningful key terms using deterministic stop-word filtering and term-frequency scoring.
- **History Logging**: Automatically log every analysis into a local SQLite database for historical tracking.
- **Analytics Dashboard**: Calculate and display aggregate statistics across all past analyses directly from the database.
- **History Management**: Provide safe, user-confirmed clearing of stored analysis history.

---

## 3. Key Features

- 🧠 **Transformer-Based NLP**: Powered by Hugging Face `DistilBERT` and `DistilRoBERTa` open-source models running locally on CPU.
- 📊 **Sentiment & Emotion Visualization**: Visual progress bars, color-coded badges, and probability percentages for clear visual interpretation.
- 🏷️ **Extracted Key Phrases**: Automatic extraction of high-relevance key terms formatted as visual hashtag chips.
- 📜 **Analysis History Table**: Searchable, reverse-chronological log of past text analyses with single-record detail viewing.
- 📈 **Real-Time Statistics**: Live dynamic computation of total analyses, sentiment breakdowns, 7-emotion distributions, and average confidence levels.
- 🗑️ **Confirmed History Management**: One-click bulk clearing of database records guarded by explicit browser confirmation.
- ⚡ **Modern & Responsive UI**: Responsive React interface styled with Tailwind CSS, supporting mobile, tablet, laptop, and desktop viewports.
- 🔒 **Local Persistence**: Portable, zero-configuration SQLite database (`analyzer.db`) for persistent storage without external server setup.

---

## 4. System Architecture

```
User (Browser)
      │
      ▼
React Frontend (Vite + Tailwind CSS)
      │
      ▼ (HTTP / REST API via Axios)
FastAPI Backend (Uvicorn ASGI Server)
      │
      ├───────────────────────────────┐
      ▼                               ▼
Transformer NLP Engine         SQLite Database
(DistilBERT + DistilRoBERTa)   (backend/analyzer.db)
      │                               │
      └──────────────┬────────────────┘
                     ▼
          JSON Response Payload
                     │
                     ▼
           React Result Dashboard
```

---

## 5. Technology Stack

### Backend
- **Python 3.10+**: Core programming language.
- **FastAPI**: Modern, high-performance web framework for building REST APIs.
- **Uvicorn**: Lightning-fast ASGI web server implementation.
- **PyTorch (CPU)**: Open-source machine learning framework executing model inference on CPU.
- **Hugging Face Transformers**: Pipeline library managing pretrained neural network models.
- **SQLAlchemy**: Object-Relational Mapping (ORM) library for SQLite database interactions.
- **Pydantic v2**: Data validation and settings management enforcing strict API request/response schemas.
- **NumPy & scikit-learn**: Supporting libraries for array manipulation and numerical operations.

### Frontend
- **React 18**: Component-based JavaScript UI library.
- **Vite 5**: Next-generation frontend build tool and development server.
- **Tailwind CSS v3**: Utility-first CSS framework for responsive layout styling.
- **Axios**: Promise-based HTTP client for API requests.
- **Lucide React**: Clean, accessible icon suite.

---

## 6. AI & NLP Models

### Sentiment Analysis Model
- **Model Checkpoint**: `distilbert-base-uncased-finetuned-sst-2-english`
- **Model Type**: Pretrained Transformer model fine-tuned on the Stanford Sentiment Treebank (SST-2).
- **Native Classes**: `POSITIVE` and `NEGATIVE`.

> [!IMPORTANT]
> **Deterministic Neutral Sentiment Derivation Rule**:  
> The SST-2 model natively outputs probabilities for Positive ($p_{pos}$) and Negative ($p_{neg}$). Neutral sentiment is derived using a deterministic, explainable confidence-gap rule:
> 
> $$\Delta = |p_{pos} - p_{neg}|$$
> 
> 1. If $\Delta \le 0.30$ (neither Positive nor Negative is strongly dominant):
>    - **Sentiment** = `Neutral`
>    - **Sentiment Confidence** = $1.0 - \Delta$
> 2. If $\Delta > 0.30$:
>    - **Sentiment** = `Positive` if $p_{pos} > p_{neg}$, else `Negative`
>    - **Sentiment Confidence** = $\max(p_{pos}, p_{neg})$

### Emotion Detection Model
- **Model Checkpoint**: `j-hartmann/emotion-english-distilroberta-base`
- **Model Type**: Pretrained DistilRoBERTa Transformer fine-tuned for 7-class emotion classification.
- **Label Mapping**:
  - `joy` ➔ **Happy**
  - `sadness` ➔ **Sad**
  - `anger` ➔ **Angry**
  - `fear` ➔ **Fear**
  - `surprise` ➔ **Surprise**
  - `disgust` ➔ **Disgust**
  - `neutral` ➔ **Neutral**

---

## 7. Keyword Extraction Implementation

The keyword extraction engine uses a deterministic term-frequency (TF) approach paired with English stop-word filtering:
1. Converts input text to lowercase and strips punctuation and numbers.
2. Filters out standard English stop words (e.g., *the*, *is*, *at*, *which*, *for*) and short tokens ($< 3$ characters).
3. Ranks candidate words by term frequency weighted by word length factor ($1.0 + \frac{\text{len}}{20.0}$).
4. Extracts and returns up to the top 10 unique key terms.

---

## 8. Database Schema

- **Database Engine**: SQLite 3
- **Database File**: `backend/analyzer.db` (auto-created at runtime)
- **Table Name**: `analysis_history`

| Column | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER | Primary Key, Autoincrement | Unique analysis record ID |
| `text` | TEXT | Not Null | Raw input text analyzed |
| `sentiment` | VARCHAR(20) | Not Null, Indexed | Classified sentiment (`Positive`, `Negative`, `Neutral`) |
| `sentiment_confidence` | FLOAT | Not Null | Confidence score (0.0 to 1.0) |
| `positive_score` | FLOAT | Not Null | Positive probability score (0.0 to 1.0) |
| `negative_score` | FLOAT | Not Null | Negative probability score (0.0 to 1.0) |
| `emotion` | VARCHAR(20) | Not Null, Indexed | Primary predicted emotion (`Happy`, `Sad`, etc.) |
| `emotion_confidence` | FLOAT | Not Null | Primary emotion probability (0.0 to 1.0) |
| `emotion_scores` | TEXT | Not Null | JSON string of all 7 mapped emotion scores |
| `keywords` | TEXT | Not Null | JSON string array of extracted key terms |
| `word_count` | INTEGER | Not Null | Count of words in input text |
| `character_count` | INTEGER | Not Null | Count of characters in input text |
| `created_at` | DATETIME | Default `current_timestamp` | Timestamp of analysis creation |

---

## 9. API Endpoints

| Method | Endpoint | Purpose | Request Body / Query | Response Payload |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Service health check | None | `{ "status": "healthy", "service": str, "nlp_engine_ready": bool }` |
| `POST` | `/api/analyze` | Execute NLP analysis & save record | `{ "text": "string" }` | `AnalysisRecordResponse` JSON object |
| `GET` | `/api/history` | Fetch analysis history | `?limit=50` | List of `AnalysisRecordResponse` objects (newest first) |
| `GET` | `/api/history/{id}` | Fetch single record by ID | Path parameter `id` | `AnalysisRecordResponse` object (HTTP 404 if missing) |
| `DELETE` | `/api/history` | Clear all history rows | None | `{ "message": str, "deleted_count": int }` |
| `GET` | `/api/stats` | Compute aggregate statistics | None | `StatsResponse` JSON object |

---

## 10. Project Directory Structure

```
Emotions_Project/
├── backend/
│   ├── app/
│   │   ├── __init__.py         # Python package marker
│   │   ├── config.py           # Configuration & relative path resolution
│   │   ├── database.py         # SQLite connection & table creation
│   │   ├── main.py             # FastAPI app, CORS, routes & lifespan events
│   │   ├── models.py           # SQLAlchemy database model
│   │   ├── nlp_engine.py       # Real PyTorch transformer pipelines
│   │   ├── schemas.py          # Pydantic schemas & input validation
│   │   └── services.py         # Database CRUD & statistics business logic
│   ├── .env.example            # Backend environment template
│   ├── requirements.txt         # Python dependencies
│   ├── run_backend.py          # Backend entrypoint runner script
│   └── test_backend.py         # Backend automated test suite
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js       # Centralized Axios API client
│   │   ├── components/
│   │   │   ├── AnalysisForm.jsx # Input form & sample prompt chips
│   │   │   ├── HistoryTable.jsx # History log table & delete controls
│   │   │   ├── Navbar.jsx       # Header navigation bar
│   │   │   ├── ResultCard.jsx   # Result display & emotion bars
│   │   │   └── StatsDashboard.jsx # Analytics cards & distribution charts
│   │   ├── App.jsx             # Main layout & state coordinator
│   │   ├── index.css           # Tailwind directives & styles
│   │   └── main.jsx            # React DOM mounting entry point
│   ├── .env.example            # Frontend environment template
│   ├── index.html              # Main HTML entry document
│   ├── package.json            # Node.js dependencies & scripts
│   ├── postcss.config.js       # PostCSS plugin configuration
│   ├── tailwind.config.js      # Tailwind CSS configuration
│   └── vite.config.js          # Vite server & proxy configuration
├── .gitignore                  # Git exclusion rules
├── README.md                   # Project documentation
├── run_app.bat                 # One-click Windows launcher script
└── setup_env.bat               # Windows virtual environment setup script
```

---

## 11. Environment Variables

### Backend (`backend/.env.example`)
```ini
APP_NAME="Smart Sentiment & Emotion Analyzer"
APP_ENV="development"
HOST="127.0.0.1"
PORT=8000
DATABASE_URL="sqlite:///./analyzer.db"
MODEL_CACHE_DIR="./models_cache"
```

### Frontend (`frontend/.env.example`)
```ini
VITE_API_BASE_URL=http://localhost:8000
```

---

## 12. First-Run Model Download

On the very first application startup, the Hugging Face `transformers` library automatically downloads pretrained model weights from Hugging Face Hub:
- **DistilBERT Sentiment Model**: ~268 MB
- **DistilRoBERTa Emotion Model**: ~329 MB
- **Total Combined Download**: ~600 MB

> [!NOTE]
> Internet access is required **only for the first launch** to download weights. Models are saved in `backend/models_cache/`. All subsequent application launches load directly from local disk cache in 1–2 seconds with zero internet required.

---

## 13. Installation & Setup (Windows)

### Prerequisites
1. **Python 3.10 or higher**: Verify with `python --version`
2. **Node.js 18 or higher**: Verify with `node -v`

### Automatic Setup (Recommended)
1. Open Command Prompt or PowerShell in the root `Emotions_Project` folder.
2. Run the environment setup script:
   ```cmd
   setup_env.bat
   ```
   This creates `.venv`, installs PyTorch CPU + FastAPI dependencies, and installs Node modules.

### Manual Setup
```cmd
# 1. Create and activate Python virtual environment
python -m venv .venv
.venv\Scripts\activate

# 2. Install backend dependencies
pip install -r backend\requirements.txt

# 3. Install frontend dependencies
cd frontend
npm install
cd ..
```

---

## 14. Running the Application

### One-Click Launch (Recommended)
Double-click or run:
```cmd
run_app.bat
```

### Manual Launch

**Terminal 1 (Backend)**:
```cmd
.venv\Scripts\activate
python backend\run_backend.py
```
*Backend runs at:* `http://localhost:8000` (Swagger docs at `http://localhost:8000/docs`)

**Terminal 2 (Frontend)**:
```cmd
cd frontend
npm run dev
```
*Frontend runs at:* `http://localhost:3000`

---

## 15. Demonstrational Sample Inputs

- **Sample 1**: `"I am extremely happy with this amazing product!"`  
  *Expected*: Positive Sentiment, Happy Emotion
- **Sample 2**: `"I am very disappointed and angry about this broken service."`  
  *Expected*: Negative Sentiment, Angry/Sad Emotion
- **Sample 3**: `"The meeting is scheduled for tomorrow at 10 AM."`  
  *Expected*: Neutral Sentiment, Neutral Emotion

---

## 16. Technical Concept Viva Summary

- **React**: Modern component-based UI framework used to build interactive, state-driven user interfaces.
- **FastAPI**: Asynchronous Python web framework providing automatic data validation (via Pydantic) and OpenAPI documentation.
- **Transformers**: Deep learning architecture using self-attention mechanisms to process sequential text data effectively.
- **DistilBERT / DistilRoBERTa**: Light-weight, distilled versions of BERT/RoBERTa that preserve ~95%+ language accuracy while reducing model size and enabling fast CPU inference.
- **SQLite**: Zero-configuration, serverless, file-based relational database engine storing application records locally.
- **Axios**: HTTP client managing asynchronous promise-based REST API communication between client and server.
- **Tailwind CSS**: Utility-first CSS framework enabling clean responsive layout styling.

---

## 17. System Limitations

- **Input Length**: Text input is capped at 1,000 characters per analysis request.
- **Language Scope**: Pretrained models are fine-tuned primarily on English language corpora.
- **Deterministic Neutral Rule**: Neutral sentiment is derived via a confidence-gap threshold rather than a native three-class classifier.
- **Keyword Method**: Uses frequency-weighted stop-word filtering rather than deep contextual keyword extraction.
- **Database Scale**: SQLite is designed for single-user/local desktop execution rather than high-concurrency multi-tenant production systems.

---

## 18. Future Enhancements

- **Multilingual Support**: Integration of multilingual Transformer models (e.g. `xlm-roberta`).
- **Domain Fine-Tuning**: Custom fine-tuning on domain-specific datasets (e.g. medical, legal, or financial reviews).
- **User Authentication**: Secure multi-user login and personal history management.
- **Advanced NLP**: Aspect-based sentiment analysis (ABSA) and named entity recognition (NER).
- **Cloud Deployment**: Containerized deployment via Docker on cloud container platforms.

---

## 19. Troubleshooting Guide

| Issue | Cause | Resolution |
| :--- | :--- | :--- |
| **`ModuleNotFoundError: No module named 'fastapi'`** | Python virtual environment not activated. | Run `.venv\Scripts\activate` before launching backend scripts. |
| **`Unable to connect to analysis server`** | FastAPI backend is not running. | Verify backend terminal is active at `http://localhost:8000`. |
| **`WinError 10048 (Address already in use)`** | Port 8000 or 3000 is occupied by another process. | Close the conflicting process or change the port parameter in `config.py` / `vite.config.js`. |
| **Slow First Inference** | First-time Transformer model downloading. | Wait for initial model download to complete (~600 MB). Subsequent runs load instantly. |

---

## 20. Security & Privacy Disclosure

All text processing, transformer inference, and history database storage occur **entirely locally on your machine**. No text content is sent to third-party cloud APIs or external telemetry servers. SQLite data is stored locally in `backend/analyzer.db`.
