const baseUrl = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
const API_URL = baseUrl + '/api.php';

export const messageService = {
    getMessages: async () => {
        try {
            const response = await fetch(`${API_URL}?action=get_messages`);
            if (!response.ok) throw new Error("API Unavailable");
            const messages = await response.json();
            return Array.isArray(messages) ? messages : [];
        } catch (e) {
            const local = localStorage.getItem('ods_messages');
            return local ? JSON.parse(local) : [];
        }
    },

    saveMessage: async (messageData) => {
        const messages = await messageService.getMessages();
        const newMessage = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            readBy: [],
            ...messageData
        };
        messages.push(newMessage);
        
        try {
            await fetch(`${API_URL}?action=save_messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(messages)
            });
            localStorage.setItem('ods_messages', JSON.stringify(messages));
        } catch (e) {
            localStorage.setItem('ods_messages', JSON.stringify(messages));
        }
        return newMessage;
    },

    markAsRead: async (messageId, userEmail) => {
        const messages = await messageService.getMessages();
        const msg = messages.find(m => m.id === messageId);
        if (msg && !msg.readBy.includes(userEmail)) {
            msg.readBy.push(userEmail);
            try {
                await fetch(`${API_URL}?action=save_messages`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(messages)
                });
                localStorage.setItem('ods_messages', JSON.stringify(messages));
            } catch (e) {
                localStorage.setItem('ods_messages', JSON.stringify(messages));
            }
        }
    },

    markAllAsRead: async (userEmail) => {
        const messages = await messageService.getMessages();
        let changed = false;
        messages.forEach(msg => {
            if (!msg.readBy.includes(userEmail)) {
                msg.readBy.push(userEmail);
                changed = true;
            }
        });
        if (changed) {
            try {
                await fetch(`${API_URL}?action=save_messages`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(messages)
                });
                localStorage.setItem('ods_messages', JSON.stringify(messages));
            } catch (e) {
                localStorage.setItem('ods_messages', JSON.stringify(messages));
            }
        }
    }
};
