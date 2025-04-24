import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import { fetchNotifications } from "../services/api";
import "./NavBar.css";

const NavBar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [unreadCount, setUnreadCount] = useState(0);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Fetch notification count
    useEffect(() => {
        const getNotificationCount = async () => {
            if (user && user.email) {
                try {
                    // Use the getUnreadNotificationsCount helper instead of processing here
                    const response = await fetchNotifications(user.email);
                    const unread = response.data.filter(notification => !notification.IsRead).length;
                    setUnreadCount(unread);
                } catch (error) {
                    console.error("Error fetching notifications:", error);
                }
            }
        };

        getNotificationCount();
        // Set up poll for notifications every 10 seconds
        const interval = setInterval(getNotificationCount, 10000);
        return () => clearInterval(interval);
    }, [user]);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    // Check if the current path matches the link
    const isActive = (path) => {
        return location.pathname === path;
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <div className="navbar-logo">
                    <Link to="/">
                        <span className="logo-text">Matchbook</span>
                    </Link>
                </div>

                <div className="mobile-menu-button" onClick={toggleMobileMenu}>
                    <span></span>
                    <span></span>
                    <span></span>
                </div>

                <div className={`navbar-links ${mobileMenuOpen ? 'active' : ''}`}>
                    {/* Home Link for all users */}
                    <Link 
                        to="/" 
                        className={isActive("/") ? "active" : ""}
                    >
                        Home
                    </Link>
                    
                    {user ? (
                        <>
                            {/* Regular User Links */}
                            {user.role !== "admin" && (
                                <>
                                    <Link 
                                        to="/profile" 
                                        className={isActive("/profile") ? "active" : ""}
                                    >
                                        Profile
                                    </Link>
                                    <Link 
                                        to="/opportunities" 
                                        className={isActive("/opportunities") ? "active" : ""}
                                    >
                                        Opportunities
                                    </Link>
                                    <Link 
                                        to="/history" 
                                        className={isActive("/history") ? "active" : ""}
                                    >
                                        My Volunteer History
                                    </Link>
                                </>
                            )}

                            {/* Admin Links */}
                            {user.role === "admin" && (
                                <>
                                    <Link 
                                        to="/events/manage" 
                                        className={isActive("/events/manage") ? "active" : ""}
                                    >
                                        Event Management
                                    </Link>
                                    <Link 
                                        to="/match-volunteers" 
                                        className={isActive("/match-volunteers") ? "active" : ""}
                                    >
                                        Match & Assign
                                    </Link>
                                    <Link 
                                        to="/volunteers" 
                                        className={isActive("/volunteers") ? "active" : ""}
                                    >
                                        Volunteer History
                                    </Link>
                                </>
                            )}

                            {/* Common Links for both user types */}
                            <Link 
                                to="/notifications" 
                                className={`notification-link ${isActive("/notifications") ? "active" : ""}`}
                            >
                                Notifications
                                {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
                            </Link>
                            
                            <button onClick={handleLogout} className="logout-button">
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link 
                                to="/login" 
                                className={isActive("/login") ? "active" : ""}
                            >
                                Login
                            </Link>
                            <Link 
                                to="/signup" 
                                className={`signup-link ${isActive("/signup") ? "active" : ""}`}
                            >
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default NavBar;
