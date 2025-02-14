import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";

const Register = () => {
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);
    
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleRegistration = (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        // Automatically assign admin role if email is 'admin@gmail.com'
        const role = email === "admin@gmail.com" ? "admin" : "volunteer";

        const userData = { email, password, role };

        // Store user data (this simulates a database)
        localStorage.setItem(`user_${email}`, JSON.stringify(userData));

        // Log in immediately after registration
        login(email, role);

        // Redirect based on role
        if (role === "admin") {
            navigate("/events");
        } else {
            navigate("/profile");
        }
    };

    return (
        <div style={{ textAlign: "center", padding: "20px" }}>
            <h2>Sign Up</h2>
            <form onSubmit={handleRegistration}>
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
                <input 
                    type="password" 
                    placeholder="Confirm Password" 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    required 
                />
                <button type="submit">Sign Up</button>
            </form>
        </div>
    );
};

export default Register;
