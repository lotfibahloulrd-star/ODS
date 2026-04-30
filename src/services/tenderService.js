import { logService } from './logService';

const baseUrl = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
const API_URL = baseUrl + '/api.php';

export const tenderService = {
    getAllTenders: async () => {
        try {
            const response = await fetch(`${API_URL}?action=get_tenders`);
            if (!response.ok) throw new Error("API Unavailable");
            const data = await response.json();
            return Array.isArray(data) ? data : [];
        } catch (e) {
            console.error("TenderService: Error fetching tenders", e);
            return [];
        }
    },

    saveTender: async (tenderData, userName = "Inconnu") => {
        const tenders = await tenderService.getAllTenders();
        let newTender = { ...tenderData };
        
        if (!newTender.id) {
            newTender.id = Date.now().toString();
            newTender.createdAt = new Date().toISOString();
            tenders.unshift(newTender);
            await logService.saveLog({
                userName,
                action: "Nouveau CDC",
                details: `Nouvelle soumission créée pour ${newTender.organism || '??'} (Réf: ${newTender.refCdc || '-'})`,
                tenderId: newTender.id
            });
        } else {
            const index = tenders.findIndex(t => t.id === newTender.id);
            if (index !== -1) {
                tenders[index] = newTender;
                await logService.saveLog({
                    userName,
                    action: "Mise à jour CDC",
                    details: `Mise à jour du CDC ${newTender.refCdc || newTender.id}`,
                    tenderId: newTender.id
                });
            }
        }

        try {
            const response = await fetch(`${API_URL}?action=save_tenders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(tenders)
            });
            return response.ok ? newTender : null;
        } catch (e) {
            console.error("TenderService: Error saving tenders", e);
            return null;
        }
    },

    deleteTender: async (id, userName = "Inconnu") => {
        const tenders = await tenderService.getAllTenders();
        const filtered = tenders.filter(t => t.id !== id);
        if (filtered.length === tenders.length) return false;

        await logService.saveLog({
            userName,
            action: "Suppression CDC",
            details: `Suppression du CDC ID: ${id}`
        });

        try {
            const response = await fetch(`${API_URL}?action=save_tenders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(filtered)
            });
            return response.ok;
        } catch (e) {
            return false;
        }
    },

    saveFile: async (tenderId, storageKey, file, fileName) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('orderId', tenderId);
        formData.append('storageKey', storageKey);
        formData.append('fileName', fileName);
        formData.append('type', 'tender');

        try {
            const response = await fetch(`${API_URL}?action=upload_file`, {
                method: 'POST',
                body: formData
            });
            return await response.json();
        } catch (e) {
            console.error("TenderService: Error uploading file", e);
            return { success: false };
        }
    },

    getFileUrl: (tenderId, storageKey) => {
        return `${API_URL}?action=get_file&orderId=${tenderId}&storageKey=${storageKey}&type=tender`;
    }
};
