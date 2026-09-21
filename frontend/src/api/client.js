import axios from 'axios';

/**
 * Centralized Axios API Client
 * Configured via VITE_API_BASE_URL environment variable.
 * Default development URL: http://localhost:8000
 */
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000,
});

/**
 * Sends POST /api/analyze request to backend
 * @param {string} text - Cleaned text input
 * @returns {Promise<Object>} AnalysisRecordResponse JSON
 */
export const analyzeText = async (text) => {
  const response = await apiClient.post('/api/analyze', { text });
  return response.data;
};

/**
 * Fetches analysis history from backend
 * @param {number} limit - Maximum records to fetch (default 50)
 * @returns {Promise<Array>} List of AnalysisRecordResponse objects
 */
export const getHistory = async (limit = 50) => {
  const response = await apiClient.get('/api/history', { params: { limit } });
  return response.data;
};

/**
 * Fetches a single analysis record by ID
 * @param {number} id - Record ID
 * @returns {Promise<Object>} AnalysisRecordResponse JSON
 */
export const getHistoryById = async (id) => {
  const response = await apiClient.get(`/api/history/${id}`);
  return response.data;
};

/**
 * Clears all analysis records from SQLite
 * @returns {Promise<Object>} MessageResponse JSON { message, deleted_count }
 */
export const deleteHistory = async () => {
  const response = await apiClient.delete('/api/history');
  return response.data;
};

/**
 * Fetches aggregate analysis statistics from backend
 * @returns {Promise<Object>} StatsResponse JSON
 */
export const getStats = async () => {
  const response = await apiClient.get('/api/stats');
  return response.data;
};
