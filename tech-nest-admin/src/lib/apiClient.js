const BASE_URL = 'http://localhost:5031/api';

export const apiClient = async (endpoint, options = {}) => {
    // Retrieve the token saved during login
    const token = localStorage.getItem('token');
    
    const defaultHeaders = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };

    const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers
        }
    });

    if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
    }

    // Return empty object for 204 No Content, otherwise parse JSON
    return response.status === 204 ? {} : response.json();
};