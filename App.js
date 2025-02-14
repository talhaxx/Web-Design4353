import React, { useContext } from "react"; // ✅ Import useContext from React
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"; // ✅ Import Router components
import { AuthProvider, AuthContext } from "./components/AuthContext";
import NavBar from "./components/NavBar";
import Register from "./components/Register";
import Profile from "./components/Profile";
import EventManagement from "./components/EventManagement";
import VolunteerMatching from "./components/VolunteerMatching";
import VolunteerHistory from "./components/VolunteerHistory";
import Notifications from "./components/Notifications";
import Login from "./components/Login";


const ProtectedRoute = ({ children, adminOnly }) => {
    const { user } = useContext(AuthContext);

    if (!user) return <Navigate to="/login" />;

    // Prevent volunteers from accessing admin-only pages
    if (adminOnly && user.role !== "admin") return <Navigate to="/profile" />;

    return children;
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <AuthContext.Consumer>
                    {({ user }) => user && <NavBar />}
                </AuthContext.Consumer>

                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                    <Route path="/history" element={<ProtectedRoute><VolunteerHistory /></ProtectedRoute>} />
                    <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
                    <Route path="/events" element={<ProtectedRoute adminOnly><EventManagement /></ProtectedRoute>} />
                    <Route path="/match-volunteers" element={<ProtectedRoute adminOnly><VolunteerMatching /></ProtectedRoute>} />
                    <Route path="/" element={<Navigate to="/login" />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
