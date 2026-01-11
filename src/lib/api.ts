const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const api = {
  async request(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem('token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMessage = 'Request failed';
      try {
        const error = await response.json();
        errorMessage = error.message || error.error || 'Request failed';
      } catch {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    return response.json();
  },

  // Auth endpoints
  auth: {
    login: (email: string, password: string) =>
      api.request('/auth/login/student', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),

    register: (data: {
      email: string;
      password: string;
      name: string;
      rollNumber: string;
      department?: string;
    }) =>
      api.request('/auth/register/student', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    getMe: () => api.request('/auth/me'),

    // Microsoft OAuth endpoints
    getMicrosoftAuthUrl: () => api.request('/auth/microsoft/url'),

    microsoftCallback: (code: string) =>
      api.request('/auth/microsoft/callback', {
        method: 'POST',
        body: JSON.stringify({ code }),
      }),
  },
};

