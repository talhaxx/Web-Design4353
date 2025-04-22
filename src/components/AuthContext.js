import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    // Initialize auth state from localStorage
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        const storedToken = localStorage.getItem("token");
        
        if (storedUser && storedToken) {
            setUser(JSON.parse(storedUser));
            setToken(storedToken);
            
            // Set axios default authorization header
            axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        }
        
        setLoading(false);
    }, []);

    const login = (userData, authToken) => {
        // Store user and token in state
        setUser(userData);
        setToken(authToken);
        
        // Store in localStorage for persistence
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("token", authToken);
        
        // Set axios default header for all future requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
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
        return !!user && !!token;
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
