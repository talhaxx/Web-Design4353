import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Fetch all volunteers
export const fetchAllVolunteers = async () => {
  try {
    const response = await axios.get(`${API_URL}/volunteers`);
    return response.data;
  } catch (error) {
    console.error('Error fetching volunteers:', error);
    throw error;
  }
};

// Fetch a specific volunteer by ID
export const fetchVolunteerById = async (volunteerId) => {
  try {
    const response = await axios.get(`${API_URL}/volunteers/${volunteerId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching volunteer ${volunteerId}:`, error);
    throw error;
  }
};

// Fetch volunteer history (past events/assignments)
export const fetchVolunteerHistory = async (volunteerId) => {
  try {
    const response = await axios.get(`${API_URL}/volunteers/${volunteerId}/history`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching history for volunteer ${volunteerId}:`, error);
    throw error;
  }
};

// Update volunteer status (active/inactive)
export const updateVolunteerStatus = async (volunteerId, status) => {
  try {
    const response = await axios.patch(`${API_URL}/volunteers/${volunteerId}/status`, { status });
    return response.data;
  } catch (error) {
    console.error(`Error updating volunteer ${volunteerId} status:`, error);
    throw error;
  }
};

// Update volunteer information
export const updateVolunteer = async (volunteerId, volunteerData) => {
  try {
    const response = await axios.put(`${API_URL}/volunteers/${volunteerId}`, volunteerData);
    return response.data;
  } catch (error) {
    console.error(`Error updating volunteer ${volunteerId}:`, error);
    throw error;
  }
};

// Add a new note to volunteer
export const addVolunteerNote = async (volunteerId, note) => {
  try {
    const response = await axios.post(`${API_URL}/volunteers/${volunteerId}/notes`, { note });
    return response.data;
  } catch (error) {
    console.error(`Error adding note to volunteer ${volunteerId}:`, error);
    throw error;
  }
};

// Get volunteer stats for admin dashboard
export const getVolunteerStats = async () => {
  try {
    const response = await axios.get(`${API_URL}/volunteers/stats`);
    return response.data;
  } catch (error) {
    console.error('Error fetching volunteer stats:', error);
    throw error;
  }
}; 