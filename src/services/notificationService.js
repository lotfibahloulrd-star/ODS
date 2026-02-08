export const notificationService = {
    getNotifications: (userEmail) => {
        const all = JSON.parse(localStorage.getItem('ods_notifications') || '[]');
        return all.filter(n => n.to.includes('all') || n.to.includes(userEmail));
    },

    addNotification: (message, type, to = ['all'], orderId = null) => {
        const notifications = JSON.parse(localStorage.getItem('ods_notifications') || '[]');
        const newNotif = {
            id: Date.now(),
            message,
            type,
            to,
            orderId,
            timestamp: new Date().toISOString(),
            readBy: []
        };
        notifications.unshift(newNotif);
        // Keep only last 50
        localStorage.setItem('ods_notifications', JSON.stringify(notifications.slice(0, 50)));
    },

    markAsRead: (id, userEmail) => {
        const notifications = JSON.parse(localStorage.getItem('ods_notifications') || '[]');
        const notif = notifications.find(n => n.id === id);
        if (notif && !notif.readBy.includes(userEmail)) {
            notif.readBy.push(userEmail);
            localStorage.setItem('ods_notifications', JSON.stringify(notifications));
        }
    }
};
