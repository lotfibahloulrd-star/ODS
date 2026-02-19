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
    },
    {
        id: 'init-enpc-04',
        client: 'ENP Constantine',
        refOds: 'Lot 04 - ENPC',
        object: 'Acquisition des équipements scientifiques pour les travaux pratiques au profit de l\'Ecole Nationale Polytechnique de Constantine (Lot 04)',
        dateOds: '2026-02-18',
        delay: '120',
        amount: '15462860.00',
        division: 'Division Analytique',
        status: 'En cours',
        importStatus: { authImport: null, importLaunched: false, estCustomsDate: '', domiciliationDate: '', clearedAt: '' },
        stockStatus: { reception: 'Aucune', receivedAt: '' },
        isReadyForDelivery: false,
        createdAt: '2026-02-18T09:00:00.000Z',
        files: {},
        equipmentDetails: 'Lot de 06 bancs de formation technique et didactique de marque BEDO destinés au département de Génie Mécanique. Inclus : Banc moteur essence (EPG104), Banc ABS/EBD/ASR (BSB111), Panneau contrôle électrique (EFU105), Banc Diesel Common Rail (EDE104), Simulateur GPL (EFU104) et Banc capteurs/actionneurs (BES104). Fourniture incluant l\'installation, la mise en service et la formation technique approfondie. Garantie : 24 mois.',
        reagentDetails: 'S/O (Équipements didactiques matériels).',
        consumableDetails: 'Accessoires et kits de raccordement inclus pour chaque banc. Documentation pédagogique complète (manuels TP/TD) fournie en Français.',
        articles: [
            { no: '01', ref: 'EPG104', designation: 'Fourniture, installation et mise en service d\'un banc de formation pour moteur à essence', qte: 1, pu: 2438000, total: 2438000, marque: 'BEDO' },
            { no: '02', ref: 'BSB111', designation: 'Fourniture, installation et mise en service d\'un banc de formation sur le système antiblocage ABC/EBD/ASR. Formateur de freins à disques et tambours ABS avec défauts.', qte: 1, pu: 2892000, total: 2892000, marque: 'BEDO' },
            { no: '03', ref: 'EFU105', designation: 'Fourniture, installation et mise en service d\'un panneau de formation sur le système de contrôle électrique des moteur à essence. Systeme didactique "Injection de carburant"', qte: 1, pu: 2257000, total: 2257000, marque: 'BEDO' },
            { no: '04', ref: 'EDE104', designation: 'Fourniture, installation et mise en service d\'un banc moteur diesel à commande électronique common Rail. Système modulaire de gestion moteur "Common Rail" Ensemble MMM1.', qte: 1, pu: 2642000, total: 2642000, marque: 'BEDO' },
            { no: '05', ref: 'EFU104', designation: 'Fourniture, installation et mise en service d\'un Simulateur de système du carburant GPL. Circuit d\'alimentation GPL sur socle- Formateur statique', qte: 1, pu: 1144000, total: 1144000, marque: 'BEDO' },
            { no: '06', ref: 'BES104', designation: 'Fourniture, installation et mise en service d\'un banc de formation sur les capteurs et les actionneurs. Equipements de base "Capteurs et actionneurs en automobile"', qte: 1, pu: 1621000, total: 1621000, marque: 'BEDO' }
        ],
        totals: { ht: 12994000, tva: 2468860, ttc: 15462860 }
    },
    {
        id: 'init-bc-001885',
        client: 'ADE AIN SALAH TAMENRASSET',
        refOds: 'BC 001885',
        refContract: 'BC N°: 001885 Du 09/07/2025',
        object: 'ACQUISITION ET LIVRAISON DES EQUIPEMENTS DE LABORATOIRE',
        dateOds: '2025-07-09',
        delay: '120',
        amount: '7163046.73',
        division: 'Division Analytique',
        status: 'En cours',
        importStatus: { authImport: null, importLaunched: false, estCustomsDate: '', domiciliationDate: '', clearedAt: '' },
        stockStatus: { reception: 'Aucune', receivedAt: '' },
        isReadyForDelivery: false,
        createdAt: '2025-07-09T10:00:00.000Z',
        files: {},
        articles: [
            { no: '01', ref: '9020-0311', designation: 'Etuve réfrigérée', qte: 1, pu: 770000, total: 770000, marque: 'BINDER', available: true },
            { no: '02', ref: 'HS120', designation: 'Hotte d\'extraction chimique', qte: 1, pu: 754000, total: 754000, marque: 'CAD', available: true },
            { no: '03', ref: 'F0A011400000', designation: 'Hotte d\'extraction bacteriologique', qte: 1, pu: 1225167, total: 1225167, marque: 'FASTER', available: true },
            { no: '04', ref: 'LEV015.98.2100A', designation: 'Multimetre parametre ph-cond-temp (Sondes et solutions incluses)', qte: 1, pu: 325000, total: 325000, marque: 'HACH', available: true },
            { no: '05', ref: 'TL-25-STIR-MI', designation: 'Burette automatique avec agitateur', qte: 1, pu: 302500, total: 302500, marque: 'MICROLITE', available: true },
            { no: '06', ref: 'LPV444.99.00210', designation: 'Turbidimetre de paillasse', qte: 1, pu: 945000, total: 945000, marque: 'HACH', available: true },
            { no: '07', ref: '05721753', designation: 'Thermometre de precision pour contrôle des étuves tem gamme mesure 1/50', qte: 6, pu: 55400, total: 332400, marque: 'TESTO', available: true },
            { no: '08', ref: '-', designation: 'Tabouret pour laboratoire', qte: 4, pu: 13050, total: 52200, marque: 'CAD', available: true },
            { no: '09', ref: 'LTV082.99.10002', designation: 'Bloc chauffante bain sec', qte: 1, pu: 254500, total: 254500, marque: 'HACH', available: true },
            { no: '10', ref: '56K001901', designation: 'Testeur d\'indice de colmatage de l\'eau SDI', qte: 2, pu: 215600, total: 431200, available: false },
            { no: '11', ref: 'DRAI-055-001', designation: 'Egoutoir pour verrerie de laboratoire', qte: 2, pu: 9200, total: 18400, marque: 'LABBOX', available: true },
            { no: '12', ref: '172244', designation: 'Densimetre', qte: 1, pu: 609000, total: 609000, marque: 'ANTON PAR', available: true }
        ],
        totals: { ht: 6019367, tva: 1143679.73, ttc: 7163046.73 }
    },
    {
        id: 'init-sonatrach-gl3z-75-25',
        client: 'SONATRACH ACTIVITE LIQUEFACTION & SEPARATION DIVISION GNL/GPL COMPLEXE GL3Z',
        refOds: 'CONTRAT N° 75/2025',
        refContract: 'CONTRAT N° 75/2025',
        object: 'LA FOURNITURE, INSTALLATION ET MISE EN SERVICE D\'UN ANALYSEUR DE LA TENEUR EN EAU DANS L\'HUILE',
        dateOds: '2025-02-19',
        delay: '60',
        amount: '2960037.63',
        division: 'Division Analytique',
        status: 'En cours',
        importStatus: { authImport: null, importLaunched: false, estCustomsDate: '', domiciliationDate: '', clearedAt: '' },
        stockStatus: { reception: 'Aucune', receivedAt: '' },
        isReadyForDelivery: false,
        createdAt: '2025-02-19T11:00:00.000Z',
        files: {},
        equipmentDetails: 'Analyseur de la teneur en eau dans l\'huile Eco Oculomètre avec accessoires et pièces de rechange',
        articles: [
            { no: '01', ref: '-', designation: 'Analyseur de la teneur en eau dans l\'huile Eco Oculomètre avec accessoires', qte: 1, pu: 1897658.60, total: 1897658.60, marque: 'METROHM' },
            { no: '02', ref: '-', designation: 'Bloc d\'alimentation', qte: 2, pu: 47178.77, total: 94357.54, marque: 'METROHM' },
            { no: '03', ref: '-', designation: 'Barreau aimanté 13*30mm', qte: 4, pu: 2787.84, total: 11151.36, marque: 'METROHM' },
            { no: '04', ref: '-', designation: 'Cable USB (1.8 MA-B)', qte: 2, pu: 9435.75, total: 18871.50, marque: 'METROHM' },
            { no: '05', ref: '-', designation: 'Tamis moléculaire 250g', qte: 1, pu: 38386.36, total: 38386.36, marque: 'METROHM' },
            { no: '06', ref: '-', designation: 'Tube graisse silicone', qte: 1, pu: 3860.08, total: 3860.08, marque: 'METROHM' },
            { no: '07', ref: '-', designation: 'Cellule génératrice', qte: 1, pu: 373141.14, total: 373141.14, marque: 'METROHM' },
            { no: '08', ref: '-', designation: 'Prestation : Installation et mise en service', qte: 1, pu: 50000, total: 50000, marque: '-' }
        ],
        totals: { ht: 2487426.58, tva: 472611.05, ttc: 2960037.63 }
    },
    {
        id: 'init-saidal-139-25',
        client: 'GROUPE SAIDAL',
        refOds: 'CONTRAT N° 139/2025',
        refContract: 'CONTRAT N° 139/EQUIP.LAB.DIVERS SITES/DDI/BGM/GS/2025',
        object: 'ACQUISITION, INSTALLATION MISE EN SERVICE ET QUALIFICATION D\'EQUIPEMENTS DE LABORATOIRE DESTINES AUX DIVERS SITES DU GROUPE SAIDAL',
        dateOds: '2025-02-19',
        delay: '90',
        amount: '81749052.67',
        division: 'Division Laboratoire',
        status: 'En cours',
        importStatus: { authImport: null, importLaunched: false, estCustomsDate: '', domiciliationDate: '', clearedAt: '' },
        stockStatus: { reception: 'Aucune', receivedAt: '' },
        isReadyForDelivery: false,
        createdAt: '2025-02-19T11:30:00.000Z',
        files: {},
        equipmentDetails: 'Équipements de laboratoire variés pour les sites CRD, MEDEA et CONSTANTINE',
        articles: [
            { no: '01', ref: 'OsmoTECH XT', designation: 'Osmomètre (Convenience kit, Embout, Solution réf, Imprimante)', qte: 1, pu: 5179000.00, total: 5179000.00, marque: 'Advanced Instruments', site: 'CRD' },
            { no: '02', ref: 'SA20500600', designation: 'Agitateur magnétique chauffant à 04 postes (Helice, Sonde, Pince)', qte: 1, pu: 532100.00, total: 532100.00, marque: '-', site: 'CRD' },
            { no: '03', ref: '05630110', designation: 'Thermomètre à sonde digital (Sonde d\'immersion)', qte: 1, pu: 77700.00, total: 77700.00, marque: 'Testo', site: 'CRD' },
            { no: '04', ref: '-', designation: 'Enregistreur de température et humidité', qte: 4, pu: 158300.00, total: 633200.00, marque: '-', site: 'CRD' },
            { no: '05', ref: '-', designation: 'Thermomètre digital', qte: 1, pu: 47000.00, total: 47000.00, marque: '-', site: 'CRD' },
            { no: '06', ref: '-', designation: 'Autoclave', qte: 1, pu: 4923000.00, total: 4923000.00, marque: '-', site: 'CRD' },
            { no: '07', ref: '-', designation: 'pHmètre', qte: 2, pu: 535522.76, total: 1071045.52, marque: '-', site: 'MEDEA' },
            { no: '08', ref: '-', designation: 'centrifugeuse', qte: 1, pu: 868600.00, total: 868600.00, marque: '-', site: 'MEDEA' },
            { no: '09', ref: '-', designation: 'Balance 0,1g (4-6)kg', qte: 1, pu: 539004.86, total: 539004.86, marque: '-', site: 'MEDEA' },
            { no: '10', ref: '-', designation: 'Spectrophotomètre', qte: 2, pu: 2858902.50, total: 5717805.00, marque: '-', site: 'MEDEA' },
            { no: '11', ref: '-', designation: 'Distilateur', qte: 1, pu: 470000.00, total: 470000.00, marque: '-', site: 'MEDEA' },
            { no: '12', ref: '-', designation: 'Congélateur -40°C à 90°C capacité 500 à 700litres', qte: 1, pu: 2623000.00, total: 2623000.00, marque: '-', site: 'MEDEA' },
            { no: '13', ref: '-', designation: 'Viscosimètre', qte: 1, pu: 4757000.00, total: 4757000.00, marque: '-', site: 'MEDEA' },
            { no: '14', ref: '-', designation: 'Equipement CAMAG SCIENTIC UV CABINET 4 WITH UV LAMPAS4', qte: 1, pu: 500227.54, total: 500227.54, marque: 'CAMAG', site: 'CONSTANTINE' },
            { no: '15', ref: '22-046-680', designation: 'Advanced instruments OsmoPRO multi-sample Micro-Osmomètre', qte: 2, pu: 10078000.00, total: 20156000.00, marque: 'Advanced Instruments', site: 'CONSTANTINE' },
            { no: '16', ref: '-', designation: 'centrifuge 5418R EPPENDORF', qte: 2, pu: 1122500.00, total: 2245000.00, marque: 'EPPENDORF', site: 'CONSTANTINE' },
            { no: '17', ref: 'WB-4MS', designation: 'STIRRED WATER BATH WB-4MS', qte: 2, pu: 230000.00, total: 460000.00, marque: '-', site: 'CONSTANTINE' },
            { no: '18', ref: 'CKX41', designation: 'INVERTED MICROSCOPE OLYPUS CKX41', qte: 1, pu: 13255000.00, total: 13255000.00, marque: 'OLYMPUS', site: 'CONSTANTINE' },
            { no: '19', ref: '-', designation: 'BINDER CO2 INCUBATOR', qte: 1, pu: 2992000.00, total: 2992000.00, marque: 'BINDER', site: 'CONSTANTINE' },
            { no: '20', ref: '-', designation: 'Laminar flow hood', qte: 1, pu: 1650000.00, total: 1650000.00, marque: '-', site: 'CONSTANTINE' }
        ],
        totals: { ht: 68696682.92, tva: 13052369.75, ttc: 81749052.67 }
    },
    {
        id: 'init-crbt-const-17-25',
        client: 'CENTRE DE RECHERCHE EN BIOTECHNOLOGIE (CRBT) CONSTANTINE',
        refOds: 'MARCHE N°17/2025',
        refContract: 'MARCHE N°17/2025',
        object: 'L\'ACQUISITION, L\'INSTALLATION ET LA MISE EN SERVICE D\'EQUIPEMENTS DE BASE POUR LA STATION EXPERIMENTALE EL-BAARAOUIA AU PROFIT DU CRBT',
        dateOds: '2025-02-19',
        delay: '90',
        amount: '2898483.00',
        division: 'Division Laboratoire',
        status: 'En cours',
        importStatus: { authImport: null, importLaunched: false, estCustomsDate: '', domiciliationDate: '', clearedAt: '' },
        stockStatus: { reception: 'Aucune', receivedAt: '' },
        isReadyForDelivery: false,
        createdAt: '2025-02-19T10:00:00.000Z',
        files: {},
        equipmentDetails: 'Balance d\'analyse, Etuve économique, Microcentrifugeuses, Multiparamètre portable, Agitateur magnétique, Secoueur Vortex, Microscope fond claire, Loupe binoculaire',
        articles: [
            { no: '01', ref: '321-62900-32', designation: 'BALANCE D\'ANALYSE', qte: 1, pu: 420000, total: 420000, marque: 'SHIMADZU', available: true },
            { no: '02', ref: '9010-0335', designation: 'ETUVE ECONOMIQUE A CONVEXION NATURELLE', qte: 1, pu: 299000, total: 299000, marque: 'BINDER' },
            { no: '03', ref: 'CE148', designation: 'MICROCENTRIFUGEUSES', qte: 1, pu: 918000, total: 918000, marque: 'ORTO ALRESA' },
            { no: '04', ref: 'HI98194', designation: 'MULTIPARAMETRE PORTABLE ETANCHE', qte: 1, pu: 384000, total: 384000, marque: 'HANNA' },
            { no: '05', ref: 'F20500560', designation: 'AGITATEUR MAGNETIQUE CHAUFFANT', qte: 3, pu: 56800, total: 170400, marque: 'VELP' },
            { no: '06', ref: 'F202A0175', designation: 'SECOUEUR VORTEX INFRAROUGE', qte: 1, pu: 54000, total: 54000, marque: 'VELP' },
            { no: '07', ref: 'MB.1152', designation: 'MICROSCOPE FOND CLAIRE', qte: 1, pu: 101800, total: 101800, marque: 'EUROMEX' },
            { no: '08', ref: 'SB.1402', designation: 'LOUPE BINOCULAIRE', qte: 1, pu: 88500, total: 88500, marque: 'EUROMEX' }
        ],
        totals: { ht: 2435700, tva: 462783, ttc: 2898483 }
    },
    {
        id: 'init-el-oued-11-25',
        client: 'UNIVERSITE ECHAHID HAMMA LAKHDAR EL OUED',
        refOds: 'MARCHE N° 11/2025',
        refContract: 'MARCHE N° 11/2025 Du 10/08/2025',
        object: 'ACQUISITION D\'EQUIPEMENTS AU PROFIT DU LABORATOIRE DE BIOLOGIE ENVIRONNEMENTALE ET SANTE DE L\'UNIVERSITE D\'EL OUED',
        dateOds: '2025-08-10',
        delay: '120',
        amount: '29117574.50',
        division: 'Division Laboratoire',
        status: 'En cours',
        importStatus: { authImport: null, importLaunched: false, estCustomsDate: '', domiciliationDate: '', clearedAt: '' },
        stockStatus: { reception: 'Aucune', receivedAt: '' },
        isReadyForDelivery: false,
        createdAt: '2025-08-10T10:00:00.000Z',
        files: {},
        hasStopRequest: 'Oui',
        stopDate: '2025-02-15',
        equipmentDetails: 'Équipements scientifiques : Microscopes, Chlorophyll meter, Spectrophotomètre d\'absorption atomique (SAA), GC-MS, etc.',
        articles: [
            { no: '01', ref: 'IS.1153.EPLi', designation: 'Microscope trinoculaire pour le fons claire+Caméra ultra rapide modèle, 10MP', qte: 1, pu: 394000, total: 394000, marque: 'EUROMEX' },
            { no: '02', ref: 'A1RT-206', designation: 'Chlorophyll meter', qte: 1, pu: 722550, total: 722550, marque: 'KONICA' },
            { no: '03', ref: '208-01720-58', designation: 'Spectrophotomètre d\'absorption atomique flamme et four (SAAS) + 8 lampes+ bouteilles', qte: 1, pu: 6385000, total: 6385000, marque: 'SHIMADZU' },
            { no: '03.1', ref: '-', designation: 'Compresseur d\'air', qte: 1, pu: 200000, total: 200000, marque: 'SHIMADZU' },
            { no: '03.2', ref: '-', designation: 'Refroidisseur d\'eau', qte: 1, pu: 400000, total: 400000, marque: 'SHIMADZU' },
            { no: '03.3', ref: '-', designation: 'Bruleur air/acétylène', qte: 1, pu: 150000, total: 150000, marque: 'SHIMADZU' },
            { no: '03.4', ref: '-', designation: 'Lampe à cathode creuse', qte: 8, pu: 90000, total: 720000, marque: 'SHIMADZU' },
            { no: '03.5', ref: '-', designation: 'Solution étalons', qte: 8, pu: 14000, total: 112000, marque: 'SHIMADZU' },
            { no: '03.6', ref: '-', designation: 'Nébuliseur en verre à haute efficacité', qte: 1, pu: 130000, total: 130000, marque: 'SHIMADZU' },
            { no: '03.7', ref: '-', designation: 'Hotte suspendue en acier inoxydable', qte: 1, pu: 130000, total: 130000, marque: 'SHIMADZU' },
            { no: '03.8', ref: '-', designation: 'Tube en graphite haute performance', qte: 1, pu: 12000, total: 12000, marque: 'SHIMADZU' },
            { no: '03.9', ref: '-', designation: 'Générateur de vapeur d\'hydrure', qte: 1, pu: 800000, total: 800000, marque: 'SHIMADZU' },
            { no: '03.10', ref: '-', designation: 'Système breveté de flamme air-C2H2-O2', qte: 1, pu: 210000, total: 210000, marque: 'SHIMADZU' },
            { no: '03.11', ref: '-', designation: 'Bouteille d\'argon ultra pure 99,9999%, 10,5m3+', qte: 1, pu: 150000, total: 150000, marque: 'SHIMADZU' },
            { no: '03.12', ref: '-', designation: 'Manodetendeur', qte: 1, pu: 23000, total: 23000, marque: 'SHIMADZU' },
            { no: '03.13', ref: '-', designation: 'Bouteille d\'acytélène 99,6%, 5m3+ manodetendeur', qte: 1, pu: 150000, total: 150000, marque: 'SHIMADZU' },
            { no: '03.14', ref: '-', designation: 'PC bureau i5+Ecran 22"', qte: 1, pu: 200000, total: 200000, marque: 'SHIMADZU' },
            { no: '04', ref: '-', designation: 'Chromatographie phase gazeuse couplé masse (GC-MS)+ détecteur FID+Bibliothèque+ Générateur de gaz+PC bureau', qte: 1, pu: 1900000, total: 1900000, marque: 'SHIMADZU' },
            { no: '04.1', ref: '-', designation: 'Port d\'injecteur divisé/non divisé avec contrôle EFC', qte: 1, pu: 600000, total: 600000, marque: 'SHIMADZU' },
            { no: '04.2', ref: '-', designation: 'Echantillonneur automatique de liquide AS6100', qte: 1, pu: 700000, total: 700000, marque: 'SHIMADZU' },
            { no: '04.3', ref: '-', designation: 'Spécrtroscopie de masse (MS)', qte: 1, pu: 5200000, total: 5200000, marque: 'SHIMADZU' },
            { no: '04.4', ref: '-', designation: 'Colonne haute performance-5MS', qte: 1, pu: 130000, total: 130000, marque: 'SHIMADZU' },
            { no: '04.5', ref: '-', designation: 'Détecteur FID', qte: 1, pu: 600000, total: 600000, marque: 'SHIMADZU' },
            { no: '04.6', ref: '-', designation: 'Base de donnée NIST/EPA/NIH Mass Spectral Library 2020 edition', qte: 1, pu: 400000, total: 400000, marque: 'SHIMADZU' },
            { no: '04.7', ref: '-', designation: 'Générateur d\'hydrogène NM250plus', qte: 1, pu: 900000, total: 900000, marque: 'SHIMADZU' },
            { no: '04.8', ref: '-', designation: 'Générateur d\'azote haut performance 750', qte: 1, pu: 1200000, total: 1200000, marque: 'SHIMADZU' },
            { no: '04.9', ref: '-', designation: 'Générateur d\'air zéro GT 1500 plus', qte: 1, pu: 500000, total: 500000, marque: 'SHIMADZU' },
            { no: '05', ref: '207-28100-58', designation: 'Spectrophotomètre Uv-Visible à double faisceau+Cuves Quartz+ Cuve en verre +Logiciel', qte: 1, pu: 1450000, total: 1450000, marque: 'SHIMADZU' }
        ],
        totals: { ht: 24468550, tva: 4649024.50, ttc: 29117574.50 }
    },
    {
        id: 'init-saeg-tiaret-02-25',
        client: 'SAEG UNITE DE PRODUCTION TIARET',
        refOds: '02/2025/SPE/DRPO/TIARET',
        refContract: 'BC N°: 02/2025/SPE/DRPO/UNITE DE TIARET',
        object: 'ACQUISITION ET MISE EN SERVICE D\'UN ANALYSEUR DES FUMEES POUR L\'UNITE DE TIARET',
        dateOds: '2025-02-19',
        delay: '90',
        amount: '6504317.47',
        division: 'Division Analytique',
        status: 'En cours',
        importStatus: { authImport: null, importLaunched: false, estCustomsDate: '', domiciliationDate: '', clearedAt: '' },
        stockStatus: { reception: 'Aucune', receivedAt: '' },
        isReadyForDelivery: false,
        createdAt: '2025-02-19T09:00:00.000Z',
        files: {},
        articles: [
            { no: '01', ref: '06323510', designation: 'Appareil d\'analyse de fumée portable avec cellule intégré sur l\'appareil et accessoires', qte: 1, pu: 5465813, total: 5465813, marque: 'TESTO' },
            { no: '02', ref: '06007610', designation: 'Sonde de mesure', qte: 2, pu: 0, total: 0, marque: 'TESTO' },
            { no: '03', ref: '03930000', designation: 'Cellule O2 de rechange', qte: 2, pu: 0, total: 0, marque: 'TESTO' },
            { no: '04', ref: '03930104', designation: 'Cellule CO de rechange', qte: 2, pu: 0, total: 0, marque: 'TESTO' },
            { no: '05', ref: '03930400', designation: 'Cellule CO2 de rechange', qte: 2, pu: 0, total: 0, marque: 'TESTO' },
            { no: '06', ref: '03930150', designation: 'Cellule NO de rechange', qte: 2, pu: 0, total: 0, marque: 'TESTO' },
            { no: '07', ref: '03930200', designation: 'Cellule NO2 de rechange', qte: 2, pu: 0, total: 0, marque: 'TESTO' },
            { no: '08', ref: '03930250', designation: 'Cellule SO2 de rechange', qte: 2, pu: 0, total: 0, marque: 'TESTO' }
        ],
        totals: { ht: 5465813, tva: 1038504.47, ttc: 6504317.47 }
    },
    {
        id: 'init-mdn-force-naval-25',
        client: 'MDN FORCE NAVAL',
        refOds: 'MARCHE',
        refContract: 'MARCHE',
        object: 'ACQUISITION DE L\'ENCEINTE CLIMATIQUE',
        dateOds: '2025-02-19',
        delay: '120',
        amount: '9424800.00',
        division: 'Division Laboratoire',
        status: 'En cours',
        importStatus: { authImport: null, importLaunched: false, estCustomsDate: '', domiciliationDate: '', clearedAt: '' },
        stockStatus: { reception: 'Aucune', receivedAt: '' },
        isReadyForDelivery: false,
        createdAt: '2025-02-19T11:45:00.000Z',
        files: {},
        equipmentDetails: 'Enceinte climatique de corrosion. Mesure d\'accompagnement : 505 000,00 DA.',
        articles: [
            { no: '01', ref: '9020-0382', designation: 'Enceinte climatique de corrosion', qte: 1, pu: 7920000.00, total: 7920000.00, marque: '-' }
        ],
        totals: { ht: 7920000.00, tva: 1504800.00, ttc: 9424800.00 }
    },
    {
        id: 'init-seaco-14-25',
        client: 'SEACO',
        refOds: 'CONTRAT N° 014/2025',
        refContract: 'CONTRAT N° 014/CONS_FOUR/SEACO/2025',
        object: 'FOURNITURE DES EQUIPEMENTS HACH LANGE DE LABORATOIRE',
        dateOds: '2025-02-19',
        delay: '60',
        amount: '447321.00',
        division: 'Division Laboratoire',
        status: 'En cours',
        importStatus: { authImport: null, importLaunched: false, estCustomsDate: '', domiciliationDate: '', clearedAt: '' },
        stockStatus: { reception: 'Aucune', receivedAt: '' },
        isReadyForDelivery: false,
        createdAt: '2025-02-19T12:00:00.000Z',
        files: {},
        equipmentDetails: 'Équipements HACH LANGE de laboratoire (Sonde, Solutions étalons, Cuves, Ensemble d\'étalonnage).',
        articles: [
            { no: '01', ref: '5071', designation: 'Sonde pour conductimètre hach SENS ION+EC 7 ref 5071', qte: 2, pu: 73800.00, total: 147600.00, marque: 'HACH' },
            { no: '02', ref: '-', designation: 'Solution étalon pour conductimètre HACH SENS ION+EC7 147 µs/cm', qte: 2, pu: 4400.00, total: 8800.00, marque: 'HACH' },
            { no: '03', ref: '-', designation: 'Solution étalon pour conductimètre HACH SENS ION+EC7 1288 µs/cm', qte: 2, pu: 4400.00, total: 8800.00, marque: 'HACH' },
            { no: '04', ref: '-', designation: 'Solution étalon pour conductimètre HACH SENS ION+EC7 1413 µs/cm', qte: 2, pu: 4100.00, total: 8200.00, marque: 'HACH' },
            { no: '05', ref: '-', designation: 'Cuve d\'échantillonnage en verre pour turbidité pack de 6', qte: 4, pu: 26000.00, total: 104000.00, marque: 'HACH' },
            { no: '06', ref: '-', designation: 'Ensemble d\'étalonnage de turbidité (<0,1NTU-20 NTU-200NTU-1000NTU-4000NTU)', qte: 1, pu: 98500.00, total: 98500.00, marque: 'HACH' }
        ],
        totals: { ht: 375900.00, tva: 71421.00, ttc: 447321.00 }
    },
    {
        id: 'init-crbt-lot2-02-25',
        client: 'CENTRE DE RECHERCHE EN BIOTECHNOLOGIE (CRBT) CONSTANTINE',
        refOds: 'MARCHE N° 02/2025',
        refContract: 'MARCHE N° 02/2025 - LOT 02',
        object: 'ACQUISITION, INSTALLATION MISE EN SERVICE EQUIPEMENTS SCIENTIFIQUES DU LABORATOIRE CULTURE CELLULAIRE BSL2 DU CRBT - LOT 02: STERILISATION ET LAVAGE',
        dateOds: '2025-02-19',
        delay: '120',
        amount: '27867182.00',
        division: 'Division Laboratoire',
        status: 'En cours',
        importStatus: { authImport: null, importLaunched: false, estCustomsDate: '', domiciliationDate: '', clearedAt: '' },
        stockStatus: { reception: 'Aucune', receivedAt: '' },
        isReadyForDelivery: false,
        createdAt: '2025-02-19T13:00:00.000Z',
        files: {},
        equipmentDetails: 'Équipements de stérilisation et lavage : Purification d\'eau, Armoire de séchage, Autoclave, Laveur désinfecteur.',
        articles: [
            { no: '01', ref: 'ZIQ7005TOC', designation: 'SYSTÈME DE PURIFICATION D\'EAU TYPE2', qte: 1, pu: 3615000.00, total: 3615000.00, marque: 'MERCK', available: true },
            { no: '02', ref: 'ZRDSVP3EU', designation: 'SYSTÈME DE PRODUCTION D\'EAU OSMOEE', qte: 1, pu: 704900.00, total: 704900.00, marque: 'MERCK', available: true },
            { no: '03', ref: 'XAS320', designation: 'ARMOIRE DE SECHAGE', qte: 2, pu: 527900.00, total: 1055800.00, marque: 'FRANCE ETUVE', available: false },
            { no: '04', ref: '1100', designation: 'AUTOCLAVE VERTICAL DE LABORATOIRE', qte: 2, pu: 5310550.00, total: 10621100.00, marque: 'SYSTEC', available: true },
            { no: '05', ref: '10215770', designation: 'LAVEUR DESINFECTEUR', qte: 2, pu: 3710500.00, total: 7421000.00, marque: 'MIELE', available: true }
        ],
        totals: { ht: 23417800.00, tva: 4449382.00, ttc: 27867182.00 }
    },
    {
        id: 'init-el-oued-06-25-lot1',
        client: 'UNIVERSITE ECHAHID HAMMA LAKHDAR EL OUED',
        refOds: 'MARCHE N° 06/2025',
        refContract: 'MARCHE N° 06/2025 Du 19/06/2025',
        object: 'ACQUISITION ET INSTALLATION D\'EQUIPEMENTS COMPLEMENTAIRES AU PROFIT DE L\'UNIVERSITE D\'EL OUED - LOT 01: ACQUISITION D\'EQUIPEMENT DE LABORATOIRE',
        dateOds: '2025-06-19',
        delay: '120',
        amount: '2347066.16',
        division: 'Division Laboratoire',
        status: 'En cours',
        importStatus: { authImport: null, importLaunched: false, estCustomsDate: '', domiciliationDate: '', clearedAt: '' },
        stockStatus: { reception: 'Aucune', receivedAt: '' },
        isReadyForDelivery: false,
        createdAt: '2025-06-19T10:00:00.000Z',
        files: {},
        equipmentDetails: 'Balance analytique, Incubateur microbiologique, Disperser à ultrasons, Viscosimètre capillaire, Densimètre, Mortier et pilon, Lampes UV.',
        articles: [
            { no: '01', ref: '321-62900-23', designation: 'BALANCE ANALYTIQUE HAUTE PRECISION HOMOLOGABLE', qte: 1, pu: 403750.50, total: 403750.50, marque: 'SHIMADZU' },
            { no: '02', ref: '9090-0016', designation: 'INCUBATEUR MICROBIOLOGIQUE AVEC ACCESSOIRES', qte: 1, pu: 190000.00, total: 190000.00, marque: 'BINDER' },
            { no: '03', ref: 'UP50H', designation: 'DISPERSER A ULTRASONS (SONIFICATEUR HOMOGENEISATEUR) + Statif ST1-16 + Sonotrode MS3', qte: 1, pu: 993500.00, total: 993500.00, marque: 'HIELSCHER' },
            { no: '04', ref: '10707021', designation: 'VISCOSIMETRE CAPILLAIRE ASTM (UNE 400313, ASTM D445-446, ASTM D2515 AND ISO 3104-310)', qte: 1, pu: 81100.00, total: 81100.00, marque: 'SI ANALYTICS' },
            { no: '05', ref: '11782565', designation: 'DENSIMETRE POUR HUILE MINERALE TRACABLE', qte: 1, pu: 17200.00, total: 17200.00, marque: 'ALLA France' },
            { no: '06', ref: 'MORG-100-001', designation: 'MORTIER ET PILON EN AGATE GRANIT 50ML ØEXT 100MM', qte: 1, pu: 70200.00, total: 70200.00, marque: '-' },
            { no: '07', ref: 'VILB311100611', designation: 'LAMPES UV', qte: 1, pu: 108287.00, total: 108287.00, marque: 'VILBER' },
            { no: '08', ref: 'VILB311100631', designation: 'LAMPES UV', qte: 1, pu: 108287.00, total: 108287.00, marque: 'VILBER' }
        ],
        totals: { ht: 1972324.50, tva: 374741.66, ttc: 2347066.16 }
    }
];

// Calcul de l'URL de l'API de manière robuste (compatible avec les routes imbriquées)
const baseUrl = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
const API_URL = baseUrl + '/api.php';

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
            const DATA_VERSION = 'ods_data_v23';
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
            const DATA_VERSION = 'ods_data_v23';
            const localData = localStorage.getItem(DATA_VERSION);
            return localData ? JSON.parse(localData) : INITIAL_ORDERS;
        }
    },

    _saveAllToShared: async (orders) => {
        const DATA_VERSION = 'ods_data_v20';
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

            if (!response.ok) {
                const text = await response.text();
                throw new Error(`Erreur serveur (${response.status}): ${text.substring(0, 100)}`);
            }

            const result = await response.json();
            if (!result.success) {
                throw new Error(result.message || "L'upload a échoué sur le serveur");
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
