const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/.netlify/functions/api'
  : 'http://localhost:9000/.netlify/functions/api';

export const apiClient = {
  async get(url) {
    const response = await fetch(`${API_BASE_URL}${url}`);
    return response.json();
  },

  async post(url, data) {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  }
};