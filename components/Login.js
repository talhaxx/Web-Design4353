import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "./AuthContext";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();

        // Retrieve user data from localStorage
        const storedUser = localStorage.getItem(`user_${email}`);

        if (!storedUser) {
            alert("User not found. Please sign up first.");
            return;
        }

        const userData = JSON.parse(storedUser);

        if (userData.password !== password) {
            alert("Incorrect password. Try again.");
            return;
        }

        login(userData.email, userData.role);

        // Redirect based on role
        if (userData.role === "admin") {
            navigate("/events");
        } else {
            navigate("/profile");
        }
    };

    return (
        <div style={{ textAlign: "center", padding: "20px" }}>
            <h2>Login</h2>
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
