const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

const getAuthHeadersNoContentType = () => {
  const token = localStorage.getItem('authToken');
  const headers: Record<string, string> = {};
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
  return response.json();
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

  upload: (endpoint: string, formData: FormData) => {
    const headers = getAuthHeadersNoContentType();
    return fetch(buildUrl(endpoint), {
      method: 'POST',
      headers,
      body: formData,
    }).then(handleResponse);
  },
};

export default api;
