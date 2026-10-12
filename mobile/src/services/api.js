import { Platform } from 'react-native';

// Default to localhost for web/iOS, 10.0.2.2 for Android emulator, or LAN IP
const DEFAULT_HOST = Platform.OS === 'android' ? 'http://10.0.2.2:5000' : 'http://localhost:5000';

let authToken = null;
let currentBaseUrl = `${DEFAULT_HOST}/api`;

export const setToken = (token) => {
  authToken = token;
};

export const setBaseUrl = (url) => {
  currentBaseUrl = url.endsWith('/api') ? url : `${url}/api`;
};

export const getBaseUrl = () => currentBaseUrl;

async function request(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}),
    ...options.headers
  };

  const response = await fetch(`${currentBaseUrl}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `İstek hatası (${response.status})`);
  }

  return data;
}

export const mobileApi = {
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  getMe: () => request('/auth/me'),
  getAssets: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/assets${qs ? `?${qs}` : ''}`);
  },
  getAssetById: (id) => request(`/assets/${id}`),
  assignAsset: (data) => request('/assignments', { method: 'POST', body: JSON.stringify(data) }),
  returnAsset: (data) => request('/assignments/return', { method: 'POST', body: JSON.stringify(data) }),
  reportFault: (id, faultData) => request(`/assets/${id}/report-fault`, { method: 'POST', body: JSON.stringify(faultData) }),
  getMyAssets: () => request('/assignments/my-assets'),
  getDashboardStats: () => request('/stats/dashboard'),
  getUsers: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/users${qs ? `?${qs}` : ''}`);
  }
};
