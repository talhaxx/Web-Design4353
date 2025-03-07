import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import { loginUser } from "../services/api";
 // Import API function

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const response = await loginUser(email, password);
            login(response.data.user.email, response.data.user.role);
            
            // Redirect based on role
            if (response.data.user.role === "admin") {
                navigate("/events");
            } else {
                navigate("/profile");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Login failed");
        }
    };

    return (
        <div style={{ textAlign: "center", padding: "20px" }}>
            <h2>Login</h2>
            {error && <p className="error-text">{error}</p>}
            <form onSubmit={handleLogin}>
                <input 
                    type="email" 
                    placeholder="Email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                />
                <input 
                    type="password" 
                    placeholder="Password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                />
                <button type="submit">Login</button>
            </form>
            <p>Don't have an account? <Link to="/register">Sign up here</Link></p>
        </div>
    );
};

export default Login;
