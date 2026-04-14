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
    getMicrosoftAuthUrl: (role?: string) =>
      api.request(`/auth/microsoft/url${role ? `?role=${encodeURIComponent(role)}` : ''}`),

    microsoftCallback: (code: string, requestedRole?: string) =>
      api.request('/auth/microsoft/callback', {
        method: 'POST',
        body: JSON.stringify({ code, requestedRole }),
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
    get: () => api.request('/profile'),
    update: (data: { name?: string; department?: string }) =>
      api.request('/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    updatePreferences: (data: {
      emailDigest?: boolean;
      eventReminders?: boolean;
      attendanceUpdates?: boolean;
      shareProfile?: boolean;
      sessionLock?: boolean;
    }) =>
      api.request('/profile/preferences', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    getNotifications: () => api.request('/profile/notifications'),
  },

  // Event admin endpoints (for convenors/coordinators)
  eventsAdmin: {
    create: (data: any) =>
      api.request('/events', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    getMyEvents: () => api.request('/events/convenor/my-events'),

    getCoordinatorEvents: () => api.request('/events/coordinator/my-events'),

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

    updateEventStatus: (eventId: string, data: { status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'; isOpen?: boolean }) =>
      api.request(`/events/${eventId}/status`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
  },

  admin: {
    getEvents: (params?: { q?: string; status?: string; category?: string }) => {
      const q = new URLSearchParams();
      if (params?.q) q.set('q', params.q);
      if (params?.status) q.set('status', params.status);
      if (params?.category) q.set('category', params.category);
      const qs = q.toString();
      return api.request(`/admin/events${qs ? `?${qs}` : ''}`);
    },
    getUsers: (params?: { q?: string }) => {
      const q = new URLSearchParams();
      if (params?.q) q.set('q', params.q);
      const qs = q.toString();
      return api.request(`/admin/users${qs ? `?${qs}` : ''}`);
    },
    getDepartments: () => api.request('/admin/departments'),
    getAuditLogs: () => api.request('/admin/audit-logs'),
    getSystemSettings: () => api.request('/admin/system-settings'),
    updateSystemSettings: (data: {
      maintenanceMode: boolean;
      lockRegistrations: boolean;
      require2FA: boolean;
      defaultAttendancePolicy: 'strict' | 'normal';
    }) =>
      api.request('/admin/system-settings', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  },

  support: {
    createTicket: (data: { category: 'attendance' | 'registration' | 'account' | 'other'; subject: string; message: string }) =>
      api.request('/support/tickets', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getMyTickets: () => api.request('/support/tickets/me'),
  },

  club: {
    getProfile: () => api.request('/club/profile'),
    getMembers: (q?: string) => api.request(`/club/members${q ? `?q=${encodeURIComponent(q)}` : ''}`),
    importMembers: (rollNumbers: string[]) =>
      api.request('/club/members/import', {
        method: 'POST',
        body: JSON.stringify({ rollNumbers }),
      }),
    updateMember: (memberId: string, data: { status?: 'active' | 'pending'; action?: 'remove' }) =>
      api.request(`/club/members/${memberId}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
  },
};

