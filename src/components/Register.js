import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/api"; // Import API function

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const response = await registerUser(email, password);
      alert(response.data.message); // Show success message
      navigate("/login"); // Redirect to login page
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold mb-6">Sign Up</h2>
      {error && <p className="error-text">{error}</p>}
      <form className="bg-white p-6 rounded-lg shadow-md w-96" onSubmit={handleRegister}>
        <label className="block text-gray-700 mb-1">Email</label>
        <input type="email" className="border rounded p-2 w-full mb-3" value={email} onChange={(e) => setEmail(e.target.value)} required />

        <label className="block text-gray-700 mb-1">Password</label>
        <input type="password" className="border rounded p-2 w-full mb-3" value={password} onChange={(e) => setPassword(e.target.value)} required />

        <label className="block text-gray-700 mb-1">Confirm Password</label>
        <input type="password" className="border rounded p-2 w-full mb-3" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />

        <button className="bg-green-500 text-white px-4 py-2 rounded w-full" type="submit">Sign Up</button>
      </form>
    </div>
  );
}

export default Register;
