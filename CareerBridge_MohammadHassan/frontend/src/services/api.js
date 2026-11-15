import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach JWT bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401 unauthenticated
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Only redirect if not already on login/register/home/forgot-password
      const p = window.location.pathname;
      if (
        !p.includes('/login') &&
        !p.includes('/register') &&
        !p.includes('/forgot-password') &&
        !p.includes('/reset-password') &&
        p !== '/'
      ) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ── Member 1: Core Platform & Auth API ────────────────────
export const authAPI = {
  login: (identifier, password) =>
    api.post('/api/auth/login', {
      email: identifier,
      username: identifier,
      identifier,
      password,
    }),

  register: (name, email, password, role = 'student') =>
    api.post('/api/auth/register', { name, email, password, role }),

  getProfile: () =>
    api.get('/api/auth/profile'),

  updateProfile: (data) =>
    api.put('/api/auth/profile', data),

  getStudents: () =>
    api.get('/api/auth/students'),

  getDashboardStats: () =>
    api.get('/api/auth/dashboard-stats'),

  forgotPassword: (email) =>
    api.post('/api/auth/forgot-password', { email }),

  resetPassword: (token, password, confirm_password) =>
    api.post('/api/auth/reset-password', { token, password, confirm_password }),
};

// ── Member 2: Internship API ──────────────────────────────
export const internshipAPI = {
  getAll: (params) => api.get('/api/internship/list', { params }),
  getById: (id) => api.get(`/api/internship/${id}`),
  apply: (data) => api.post('/api/internship/apply', data),
  getMyApplications: () => api.get('/api/internship/my-applications'),
  bookmark: (internship_id) => api.post('/api/internship/bookmark', { internship_id }),
  getBookmarks: () => api.get('/api/internship/my-bookmarks'),
};

// ── Member 3: Placement Preparation API ───────────────────
export const placementAPI = {
  getCategories: (params) => api.get('/api/placement/categories', { params }),
  getQuestions: (params) => api.get('/api/placement/questions', { params }),
  getMockTests: () => api.get('/api/placement/mock-tests'),
  getMockTestDetail: (testId) => api.get(`/api/placement/mock-tests/${testId}`),
  submitTest: (testId, data) => api.post(`/api/placement/mock-tests/${testId}/submit`, data),
  getMyResults: () => api.get('/api/placement/my-results'),
};

// ── Member 4: Skill Gap Analyzer API ──────────────────────
export const skillGapAPI = {
  getJobRoles: () => api.get('/api/skill-gap/roles'),
  getUserSkills: () => api.get('/api/skill-gap/user-skills'),
  addUserSkill: (data) => api.post('/api/skill-gap/user-skills', data),
  deleteUserSkill: (id) => api.delete(`/api/skill-gap/user-skills/${id}`),
  analyzeGap: (jobRoleId) => api.post('/api/skill-gap/analyze', { job_role_id: jobRoleId }),
  getResources: (skillName) => api.get(`/api/skill-gap/learning-resources?skill=${skillName || ''}`),
};

// ── Member 5: Skill Exchange API ──────────────────────────
export const skillExchangeAPI = {
  getListings: (params) => api.get('/api/skill-exchange/listings', { params }),
  createListing: (data) => api.post('/api/skill-exchange/listings', data),
  sendRequest: (data) => api.post('/api/skill-exchange/request', data),
  getMyRequests: () => api.get('/api/skill-exchange/my-requests'),
  updateRequestStatus: (requestId, status) => api.put(`/api/skill-exchange/requests/${requestId}/status`, { status }),
  submitReview: (data) => api.post('/api/skill-exchange/reviews', data),
  getUserReviews: (userId) => api.get(`/api/skill-exchange/reviews/${userId}`),
};

export default api;
