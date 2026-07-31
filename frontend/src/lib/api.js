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
  getMe: () => apiFetch('/auth/me'),
  googleAuth: (credential) => apiFetch('/auth/google', { method: 'POST', body: JSON.stringify({ credential }) }),
  chat: (message, lang) => apiFetch('/assistant/chat', { method: 'POST', body: JSON.stringify({ message, lang }) }),
  
  // Scans — all accept optional `lang` for localized responses
  scanMessage: (text, lang) => apiFetch('/scans/message', { method: 'POST', body: JSON.stringify({ text, lang }) }),
  scanUPI: (upiId, lang) => apiFetch('/scans/upi', { method: 'POST', body: JSON.stringify({ upiId, lang }) }),
  scanQR: (url, lang) => apiFetch('/scans/qr', { method: 'POST', body: JSON.stringify({ url, lang }) }),
  scanVoice: (features, sourceType, fileName, lang) => apiFetch('/scans/voice', { method: 'POST', body: JSON.stringify({ features, sourceType, fileName, lang }) }),

  // Dashboard
  getStats: () => apiFetch('/dashboard/stats'),
  getLogs: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`/dashboard/logs?${query}`);
  },
  getCharts: () => apiFetch('/dashboard/charts'),

  // Learn
  getModules: (category, lang) => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (lang) params.append('lang', lang);
    const q = params.toString();
    return apiFetch(`/learn/modules${q ? `?${q}` : ''}`);
  },
  getModule: (id, lang) => apiFetch(`/learn/modules/${id}${lang ? `?lang=${lang}` : ''}`),
  getQuiz: (id, lang) => apiFetch(`/learn/modules/${id}/quiz${lang ? `?lang=${lang}` : ''}`),
  submitQuiz: (id, answers, lang) => apiFetch(`/learn/modules/${id}/quiz/submit`, { method: 'POST', body: JSON.stringify({ answers, lang }) }),
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
