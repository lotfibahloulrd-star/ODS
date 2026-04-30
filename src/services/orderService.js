import { INITIAL_ORDERS } from './initialData';
import { notificationService } from './notificationService';
import { logService } from './logService';

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

            // --- RÉPARATION AUTOMATIQUE DES LIENS FICHIERS V4.5 ---
            try {
                const fileRes = await fetch(`${API_URL}?action=list_files`);
                if (fileRes.ok) {
                    const { files: serverFiles } = await fileRes.json();
                    if (Array.isArray(serverFiles) && Array.isArray(sharedOrders)) {
                        let repairCount = 0;
                        sharedOrders.forEach(order => {
                            if (!order.files) order.files = {};
                            const possibleIds = [
                                String(order.id),
                                order.refOds?.toLowerCase().replace(/[^a-z0-9]/g, '-'),
                                order.refContrat?.toLowerCase().replace(/[^a-z0-9]/g, '-'),
                                order.refContract?.toLowerCase().replace(/[^a-z0-9]/g, '-')
                            ].filter(Boolean);

                            serverFiles.forEach(fileName => {
                                // Format attendu : ID_STORAGEKEY.EXT
                                const parts = fileName.split('_');
                                if (parts.length < 2) return;
                                
                                const fileId = parts[0];
                                const remainder = parts.slice(1).join('_');
                                const [storageKeyWithExt] = remainder.split('.');
                                const storageKey = storageKeyWithExt; 

                                // Si l'ID du fichier correspond à l'un des ID ou Slugs du dossier
                                if (possibleIds.some(pid => fileId.includes(pid) || pid.includes(fileId))) {
                                    if (!order.files[storageKey] || !order.files[storageKey].exists) {
                                        order.files[storageKey] = {
                                            exists: true,
                                            name: fileName,
                                            at: new Date().toISOString(),
                                            ext: fileName.split('.').pop(),
                                            linkedId: fileId // On stocke l'ID qui a permis le lien
                                        };
                                        repairCount++;
                                    }
                                }
                            });
                        });
                        if (repairCount > 0) {
                            console.log(`${repairCount} liens fichiers réparés automatiquement.`);
                            await orderService._saveAllToShared(sharedOrders);
                        }
                    }
                }
            } catch (e) { console.error("File repair failed:", e); }

            if (Array.isArray(sharedOrders)) {
                let hasChanges = false;
                
                // 1. Suppression des doublons "batch-" injectés par erreur
                const countBefore = sharedOrders.length;
                sharedOrders = sharedOrders.filter(o => !String(o.id).startsWith('batch-'));
                if (sharedOrders.length !== countBefore) {
                    console.log(`Suppression de ${countBefore - sharedOrders.length} doublons.`);
                    hasChanges = true;
                }


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
        
        await logService.saveLog({
            userName: orderData.createdBy || "Inconnu",
            action: "Création ODS",
            details: `Nouvel ODS créé pour le client ${newOrder.client} (Réf: ${newOrder.refOds || '-'})`,
            orderId: newOrder.id
        });

        return newOrder;
    },

    updateOrder: async (id, updates, userName = "Inconnu") => {
        const orders = await orderService.getAllOrders();
        const index = orders.findIndex(o => o.id === id);
        if (index === -1) return null;
        const updatedOrders = orders.map(o => o.id === id ? { ...o, ...updates } : o);
        await orderService._saveAllToShared(updatedOrders);
        
        await logService.saveLog({
            userName: userName,
            action: "Mise à jour ODS",
            details: `Mise à jour de l'ODS de ${orders[index].client || id}`,
            orderId: id
        });

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

        return updatedOrders[index];
    },

    deleteOrder: async (id, userName = "Inconnu") => {
        const orders = await orderService.getAllOrders();
        const deletedOrder = orders.find(o => o.id === id);
        const finalOrders = orders.filter(o => o.id !== id);
        if (finalOrders.length === orders.length) return false;
        await orderService._saveAllToShared(finalOrders);
        
        await logService.saveLog({
            userName: userName,
            action: "Suppression ODS",
            details: `Suppression définitive de l'ODS de ${deletedOrder?.client || id}`,
            orderId: id
        });

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

    _uploadToShared: async (storageKey, orderId, fileDataOrBlob, fileName, userName = "Inconnu") => {
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

            await logService.saveLog({
                userName: userName,
                action: "Upload Document",
                details: `Fichier ${fileName} ajouté (${storageKey})`,
                orderId: orderId
            });

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
    deleteFile: async (orderId, storageKey, userName = "Inconnu") => {
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

        await logService.saveLog({
            userName: userName,
            action: "Suppression Document",
            details: `Fichier supprimé (${storageKey})`,
            orderId: orderId
        });

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
