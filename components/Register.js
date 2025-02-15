import { useState } from "react";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold mb-6">Sign Up</h2>
      <form className="bg-white p-6 rounded-lg shadow-md w-96">
        <label className="block text-gray-700 mb-1">Email</label>
        <input type="email" className="border rounded p-2 w-full mb-3" value={email} onChange={(e) => setEmail(e.target.value)} />

        <label className="block text-gray-700 mb-1">Password</label>
        <input type="password" className="border rounded p-2 w-full mb-3" value={password} onChange={(e) => setPassword(e.target.value)} />

        <label className="block text-gray-700 mb-1">Confirm Password</label>
        <input type="password" className="border rounded p-2 w-full mb-3" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />

        <button className="bg-green-500 text-white px-4 py-2 rounded w-full">Sign Up</button>
      </form>
    </div>
  );
}

export default Register;
