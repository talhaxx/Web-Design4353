import axios from "axios";

const API_URL = "http://localhost:5001/api";


export const registerUser = async (email, password) => {
    return await axios.post(`${API_URL}/auth/register`, { email, password });
};

export const loginUser = async (email, password) => {
    return await axios.post(`${API_URL}/auth/login`, { email, password });
};

export const fetchUserProfile = async (email) => {
    return await axios.get(`${API_URL}/users/profile/${email}`);
};

export const updateUserProfile = async (profileData) => {
    return await axios.post(`${API_URL}/users/profile`, profileData);
};

export const fetchEvents = async () => {
    return await axios.get(`${API_URL}/events`);
};

export const createEvent = async (eventData) => {
    return await axios.post(`${API_URL}/events/create`, eventData);
};
