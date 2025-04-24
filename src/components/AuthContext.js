import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import { sendNotification } from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    // On mount, check if we have a user in localStorage
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');
        
        if (storedUser && storedToken) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            
            // Set axios default authorization header
            axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;

            // Create welcome notification if first login
            if (!localStorage.getItem(`welcomed_${parsedUser.email}`)) {
                createWelcomeNotifications(parsedUser.email);
            }
        }
        
        setLoading(false);
    }, []);

    // Create welcome notifications for new users
    const createWelcomeNotifications = async (email) => {
        try {
            // Create welcome notification
            await sendNotification(
                email,
                "Welcome to Matchbook! We're excited to have you join our community. Start by exploring available volunteer opportunities or completing your profile.",
                "welcome"
            );
            
            // Create a tip notification
            await sendNotification(
                email,
                "Tip: Fill out your skills and availability in your profile to get better matches for volunteer opportunities.",
                "general"
            );
            
            // Mark that we've welcomed this user
            localStorage.setItem(`welcomed_${email}`, 'true');
        } catch (error) {
            console.error("Error creating welcome notifications:", error);
        }
    };

    const login = (userData, authToken) => {
        // Store user and token in state
        setUser(userData);
        setToken(authToken);
        
        // Store in localStorage for persistence
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("token", authToken);
        
        // Set axios default header for all future requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;

        // Create welcome notification if first login
        if (!localStorage.getItem(`welcomed_${userData.email}`)) {
            createWelcomeNotifications(userData.email);
        }
    };

    const logout = () => {
        // Clear user and token
        setUser(null);
        setToken(null);
        
        // Remove from localStorage
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        
        // Clear authorization header
        delete axios.defaults.headers.common['Authorization'];
    };

    // Check if user is authenticated
    const isAuthenticated = () => {
        // First check component state
        if (user && token) {
            return true;
        }
        
        // If not in state, check localStorage (useful during page reloads)
        const storedUser = localStorage.getItem("user");
        const storedToken = localStorage.getItem("token");
        return storedUser && storedToken ? true : false;
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            token, 
            loading,
            login, 
            logout,
            isAuthenticated 
        }}>
            {children}
        </AuthContext.Provider>
    );
};
