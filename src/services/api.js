import axios from "axios";

// Get API URL from environment variables or use default
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5001/api";

// Create an axios instance with defaults
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Interceptor for handling errors globally
api.interceptors.response.use(
    response => response,
    error => {
        // Handle common errors
        if (error.response) {
            // Server responded with error status (4xx, 5xx)
            console.error("API Error:", error.response.data);
            
            // Handle authentication errors - redirect to login if unauthorized
            if (error.response.status === 401 || error.response.status === 403) {
                // Clear token and user if needed
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                
                // Could also redirect to login page here if needed
                // window.location.href = '/login';
            }
        } else if (error.request) {
            // Request made but no response received
            console.error("API Request Error:", error.request);
        } else {
            // Something else caused an error
            console.error("API Error:", error.message);
        }
        return Promise.reject(error);
    }
);

// Set token when available
export const setAuthToken = (token) => {
    if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete api.defaults.headers.common['Authorization'];
    }
};

// Auth Services
export const registerUser = async (email, password) => {
    return await api.post('/auth/register', { email, password });
};

export const loginUser = async (email, password) => {
    return await api.post('/auth/login', { email, password });
};

// User Services
export const fetchUserProfile = async (email) => {
    return await api.get(`/users/profile/${email}`);
};

export const updateUserProfile = async (profileData) => {
    return await api.post('/users/profile', profileData);
};

// Event Services
export const fetchEvents = async () => {
    return await api.get('/events');
};

export const fetchEventById = async (eventId) => {
    return await api.get(`/events/${eventId}`);
};

export const createEvent = async (eventData) => {
    return await api.post('/events/create', eventData);
};

export const updateEvent = async (eventId, eventData) => {
    return await api.put(`/events/${eventId}`, eventData);
};

export const deleteEvent = async (eventId) => {
    return await api.delete(`/events/${eventId}`);
};

// Match Services
export const matchVolunteers = async (eventId) => {
    return await api.post(`/match/${eventId}`);
};

export const assignVolunteer = async (eventId, userId) => {
    return await api.post('/match/assign', { eventId, userId });
};

export const fetchVolunteerHistory = async (userId = null) => {
    const url = userId ? `/match/user/${userId}` : '/match';
    return await api.get(url);
};

// Notification Services
export const fetchNotifications = async () => {
    return await api.get('/notifications');
};

export const markNotificationRead = async (notificationId) => {
    return await api.put(`/notifications/${notificationId}/read`);
};

// Other services can be added as needed

export default api;
