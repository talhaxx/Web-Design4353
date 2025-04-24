import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "./AuthContext";
import { fetchNotifications, fetchEvents, markNotificationRead, sendNotification } from "../services/api";
import "./Notifications.css";

const Notifications = () => {
    const { user } = useContext(AuthContext);
    const [notifications, setNotifications] = useState([]);
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        const loadNotifications = async () => {
            setLoading(true);
            try {
                // Load notifications from localStorage
                if (user && user.email) {
                    const response = await fetchNotifications(user.email);
                    if (response.data) {
                        setNotifications(response.data);
                    }
                }
                
                // Load upcoming events
                try {
                    const eventsResponse = await fetchEvents();
                    if (eventsResponse.data && Array.isArray(eventsResponse.data)) {
                        // Filter for upcoming events (next 7 days)
                        const now = new Date();
                        const nextWeek = new Date();
                        nextWeek.setDate(now.getDate() + 7);
                        
                        const upcoming = eventsResponse.data.filter(event => {
                            const eventDate = new Date(event.EventDate);
                            return eventDate >= now && eventDate <= nextWeek;
                        });
                        
                        setUpcomingEvents(upcoming);
                    }
                } catch (eventErr) {
                    console.error("Error loading events:", eventErr);
                    // Don't set error just for events
                }
            } catch (err) {
                console.error("Error loading notifications:", err);
                setError("Failed to load notifications");
            } finally {
                setLoading(false);
            }
        };
        
        loadNotifications();
    }, [user]);

    const markAsRead = async (notificationId) => {
        try {
            await markNotificationRead(notificationId);
            
            setNotifications(prevNotifications => 
                prevNotifications.map(notif => 
                    notif.NotificationID === notificationId ? { ...notif, IsRead: true } : notif
                )
            );
        } catch (err) {
            console.error("Error marking notification as read:", err);
        }
    };

    const markAllAsRead = async () => {
        try {
            if (user && user.email) {
                // Get all notification IDs
                const notificationIds = notifications.filter(n => !n.IsRead).map(n => n.NotificationID);
                
                // Mark each notification as read
                for (const id of notificationIds) {
                    await markNotificationRead(id);
                }
                
                // Update state
                setNotifications(prevNotifications => 
                    prevNotifications.map(notif => ({ ...notif, IsRead: true }))
                );
                
                setSuccessMessage("All notifications marked as read");
                setTimeout(() => setSuccessMessage(""), 3000);
            }
        } catch (err) {
            console.error("Error marking all notifications as read:", err);
            setError("Failed to mark all as read");
            setTimeout(() => setError(""), 3000);
        }
    };
    
    // Function to create sample notifications for testing
    const createSampleNotifications = async () => {
        if (!user || !user.email) return;
        
        try {
            setLoading(true);
            
            // Sample notification messages
            const sampleNotifications = [
                { message: "Welcome to Matchbook! Your profile has been created successfully.", type: "welcome" },
                { message: "You have been matched with the 'Community Garden Cleanup' event based on your skills.", type: "match" },
                { message: "Reminder: You have an upcoming event on " + new Date().toLocaleDateString(), type: "reminder" },
                { message: "Your volunteer application has been approved. Thank you for your commitment!", type: "approval" }
            ];
            
            // Create each notification
            for (const notif of sampleNotifications) {
                await sendNotification(user.email, notif.message, notif.type);
            }
            
            // Reload notifications
            const response = await fetchNotifications(user.email);
            if (response.data) {
                setNotifications(response.data);
            }
            
            setSuccessMessage("Sample notifications created");
            setTimeout(() => setSuccessMessage(""), 3000);
        } catch (err) {
            console.error("Error creating sample notifications:", err);
            setError("Failed to create sample notifications");
            setTimeout(() => setError(""), 3000);
        } finally {
            setLoading(false);
        }
    };
    
    // Format date for display
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="notifications-page">
            <h2 className="notifications-title">Notifications</h2>
            
            {error && <div className="error-message">{error}</div>}
            {successMessage && <div className="success-message">{successMessage}</div>}
            
            {loading ? (
                <p className="loading-text">Loading notifications...</p>
            ) : (
                <div className="notifications-content">
                    {/* Sample Notifications Button */}
                    {notifications.length === 0 && (
                        <div className="sample-button-container">
                            <button 
                                className="sample-notifications-btn"
                                onClick={createSampleNotifications}
                                disabled={loading}
                            >
                                Create Sample Notifications
                            </button>
                            <p className="sample-hint">No notifications yet. Click the button above to create sample notifications for demonstration.</p>
                        </div>
                    )}
                
                    {/* Upcoming Events Section */}
                    <div className="notifications-section">
                        <h3 className="section-title">Upcoming Events</h3>
                        {upcomingEvents.length === 0 ? (
                            <p className="no-notifications">No upcoming events in the next 7 days</p>
                        ) : (
                            <div className="notifications-list">
                                {upcomingEvents.map(event => (
                                    <div key={event.EventID} className="notification-card upcoming-event">
                                        <div className="notification-header">
                                            <h4>{event.EventName}</h4>
                                            <span className="notification-date">{formatDate(event.EventDate)}</span>
                                        </div>
                                        <p className="notification-message">
                                            <strong>Location:</strong> {event.Location}<br />
                                            <strong>Skills:</strong> {event.RequiredSkills}<br />
                                            <strong>Urgency Level:</strong> {event.Urgency}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    {/* Recent Notifications Section */}
                    <div className="notifications-section">
                        <div className="section-header">
                            <h3 className="section-title">Recent Notifications</h3>
                            {notifications.length > 0 && (
                                <button 
                                    className="mark-all-read-btn"
                                    onClick={markAllAsRead}
                                >
                                    Mark all as read
                                </button>
                            )}
                        </div>
                        
                        {notifications.length === 0 ? (
                            <p className="no-notifications">No new notifications</p>
                        ) : (
                            <div className="notifications-list">
                                {notifications.map(notification => (
                                    <div 
                                        key={notification.NotificationID} 
                                        className={`notification-card ${!notification.IsRead ? 'unread' : ''} ${notification.Type}`}
                                        onClick={() => markAsRead(notification.NotificationID)}
                                    >
                                        <div className="notification-header">
                                            <span className="notification-type">
                                                {notification.Type === "match" ? "Match" : 
                                                 notification.Type === "reminder" ? "Reminder" : 
                                                 notification.Type === "approval" ? "Approval" :
                                                 notification.Type === "welcome" ? "Welcome" : 
                                                 notification.Type === "interest" ? "Interest" :
                                                 notification.Type === "volunteer-interest" ? "Volunteer Interest" :
                                                 "Notification"}
                                            </span>
                                            <span className="notification-date">
                                                {formatDate(notification.CreatedAt)}
                                            </span>
                                        </div>
                                        <p className="notification-message">{notification.Message}</p>
                                        {!notification.IsRead && (
                                            <span className="unread-indicator"></span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Notifications;

