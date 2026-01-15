import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  params: {
    api_key: import.meta.env.VITE_API_KEY,
  },
});

api.interceptors.request.use(config => {
  const lang = localStorage.getItem('cineverse_lang') || 'en-US';
  config.params = config.params || {};
  config.params.language = lang;
  return config;
});

export default api;