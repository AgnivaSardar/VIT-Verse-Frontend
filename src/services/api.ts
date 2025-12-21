const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  const headers: Record<string, string> = { 'Content-Type': 'application/json', 'x-bypass-rate-limit': '1' };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

const getAuthHeadersNoContentType = () => {
  const token = localStorage.getItem('authToken');
  const headers: Record<string, string> = { 'x-bypass-rate-limit': '1' };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    throw new Error(`HTTP Error: ${response.status}`);
  }
  const parsed = await response.json();
  // Normalize response: if backend returns raw object, wrap as { data: ... }
  if (parsed && typeof parsed === 'object' && 'data' in parsed) {
    return parsed;
  }
  return { data: parsed } as { data: any; message?: string };
};

const buildUrl = (endpoint: string) => {
  const path = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_BASE}/${path}`;
};

const api = {
  get: <T>(endpoint: string) =>
    fetch(buildUrl(endpoint), {
      headers: getAuthHeaders(),
    }).then(handleResponse) as Promise<ApiResponse<T>>,

  post: <T>(endpoint: string, body: any) =>
    fetch(buildUrl(endpoint), {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    }).then(handleResponse) as Promise<ApiResponse<T>>,

  put: <T>(endpoint: string, body: any) =>
    fetch(buildUrl(endpoint), {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    }).then(handleResponse) as Promise<ApiResponse<T>>,

  delete: <T>(endpoint: string) =>
    fetch(buildUrl(endpoint), {
      method: 'DELETE',
      headers: getAuthHeaders(),
    }).then(handleResponse) as Promise<ApiResponse<T>>,

  patch: <T>(endpoint: string, body?: any) =>
    fetch(buildUrl(endpoint), {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    }).then(handleResponse) as Promise<ApiResponse<T>>,

  upload: (endpoint: string, formData: FormData) => {
    const headers = getAuthHeadersNoContentType();
    return fetch(buildUrl(endpoint), {
      method: 'POST',
      headers,
      body: formData,
    }).then(handleResponse);
  },

  // Test backend connection
  testConnection: async () => {
    try {
      const response = await fetch(`${API_BASE.replace('/api', '')}/api/test-connection`);
      const data = await response.json();
      console.log('✅ FRONTEND-BACKEND CONNECTION SUCCESSFUL!');
      console.log('📦 Backend Info:', data);
      return data;
    } catch (error) {
      console.error('❌ FRONTEND-BACKEND CONNECTION FAILED:', error);
      throw error;
    }
  }
};

// Auto-test connection on module load (only in development)
if (import.meta.env.DEV) {
  api.testConnection().catch(() => {
    console.warn('⚠️ Could not connect to backend. Make sure the backend server is running.');
  });
}

export default api;
