// API Client for MessMetrics Backend
const BASE_URL = '/api';

export function getToken() {
  return localStorage.getItem('messmetrics_token');
}

export function setToken(token) {
  if (token) {
    localStorage.setItem('messmetrics_token', token);
  } else {
    localStorage.removeItem('messmetrics_token');
  }
}

export function removeToken() {
  localStorage.removeItem('messmetrics_token');
}

export async function apiFetch(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type');
  let data = null;
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorMsg =
      (data && typeof data === 'object' && data.error) ||
      (typeof data === 'string' && data) ||
      `Request failed with status ${response.status}`;
    const err = new Error(errorMsg);
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
}

// Auth API
export const authApi = {
  login: (email, password) =>
    apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  register: (name, email, password, role) =>
    apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role }),
    }),
  getMe: () => apiFetch('/auth/me'),
  logout: () => apiFetch('/auth/logout', { method: 'POST' }),
};

// Dishes API
export const dishApi = {
  getAll: (category) => {
    const query = category ? `?category=${encodeURIComponent(category)}` : '';
    return apiFetch(`/dishes${query}`);
  },
  getById: (id) => apiFetch(`/dishes/${id}`),
  create: (data) =>
    apiFetch('/dishes', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id, data) =>
    apiFetch(`/dishes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id) => apiFetch(`/dishes/${id}`, { method: 'DELETE' }),
};

// Meals & MealDishes API
export const mealApi = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.mealType) params.append('mealType', filters.mealType);
    if (filters.date) params.append('date', filters.date);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.limit) params.append('limit', String(filters.limit));
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return apiFetch(`/meals${queryString}`);
  },
  getById: (id) => apiFetch(`/meals/${id}`),
  create: (data) =>
    apiFetch('/meals', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id, data) =>
    apiFetch(`/meals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id) => apiFetch(`/meals/${id}`, { method: 'DELETE' }),

  addDishToMeal: (mealId, dishId, quantityPrepared, quantityWasted) =>
    apiFetch('/meal-dishes', {
      method: 'POST',
      body: JSON.stringify({
        mealId: Number(mealId),
        dishId: Number(dishId),
        quantityPrepared: Number(quantityPrepared),
        quantityWasted: Number(quantityWasted),
      }),
    }),
  deleteMealDish: (id) => apiFetch(`/meal-dishes/${id}`, { method: 'DELETE' }),
};

// Weekly Menu API
export const weeklyMenuApi = {
  getWeeklyMenu: () => apiFetch('/weekly-menu'),
  getTodayMenu: () => apiFetch('/weekly-menu/today'),
  updateDayMenu: (day, menu) =>
    apiFetch('/weekly-menu', {
      method: 'PUT',
      body: JSON.stringify({ day, menu }),
    }),
  updateFullWeeklyMenu: (fullMenu) =>
    apiFetch('/weekly-menu', {
      method: 'PUT',
      body: JSON.stringify({ fullMenu }),
    }),
};

// Analytics API
export const analyticsApi = {
  getSummary: (startDate, endDate) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return apiFetch(`/analytics/summary${queryString}`);
  },
  getByMealType: () => apiFetch('/analytics/by-meal-type'),
  getDaily: () => apiFetch('/analytics/daily'),
};

// Health Check
export const checkHealth = async () => {
  try {
    const res = await fetch('/api/health');
    return res.ok;
  } catch {
    return false;
  }
};

