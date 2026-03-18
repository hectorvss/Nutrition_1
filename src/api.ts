export const API_URL = '/api';

export const getAuthToken = () => localStorage.getItem('auth_token');

export const setAuthToken = (token: string) => {
  if (token) {
    localStorage.setItem('auth_token', token);
  } else {
    localStorage.removeItem('auth_token');
  }
};

export const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if ((response.status === 401 || response.status === 403) && token) {
    // Unauthorized or Forbidden - but we had a token, so it must be invalid
    setAuthToken('');
    localStorage.removeItem('auth_user');
    window.location.href = '/'; 
    return;
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'API Request Failed');
  }

  return response.json();
};
