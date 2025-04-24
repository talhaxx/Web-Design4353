import React, { useContext } from "react"; // ✅ Import useContext from React
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom"; // ✅ Import Router components
import { AuthProvider, AuthContext } from "./components/AuthContext";
import NavBar from "./components/NavBar";
import Register from "./components/Register";
import Profile from "./components/Profile";
import EventManagement from "./components/EventManagement";
import VolunteerMatching from "./components/VolunteerMatching";
import VolunteerHistory from "./components/VolunteerHistory";
import Notifications from "./components/Notifications";
import Login from "./components/Login";
import AdminLogin from "./components/AdminLogin";
import Opportunities from "./components/Opportunities";
import Home from "./components/Home";

const ProtectedRoute = ({ children, adminOnly }) => {
    const { user } = useContext(AuthContext);

    if (!user) return <Navigate to="/login" />;

    // Prevent volunteers from accessing admin-only pages
    if (adminOnly && user.role !== "admin") return <Navigate to="/profile" />;

    return children;
};

// NavBar wrapper component that decides when to show the navbar
const NavBarWrapper = () => {
    const { user } = useContext(AuthContext);
    const location = useLocation();
    
    // Only show NavBar when user is logged in OR not on the home page
    const showNavBar = user || location.pathname !== "/";
    
    return showNavBar ? <NavBar /> : null;
};

const EventsRedirect = () => {
    const { user } = useContext(AuthContext);

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (user.role === "admin") {
        return <Navigate to="/events/manage" replace />;
    } else {
        return <Navigate to="/opportunities" replace />;
    }
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <AuthContext.Consumer>
                    {() => <NavBarWrapper />}
                </AuthContext.Consumer>

                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/signup" element={<Register />} />
                    <Route path="/admin" element={<AdminLogin />} />
                    
                    {/* Protected routes for all users */}
                    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                    <Route path="/opportunities" element={<ProtectedRoute><Opportunities /></ProtectedRoute>} />
                    <Route path="/history" element={<ProtectedRoute><VolunteerHistory /></ProtectedRoute>} />
                    <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
                    
                    {/* Admin-only routes */}
                    <Route path="/events/manage" element={<ProtectedRoute adminOnly><EventManagement /></ProtectedRoute>} />
                    <Route path="/match-volunteers" element={<ProtectedRoute adminOnly><VolunteerMatching /></ProtectedRoute>} />
                    <Route path="/volunteers" element={<ProtectedRoute adminOnly><VolunteerHistory /></ProtectedRoute>} />
                    
                    {/* Redirect routes */}
                    <Route 
                        path="/events" 
                        element={
                            <EventsRedirect />
                        } 
                    />
                    
                    {/* Home route */}
                    <Route path="/" element={<Home />} />
                    
                    {/* Fallback route - redirect any undefined routes to home */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
