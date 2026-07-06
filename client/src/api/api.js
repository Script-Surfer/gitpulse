import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Attach JWT token to every request if available
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('gitpulse_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// -------- Auth --------
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');
export const changePassword = (data) => API.put('/auth/password', data);
export const saveGithubToken = (data) => API.put('/auth/github-token', data);

// -------- Repos --------
export const getRepoAnalytics = (owner, name) => API.get(`/repos/${owner}/${name}`);
export const refreshRepoAnalytics = (owner, name) => API.get(`/repos/${owner}/${name}/refresh`);

// -------- Saved Repos --------
export const getSavedRepos = () => API.get('/saved');
export const saveRepo = (cachedRepoId) => API.post('/saved', { cachedRepoId });
export const removeSavedRepo = (id) => API.delete(`/saved/${id}`);

// -------- Search History --------
export const getSearchHistory = () => API.get('/history');

export default API;
