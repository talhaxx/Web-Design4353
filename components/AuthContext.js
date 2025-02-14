import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        // Retrieve user data from localStorage if available
        const storedUser = localStorage.getItem("user");
        return storedUser ? JSON.parse(storedUser) : null;
    });

    const login = (email, role) => {
        const userData = { email, role };
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData)); // Save user in localStorage
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("user"); // Remove user from localStorage
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
