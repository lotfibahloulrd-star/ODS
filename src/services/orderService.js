import { notificationService } from './notificationService';

const INITIAL_ORDERS = [
    {
        id: 'init-1',
        client: 'Gendarmerie (INCC)',
        refOds: '005/321 (Lots 10, 11)',
        object: 'Spectro Raman / UV-Vis',
        dateOds: '2025-04-15',
        delay: '121',
        amount: '388787735.30',
        division: 'Division Analytique',
        status: 'En cours',
        importStatus: { authImport: null, importLaunched: false, estCustomsDate: '', domiciliationDate: '', clearedAt: '' },
        stockStatus: { reception: 'Aucune', receivedAt: '' },
        isReadyForDelivery: false,
        createdAt: '2025-04-15T10:00:00.000Z'
    },
    {
        id: 'init-2',
        client: 'Sonatrach (D-LAB)',
        refOds: 'L05/25/INV',
        object: '2 Spectrophotomètres de terrain',
        dateOds: '2025-05-15',
        delay: '90',
        amount: '0',
        division: 'Division Laboratoire',
        status: 'En cours',
        importStatus: { authImport: null, importLaunched: false, estCustomsDate: '', domiciliationDate: '', clearedAt: '' },
        stockStatus: { reception: 'Aucune', receivedAt: '' },
        isReadyForDelivery: false,
        createdAt: '2025-05-15T10:00:00.000Z'
    },
    {
        id: 'init-3',
        client: 'Gendarmerie (INCC)',
        refOds: '009/325 (Lot 01, 03, 04)',
        object: 'Analyseur Gaz / Moufle / PCR',
        dateOds: '2025-07-17',
        delay: '120',
        amount: '15936182.50',
        division: 'Division Laboratoire',
        status: 'En cours',
        importStatus: { authImport: null, importLaunched: false, estCustomsDate: '', domiciliationDate: '', clearedAt: '' },
        stockStatus: { reception: 'Aucune', receivedAt: '' },
        isReadyForDelivery: false,
        createdAt: '2025-07-17T10:00:00.000Z'
    },
    {
        id: 'init-4',
        client: 'Univ. Bouira',
        refOds: 'E050 25 02 12 (Lot 01, 02)',
        object: 'SAA Flamme & Four / COT-mètre',
        dateOds: '2025-11-02',
        delay: '120',
        amount: '21340070.00',
        division: 'Division Analytique',
        status: 'En cours',
        importStatus: { authImport: null, importLaunched: false, estCustomsDate: '', domiciliationDate: '', clearedAt: '' },
        stockStatus: { reception: 'Aucune', receivedAt: '' },
        isReadyForDelivery: false,
        createdAt: '2025-11-02T10:00:00.000Z'
    },
    {
        id: 'init-5',
        client: 'Gendarmerie (INCC)',
        refOds: '039/355',
        object: 'Consommables & Verrerie',
        dateOds: '2025-11-12',
        delay: '150',
        amount: '1358540.53',
        division: 'Division Laboratoire',
        status: 'En cours',
        importStatus: { authImport: null, importLaunched: false, estCustomsDate: '', domiciliationDate: '', clearedAt: '' },
        stockStatus: { reception: 'Aucune', receivedAt: '' },
        isReadyForDelivery: false,
        createdAt: '2025-11-12T10:00:00.000Z'
    },
    {
        id: 'init-6',
        client: 'Gendarmerie (INCC)',
        refOds: '062/378',
        object: 'Génie Civil Forensique',
        dateOds: '2025-11-20',
        delay: '180',
        amount: '34084575.00',
        division: 'Division Analytique',
        status: 'En cours',
        importStatus: { authImport: null, importLaunched: false, estCustomsDate: '', domiciliationDate: '', clearedAt: '' },
        stockStatus: { reception: 'Aucune', receivedAt: '' },
        isReadyForDelivery: false,
        createdAt: '2025-11-20T10:00:00.000Z'
    },
    {
        id: 'init-7',
        client: 'ENP Constantine',
        refOds: '2025/07 (Lot 04)',
        object: 'Équipements Génie Mécanique',
        dateOds: '2025-11-27',
        delay: '120',
        amount: '0',
        division: 'Division Laboratoire',
        status: 'En cours',
        importStatus: { authImport: null, importLaunched: false, estCustomsDate: '', domiciliationDate: '', clearedAt: '' },
        stockStatus: { reception: 'Aucune', receivedAt: '' },
        isReadyForDelivery: false,
        createdAt: '2025-11-27T10:00:00.000Z'
    },
    {
        id: 'init-8',
        client: 'Sonatrach Skikda',
        refOds: 'K/15/TL/25 (Lot 01)',
        object: 'Analyseur ICP-MS (ISO 17294-2)',
        dateOds: '2025-12-01',
        delay: '90',
        amount: '0',
        division: 'Division Analytique',
        status: 'En cours',
        importStatus: { authImport: null, importLaunched: false, estCustomsDate: '', domiciliationDate: '', clearedAt: '' },
        stockStatus: { reception: 'Aucune', receivedAt: '' },
        isReadyForDelivery: false,
        createdAt: '2025-12-01T10:00:00.000Z'
    },
    {
        id: 'init-9',
        client: 'Gendarmerie (INCC)',
        refOds: '077/393',
        object: 'Maintenance Prév. & Corrective',
        dateOds: '2025-12-03',
        delay: '365',
        amount: '71400000',
        division: 'Division Analytique',
        status: 'En cours',
        importStatus: { authImport: null, importLaunched: false, estCustomsDate: '', domiciliationDate: '', clearedAt: '' },
        stockStatus: { reception: 'Aucune', receivedAt: '' },
        isReadyForDelivery: false,
        createdAt: '2025-12-03T10:00:00.000Z'
    },
    {
        id: 'init-10',
        client: 'ENSB Constantine',
        refOds: '01/ENSB-CONT/2025',
        object: 'Matériels thermiques de labo',
        dateOds: '2025-12-11',
        delay: '90',
        amount: '0',
        division: 'Division Laboratoire',
        status: 'En cours',
        importStatus: { authImport: null, importLaunched: false, estCustomsDate: '', domiciliationDate: '', clearedAt: '' },
        stockStatus: { reception: 'Aucune', receivedAt: '' },
        isReadyForDelivery: false,
        createdAt: '2025-12-11T10:00:00.000Z'
    },
    {
        id: 'init-11',
        client: 'MDN (Recherche)',
        refOds: 'Contrat 04 / Visa 186',
        object: 'Équipements Scientifiques',
        dateOds: '2025-12-15',
        delay: '90',
        amount: '9424800.00',
        division: 'Division Analytique',
        status: 'En cours',
        importStatus: { authImport: null, importLaunched: false, estCustomsDate: '', domiciliationDate: '', clearedAt: '' },
        stockStatus: { reception: 'Aucune', receivedAt: '' },
        isReadyForDelivery: false,
        createdAt: '2025-12-15T10:00:00.000Z'
    },
    {
        id: 'init-12',
        client: 'HCA Ain Naadja (Alger)',
        refOds: 'Contrat 82',
        object: 'Réparation équipements médico',
        dateOds: '2025-12-24',
        delay: '30',
        amount: '386750.00',
        division: 'Division Analytique',
        status: 'En cours',
        importStatus: { authImport: null, importLaunched: false, estCustomsDate: '', domiciliationDate: '', clearedAt: '' },
        stockStatus: { reception: 'Aucune', receivedAt: '' },
        isReadyForDelivery: false,
        createdAt: '2025-12-24T10:00:00.000Z'
    },
    {
        id: 'init-13',
        client: 'Univ. Béjaïa',
        refOds: 'Marché 17/2025 (Lot 02)',
        object: 'Équipements Électrochimie',
        dateOds: '2025-12-30',
        delay: '120',
        amount: '0',
        division: 'Division Analytique',
        status: 'En cours',
        importStatus: { authImport: null, importLaunched: false, estCustomsDate: '', domiciliationDate: '', clearedAt: '' },
        stockStatus: { reception: 'Aucune', receivedAt: '' },
        isReadyForDelivery: false,
        createdAt: '2025-12-30T10:00:00.000Z'
    },
    {
        id: 'init-14',
        client: 'Univ. Ouargla',
        refOds: '2025/06 (Lot 01)',
        object: 'Équipements Labo Pharmacie',
        dateOds: '2026-01-08',
        delay: '120',
        amount: '0',
        division: 'Division Analytique',
        status: 'En cours',
        importStatus: { authImport: null, importLaunched: false, estCustomsDate: '', domiciliationDate: '', clearedAt: '' },
        stockStatus: { reception: 'Aucune', receivedAt: '' },
        isReadyForDelivery: false,
        createdAt: '2026-01-08T10:00:00.000Z'
    },
    {
        id: 'init-15',
        client: 'Univ. Tiaret',
        refOds: 'Convention 01/2025',
        object: 'Labo reproduction animale',
        dateOds: '2026-01-28',
        delay: '120',
        amount: '4680865.00',
        division: 'DL et DA',
        status: 'En cours',
        importStatus: { authImport: null, importLaunched: false, estCustomsDate: '', domiciliationDate: '', clearedAt: '' },
        stockStatus: { reception: 'Aucune', receivedAt: '' },
        isReadyForDelivery: false,
        createdAt: '2026-01-28T10:00:00.000Z'
    }
];

export const orderService = {
    getAllOrders: async () => {
        const dataStr = localStorage.getItem('ods_data_v2');
        let currentOrders = dataStr ? JSON.parse(dataStr) : [];

        // Système de synchronisation intelligente :
        // On vérifie si certains ordres initiaux manquent (cas d'une mise à jour de ma part)
        // sans écraser les modifications que vous avez faites localement.
        let hasChanges = false;
        INITIAL_ORDERS.forEach(initOrder => {
            const exists = currentOrders.some(o => o.id === initOrder.id);
            if (!exists) {
                currentOrders.push(initOrder);
                hasChanges = true;
            }
        });

        if (hasChanges) {
            // On trie par date de création décroissante (plus récent en haut)
            currentOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            localStorage.setItem('ods_data_v2', JSON.stringify(currentOrders));
        }

        return currentOrders;
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
