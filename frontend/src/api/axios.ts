import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor to handle errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't auto-redirect on auth check endpoint or if already on login/register page
    const isAuthCheck = error.config?.url?.includes('/auth/me');
    const isOnAuthPage = window.location.pathname === '/login' || window.location.pathname === '/register';

    if (error.response?.status === 401 && !isAuthCheck && !isOnAuthPage) {
      // Redirect to login on authentication error
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
