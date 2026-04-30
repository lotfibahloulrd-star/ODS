const baseUrl = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
const API_URL = baseUrl + '/api.php';

export const logService = {
    getLogs: async () => {
        try {
            const response = await fetch(`${API_URL}?action=get_logs`);
            if (!response.ok) throw new Error("API Unavailable");
            const logs = await response.json();
            return Array.isArray(logs) ? logs : [];
        } catch (e) {
            console.error("LogService: Error fetching logs", e);
            return [];
        }
    },

    saveLog: async (logData) => {
        try {
            const response = await fetch(`${API_URL}?action=save_log`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(logData)
            });
            return response.ok;
        } catch (e) {
            console.error("LogService: Error saving log", e);
            return false;
        }
    }
};
