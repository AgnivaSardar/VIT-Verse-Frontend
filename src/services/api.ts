export interface UploadRequest<T = any> {
  promise: Promise<T>;
  cancel: () => void;
  xhr: XMLHttpRequest;
}

// Upload with progress support using XMLHttpRequest + cancelation hook
export function uploadWithProgress(endpoint: string, formData: FormData, onProgress: (percent: number) => void, method: string = 'POST'): UploadRequest<any> {
  const xhr = new XMLHttpRequest();
  xhr.withCredentials = true;
  xhr.open(method, buildUrl(endpoint));
  const token = localStorage.getItem('authToken');
  if (token) {
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
  }
  xhr.setRequestHeader('x-bypass-rate-limit', '1');

  const promise = new Promise((resolve, reject) => {
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        onProgress(percent);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const json = JSON.parse(xhr.responseText);
          resolve(json);
        } catch (_e) {
          resolve({ data: null });
        }
      } else {
        reject(new Error(`HTTP Error: ${xhr.status}`));
      }
    };

    xhr.onerror = () => {
      const uploadError = new Error('Upload failed');
      // Check if it might be a certificate/network issue
      import('react-hot-toast').then(({ default: toast }) => {
        toast.error(
          '🔒 Upload Failed - Network Issue Detected!\n\n' +
          '⚠️ If you\'re on public WiFi (college/office),\n' +
          'please switch to mobile data.\n\n' +
          'Public WiFi firewalls can block file uploads.',
          {
            duration: 7000,
            style: {
              minWidth: '350px',
              fontSize: '14px',
              whiteSpace: 'pre-line',
            },
          }
        );
      });
      reject(uploadError);
    };

    xhr.onabort = () => {
      const abortErr = new Error('Upload cancelled');
      (abortErr as any).code = 'UPLOAD_CANCELLED';
      reject(abortErr);
    };

    xhr.send(formData);
  });

  return {
    promise,
    cancel: () => xhr.abort(),
    xhr,
  };
}

export const isUploadCancelled = (error: unknown): boolean => {
  const err = error as any;
  return err?.code === 'UPLOAD_CANCELLED' || err?.message === 'Upload cancelled' || err?.name === 'AbortError';
};

const API_BASE = import.meta.env.DEV 
  ? '/api'  // Vite proxy → http://localhost:5173/api → backend
  : import.meta.env.VITE_API_URL || 'https://18.60.156.89:5443/api';


export interface ApiResponse<T> {
  data: T;
  message?: string;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-bypass-rate-limit': '1'
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

const getAuthHeadersNoContentType = () => {
  const token = localStorage.getItem('authToken');
  const headers: Record<string, string> = {
    'x-bypass-rate-limit': '1'
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

// Check if error is related to certificate/network issues (common with public WiFi)
const isCertificateOrNetworkError = (error: any): boolean => {
  if (!error) return false;
  
  const errorMessage = error.message?.toLowerCase() || '';
  const errorName = error.name?.toLowerCase() || '';
  
  // Common certificate and network error patterns
  const certificateErrors = [
    'certificate',
    'ssl',
    'tls',
    'cert',
    'self-signed',
    'untrusted',
    'net::err_cert',
    'sec_error',
    'mozilla_pkix_error',
  ];
  
  const networkErrors = [
    'network',
    'failed to fetch',
    'network request failed',
    'typeerror: failed to fetch',
    'networkerror',
    'connection',
    'timeout',
    'econnrefused',
    'enotfound',
  ];
  
  const allPatterns = [...certificateErrors, ...networkErrors];
  
  return allPatterns.some(pattern => 
    errorMessage.includes(pattern) || errorName.includes(pattern)
  );
};

// Show user-friendly message for certificate/network issues
const showNetworkErrorToast = () => {
  // Only import toast when needed to avoid circular dependencies
  import('react-hot-toast').then(({ default: toast }) => {
    toast.error(
      '🔒 Connection Issue Detected!\n\n' +
      '⚠️ If you\'re on public WiFi (college/office network),\n' +
      'please disconnect and use your mobile data instead.\n\n' +
      'Public WiFi firewalls (like Fortinet) can block secure connections.',
      {
        duration: 8000,
        style: {
          minWidth: '350px',
          fontSize: '14px',
          whiteSpace: 'pre-line',
        },
      }
    );
  });
};

const handleResponse = async (response: Response) => {
  // Allow 304 Not Modified as a soft success with no body
  if (response.status === 304) {
    return { data: null } as { data: any; message?: string };
  }

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('authToken');
      // Do not redirect, just clear token
    }
    throw new Error(`HTTP Error: ${response.status}`);
  }

  // No content (204/205) should not attempt JSON parsing
  if (response.status === 204 || response.status === 205) {
    return { data: null } as { data: any; message?: string };
  }

  const text = await response.text();
  if (!text) {
    return { data: null } as { data: any; message?: string };
  }

  const parsed = JSON.parse(text);
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
      credentials: 'include',
      cache: 'no-store',
    })
      .then(handleResponse)
      .catch((error) => {
        if (isCertificateOrNetworkError(error)) {
          showNetworkErrorToast();
        }
        throw error;
      }) as Promise<ApiResponse<T>>,

  post: <T>(endpoint: string, body: any) =>
    fetch(buildUrl(endpoint), {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(body),
      cache: 'no-store',
    })
      .then(handleResponse)
      .catch((error) => {
        if (isCertificateOrNetworkError(error)) {
          showNetworkErrorToast();
        }
        throw error;
      }) as Promise<ApiResponse<T>>,

  put: <T>(endpoint: string, body: any) =>
    fetch(buildUrl(endpoint), {
      method: 'PUT',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(body),
      cache: 'no-store',
    })
      .then(handleResponse)
      .catch((error) => {
        if (isCertificateOrNetworkError(error)) {
          showNetworkErrorToast();
        }
        throw error;
      }) as Promise<ApiResponse<T>>,

  delete: <T>(endpoint: string) =>
    fetch(buildUrl(endpoint), {
      method: 'DELETE',
      headers: getAuthHeaders(),
      credentials: 'include',
      cache: 'no-store',
    })
      .then(handleResponse)
      .catch((error) => {
        if (isCertificateOrNetworkError(error)) {
          showNetworkErrorToast();
        }
        throw error;
      }) as Promise<ApiResponse<T>>,

  deleteWithBody: <T>(endpoint: string, body: any) =>
    fetch(buildUrl(endpoint), {
      method: 'DELETE',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(body),
      cache: 'no-store',
    })
      .then(handleResponse)
      .catch((error) => {
        if (isCertificateOrNetworkError(error)) {
          showNetworkErrorToast();
        }
        throw error;
      }) as Promise<ApiResponse<T>>,

  patch: <T>(endpoint: string, body?: any) =>
    fetch(buildUrl(endpoint), {
      method: 'PATCH',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: body ? JSON.stringify(body) : undefined,
      cache: 'no-store',
    })
      .then(handleResponse)
      .catch((error) => {
        if (isCertificateOrNetworkError(error)) {
          showNetworkErrorToast();
        }
        throw error;
      }) as Promise<ApiResponse<T>>,

  upload: (endpoint: string, formData: FormData, method: string = 'POST') => {
    const headers = getAuthHeadersNoContentType();
    return fetch(buildUrl(endpoint), {
      method,
      headers,
      credentials: 'include',
      body: formData,
      cache: 'no-store',
    })
      .then(handleResponse)
      .catch((error) => {
        if (isCertificateOrNetworkError(error)) {
          showNetworkErrorToast();
        }
        throw error;
      });
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
