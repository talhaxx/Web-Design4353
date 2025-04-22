import React, { useState, useContext, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import { loginUser } from "../services/api";
import "./Login.css";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { login, isAuthenticated } = useContext(AuthContext);
    const navigate = useNavigate();

    // If already logged in, redirect to appropriate page
    useEffect(() => {
        if (isAuthenticated()) {
            const user = JSON.parse(localStorage.getItem("user"));
            if (user && user.role === "admin") {
                navigate("/events");
            } else {
                navigate("/profile");
            }
        }
    }, [isAuthenticated, navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        // Basic form validation
        if (!email.trim() || !password) {
            setError("Email and password are required");
            setIsLoading(false);
            return;
        }

        try {
            const response = await loginUser(email, password);
            
            // Check if response has the expected data structure
            if (response.data && response.data.token && response.data.user) {
                // Call login function from context with user data and token
                login(response.data.user, response.data.token);
                
                // Redirect based on role
                if (response.data.user.role === "admin") {
                    navigate("/events");
                } else {
                    navigate("/profile");
                }
            } else {
                // Handle unexpected response format
                setError("Invalid server response");
                console.error("Unexpected login response format:", response);
            }
        } catch (err) {
            // Handle error with more detail
            if (err.response) {
                // Server responded with error
                setError(err.response.data?.message || "Login failed");
                console.error("Login error:", err.response.data);
            } else if (err.request) {
                // No response received
                setError("No response from server. Please check your connection.");
                console.error("Login request error:", err.request);
            } else {
                // Other error
                setError("Login failed. Please try again.");
                console.error("Login error:", err.message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-form-container">
                <h2>Login to Matchbook</h2>
                {error && <p className="error-message">{error}</p>}
                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input 
                            id="email"
                            type="email" 
                            placeholder="Enter your email" 
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
                            placeholder="Enter your password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                        />
                    </div>
                    <button 
                        type="submit" 
                        className="login-button" 
                        disabled={isLoading}
                    >
                        {isLoading ? "Logging in..." : "Login"}
                    </button>
                </form>
                <p className="register-link">
                    Don't have an account? <Link to="/register">Sign up here</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
