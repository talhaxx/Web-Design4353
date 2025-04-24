import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import { loginUser } from "../services/api";
import "./Login.css";

const AdminLogin = () => {
    const [email, setEmail] = useState("admin@matchbook.com");
    const [password, setPassword] = useState("admin123");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [debug, setDebug] = useState("");
    const { login, isAuthenticated } = useContext(AuthContext);
    const navigate = useNavigate();

    // Redirect if already logged in
    useEffect(() => {
        console.log("AdminLogin - Checking authentication status");
        const user = JSON.parse(localStorage.getItem("user"));
        console.log("AdminLogin - User in localStorage:", user);
        
        if (isAuthenticated()) {
            console.log("AdminLogin - User is authenticated, role:", user?.role);
            
            if (user && user.role === "admin") {
                console.log("AdminLogin - Redirecting admin to /events/manage");
                navigate("/events/manage");
            } else {
                // If logged in but not admin, redirect to login
                console.log("AdminLogin - User is not admin, clearing auth and showing error");
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                setError("You need admin privileges to access this page");
            }
        } else {
            console.log("AdminLogin - User is not authenticated");
        }
    }, [isAuthenticated, navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setDebug("");
        setIsLoading(true);

        if (!email.trim() || !password) {
            setError("Email and password are required");
            setIsLoading(false);
            return;
        }

        try {
            // Log the request being made
            setDebug(`Attempting to login with email: ${email}`);
            
            // Make API request with explicit timeout
            const response = await loginUser(email, password);
            
            setDebug(prev => `${prev}\nAPI Response received: ${JSON.stringify(response.data)}`);
            
            if (response.data && response.data.token && response.data.user) {
                // Verify the user is an admin
                if (response.data.user.role !== "admin") {
                    setError("You do not have admin privileges");
                    setDebug(prev => `${prev}\nUser role: ${response.data.user.role} - Expected: admin`);
                    setIsLoading(false);
                    return;
                }
                
                // Save admin login to context and localStorage
                login(response.data.user, response.data.token);
                setDebug(prev => `${prev}\nLogin successful, redirecting to /events/manage`);
                
                // Add a small delay to ensure state updates before redirect
                setTimeout(() => {
                    navigate("/events/manage");
                }, 100);
            } else {
                setError("Invalid server response");
                setDebug(prev => `${prev}\nUnexpected login response format: ${JSON.stringify(response.data)}`);
                console.error("Unexpected login response:", response);
            }
        } catch (err) {
            console.error("Login error:", err);
            
            if (err.response) {
                setError(err.response.data?.message || "Login failed");
                setDebug(prev => `${prev}\nAPI Error ${err.response.status}: ${JSON.stringify(err.response.data)}`);
            } else if (err.request) {
                setError("No response from server. Please check your connection.");
                setDebug(prev => `${prev}\nNo response from server. Request: ${JSON.stringify(err.request)}`);
                setDebug(prev => `${prev}\nAPI URL: ${err.config?.url}`);
            } else {
                setError(`Login failed: ${err.message}`);
                setDebug(prev => `${prev}\nError: ${err.message}`);
            }
            
            // Additional debugging for network errors
            if (err.code === 'ECONNREFUSED') {
                setDebug(prev => `${prev}\nConnection refused. Is your backend server running at http://localhost:5001?`);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container admin-login">
            <div className="login-form-container">
                <h2>Admin Login</h2>
                <p className="admin-subtitle">Restricted Area - Staff Only</p>
                {error && <p className="error-message">{error}</p>}
                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input 
                            id="email"
                            type="email" 
                            placeholder="Admin Email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input 
                            id="password"
                            type="password" 
                            placeholder="Admin Password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                        />
                    </div>
                    <button 
                        type="submit" 
                        className="login-button admin-login-button" 
                        disabled={isLoading}
                    >
                        {isLoading ? "Logging in..." : "Admin Login"}
                    </button>
                </form>
                <p className="admin-note">
                    Not an admin? <a href="/login">Go to regular login</a>
                </p>
                
                {debug && (
                    <div className="debug-info">
                        <h4>Debug Information</h4>
                        <pre>{debug}</pre>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminLogin; 