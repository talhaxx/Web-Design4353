import React, { useState, useEffect } from "react";

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const storedNotifications = JSON.parse(localStorage.getItem("notifications")) || [];
        setNotifications(storedNotifications);
    }, []);

    const markAllAsRead = () => {
        setNotifications([]);
        localStorage.removeItem("notifications");
    };

    return (
        <div>
            <h2>Notifications</h2>
            {notifications.length === 0 ? (
                <p>No new notifications</p>
            ) : (
                <div>
                    <ul>
                        {notifications.map((notif, index) => (
                            <li key={index}>{notif}</li>
                        ))}
                    </ul>
                    <button onClick={markAllAsRead}>Mark All as Read</button>
                </div>
            )}
        </div>
    );
};

export default Notifications;

