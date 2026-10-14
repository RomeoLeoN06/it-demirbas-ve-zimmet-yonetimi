const API_BASE = '/api';

function getAuthHeader() {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

async function request(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `İstek başarısız oldu (${response.status})`);
  }

  return data;
}

export const api = {
  // Auth
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  googleLogin: (googleData) => request('/auth/google', { method: 'POST', body: JSON.stringify(googleData) }),
  getMe: () => request('/auth/me'),
  updateProfile: (profileData) => request('/auth/profile', { method: 'PUT', body: JSON.stringify(profileData) }),
  changePassword: (passwords) => request('/auth/change-password', { method: 'PUT', body: JSON.stringify(passwords) }),

  // Assets
  getAssets: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/assets${qs ? `?${qs}` : ''}`);
  },
  getAssetById: (id) => request(`/assets/${id}`),
  createAsset: (assetData) => request('/assets', { method: 'POST', body: JSON.stringify(assetData) }),
  updateAsset: (id, assetData) => request(`/assets/${id}`, { method: 'PUT', body: JSON.stringify(assetData) }),
  deleteAsset: (id) => request(`/assets/${id}`, { method: 'DELETE' }),
  reportFault: (id, faultData) => request(`/assets/${id}/report-fault`, { method: 'POST', body: JSON.stringify(faultData) }),

  // Custody / Assignments
  assignAsset: (data) => request('/assignments', { method: 'POST', body: JSON.stringify(data) }),
  returnAsset: (data) => request('/assignments/return', { method: 'POST', body: JSON.stringify(data) }),
  getMyAssets: () => request('/assignments/my-assets'),
  getAssignmentHistory: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/assignments/history${qs ? `?${qs}` : ''}`);
  },
  getSystemAuditLogs: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/assignments/audit-logs${qs ? `?${qs}` : ''}`);
  },

  // Users (Admin)
  getUsers: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/users${qs ? `?${qs}` : ''}`);
  },
  getUserById: (id) => request(`/users/${id}`),
  createUser: (userData) => request('/users', { method: 'POST', body: JSON.stringify(userData) }),
  updateUser: (id, userData) => request(`/users/${id}`, { method: 'PUT', body: JSON.stringify(userData) }),
  resetUserPassword: (id, data) => request(`/users/${id}/reset-password`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteUser: (id) => request(`/users/${id}`, { method: 'DELETE' }),

  // Departments (Birimler)
  getDepartments: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/departments${qs ? `?${qs}` : ''}`);
  },
  createDepartment: (data) => request('/departments', { method: 'POST', body: JSON.stringify(data) }),
  updateDepartment: (id, data) => request(`/departments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteDepartment: (id) => request(`/departments/${id}`, { method: 'DELETE' }),

  // Roles (Yetki ve Rol Tanımları)
  getRoles: () => request('/roles'),
  createRole: (data) => request('/roles', { method: 'POST', body: JSON.stringify(data) }),
  updateRole: (id, data) => request(`/roles/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteRole: (id) => request(`/roles/${id}`, { method: 'DELETE' }),

  // Stats
  getDashboardStats: () => request('/stats/dashboard')
};
