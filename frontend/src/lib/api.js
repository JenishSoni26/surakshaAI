const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export async function apiFetch(endpoint, options = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('suraksha_token') : null;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Something went wrong');
  }

  return data;
}

export const api = {
  // Auth
  login: (email, password) => apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (name, email, password, phone) => apiFetch('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password, phone }) }),
  
  // Scans
  scanMessage: (text) => apiFetch('/scans/message', { method: 'POST', body: JSON.stringify({ text }) }),
  scanUPI: (upiId) => apiFetch('/scans/upi', { method: 'POST', body: JSON.stringify({ upiId }) }),
  scanQR: (url) => apiFetch('/scans/qr', { method: 'POST', body: JSON.stringify({ url }) }),
  scanVoice: () => apiFetch('/scans/voice', { method: 'POST', body: JSON.stringify({}) }),
  
  // Dashboard
  getStats: () => apiFetch('/dashboard/stats'),
  getLogs: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`/dashboard/logs?${query}`);
  },
  getCharts: () => apiFetch('/dashboard/charts'),
  
  // Learn
  getModules: (category) => apiFetch(`/learn/modules${category ? `?category=${category}` : ''}`),
  updateProgress: (moduleId, score) => apiFetch('/learn/progress', { method: 'POST', body: JSON.stringify({ moduleId, score }) }),
  
  // Emergency
  getContacts: () => apiFetch('/emergency/contacts'),
  freezeAccount: (accountType, reason) => apiFetch('/emergency/freeze', { method: 'POST', body: JSON.stringify({ accountType, reason }) }),
  reportFraud: (type, description) => apiFetch('/emergency/report', { method: 'POST', body: JSON.stringify({ type, description }) }),
  
  // Profile
  getProfile: () => apiFetch('/profile'),
  updateProfile: (data) => apiFetch('/profile', { method: 'PUT', body: JSON.stringify(data) }),
  changePassword: (currentPassword, newPassword) => apiFetch('/profile/password', { method: 'PUT', body: JSON.stringify({ currentPassword, newPassword }) }),
};
