import axios, { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import Cookies from 'js-cookie';

const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    // headers: {
    //     'Content-Type': 'application/json',   
    // }
});


//Request Interceptor
axiosClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // Automatically set Content-Type to application/json for standard objects
        // and allow it to be empty (letting browser decide) for FormData
        if (config.data && !(config.data instanceof FormData) && !config.headers['Content-Type']) {
            config.headers['Content-Type'] = 'application/json';
        }
        
        // const token = Cookies.get('token');
        // if (token) {
        //     config.headers.Authorization = `Bearer ${token}`;
        // }

        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

//Response Interceptor
axiosClient.interceptors.response.use(
    (response: AxiosResponse) => {
        // Check if the response is actually HTML instead of JSON (common SPA routing issue)
        if (typeof response.data === 'string' && response.data.trim().startsWith('<!DOCTYPE')) {
            console.error("Critical API Error: Received HTML instead of JSON. This suggests a misconfigured API_URL or a routing issue.");
            return Promise.reject({
                message: "API returned HTML instead of JSON. Please check VITE_API_URL and server routing.",
                response: response,
                config: response.config
            });
        }
        return response;
    },
    (error: AxiosError) => {
        if (error.response && error.response.status === 401) {
            // Unauthorized access: clear all session data
            localStorage.clear();
            
            // Remove specific cookies
            Cookies.remove('token');
            Cookies.remove('user_id');
            Cookies.remove('username');
            
            // Show toast using the library (need to import it if possible, or use a window event)
            // Since we can't easily import toast without potential circular deps or setup issues,
            // we'll use a simple alert or assume the page reload/redirect handles it via App.tsx logic
            
            import('react-hot-toast').then(({ toast }) => {
                toast.error("Session expired. Please login again.");
            }).catch(() => {
                console.warn("Toast not available in interceptor");
            });

            // Redirect to login: since the app uses state-based routing in App.tsx, 
            // we set the currentStep in localStorage so it persists after the redirect.
            localStorage.setItem('currentStep', JSON.stringify('login'));
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);


const axiosFastApiClient = axios.create({
    baseURL: import.meta.env.VITE_RESULT_API_URL,
    // headers: {
    //     'Content-Type': 'application/json',   
    // }
});

//Request Interceptor for Fast API
axiosFastApiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        if (config.data && !(config.data instanceof FormData) && !config.headers['Content-Type']) {
            config.headers['Content-Type'] = 'application/json';
        }
        
        const token = Cookies.get('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

//Response Interceptor for Fast API
axiosFastApiClient.interceptors.response.use(
    (response: AxiosResponse) => {
        return response;
    },
    (error: AxiosError) => {
        if (error.response && error.response.status === 401) {
            localStorage.clear();
            Cookies.remove('token');
            Cookies.remove('user_id');
            Cookies.remove('username');
            
            import('react-hot-toast').then(({ toast }) => {
                toast.error("Session expired. Please login again.");
            }).catch(() => {
                console.warn("Toast not available in interceptor");
            });

            localStorage.setItem('currentStep', JSON.stringify('login'));
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

const axiosVoiceClient = axios.create({
    baseURL: import.meta.env.VITE_MINDSHAALA_API_URL
    // headers: {
    //     'Content-Type': 'application/json',   
    // }
});

//Request Interceptor for Conceptual Viva API
axiosVoiceClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        if (config.data && !(config.data instanceof FormData) && !config.headers['Content-Type']) {
            config.headers['Content-Type'] = 'application/json';
        }
        
        const token = Cookies.get('token');
        if (token && config.headers['skip-auth'] !== 'true') {
            config.headers.Authorization = `Bearer ${token}`;
        }
        delete config.headers['skip-auth'];

        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

//Response Interceptor for Conceptual Viva API
axiosVoiceClient.interceptors.response.use(
    (response: AxiosResponse) => {
        return response;
    },
    (error: AxiosError) => {
        if (error.response && error.response.status === 401) {
            localStorage.clear();
            Cookies.remove('token');
            Cookies.remove('user_id');
            Cookies.remove('username');
            
            import('react-hot-toast').then(({ toast }) => {
                toast.error("Session expired. Please login again.");
            }).catch(() => {
                console.warn("Toast not available in interceptor");
            });

            localStorage.setItem('currentStep', JSON.stringify('login'));
            window.location.href = '/';
        }
        return Promise.reject(error);
    },

    
);

const axiosMindShaalaClient = axios.create({
    baseURL: import.meta.env.VITE_MINDSHAALA_API_URL,
    // headers: {
    //     'Content-Type': 'application/json',   
    // }
});

//Request Interceptor for AI API
axiosMindShaalaClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        if (config.data && !(config.data instanceof FormData) && !config.headers['Content-Type']) {
            config.headers['Content-Type'] = 'application/json';
        }

        const token = Cookies.get('token');
        if (token && config.headers['skip-auth'] !== 'true') {
            config.headers.Authorization = `Bearer ${token}`;
        }
        delete config.headers['skip-auth'];

        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

//Response Interceptor for AI API
axiosMindShaalaClient.interceptors.response.use(
    (response: AxiosResponse) => {
        return response;
    },
    (error: AxiosError) => {
        if (error.response && error.response.status === 401) {
            localStorage.clear();
            Cookies.remove('token');
            Cookies.remove('user_id');
            Cookies.remove('username');

            import('react-hot-toast').then(({ toast }) => {
                toast.error("Session expired. Please login again.");
            }).catch(() => {
                console.warn("Toast not available in interceptor");
            });

            localStorage.setItem('currentStep', JSON.stringify('login'));
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

export { axiosClient, axiosFastApiClient, axiosVoiceClient , axiosMindShaalaClient };
export default axiosClient;

// export { axiosClient, axiosFastApiClient, axiosConceptualVivaClient };
// export default axiosClient;