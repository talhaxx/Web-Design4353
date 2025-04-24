import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../services/api";
import "./Register.css";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Basic validation
    if (!email.includes("@")) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const response = await registerUser(email, password);
      // Redirect to profile completion
      navigate("/profile", { 
        state: { 
          newUser: true, 
          message: "Account created successfully! Please complete your profile." 
        } 
      });
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <div className="logo-placeholder">
            <span>MB</span>
          </div>
          <h1>Join Matchbook</h1>
          <p className="tagline">Connect with volunteer opportunities that match your skills and interests</p>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <form className="register-form" onSubmit={handleRegister}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input 
              id="email"
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="you@example.com"
              required 
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input 
              id="password"
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="Create a secure password"
              required 
              className="form-control"
            />
            <small>Must be at least 6 characters</small>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input 
              id="confirmPassword"
              type="password" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              placeholder="Confirm your password"
              required 
              className="form-control"
            />
          </div>

          <button 
            type="submit" 
            className="register-button" 
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
          
          <div className="login-link">
            Already have an account? <Link to="/login">Sign in</Link>
          </div>
        </form>
      </div>
      
      <div className="illustration-panel">
        <div className="illustration-content">
          <h2>Make a Difference</h2>
          <p>Join our community of volunteers and find opportunities that match your skills and interests. Together, we can make a positive impact.</p>
          <ul className="benefits-list">
            <li>⭐ Match with events based on your skills</li>
            <li>📱 Get notifications for new opportunities</li>
            <li>📊 Track your volunteer history</li>
            <li>🤝 Connect with other volunteers</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Register;
