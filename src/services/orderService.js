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
        createdAt: '2025-04-15T10:00:00.000Z',
        files: {}
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
        createdAt: '2025-05-15T10:00:00.000Z',
        files: {}
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
        createdAt: '2025-07-17T10:00:00.000Z',
        files: {}
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
        createdAt: '2025-11-02T10:00:00.000Z',
        files: {}
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
        createdAt: '2025-11-12T10:00:00.000Z',
        files: {}
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
        createdAt: '2025-11-20T10:00:00.000Z',
        files: {}
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
        createdAt: '2025-11-27T10:00:00.000Z',
        files: {}
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
        createdAt: '2025-12-01T10:00:00.000Z',
        files: {}
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
        createdAt: '2025-12-03T10:00:00.000Z',
        files: {}
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
        createdAt: '2025-12-11T10:00:00.000Z',
        files: {}
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
        createdAt: '2025-12-15T10:00:00.000Z',
        files: {}
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
        createdAt: '2025-12-24T10:00:00.000Z',
        files: {}
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
        createdAt: '2025-12-30T10:00:00.000Z',
        files: {}
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
        createdAt: '2026-01-08T10:00:00.000Z',
        files: {}
    },
    {
        id: 'init-15',
        client: 'Univ. Tiaret',
        refOds: 'Convention 01/2025',
        object: 'Acquisition d\'équipements scientifique et technologique pour différents laboratoires au profit de l\'Univ. de Tiaret',
        dateOds: '2026-01-28',
        delay: '120',
        amount: '4680865.00',
        division: 'DL et DA',
        status: 'En cours',
        importStatus: { authImport: null, importLaunched: false, estCustomsDate: '', domiciliationDate: '', clearedAt: '' },
        stockStatus: { reception: 'Aucune', receivedAt: '' },
        isReadyForDelivery: false,
        createdAt: '2026-01-28T10:00:00.000Z',
        files: {},
        articles: [
            { no: '01', ref: 'CE232', designation: 'Fourniture, installation et mise en service de: Centrifugeuse réfrigérée 3-16KL (Inclus Rotor RT286 et Adaptateur RE450)', qte: 1, pu: 1535000, total: 1535000, marque: 'ORTO' },
            { no: '02', ref: '634-6041', designation: 'Fourniture, installation et mise en service de: Spectrophotomètre UV visible', qte: 1, pu: 1655500, total: 1655500, marque: 'VWR' },
            { no: '03', ref: '9010-0323', designation: 'Fourniture, installation et mise en service de: Incubateur à convection naturelle 56l', qte: 1, pu: 291000, total: 291000, marque: 'BINDER' },
            { no: '04', ref: 'MB.1001.LCD', designation: 'Fourniture, installation et mise en service de: Microscope LCD', qte: 1, pu: 132000, total: 132000, marque: 'EUROMEX' },
            { no: '05', ref: '321-62352-18', designation: 'Fourniture, installation et mise en service de: Balance de précision EWJ6000-1M', qte: 1, pu: 320000, total: 320000, marque: 'SHIMADZU' }
        ],
        totals: { ht: 3933500, tva: 747365, ttc: 4680865 }
    }
];

const API_URL = './api.php';

export const orderService = {
    _cleanupLegacyStorage: () => {
        const suspiciousKeys = ['ods_files', 'ods_contracts', 'ods_documents', 'ods_pdfs', 'files', 'pdf'];
        suspiciousKeys.forEach(key => localStorage.removeItem(key));
    },

    getAllOrders: async () => {
        try {
            const response = await fetch(`${API_URL}?action=get_orders`);
            if (!response.ok) throw new Error("API Unavailable");
            let sharedOrders = await response.json();

            // Si le serveur contient moins d'ODS que notre liste initiale, ou si la version a changé, on injecte tout
            const DATA_VERSION = 'ods_data_v4';
            const localVersion = localStorage.getItem('ods_data_version');

            if (!Array.isArray(sharedOrders) || sharedOrders.length < INITIAL_ORDERS.length || localVersion !== DATA_VERSION) {
                console.log("Mise à jour structurée des données (Version " + DATA_VERSION + ")...");

                const mergedMap = new Map();

                // 1. Charger tout ce qui vient du serveur d'abord (données réelles des utilisateurs)
                if (Array.isArray(sharedOrders)) {
                    sharedOrders.forEach(o => mergedMap.set(o.id, o));
                }

                // 2. ÉCRASER les ordres initiaux par les nouvelles définitions (pour inclure les nouveaux champs comme 'articles')
                // On fusionne pour garder les fichiers et statuts déjà saisis par l'utilisateur
                INITIAL_ORDERS.forEach(o => {
                    const existing = mergedMap.get(o.id);
                    if (existing) {
                        mergedMap.set(o.id, { ...existing, ...o, files: existing.files || o.files });
                    } else {
                        mergedMap.set(o.id, o);
                    }
                });

                const localDataStr = localStorage.getItem(DATA_VERSION);
                if (localDataStr) JSON.parse(localDataStr).forEach(o => mergedMap.set(o.id, o));

                const finalOrders = Array.from(mergedMap.values())
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                await orderService._saveAllToShared(finalOrders);
                localStorage.setItem('ods_data_version', DATA_VERSION);
                return finalOrders;
            }

            return sharedOrders;
        } catch (e) {
            const DATA_VERSION = 'ods_data_v4';
            const localData = localStorage.getItem(DATA_VERSION);
            return localData ? JSON.parse(localData) : INITIAL_ORDERS;
        }
    },

    _saveAllToShared: async (orders) => {
        const DATA_VERSION = 'ods_data_v4';
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
            ...orderData,
            id: Date.now().toString(),
            status: 'En cours',
            createdAt: new Date().toISOString(),
            importStatus: { authImport: null, importLaunched: false, estCustomsDate: '', domiciliationDate: '', clearedAt: '' },
            stockStatus: { reception: 'Aucune', receivedAt: '' },
            isReadyForDelivery: false,
            files: {}
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
        return orders[index];
    },

    _uploadToShared: async (storageKey, orderId, fileDataOrBlob, fileName) => {
        try {
            let blob = fileDataOrBlob;

            // Conversion si c'est un DataURL (Base64)
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
            const result = await response.json();
            return result.success;
        } catch (e) {
            console.error("Shared Upload Failed:", e);
            return false;
        }
    },

    saveOdsFile: async (orderId, fileData, fileName) => orderService._uploadToShared('storage_ods', orderId, fileData, fileName),
    saveContractFile: async (orderId, fileData, fileName) => orderService._uploadToShared('storage_contracts', orderId, fileData, fileName),
    saveStopRequestFile: async (orderId, fileData, fileName) => orderService._uploadToShared('storage_stops_req', orderId, fileData, fileName),
    saveStopResponseFile: async (orderId, fileData, fileName) => orderService._uploadToShared('storage_stops_res', orderId, fileData, fileName),

    // Utility to get file from local storage (migration support)
    _getFile: async (storageKey, orderId) => {
        try {
            // Mapping des clés actuelles vers les anciennes clés pour ratisser large
            const keyMap = {
                'storage_ods': ['storage_ods', 'ods_files'],
                'storage_contracts': ['storage_contracts', 'ods_contracts'],
                'storage_stops_req': ['storage_stops_req', 'ods_stop_requests', 'storage_stops_req'],
                'storage_stops_res': ['storage_stops_res', 'ods_stop_responses', 'storage_stops_res']
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
    getStopResponseFile: (orderId) => `${API_URL}?action=get_file&orderId=${orderId}&storageKey=storage_stops_res`
};
