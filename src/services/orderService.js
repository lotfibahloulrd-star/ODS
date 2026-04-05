import { INITIAL_ORDERS } from './initialData';
import { notificationService } from './notificationService';

const baseUrl = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
const API_URL = baseUrl + '/api.php';

export const orderService = {
    _cleanupLegacyStorage: () => {
        const suspiciousKeys = ['ods_files', 'ods_contracts', 'ods_documents', 'ods_pdfs', 'files', 'pdf'];
        suspiciousKeys.forEach(key => localStorage.removeItem(key));
    },

    _getDeletedIds: async () => {
        try {
            const response = await fetch(`${API_URL}?action=get_deleted_ids`);
            if (response.ok) {
                const ids = await response.json();
                if (Array.isArray(ids)) return ids;
            }
        } catch (e) { }
        const local = localStorage.getItem('ods_deleted_ids');
        return local ? JSON.parse(local) : [];
    },

    _saveDeletedIds: async (ids) => {
        localStorage.setItem('ods_deleted_ids', JSON.stringify(ids));
        try {
            await fetch(`${API_URL}?action=save_deleted_ids`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(ids)
            });
        } catch (e) { }
    },

    getAllOrders: async () => {
        try {
            const response = await fetch(`${API_URL}?action=get_orders`);
            if (!response.ok) throw new Error("API Unavailable");
            let sharedOrders = await response.json();

            const deletedIds = await orderService._getDeletedIds();
            const deletedSet = new Set(deletedIds);

            // Si le serveur contient moins d'ODS que notre liste initiale, ou si la version a changé, on injecte tout
            const DATA_VERSION = 'ods_data_v39';
            const localVersion = localStorage.getItem('ods_data_version');

            if (!Array.isArray(sharedOrders) || localVersion !== DATA_VERSION) {
                console.log("Mise à jour structurée des données (Version " + DATA_VERSION + ")...");

                const mergedMap = new Map();

                // 1. Charger tout ce qui vient du serveur d'abord (données réelles des utilisateurs)
                if (Array.isArray(sharedOrders)) {
                    sharedOrders.forEach(o => mergedMap.set(o.id, o));
                }

                // 2. ÉCRASER les ordres initiaux par les nouvelles définitions
                INITIAL_ORDERS.forEach(o => {
                    if (deletedSet.has(o.id)) return;
                    const existing = mergedMap.get(o.id);
                    if (existing) {
                        mergedMap.set(o.id, { ...o, ...existing });
                    } else {
                        mergedMap.set(o.id, o);
                    }
                });

                const finalOrders = Array.from(mergedMap.values())
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                await orderService._saveAllToShared(finalOrders);
                localStorage.setItem('ods_data_version', DATA_VERSION);
                return finalOrders;
            }

            return sharedOrders.filter(o => !deletedSet.has(o.id));
        } catch (e) {
            const DATA_VERSION = 'ods_data_v39';
            const localData = localStorage.getItem(DATA_VERSION);
            const deletedLocal = localStorage.getItem('ods_deleted_ids');
            const deletedSet = new Set(deletedLocal ? JSON.parse(deletedLocal) : []);
            const orders = localData ? JSON.parse(localData) : INITIAL_ORDERS;
            return orders.filter(o => !deletedSet.has(o.id));
        }
    },

    _saveAllToShared: async (orders) => {
        const DATA_VERSION = 'ods_data_v39';
        try {
            await fetch(`${API_URL}?action=save_orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orders)
            });
            localStorage.setItem(DATA_VERSION, JSON.stringify(orders));
        } catch (e) {
            localStorage.setItem(DATA_VERSION, JSON.stringify(orders));
        }
    },

    createOrder: async (orderData) => {
        const orders = await orderService.getAllOrders();
        const newOrder = {
            id: Date.now().toString(),
            status: 'En cours',
            createdAt: new Date().toISOString(),
            importStatus: { authImport: null, importLaunched: false, estCustomsDate: '', domiciliationDate: '', clearedAt: '' },
            stockStatus: { reception: 'Aucune', receivedAt: '' },
            isReadyForDelivery: false,
            latePenalties: 0,
            bankDomiciliation: '',
            judicialProceedings: '',
            deliveryDate: null,
            files: {},
            ...orderData
        };
        orders.unshift(newOrder);
        await orderService._saveAllToShared(orders);
        return newOrder;
    },

    updateOrder: async (id, updates) => {
        const orders = await orderService.getAllOrders();
        const index = orders.findIndex(o => o.id === id);
        if (index === -1) return null;
        orders[index] = { ...orders[index], ...updates };
        await orderService._saveAllToShared(orders);

        // Notifications
        if (updates.authorization === 'Oui') {
            notificationService.addNotification(`Autorisation confirmée pour ${orders[index].client}`, 'success', ['all'], id);
        }
        if (updates.hasStopRequest === 'Oui') {
            notificationService.addNotification(`ODS d'arrêt : Prestation arrêtée pour ${orders[index].client}`, 'error', ['all'], id);
        }
        if (updates.deliveryDate) {
            notificationService.addNotification(`LIVRAISON CONFIRMÉE : ${orders[index].client} est livré !`, 'success', ['all'], id);
        }

        return orders[index];
    },

    deleteOrder: async (id) => {
        const orders = await orderService.getAllOrders();
        const filtered = orders.filter(o => o.id !== id);
        if (filtered.length === orders.length) return false;
        await orderService._saveAllToShared(filtered);

        const deletedIds = await orderService._getDeletedIds();
        if (!deletedIds.includes(id)) {
            deletedIds.push(id);
            await orderService._saveDeletedIds(deletedIds);
        }
        return true;
    },

    _uploadToShared: async (storageKey, orderId, fileDataOrBlob, fileName) => {
        try {
            let blob = fileDataOrBlob;

            if (typeof fileDataOrBlob === 'string' && fileDataOrBlob.startsWith('data:')) {
                const res = await fetch(fileDataOrBlob);
                blob = await res.blob();
            }

            const formData = new FormData();
            formData.append('file', blob);
            formData.append('orderId', orderId);
            formData.append('storageKey', storageKey);
            formData.append('fileName', fileName);

            const response = await fetch(`${API_URL}?action=upload_file`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(`Erreur serveur (${response.status}): ${text.substring(0, 100)}`);
            }

            const result = await response.json();
            if (!result.success) {
                throw new Error(result.message || "L'upload a échoué sur le serveur");
            }

            if (storageKey === 'storage_auth') {
                const orders = await orderService.getAllOrders();
                const order = orders.find(o => o.id === orderId);
                if (order) {
                    notificationService.addNotification(`Nouveau PDF d'Autorisation attaché pour ${order.client}`, 'info', ['all'], orderId);
                }
            }

            return true;
        } catch (e) {
            console.error("Shared Upload Failed:", e);
            throw e;
        }
    },

    saveOdsFile: async (orderId, fileData, fileName) => orderService._uploadToShared('storage_ods', orderId, fileData, fileName),
    saveContractFile: async (orderId, fileData, fileName) => orderService._uploadToShared('storage_contracts', orderId, fileData, fileName),
    saveStopRequestFile: async (orderId, fileData, fileName) => orderService._uploadToShared('storage_stops_req', orderId, fileData, fileName),
    saveStopResponseFile: async (orderId, fileData, fileName) => orderService._uploadToShared('storage_stops_res', orderId, fileData, fileName),
    saveAuthFile: async (orderId, fileData, fileName) => orderService._uploadToShared('storage_auth', orderId, fileData, fileName),

    _getFile: async (storageKey, orderId) => {
        try {
            const keyMap = {
                'storage_ods': ['storage_ods', 'ods_files'],
                'storage_contracts': ['storage_contracts', 'ods_contracts'],
                'storage_stops_req': ['storage_stops_req', 'ods_stop_requests'],
                'storage_stops_res': ['storage_stops_res', 'ods_stop_responses'],
                'storage_auth': ['storage_auth']
            };

            const keysToSearch = keyMap[storageKey] || [storageKey];

            for (const key of keysToSearch) {
                const data = localStorage.getItem(key);
                if (data) {
                    const files = JSON.parse(data);
                    const file = files.find(f => f.orderId === orderId);
                    if (file) return file;
                }
            }
            return null;
        } catch (e) {
            return null;
        }
    },

    getOdsFile: (orderId) => `${API_URL}?action=get_file&orderId=${orderId}&storageKey=storage_ods`,
    getContractFile: (orderId) => `${API_URL}?action=get_file&orderId=${orderId}&storageKey=storage_contracts`,
    getStopRequestFile: (orderId) => `${API_URL}?action=get_file&orderId=${orderId}&storageKey=storage_stops_req`,
    getStopResponseFile: (orderId) => `${API_URL}?action=get_file&orderId=${orderId}&storageKey=storage_stops_res`,
    getAuthFile: (orderId) => `${API_URL}?action=get_file&orderId=${orderId}&storageKey=storage_auth`
};
