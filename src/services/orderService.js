import { notificationService } from './notificationService';

export const orderService = {
    getAllOrders: async () => {
        const data = localStorage.getItem('ods_data_v2');
        return data ? JSON.parse(data) : [];
    },

    getOrderById: async (id) => {
        const orders = await orderService.getAllOrders();
        return orders.find(o => o.id === id);
    },

    createOrder: async (orderData) => {
        const orders = await orderService.getAllOrders();
        const newOrder = {
            ...orderData,
            id: Date.now().toString(),
            status: 'En cours',
            createdAt: new Date().toISOString(),
            // Initialize workflow fields
            importStatus: {
                authImport: null,
                importLaunched: false,
                estCustomsDate: '',
                domiciliationDate: '',
                clearedAt: '',
            },
            stockStatus: {
                reception: 'Aucune',
                receivedAt: '',
            },
            isReadyForDelivery: false
        };

        orders.unshift(newOrder);
        localStorage.setItem('ods_data_v2', JSON.stringify(orders));

        // Notification: Insertion d'un nouveau document
        notificationService.addNotification(
            `Nouveau document inséré : ODS ${newOrder.refOds} (${newOrder.client}) - Division: ${newOrder.division}`,
            'info',
            ['all'],
            newOrder.id
        );

        return newOrder;
    },

    updateOrder: async (id, updates, userName) => {
        const orders = await orderService.getAllOrders();
        const index = orders.findIndex(o => o.id === id);
        if (index === -1) return null;

        const oldOrder = orders[index];
        const newOrder = { ...oldOrder, ...updates };
        orders[index] = newOrder;
        localStorage.setItem('ods_data_v2', JSON.stringify(orders));

        // Check for specific workflow notifications

        // 1. Authorization Confirmée
        if (oldOrder.importStatus?.authImport !== 'Confirmée' && newOrder.importStatus?.authImport === 'Confirmée') {
            notificationService.addNotification(
                `Autorisation confirmée pour l'ODS ${newOrder.refOds} (${newOrder.client}).`,
                'success',
                ['all'],
                newOrder.id
            );
        }

        // 2. Lancement Importation
        if (!oldOrder.importStatus?.importLaunched && newOrder.importStatus?.importLaunched) {
            notificationService.addNotification(
                `Importation lancée pour l'ODS ${newOrder.refOds} (${newOrder.client}). Délai de dédouanement estimé : ${newOrder.importStatus?.estCustomsDate ? new Intl.DateTimeFormat('fr-FR').format(new Date(newOrder.importStatus.estCustomsDate)) : 'Non défini'}.`,
                'info',
                ['all'],
                newOrder.id
            );
        }

        // 3. Import Cleared
        if (!oldOrder.importStatus?.clearedAt && newOrder.importStatus?.clearedAt) {
            notificationService.addNotification(
                `Dédouanement terminé pour l'ODS ${newOrder.refOds} (${newOrder.client}).`,
                'success',
                ['all'],
                newOrder.id
            );
        }

        // 4. Stock Received -> Ready for delivery
        if (oldOrder.stockStatus?.reception !== 'Totale' && newOrder.stockStatus?.reception === 'Totale') {
            newOrder.isReadyForDelivery = true;
            orders[index] = newOrder;
            localStorage.setItem('ods_data_v2', JSON.stringify(orders));

            notificationService.addNotification(
                `Notification : ODS ${newOrder.refOds} (${newOrder.client}) est PRÊT À ÊTRE LIVRÉ !`,
                'success',
                ['all'],
                newOrder.id
            );
        }

        return newOrder;
    },

    // Utility to save any type of file
    _saveFile: (storageKey, orderId, fileDataUrl, fileName) => {
        const fileData = {
            orderId,
            fileDataUrl,
            fileName,
            uploadedAt: new Date().toISOString()
        };
        const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
        const filtered = existing.filter(f => f.orderId !== orderId);
        filtered.push(fileData);
        localStorage.setItem(storageKey, JSON.stringify(filtered));
    },

    _getFile: (storageKey, orderId) => {
        const files = JSON.parse(localStorage.getItem(storageKey) || '[]');
        return files.find(file => file.orderId === orderId);
    },

    // ODS file
    saveOdsFile: (orderId, fileDataUrl, fileName) => orderService._saveFile('ods_files', orderId, fileDataUrl, fileName),
    getOdsFile: (orderId) => orderService._getFile('ods_files', orderId),

    // Contract file
    saveContractFile: (orderId, fileDataUrl, fileName) => orderService._saveFile('ods_contracts', orderId, fileDataUrl, fileName),
    getContractFile: (orderId) => orderService._getFile('ods_contracts', orderId),

    // Stop Request file
    saveStopRequestFile: (orderId, fileDataUrl, fileName) => orderService._saveFile('ods_stop_requests', orderId, fileDataUrl, fileName),
    getStopRequestFile: (orderId) => orderService._getFile('ods_stop_requests', orderId),

    // Stop Response file
    saveStopResponseFile: (orderId, fileDataUrl, fileName) => orderService._saveFile('ods_stop_responses', orderId, fileDataUrl, fileName),
    getStopResponseFile: (orderId) => orderService._getFile('ods_stop_responses', orderId)
};
