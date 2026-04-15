import axios from 'axios';

function getCSRFToken() {
  const name = 'csrftoken';
  let cookieValue = null;
  document.cookie.split(';').forEach(cookie => {
    const [key, val] = cookie.trim().split('=');
    if (key === name) cookieValue = decodeURIComponent(val);
  });
  return cookieValue;
}

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase())) {
    const csrfToken = getCSRFToken();
    if (csrfToken) config.headers['X-CSRFToken'] = csrfToken;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

function extractData(res) {
  return res.data.results || res.data;
}

export const auth = {
  login: (username, password) => api.post('/auth/login/', { username, password }),
  logout: () => api.post('/auth/logout/'),
  currentUser: () => api.get('/auth/user/'),
};

export const contacts = {
  list: (params) => api.get('/contacts/', { params }).then(extractData),
  get: (id) => api.get(`/contacts/${id}/`),
  create: (data) => api.post('/contacts/', data),
  update: (id, data) => api.put(`/contacts/${id}/`, data),
  delete: (id) => api.delete(`/contacts/${id}/`),
};

export const leads = {
  list: (params) => api.get('/leads/', { params }).then(extractData),
  get: (id) => api.get(`/leads/${id}/`),
  create: (data) => api.post('/leads/', data),
  update: (id, data) => api.put(`/leads/${id}/`, data),
  delete: (id) => api.delete(`/leads/${id}/`),
};

export const deals = {
  list: (params) => api.get('/deals/', { params }).then(extractData),
  get: (id) => api.get(`/deals/${id}/`),
  create: (data) => api.post('/deals/', data),
  update: (id, data) => api.put(`/deals/${id}/`, data),
  delete: (id) => api.delete(`/deals/${id}/`),
};

export const tasks = {
  list: (params) => api.get('/tasks/', { params }).then(extractData),
  get: (id) => api.get(`/tasks/${id}/`),
  create: (data) => api.post('/tasks/', data),
  update: (id, data) => api.put(`/tasks/${id}/`, data),
  delete: (id) => api.delete(`/tasks/${id}/`),
};

export const companies = {
  list: (params) => api.get('/companies/', { params }).then(extractData),
  get: (id) => api.get(`/companies/${id}/`),
  create: (data) => api.post('/companies/', data),
  update: (id, data) => api.put(`/companies/${id}/`, data),
  delete: (id) => api.delete(`/companies/${id}/`),
};

export default api;