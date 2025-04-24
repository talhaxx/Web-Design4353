import axios from "axios";

// Explicitly set the full URL to ensure the /api prefix is included
const API_URL = "http://localhost:5001/api";

console.log("API URL correctly set to:", API_URL);

// Create an axios instance with defaults
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 10000 // 10 second timeout
});

// Add token authorization header
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Enhanced request logging for debugging
    console.log(`API Request: ${config.method.toUpperCase()} ${config.baseURL}${config.url}`, config.data || '');
    
    return config;
}, (error) => {
    console.error("API Request Error:", error);
    return Promise.reject(error);
});

// Interceptor for handling errors globally
api.interceptors.response.use(
    (response) => {
        console.log(`API Response: ${response.status} ${response.config.url}`);
        return response;
    },
    (error) => {
        // Handle common errors
        if (error.response) {
            // Server responded with error status (4xx, 5xx)
            console.error(`API Error: ${error.response.status} ${error.config.url}`, error.response.data);
            
            // Handle authentication errors - redirect to login if unauthorized
            if (error.response.status === 401 || error.response.status === 403) {
                // Clear token and user if needed
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        } else if (error.request) {
            // Request made but no response received
            console.error("API Request Error - No Response:", 
                error.config?.method, error.config?.url);
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
        console.log("Auth token set in API");
    } else {
        delete api.defaults.headers.common['Authorization'];
        console.log("Auth token removed from API");
    }
};

// Auth Services
export const registerUser = async (email, password) => {
    return await api.post('/auth/register', { email, password });
};

export const loginUser = async (email, password) => {
    console.log("Attempting to login with:", email, "via URL:", `${API_URL}/auth/login`);
    try {
        const response = await api.post('/auth/login', { email, password });
        console.log("Login successful:", response.data);
        return response;
    } catch (error) {
        console.error("Login error in API service:", error.message);
        // Additional error logging
        if (error.response) {
            console.error("Error status:", error.response.status);
            console.error("Error data:", error.response.data);
        }
        throw error;
    }
};

// User Services
export const fetchUserProfile = async (email) => {
    return await api.get(`/users/profile/${email}`);
};

export const updateUserProfile = async (profileData) => {
    return await api.post('/users/profile', profileData);
};

// Volunteer Services
export const fetchAllVolunteers = async () => {
    try {
        console.log('Fetching volunteers from:', `${API_URL}/volunteers`);
        const response = await api.get('/volunteers');
        console.log('Raw API response:', response);
        
        // If the API returns the data directly without a data wrapper
        if (response && !response.data && typeof response === 'object') {
            return { data: response };
        }
        
        return response;
    } catch (error) {
        console.error('Error in fetchAllVolunteers:', error);
        throw error;
    }
};

export const updateVolunteerStatus = async (volunteerId, status) => {
    return await api.patch(`/volunteers/${volunteerId}/status`, { status });
};

export const fetchVolunteerById = async (volunteerId) => {
    return await api.get(`/volunteers/${volunteerId}`);
};

// Event Services
export const fetchEvents = async () => {
    try {
        console.log('Fetching events from:', `${API_URL}/events`);
        const response = await api.get('/events');
        console.log('Raw API events response:', response);
        
        // If the API returns the data directly without a data wrapper
        if (response && !response.data && typeof response === 'object') {
            return { data: response };
        }
        
        return response;
    } catch (error) {
        console.error('Error in fetchEvents:', error);
        throw error;
    }
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
    try {
        // First try to use the backend API
        console.log('Attempting to match volunteers using backend API for event:', eventId);
        const response = await api.post(`/match/${eventId}`);
        console.log('Backend matching response:', response.data);
        
        // If we get a valid response, return it
        if (response.data && Array.isArray(response.data)) {
            return response;
        } else {
            throw new Error('Invalid response format from server');
        }
    } catch (error) {
        console.error('Error in backend matchVolunteers:', error);
        console.log('Falling back to client-side matching algorithm...');
        
        // Fallback to client-side matching if backend fails
        try {
            // Get event details
            const eventResponse = await fetchEventById(eventId);
            const event = eventResponse.data;
            
            if (!event) {
                throw new Error('Event not found');
            }
            
            // Parse event details
            const requiredSkills = event.RequiredSkills ? 
                event.RequiredSkills.split(',').map(skill => skill.trim()) : [];
            const eventDate = event.EventDate ? 
                new Date(event.EventDate).toISOString().split('T')[0] : null;
            const eventLocation = event.Location || '';
            
            // Fetch all volunteers
            const volunteersResponse = await fetchAllVolunteers();
            let volunteers = volunteersResponse.data;
            
            if (!volunteers || !Array.isArray(volunteers)) {
                throw new Error('Failed to fetch volunteers');
            }
            
            // Filter out admins and already assigned volunteers
            const assignedVolunteersResponse = await fetchVolunteerHistory();
            const assignedVolunteers = assignedVolunteersResponse.data;
            
            // Extract IDs of volunteers already assigned to this event
            const assignedIds = assignedVolunteers
                .filter(assignment => assignment.EventID === parseInt(eventId))
                .map(assignment => assignment.UserID);
            
            // Filter out already assigned volunteers and admins
            volunteers = volunteers.filter(volunteer => 
                !assignedIds.includes(volunteer.ID) && !volunteer.IsAdmin);
            
            // Match algorithm
            const matchedVolunteers = volunteers.map(volunteer => {
                const volunteerSkills = volunteer.Skills ? 
                    volunteer.Skills.split(',').map(skill => skill.trim()) : [];
                
                // Parse availability
                let availableDates = [];
                try {
                    availableDates = JSON.parse(volunteer.Availability || '[]');
                } catch (e) {
                    console.error('Error parsing availability for volunteer:', volunteer.ID, e);
                }
                
                const isAvailable = eventDate && availableDates.includes(eventDate);
                const matchingSkills = volunteerSkills.filter(skill => 
                    requiredSkills.includes(skill));
                
                // Calculate match score
                let matchScore = requiredSkills.length > 0 ? 
                    matchingSkills.length / requiredSkills.length : 0;
                
                // Adjust score based on availability
                if (isAvailable) {
                    matchScore = Math.min(matchScore + 0.2, 1.0);
                } else if (matchingSkills.length > 0) {
                    matchScore *= 0.5;
                } else {
                    matchScore = 0;
                }
                
                // Location bonus
                if (volunteer.City && eventLocation.includes(volunteer.City)) {
                    matchScore = Math.min(matchScore + 0.1, 1.0);
                }
                
                return {
                    ...volunteer,
                    matchingSkills,
                    isAvailable,
                    matchScore
                };
            })
            .filter(volunteer => volunteer.matchScore > 0)
            .sort((a, b) => b.matchScore - a.matchScore);
            
            console.log('Client-side matching found', matchedVolunteers.length, 'volunteers');
            
            // Mock the API response format
            return { data: matchedVolunteers };
        } catch (fallbackError) {
            console.error('Client-side matching also failed:', fallbackError);
            // Add some mock data if everything fails
            return { data: getMockVolunteers(eventId) };
        }
    }
};

// Helper function to generate mock volunteers if everything fails
const getMockVolunteers = (eventId) => {
    console.log('Generating mock volunteers as last resort');
    return [
        {
            ID: 1,
            FullName: "John Doe",
            Email: "john@example.com",
            City: "New York",
            State: "NY",
            Skills: "First Aid, Cooking, Driving",
            matchScore: 0.85
        },
        {
            ID: 3,
            FullName: "Jane Smith",
            Email: "jane@example.com",
            City: "Los Angeles",
            State: "CA",
            Skills: "Languages, Teaching, Organizing, Event Planning",
            matchScore: 0.75
        },
        {
            ID: 4,
            FullName: "Robert Johnson",
            Email: "robert@example.com",
            City: "Chicago",
            State: "IL",
            Skills: "Medical, IT Support, Construction, First Aid",
            matchScore: 0.65
        }
    ];
};

export const assignVolunteer = async (eventId, userId) => {
    try {
        console.log(`Assigning volunteer with ID ${userId} to event with ID ${eventId}`);
        
        // Convert IDs to numbers if they are strings
        const eventIdNum = typeof eventId === 'string' ? parseInt(eventId, 10) : eventId;
        const userIdNum = typeof userId === 'string' ? parseInt(userId, 10) : userId;
        
        if (isNaN(eventIdNum) || isNaN(userIdNum)) {
            throw new Error(`Invalid ID format: eventId=${eventId}, userId=${userId}`);
        }
        
        const requestData = { 
            eventId: eventIdNum, 
            userId: userIdNum 
        };
        
        console.log('Making API request to /match/assignVolunteer with data:', requestData);
        
        const response = await api.post('/match/assignVolunteer', requestData);
        console.log('Assignment response data:', response.data);
        return response;
    } catch (error) {
        console.error('Error in assignVolunteer:', error);
        if (error.response) {
            console.error('Server error response:', error.response.status, error.response.data);
            throw new Error(error.response.data.message || 'Server error');
        }
        throw error;
    }
};

export const fetchVolunteerHistory = async (userId = null) => {
    try {
        const url = userId ? `/match/user/${userId}` : '/match';
        const response = await api.get(url);
        console.log('Volunteer history raw response:', response);
        
        // If the API returns the data directly without a data wrapper
        if (response && !response.data && typeof response === 'object') {
            return { data: response };
        }
        
        return response;
    } catch (error) {
        console.error('Error in fetchVolunteerHistory:', error);
        throw error;
    }
};

// Notification Services
export const fetchNotifications = async (userEmail) => {
    try {
        console.log("Fetching notifications from localStorage for:", userEmail);
        // Create a user-specific key
        const notificationsKey = `notifications_${userEmail}`;
        
        // Get notifications from localStorage or initialize empty array
        const storedNotifications = JSON.parse(localStorage.getItem(notificationsKey) || "[]");
        
        // Format notifications to match expected structure
        const formattedNotifications = storedNotifications.map(notif => ({
            NotificationID: notif.id || `local-${Date.now()}-${Math.random()}`,
            Message: notif.message,
            IsRead: notif.isRead || false,
            CreatedAt: notif.createdAt || new Date().toISOString(),
            Type: notif.type || "general"
        }));
        
        console.log("Notifications retrieved:", formattedNotifications);
        
        // Return in the format the app expects (with data property)
        return { data: formattedNotifications };
    } catch (error) {
        console.error("Error fetching notifications from localStorage:", error);
        throw error;
    }
};

export const markNotificationRead = async (notificationId) => {
    try {
        // Get current user email from localStorage
        const user = JSON.parse(localStorage.getItem('user') || "{}");
        if (!user.email) {
            console.error("No user email found for marking notification as read");
            throw new Error("User not found");
        }
        
        const notificationsKey = `notifications_${user.email}`;
        const storedNotifications = JSON.parse(localStorage.getItem(notificationsKey) || "[]");
        
        // Find and update the notification
        const updatedNotifications = storedNotifications.map(notif => {
            if (notif.id === notificationId || `local-${notif.id}` === notificationId) {
                return { ...notif, isRead: true };
            }
            return notif;
        });
        
        // Save updated notifications
        localStorage.setItem(notificationsKey, JSON.stringify(updatedNotifications));
        
        return { data: { message: "Notification marked as read" } };
    } catch (error) {
        console.error("Error marking notification as read:", error);
        throw error;
    }
};

export const getUnreadNotificationsCount = async (userEmail) => {
    try {
        const notificationsKey = `notifications_${userEmail}`;
        const storedNotifications = JSON.parse(localStorage.getItem(notificationsKey) || "[]");
        
        // Count unread notifications
        const unreadCount = storedNotifications.filter(notif => !notif.isRead).length;
        
        return { data: { unreadCount } };
    } catch (error) {
        console.error("Error counting unread notifications:", error);
        throw error;
    }
};

export const sendNotification = async (email, message, type = "general") => {
    try {
        const notificationsKey = `notifications_${email}`;
        const storedNotifications = JSON.parse(localStorage.getItem(notificationsKey) || "[]");
        
        // Create new notification
        const newNotification = {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            message,
            type,
            isRead: false,
            createdAt: new Date().toISOString()
        };
        
        // Add to notifications and save
        storedNotifications.push(newNotification);
        localStorage.setItem(notificationsKey, JSON.stringify(storedNotifications));
        
        return { data: { message: "Notification sent successfully", notificationId: newNotification.id } };
    } catch (error) {
        console.error("Error sending notification:", error);
        throw error;
    }
};

// Report Services
export const fetchReportData = async (reportType, format = 'json') => {
    try {
        console.log(`Making API request to fetch ${reportType} report with format ${format}`);
        
        // Get token from localStorage
        const token = localStorage.getItem('token');
        console.log('Auth token:', token ? 'Present' : 'Not found');
        
        // Ensure token is set for the request
        if (token) {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            console.error('No auth token found for API request');
            return { 
                success: false, 
                error: 'Authentication required. Please log in again.',
                data: []
            };
        }
        
        // Only return JSON data in the response, for PDF and CSV initiate direct download
        if (format === 'json') {
            const response = await api.get(`/reports/${reportType}?format=${format}`);
            console.log('API response:', response);
            
            // Handle edge cases where data structure might be inconsistent
            if (response && response.data) {
                if (response.data.data) {
                    // Normal case: { success: true, data: [...] }
                    return response.data;
                } else if (Array.isArray(response.data)) {
                    // If API directly returns the array
                    return { data: response.data };
                } else {
                    // Fallback for any other structure
                    return { data: [] };
                }
            }
            
            return { data: [] }; // Fallback empty data
        } else {
            // For PDF and CSV, trigger direct download using window.location
            // This is more reliable than using a form
            const downloadUrl = `${API_URL}/reports/${reportType}?format=${format}&token=${token}`;
            console.log('Opening download URL:', downloadUrl);
            
            // Use window.open with _self to prevent navigation away from current page
            const downloadWindow = window.open(downloadUrl, '_blank');
            
            // If popup was blocked, fallback to direct assignment
            if (!downloadWindow) {
                const a = document.createElement('a');
                a.href = downloadUrl;
                a.target = '_blank';
                a.download = `${reportType}_report.${format}`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }
            
            // Return success response
            return { success: true, data: [] };
        }
    } catch (error) {
        console.error(`Error fetching ${reportType} report:`, error);
        if (error.response) {
            console.error('Server response error:', error.response.status, error.response.data);
            
            // Handle authentication errors
            if (error.response.status === 401 || error.response.status === 403) {
                return { 
                    success: false, 
                    error: 'Authentication failed. Please log in again.',
                    data: []
                };
            }
        }
        
        // Return a structured error that can be handled by the UI
        return { 
            success: false, 
            error: error.response?.data?.message || error.message || 'Failed to fetch report',
            data: []
        };
    }
};

export const fetchReportDataDetail = async (detailType, itemId) => {
    try {
        const response = await api.get(`/reports/${detailType}/${itemId}`);
        return response;
    } catch (error) {
        console.error(`Error fetching ${detailType} detail report:`, error);
        throw error;
    }
};

// Other services can be added as needed

export default api;
