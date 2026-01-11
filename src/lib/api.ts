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

  // Event endpoints
  events: {
    getAll: (params?: { category?: string; status?: string; search?: string }) => {
      const queryParams = new URLSearchParams();
      if (params?.category) queryParams.append('category', params.category);
      if (params?.status) queryParams.append('status', params.status);
      if (params?.search) queryParams.append('search', params.search);
      const query = queryParams.toString();
      return api.request(`/events${query ? `?${query}` : ''}`);
    },

    getById: (eventId: string) => api.request(`/events/${eventId}`),

    register: (eventId: string) =>
      api.request(`/events/${eventId}/register`, {
        method: 'POST',
      }),

    cancelRegistration: (eventId: string) =>
      api.request(`/events/${eventId}/register`, {
        method: 'DELETE',
      }),

    getUserRegistrations: () => api.request('/events/user/registrations'),

    getUserAttendance: () => api.request('/events/user/attendance'),
  },

  // Profile endpoints
  profile: {
    update: (data: { name?: string; department?: string }) =>
      api.request('/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  },

  // Event admin endpoints (for convenors/coordinators)
  eventsAdmin: {
    create: (data: any) =>
      api.request('/events', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    getMyEvents: () => api.request('/events/convenor/my-events'),

    getEventRegistrations: (eventId: string) =>
      api.request(`/events/${eventId}/registrations`),

    markAttendance: (eventId: string, data: { rollNumber: string; status: 'present' | 'absent' }) =>
      api.request(`/events/${eventId}/attendance`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    searchStudent: (eventId: string, rollNumber: string) =>
      api.request(`/events/${eventId}/search-student/${rollNumber}`),

    scanAttendance: (eventId: string, rollNumber: string) =>
      api.request(`/events/${eventId}/scan-attendance`, {
        method: 'POST',
        body: JSON.stringify({ rollNumber }),
      }),

    getQRCode: (eventId: string) =>
      api.request(`/events/${eventId}/qr-code`),
  },
};

