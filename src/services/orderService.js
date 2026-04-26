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

            // Version v45 : Harmonisation et protection renforcée
            const DATA_VERSION = 'ods_data_v45';
            const localVersion = localStorage.getItem('ods_data_version');

            if (!Array.isArray(sharedOrders) || localVersion !== DATA_VERSION) {
                console.log("Restauration intelligente des valeurs (Version " + DATA_VERSION + ")...");

                const mergedMap = new Map();

                // 1. Charger tout ce qui vient du serveur d'abord
                if (Array.isArray(sharedOrders)) {
                    sharedOrders.forEach(o => mergedMap.set(o.id, o));
                }

                // 2. Fusion intelligente avec INITIAL_ORDERS
                INITIAL_ORDERS.forEach(o => {
                    const existing = mergedMap.get(o.id);
                    if (existing) {
                        // On crée un objet fusionné champ par champ
                        const smartMerged = { ...o }; // Base du code
                        
                        // On ne garde du serveur que les champs qui ont du CONTENU
                        Object.keys(existing).forEach(key => {
                            const val = existing[key];
                            // Si le serveur a une valeur non vide (ou est un objet/array non vide), on la garde
                            if (val !== null && val !== undefined && val !== "" && val !== 0 && val !== "0") {
                                if (Array.isArray(val) && val.length === 0) return; // Ignore arrays vides
                                if (typeof val === 'object' && Object.keys(val).length === 0) return; // Ignore objets vides
                                smartMerged[key] = val;
                            }
                        });
                        
                        // Cas particulier : Toujours garder les fichiers et articles du serveur s'ils existent
                        if (existing.files && Object.keys(existing.files).length > 0) smartMerged.files = existing.files;
                        if (existing.articles && existing.articles.length > 0) smartMerged.articles = existing.articles;
                        if (existing.financial) smartMerged.financial = { ...(o.financial || {}), ...existing.financial };

                        mergedMap.set(o.id, smartMerged);
                    } else {
                        mergedMap.set(o.id, o);
                    }
                });

                const finalOrders = Array.from(mergedMap.values())
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                await orderService._saveAllToShared(finalOrders);
                localStorage.setItem('ods_data_version', DATA_VERSION);
                await orderService.clearDeletedIds();
                return finalOrders;
            }

            if (Array.isArray(sharedOrders)) {
                let hasChanges = false;
                
                // 1. Suppression des doublons "batch-" injectés par erreur
                const countBefore = sharedOrders.length;
                sharedOrders = sharedOrders.filter(o => !String(o.id).startsWith('batch-'));
                if (sharedOrders.length !== countBefore) {
                    console.log(`Suppression de ${countBefore - sharedOrders.length} doublons.`);
                    hasChanges = true;
                }

                // 2. Mise à jour intelligente d'après votre tableau (V4.5-UPDATE)
                const UPDATES_V45 = {
                    "13/2023": { ttc: 2499000, livraison: "2026-03-01" },
                    "CRAPC N°08": { ttc: 1414951.60 },
                    "SAIDAL EQUIPEMENT": { ttc: 5196016 },
                    "Marché N°234/2024": { ttc: 193772595.96 },
                    "001/2024": { ttc: 6199900 },
                    "002/2024": { ttc: 7304220 },
                    "DS/ELH/DAA/0": { ttc: 21171290 },
                    "04/DAC/MED/": { ttc: 6544312.41 },
                    "01/CACQE/202": { ttc: 85888766.15 },
                    "002/25": { ttc: 2375240 },
                    "003/25": { ttc: 9520000 },
                    "03/CACQE/202": { ttc: 203048323 },
                    "001/2025": { ttc: 3870000 },
                    "09/2025": { ttc: 12041372 },
                    "INCC 321/005": { ttc: 58878773.53 },
                    "05/CACQE/2024": { ttc: 117045663 },
                    "F1107 / 24 DCM": { ttc: 3375174 },
                    "04/2025": { ttc: 461500 },
                    "13 & 14": { ttc: 6511000 },
                    "Univ SPTIF 13/25": { ttc: 899999.43 },
                    "09/2024": { ttc: 21704430 },
                    "GTFT 24725": { ttc: 44220108 },
                    "15/DG/2024": { ttc: 6000000 },
                    "seaal/DAM UN/2025": { ttc: 4829531.7 },
                    "15/CRAPC/2024": { ttc: 2084683.1 },
                    "01/CRD/2024": { ttc: 1141072466.29 },
                    "BC 4500057418": { ttc: 1880414.8 },
                    "05/25": { ttc: 5438300 },
                    "11/2025": { ttc: 4109041 },
                    "126/2025": { ttc: 1511000 },
                    "23/25": { ttc: 8733410 },
                    "02/25": { ttc: 27867182 },
                    "TIARET": { ttc: 6152538 },
                    "127/25": { ttc: 3816359.44 },
                    "02/2025": { ttc: 386750 },
                    "063/25": { ttc: 102340000 },
                    "001885": { ttc: 7163046.73 },
                    "MARCHE N° 02/2025": { ttc: 27867182 }
                };

                sharedOrders.forEach(order => {
                    const ref = String(order.refContrat || order.refContract || "").toUpperCase();
                    for (const [key, val] of Object.entries(UPDATES_V45)) {
                        if (ref.includes(key.toUpperCase())) {
                            if (val.ttc) {
                                order.totals = { ...order.totals, ttc: val.ttc };
                                order.amount = String(val.ttc);
                            }
                            if (val.livraison) order.deliveryDate = val.livraison;
                            hasChanges = true;
                        }
                    }
                });

                if (hasChanges) {
                    await orderService._saveAllToShared(sharedOrders);
                }
            }
            return sharedOrders;
        } catch (e) {
            const DATA_VERSION = 'ods_data_v45';
            const localData = localStorage.getItem(DATA_VERSION);
            const deletedLocal = localStorage.getItem('ods_deleted_ids');
            const deletedSet = new Set(deletedLocal ? JSON.parse(deletedLocal) : []);
            const orders = localData ? JSON.parse(localData) : INITIAL_ORDERS;
            return orders.filter(o => !deletedSet.has(o.id));
        }
    },

    _saveAllToShared: async (orders) => {
        const DATA_VERSION = 'ods_data_v45';
        try {
            // SÉCURITÉ : Ne pas sauvegarder si la liste est vide alors qu'on avait des données
            const local = localStorage.getItem(DATA_VERSION);
            if (local) {
                const prev = JSON.parse(local);
                if (prev.length > 10 && orders.length < prev.length / 2) {
                    console.error("ALERTE : Tentative de sauvegarde d'une liste massivement tronquée. Opération annulée.");
                    return;
                }
            }

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

    clearDeletedIds: async () => {
        try {
            localStorage.setItem('ods_deleted_ids', JSON.stringify([]));
            await fetch(`${API_URL}?action=save_deleted_ids`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify([])
            });
            return true;
        } catch (e) {
            console.error("Restoration failed:", e);
            throw e;
        }
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
    saveBlFile: async (orderId, fileData, fileName) => orderService._uploadToShared('storage_bl', orderId, fileData, fileName),
    savePvProvFile: async (orderId, fileData, fileName) => orderService._uploadToShared('storage_pv_provisoire', orderId, fileData, fileName),
    savePvDefFile: async (orderId, fileData, fileName) => orderService._uploadToShared('storage_pv_definitive', orderId, fileData, fileName),
    deleteFile: async (orderId, storageKey) => {
        // Remove file entry from local storage for the given storageKey
        const dataStr = localStorage.getItem(storageKey);
        if (!dataStr) return false;
        const files = JSON.parse(dataStr);
        const filtered = files.filter(f => f.orderId !== orderId);
        localStorage.setItem(storageKey, JSON.stringify(filtered));
        // Optionally notify server (if API supports delete)
        try {
            await fetch(`${API_URL}?action=delete_file&orderId=${orderId}&storageKey=${storageKey}`, {
                method: 'POST'
            });
        } catch (e) { /* ignore server errors */ }
        return true;
    },

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
    getAuthFile: (orderId) => `${API_URL}?action=get_file&orderId=${orderId}&storageKey=storage_auth`,
    getBlFile: (orderId) => `${API_URL}?action=get_file&orderId=${orderId}&storageKey=storage_bl`,
    getPvProvFile: (orderId) => `${API_URL}?action=get_file&orderId=${orderId}&storageKey=storage_pv_provisoire`,
    getPvDefFile: (orderId) => `${API_URL}?action=get_file&orderId=${orderId}&storageKey=storage_pv_definitive`,

    // Système de Sauvegarde
    exportData: async () => {
        const orders = await orderService.getAllOrders();
        const deletedIds = await orderService._getDeletedIds();
        const backup = {
            version: '1.0',
            timestamp: new Date().toISOString(),
            dataVersion: 'ods_data_v45',
            orders,
            deletedIds
        };
        
        const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ODS_BACKUP_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        return true;
    },

    importData: async (jsonFile) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const backup = JSON.parse(e.target.result);
                    if (!backup.orders || !Array.isArray(backup.orders)) {
                        throw new Error("Format de sauvegarde invalide");
                    }
                    
                    if (window.confirm(`Êtes-vous sûr ? Cela va écraser les données actuelles par les ${backup.orders.length} dossiers de la sauvegarde.`)) {
                        await orderService._saveAllToShared(backup.orders);
                        if (backup.deletedIds) {
                            await orderService._saveDeletedIds(backup.deletedIds);
                        }
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                } catch (err) {
                    reject(err);
                }
            };
            reader.onerror = () => reject(new Error("Erreur de lecture du fichier"));
            reader.readAsText(jsonFile);
        });
    },

    // Système de Secours d'Urgence (Time Machine) - VERSION AMÉLIORÉE
    getLocalSnapshots: () => {
        const snapshots = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('ods_data_v')) {
                try {
                    const data = JSON.parse(localStorage.getItem(key));
                    if (Array.isArray(data)) {
                        const totalAmount = data.reduce((sum, o) => sum + (parseFloat(o.amount) || 0), 0);
                        const filledCount = data.filter(o => parseFloat(o.amount) > 0).length;
                        snapshots.push({
                            version: key,
                            count: data.length,
                            filledCount: filledCount,
                            totalAmount: totalAmount,
                            data: data
                        });
                    }
                } catch (e) {}
            }
        }
        return snapshots.sort((a, b) => b.version.localeCompare(a.version));
    },

    restoreSnapshot: async (snapshotData) => {
        if (!Array.isArray(snapshotData)) throw new Error("Données invalides");
        await orderService._saveAllToShared(snapshotData);
        // On force la version actuelle à correspondre pour éviter les conflits
        const currentVersion = 'ods_data_v45';
        localStorage.setItem(currentVersion, JSON.stringify(snapshotData));
        localStorage.setItem('ods_data_version', currentVersion);
        return true;
    }
};
