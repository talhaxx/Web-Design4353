import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";

const NavBar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <nav style={{ display: "flex", justifyContent: "space-around", padding: "10px", backgroundColor: "#90ee90" }}>
            {user ? (
                <>
                    <Link to="/profile">Profile</Link>
                    <Link to="/history">Volunteer History</Link>
                    <Link to="/notifications">Notifications</Link>

                    {/* Show these links only if user is an admin */}
                    {user.role === "admin" && (
                        <>
                            <Link to="/events">Event Management</Link>
                            <Link to="/match-volunteers">Volunteer Matching</Link>
                        </>
                    )}
                    
                    <button onClick={handleLogout}>Logout</button>
                </>
            ) : (
                <>
                    <Link to="/login">Login</Link>
                    <Link to="/register">Sign Up</Link>
                </>
            )}
        </nav>
    );
};

export default NavBar;
