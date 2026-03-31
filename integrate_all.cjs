
const fs = require('fs');
const path = require('path');

const tableData = `EN ATTENTE DE PAIEMENT 	 CRAPC  	 CRAPC  N°08	/	acquisition installation et mise en service des equipements scientifique 
EN ATTENTE DE PAIEMENT 	 SAIDAL   	 SAIDAL EQUIPEMENT  	/	acquisition installation et mise en service des equipements scientifique 
EN ATTENTE DE PAIEMENT 	INCC	Marché N°234/2024	/	acquisition installation et mise en service des equipements scientifique 
EN ATTENTE DE PAIEMENT 	SAIDAL CHERCHEL	Contrat N°001/2024	/	acquisition installation et mise en service des equipements scientifique 
EN ATTENTE DE PAIEMENT 	SAIDAL CHERCHEL 	Contrat N°002/2024	/	acquisition installation et mise en service des equipements scientifique 
EN ATTENTE DE PAIEMENT 	SAIDAL EL HARRACH	Contrat N°DS/ELH/DAA/08/2024	/	acquisition installation et mise en service des equipements scientifique 
EN ATTENTE DE PAIEMENT 	SAIDAL MEDEA	Contrat N°04/DAC/MED/2024	/	acquisition installation et mise en service des equipements scientifique 
EN ATTENTE DE PAIEMENT 	CACQE 	Marché N°01/CACQE/2024	/	Installation et mise en marche des équipements de laboratoires
EN ATTENTE DE PAIEMENT 	saidal cherchell	002/25	/	Installation et mise en marche des équipements de laboratoires
EN ATTENTE DE PAIEMENT 	saidal cherchell	003/25	/	Installation et mise en marche des équipements de laboratoires
EN ATTENTE DE PAIEMENT 	CACQE 	Marché N°03/CACQE/2024	/	Installation et mise en marche des équipements de laboratoires
EN ATTENTE DE PAIEMENT 	saidal dar el beida	001/2025	/	Installation et mise en marche des équipements de laboratoires
EN ATTENTE DE PAIEMENT 	SEAAL 	CONTRAT N 09/2025	/	Installation et mise en marche des équipements de laboratoires
EN ATTENTE DE PAIEMENT 	INCC 	INCC 321/005	/	Installation et mise en marche des équipements de laboratoires
EN ATTENTE DE PAIEMENT 	CACQE	05/CACQE/2024	/	Installation et mise en marche des équipements de laboratoires
EN ATTENTE DE PAIEMENT 	Direction Centrale du Matériel DCM	N° E1107 /24 DCM	/	Installation et mise en marche des équipements de laboratoires
EN ATTENTE DE PAIEMENT 	DSP ORAN AFMED 52/24	DSP ORAN AFMED 52/24	/	Installation et mise en marche des équipements de laboratoires
EN ATTENTE DE PAIEMENT 	CRBT	CRBT 04/2025	/	 Acqui,insta,et mise en service d'équipements de base pour la station expérimental el baraouia 
EN ATTENTE DE PAIEMENT 	 saidal DEB 	contrat 13 &14	/	 fourniture et mise en service de deux HPLC 
EN ATTENTE DE PAIEMENT 	  Univ SETIF 01/2025 	 Univ SETIF 13/25	  Univ SETIF 13/25 	  اقتناء أدوات ومعدات علمية لفائدة مخبر أمراض القلب و الأوعية الدموية الوراثية و الغذائية بكلية الطب بجامعة سطيف1 فرحات عباس  
EN ATTENTE DE PAIEMENT 	URAPC 	URAPC	/	Installation et mise en marche des équipements de laboratoires
EN ATTENTE DE PAIEMENT 	RAFFINNERIE ARZEW	RAFFIN AREZEW N°INV Z LAB 02-24	/	Fourniture et mise en service spectrometre absorption atomique
EN ATTENTE DE PAIEMENT 	ENP CONSTANTINE 	Contrat N°09/2024	/	Acquisition d'équipements scientifiques pour les travaux pratiques
EN ATTENTE DE PAIEMENT 	GTFT 	BC GTFT 24725	/	Chromatigraphe en phase gazeuse CPG pour analyser les impurté soufré
EN ATTENTE DE PAIEMENT 	FOREMHYD STEP ADRAR 	AO N°01/FOREMHYD/UNITE 	/	Fourniture et mise en service des équipements de laboratoire déstiné pour la station d'épuration des eaux usées
EN ATTENTE DE PAIEMENT 	SEOR	SEOR N°35/DG/2024	/	Acquisition de produits chimiques pour laboratoire LCK test en cuve
EN ATTENTE DE PAIEMENT 	saidal Cherchell	contrat N°001/2025	/	ACQUISITION DES EQUIPEMENT SCIENTIFIQUE 
EN ATTENTE DE PAIEMENT 	 SEAAL  	seaal/DAM-UA/2025/C-03-23	/	 Acquisition d'equipement pour laboratoire central 
EN ATTENTE DE PAIEMENT 	CRAPC 	15/CRAPC/2024	N°19	Acquisition et installation et mise en marche du petit materiels de laboratoire
EN ATTENTE DE PAIEMENT 	SAIDAL	65/CRD/2024	/	ACQUISITION DES EQUIPEMENT SCIENTIFIQUE 
EN ATTENTE DE PAIEMENT 	sonatrach skikda CP2K	BC 4500057418	002//EL/2026	ACQUISITION D'UN ANALYSEUR KARL FISHER
EN ATTENTE DE PAIEMENT 	 Saidal dar el beida  	N°05/25	 AO N°21 	 Acquisition équipement de laboratoire hplc DAD 
EN ATTENTE DE PAIEMENT 	 CRTSE  	BON DE COMMANDE N° PO-0142	 CONSULTATION N° 12 	 ACHAT DES CABLES POUR LA POTENTIONSTAT 
EN ATTENTE DE PAIEMENT 	 saidal medea 	15/2025	 saidal 15 	 fourniture HPLC 
EN ATTENTE DE PAIEMENT 	 UNIVERSITE ANNABA  	13/2025	12/2025	 ACQUISITION SZ SPECTROPHOTOMETTRE HACH 
EN ATTENTE DE PAIEMENT 	 sarpi 	126/2025	126/2025	 Acquisition d'un DBO Metre  
EN ATTENTE DE PAIEMENT 	Météo algerie	contrat n°23/25	/	Acquisition d'une chambre climatique en température et humidite
EN ATTENTE DE PAIEMENT 	 CRBT N°02/25 	Contrat N°02/25	 CRBT N°02/25 	 Acqui,insta,et mise en service des équipements scientifique de laboratoire culture cellulaire BSL2 
EN ATTENTE DE PAIEMENT 	UNIVERSITE DE TIARET	Convention N°02	/	Acquisition D'EQUIPEMENT DE LABORATOIRE 
EN ATTENTE DE PAIEMENT 	 CHU+B150:S150 BAB ELOUED 	BC 127/25 CONTRAT	 / 	 CONSOMMABLE DE MARQUE CHIMADZU 
EN ATTENTE DE PAIEMENT 	 Hopital militaire 	82/2025	 AO N°862/2025 	 Réparation et mise en état de marche des équipements médico-chirugicaux 
EN ATTENTE DE PAIEMENT 	SAIDAL DEB	SAIDAL 063/25	/	Acquisition et mise en service d'équipements de laboratoire
CONTRAT EN COURS D'EXECUTION	GSE 	PO F24P104781-BD / 5437-00-CDMI-TA-24-34606 	/	Installation et mise en marche des équipements de laboratories
CONTRAT EN COURS D'EXECUTION	  	seaal/DAM-UA/2025/C-04/30	/	Installation et mise en marche des équipements de laboratories
CONTRAT EN COURS D'EXECUTION	UNIVERSITE  ALGER 1	010/2024	/	fourniture equipement scientifique 
CONTRAT EN COURS D'EXECUTION	KOTAMA	N°01/2025	/	Fourniture, montage et mise en service d'équipements de laboratoire
CONTRAT EN COURS D'EXECUTION	 MDN DCI 	 N° 1305	AO N°569	 Acquisition, installation et mise en service des équipements scientifiques et techniques pour les laboratoire de l'intendance 
CONTRAT EN COURS D'EXECUTION	sonatrach arzew 	N° INV Z LAB 03-24	/	Fourniture et installation immobilier spécifique laboratoire 
CONTRAT EN COURS D'EXECUTION	SONALGAZ Tiaret	COMMANDE N° 02/25 	/	Acqisition et mise en service d'un analyseurs de fumées
CONTRAT EN COURS D'EXECUTION	sonatrach CRD Boumerdes L06	L06/25/INV	/	Fourniture de 18 Thermohygrometres enregistreurs
CONTRAT EN COURS D'EXECUTION	sonatrach CRD Boumerdes L05	Contrat N°L05-2025	/	Fourniture avec service liés de 02 spectrophotomètre de terrain avec accéssoires
CONTRAT EN COURS D'EXECUTION	CETIM N°002	Contrat n°002/25	/	Fourniture et mise en service d'un analyseur de gaz e combustion industrielle
CONTRAT EN COURS D'EXECUTION	GTFT 	 N°561	/	MAINTENANCE CHROMATOGRAPHIE
CONTRAT EN COURS D'EXECUTION	GENDARMERIE NATIONALE	0058/3637	/	acquisition des équipements de protection d'environnement 07 spectromètre Raman portatif
CONTRAT EN COURS D'EXECUTION	SAIDAL	24/2023	/	FOURNITURE DE CONSOMMABLE
CONTRAT EN COURS D'EXECUTION	CYTOLAB 	CYTOLAB 	/	PRESTATION
CONTRAT EN COURS D'EXECUTION	 saidal el harrach  	03/HPLC/SPECT/2025	/	 Fourniture équipement de laboratoire  
CONTRAT EN COURS D'EXECUTION	seaco constantine 	014/2025	/	Contrat a commande pour la Fourniture des équipements HACH LANGE de laboratoire
CONTRAT EN COURS D'EXECUTION	Contrat à commande INCC N°07-2025	Contrat à commande INCC N°07-2025	 	Prestation de poids et mesures au profit de l'INCC
CONTRAT EN COURS D'EXECUTION	 EL OUED n°06 	EL OUED n°06	 	 اقتناء و تركيب التجهيزات التكميلية لفائدة جامعة الوادي 
CONTRAT EN COURS D'EXECUTION	 EL OUED 	el oued 11	 EL OUED 14 	 Equipement Scientifique de Laboratoire  
CONTRAT EN COURS D'EXECUTION	 EL OUED n°07 	EL OUED n°07	 	 اقتناء تجهيزات علمية للارضية التقنية للتحاليل الفيزيوكميائية 
CONTRAT EN COURS D'EXECUTION	INCC 009/325	INCC 009/325	 	Acqui,Insta,et mise en service des équipements de laboratories des analyseurs et microscopie au profit de l'incc
CONTRAT EN COURS D'EXECUTION	UNIVERSITE DE  RELIZANE n°02/2025	Contrat  n°02/2025	UNIVERSITE DE  RELIZANE n°02/2025	Acqui,des équipements scientifique pour le renforcement des travaux pratiques lots 4: equipements agronomie
CONTRAT EN COURS D'EXECUTION	 CRBT   	contrat  N°17/25	 CRBT N°13/25  	 Acquisition, installation et mise en service d'équipement de base 
CONTRAT EN COURS D'EXECUTION	 CRTSE  	BC N°12	 CRTSE  	 Acquisition des equipemnts scientifique  
CONTRAT EN COURS D'EXECUTION	CEVA Santé Animal 	BC 18	CEVA Santé Animal 	viscometre
CONTRAT EN COURS D'EXECUTION	 SEAAL 	SEAAL/DAM-UA/2025/C-10-101	 SEAAL 	 Acquisition de pièce de rechange 
CONTRAT EN COURS D'EXECUTION	 Sonatrach arzew  	AO N°INV LAB 01-25 	 Sonatrach arzew 01/25 	  FOURNITURE ET MISE EN SERVICE DES EQUIPEMENTS DE LABORATOIRE EN TROIS (03) LOTS DISTINCTS: 
CONTRAT EN COURS D'EXECUTION	 BOUIRA N°17 	Contrat N°08	 BOUIRA N°17 	 Acquisition, installation et mise en service des équipements scientifiques pour laboratoire de recherche Gestion et Valorisation des ressources naturelles et assurances qualité  
CONTRAT EN COURS D'EXECUTION	 Direction du carburant 	AO N°04/25	 Direction du carburant 	 etalonnage 
CONTRAT EN COURS D'EXECUTION	 SAIDAL cherchel 	cons 029/2025	 SAIDAL cherchel 	 fourniture de valise de masse pour etalon  
CONTRAT EN COURS D'EXECUTION	 CETIM 	BC 022776	BC 022776	 2 COMPARATEUR NUMERIQUE  
CONTRAT EN COURS D'EXECUTION	 SAIDAL 	139/2025	 01/Acquisition 	 Acquisition des équipement de laboratoire 
CONTRAT EN COURS D'EXECUTION	 INCC 	69/206	 / 	 MAINTENANCE DES EQUIPEMENTS DE LABORATOIRE 
CONTRAT EN COURS D'EXECUTION	 INCC 	N° 039/355	AO N°19/2025/ TA6	 Acquisition au profit de l'incc de la gendarmerie national/1°RM 
CONTRAT EN COURS D'EXECUTION	 UDES n°04 	CONSUL N°05/2024	 UDES n°04 	 Acquisition,et mise en service d'un équipement scientifique Instrumentation et équipement de mesure 
CONTRAT EN COURS D'EXECUTION	 CRTSE  	BON DE COMMANDE N° PO-0188	 CONSULTATION N° 21 	 Acquisition des équipement de laboratory 
CONTRAT EN COURS D'EXECUTION	 CRTSE  	BON DE COMMANDE N° PO-0141	 CONSULTATION N° 18 	 Acquisition d'un spectrophotometre  
CONTRAT EN COURS D'EXECUTION	 UNIV D'Alger 	Bon de commande N° 051A/2025	 consultation N° 19/2025 	 Acquisition du materiel scientifique  
CONTRAT EN COURS D'EXECUTION	 UNIV D'Alger 	Bon de commande N° 052A/2025	 consultation N° 19/2025 	 Acquisition du materiel scientifique  
CONTRAT EN COURS D'EXECUTION	 univ bejaia  	contrat en attente	 consultation N° 20/2025 	 Acqiuisition du mobilier et materiel scientifique  
CONTRAT EN COURS D'EXECUTION	 SAIDAL DAR EB 	N° 08/2025	 / 	 ACQUISITION D4UN CHROMATOGRAPHE 
CONTRAT EN COURS D'EXECUTION	 SEAAL  	01/DAM/2024	 / 	 ACQUISITION DES REACTIFS ET CONSOMMABLE HACH 
CONTRAT EN COURS D'EXECUTION	 saidal dar el beida 	N° 09	 CONSULTATION 020 	 Acquisition et mise en service d'un autoclave 
CONTRAT EN COURS D'EXECUTION	 SEAAL 	SEAAL/DAM/-UA/2025C-09-99	 SEAAL 	 maintenance préventive et curative des équipements de laboratoire de la marque SHIMADZU/METROHM 
CONTRAT EN COURS D'EXECUTION	 DCI 	Consultation n°005/2025/DCI	 DCI 	 Diagnostic et réparation des équipements technique des laboratoires au profit de laboratory central de l'intendance 
CONTRAT EN COURS D'EXECUTION	 Univ bejaia  	17/2025	AO N° 03	 Acquisition d'equipements de laboratorio 
CONTRAT EN COURS D'EXECUTION	 Sonatrach  skikda/RA1K 	K/15/Tl/25	 N° 17 	 Acquisition d'analyseurs des eaux industrielles en deux lots distincts  
CONTRAT EN COURS D'EXECUTION	 ENSB CONSTANTINE 	ENSB N°01/2025	 ENSB CONSTANTINE 	 ACQUISITION DU MATERIEL THERMIQUE DE LABORATOIRE 
CONTRAT EN COURS D'EXECUTION	 ENP CONSTANTINE  	07/2025	 05/2025/enp  	 Acquisition des equipements scientifique  
CONTRAT EN COURS D'EXECUTION	 ANPP 	 	08/2025	 QUALIFICATION DES EQUIPEMENT DE LABORATOIRE  
CONTRAT EN COURS D'EXECUTION	convention ADE IN SALAH	Bon de commande N°0001885	CONSU 21/25 LOT1 équi,de laboratory	Acquisition des équipements de laboratory 
CONTRAT EN COURS D'EXECUTION	CRTAA	contrat 11/2025	14/2025	Accompagnement à l'accréditation 
CONTRAT EN COURS D'EXECUTION	 INCC 	197/2025	 197/2025/TA6 	 maintenance des equipements scientifique  
CONTRAT EN COURS D'EXECUTION	 sonatrach GL3z 	75/2025	19/GL3Z/2025	LA FOURNITURE, INSTALLATION ET MISE EN SERVICE D’UN (01) ANALYSEUR DE LA TENEUR EN EAU DANS L’HUILE
CONTRAT EN COURS D'EXECUTION	 UNIVERSITE OUARGLA 	05/2025	02/2025	 ACQUISITION D'EQUIPEMENT SCIENTIFIQUE 
CONTRAT EN COURS D'EXECUTION	 ENP CONSTANTINE  	06/2025	02/20205	 Acquisition d'équipements scientifiques 
CONTRAT EN COURS D'EXECUTION	 URAER 	08/2025	11/2025	 Acquisition d'équipements scientifiques 
CONTRAT EN COURS D'EXECUTION	 CRTAA 	AO N°02/25	 CRTAA 	 Acquisition du Matériel déstiné à la recherche scientifique et l'expérimentation  
CONTRAT EN COURS D'EXECUTION	 MDN force NAVAL  	N°170/25	N°170/25	 Acquisition des équipements scientifiques et techniques déstinés a la recheche et developpement 
CONTRAT EN COURS D'EXECUTION	 CHU BAB EL OUED AFMED 	24/2025	 24/25	 Acquisition et mise en service des equipement medicaux  
CONTRAT EN COURS D'EXECUTION	 INCC 	INCC 079/395	228/2025/TA7	 Acquisition et mise en servive d'équipement de laboratorio 
CONTRAT EN COURS D'EXECUTION	 UNIV TIARET 	01-2025	08/2025	 Acquisition d'équipements scientifiques 
CONTRAT EN COURS D'EXECUTION	 SONELGAZ ADRAR 	04/2026	27/2025/	Acquisition d'appareils d'analyse des gaz d'échappement
CONTRAT EN COURS D'EXECUTION	 univ biskra 	E 050 2401 10/MESRS/2024 02	 02/VRDP/2025 	 chromatographe uhplc-ms/ms Triple Quadripôle 
CONTRAT EN COURS D'EXECUTION	ONEDD	01/2026	ONEDD 02/2025	Acquisition d'équipement du réseau de surveillance et contrôle des émission des gaz industrielle
En attente d'ODS	CRAPC 03	04/CRAPC/2024  LoT06          03	04/crapc/2024	ACQUISITION DES EQUIPEMENT SCIENTIFIQUE 
En attente d'ODS	 ANPP 	contrat 02	04	Acquisition des equipements scientifique 
CONTRAT EN COURS D'EXECUTION	 DCI 	DCI 1463	429/2026	 Acquisition installation mise en service des equipements scientifiques  
CONTRAT EN COURS D'EXECUTION	 INCC 	62/378	 491/2025/TA6 	 5 %+Q221+B220:S221+B221:K221+Q221+B220:B221:L221 
En attente d'ODS	UNIV TIZI OUZOU	08/UMMTO/VRDPO/2023	UNIV TIZI OUZOU	ACQUISITION DES EQUIPEMENT SCIENTIFIQUE 
En attente d'ODS	 université biskra 	 AO N°:  20/VRDP/2024  Lot N°02	  AO N°:  10/VRDP/202 	 ACQUISITION DE PAILLASSE ET MOBILIERS POUR LE CENTRE D’INNOVATION ET DE TRANSFERT TECHNOLOGIQUE SNVHottes de laboratorio  
En attente d'ODS	GHARDAIA E 050 24 01 172/MESRS/2024 01	MARCHE UNIV GHARDAIA N°03/25 	GHARDAIA E 050 24 01 172/MESRS/2024 01	اقتناء معدات مخبر التثمين والمحافظة على الأنظمة البيئية الجافة
En attente d'ODS	AIRP 004/25	contrat de prestation	AIRP 004/25	la réalisation de la maintenance préventive, curative et qualification des équipements de la marque SHIMADZU et METRHOM 
En attente d'ODS	 Université Tlemcen 	AO N°10/VRDPO/25	 Université Tlemcen 	 Equipement d'un département de pharmacie industrielle - lot 06 analyse de précision 
En attente d'ODS	 SAIDAL 	AOR N°03/QUALI-ETALLONAGE/2025	 SAIDAL 	 LOT 06 
En attente d'ODS	 SAIDAL GDC 	19/DDA/2025	 AO N°05/MARS/25 	Fourniture équipement de laboratoire 
En attente d'ODS	 DGLT 	DGLT 879	 DGLT 879 	 fourniture, installation et mise en service d'équipement spécifiques lot 01-02-item06 du lot 04   
En attente d'ODS	 saidal cherchell 	CONTRAT N° 004	 saidal cherchell N°30 	 acquisition armoire frigorifique  
En attente d'ODS	 UNIVERSITE SOUK AHRAS 	/	 AO N° 03/2025 	 installation et mise en marche des équipement sciebtifiques pour la plateforme technologique et vétérinaire  
En attente d'ODS	 MDN SANTE MILITAIRE 	MDN SANTE MILITAIRE	114/2025	 FOURNITURE ET MISE EN SERVICE DES EQUIPEMENTS DE TOXICOLOGIE ET DE CHROMATOGRAPHIE 
En attente d'ODS	 SAIDAL GDC 	N° 21	/	 FOURNITURE INSTALLATION HOTTE A FLUX LAMINAIRE 
En attente d'ODS	 CRTAA 	 	14/2025	 Aquisition de petit materiel  
En attente d'ODS	 CRAPC CONSOMMABLE 	04/2025	NEGOCIATION DIRECTE	 AQCUISITION DE CONSOMMABLE  POUR LC MS ET GC MSMS  
En attente d'ODS	 SAIDAL  	GRE A GRE	02/MAINT	 MAINTENANCE PREVENTIVE ET CURATIVE  
En attente d'ODS	 univ skikda  	 	04/2025	Acquisition d’Equipements Scientifiques
En attente d'ODS	 UNIVERSITE RELIZANE 	05/2025	05/2025	 ACQUISITION D'EQUIPEMENT SCIENTIFIQUE 
En attente d'ODS	 Université CHLEF 	 	02/2025	Acquisition des equipements scientifique 
En attente d'ODS	 INCC 	328/2025	328/2026	 Acquisition des equipements de mesures et d'analyse de laboratory 
En attente d'ODS	 UDES 	01/2026	08/2025	 ACQUISITION D'EQUIPEMENT SCIENTIFIQUE 
En attente d'ODS	 EMP ecole militaire  	 	835/2024	 ACQUISITION D'EQUIPEMENT SCIENTIFIQUE 
En attente d'ODS	 univ MEDEA 	 	14/2025	Acquisition des equipements scientifique 
En attente d'ODS	 direction centrale des carburant MDN 	 	562/2025/	 ACQUISITION D'EQUIPEMENT SCIENTIFIQUE 
En attente d'ODS	 Univ Bordj Bouariridj 	 	04/2025	Acquisition d'équipements d'analyses chromatographiques
En attente d'ODS	 seaal 	negiciation directe 	 	marché a commande acquisition de consommables laboratorio de marque IDEXX
En attente d'ODS	 SONELGAZ DERGUINA 	 	10/SPE/2025	Acquisition d'un analyseur portable de fumées
En attente d'ODS	 CRBT 	16/2026	03/2025	Acquisition de petit materiel
En attente d'ODS	 TMM ORAN 	 	28/TMM/2025	Fourniture d'analyseurs transmetteurs en ligne 
En attente d'ODS	 sonatrach skikda 	TL/01/2026 INV	TL/01/2026 INV	Acquisition et mise en service d’analyseurs des produits pétroliers
En attente d'ODS	 INCC 	167/2025/TA6	167/2025/TA7	 Acquisition et mise en servive d'équipement de laboratorio 
ATTRIBUTION EN ATTENTE CONTRAT 	 sonatrach hassi rmel 	 	 N°014 	 Acquisition des réactifs et des consommables pour les laboratoires 
ATTRIBUTION EN ATTENTE CONTRAT 	 CRAPC 	 	01/CRAPC/2025	Acquisition des equipements scientifique 
ATTRIBUTION EN ATTENTE CONTRAT 	 univ Bouira 	 	08/UB/2025	Acquisition des equipements scientifique 
ATTRIBUTION EN ATTENTE CONTRAT 	DCSSM/MDN	 	679/2025	Acquisition des equipements de laboratorio toxicologie
ATTRIBUTION EN ATTENTE CONTRAT 	SAIDAL	 	11/EQUIPEMENT	Acquisition des equipements scientifique `;

const statusMap = {
    'EN ATTENTE DE PAIEMENT': 'En attente de paiement',
    'CONTRAT EN COURS D\'EXECUTION': 'En cours',
    'En attente d\'ODS': 'En attente d\'ODS',
    'ATTRIBUTION EN ATTENTE CONTRAT': 'Attribution en attente'
};

function cleanId(s) {
    if (!s) return 'unknown';
    return s.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

const lines = tableData.trim().split('\n');
const parsed = [];
lines.forEach(line => {
    const parts = line.split('\t').map(p => p.trim());
    if (parts.length < 5) return;
    const [etat, client, refContract, refOds, obj] = parts;
    const status = statusMap[etat] || etat;
    const id = 'init-' + cleanId(client).substring(0, 15) + '-' + cleanId(refContract).substring(0, 15);
    parsed.push({
        id, client, refContract, refOds: refOds === '/' ? '' : refOds, object: obj, status,
        dateOds: '', delay: '120', amount: '0', division: 'Division Laboratoire',
        importStatus: { authImport: null, importLaunched: false, estCustomsDate: '', domiciliationDate: '', clearedAt: '' },
        stockStatus: { reception: 'Aucune', receivedAt: '' },
        isReadyForDelivery: false,
        createdAt: '2025-03-30T10:00:00.000Z',
        files: {},
        articles: []
    });
});

// Update ONEDD specifically with the new details
const onedd = parsed.find(o => o.client.includes('ONEDD') || o.refContract.includes('01/2026'));
if (onedd) {
    onedd.object = "Acquisition d'équipements du réseau de surveillance et de contrôle des émissions des gaz industriels";
    onedd.articles = [
        { no: '03', designation: "Analyseur multi-paramètres CO, CO2, NO, NO2, SO2, H2S ou CxHy portatif", qte: 8, pu: 4768682, total: 38149456, unit: 'U' },
        { no: '09', designation: "SAA (Spectroscopie d’Absorption Atomique) pour l’analyse des métaux lourds (système hydrure + lampes)", qte: 3, pu: 14900000, total: 44700000, unit: 'U' }
    ];
    onedd.totals = { ht: 82849456, tva: 15741396.64, ttc: 98590852.64 };
    onedd.amount = onedd.totals.ttc.toString();
}

const initialDataPath = path.join(__dirname, 'src', 'services', 'initialData.js');
const content = fs.readFileSync(initialDataPath, 'utf8');
const startMarker = 'export const INITIAL_ORDERS = ';
const startIndex = content.indexOf(startMarker);
const initialOrdersStr = content.substring(startIndex + startMarker.length, content.lastIndexOf(';'));

let existingOrders = eval(initialOrdersStr);
const map = new Map();
existingOrders.forEach(o => map.set(o.refContract, o));

parsed.forEach(o => {
    if (map.has(o.refContract)) {
        const existing = map.get(o.refContract);
        // Merge but prioritize new status and objects if provided
        map.set(o.refContract, { ...existing, status: o.status, object: o.object || existing.object, articles: o.articles.length > 0 ? o.articles : existing.articles, totals: o.totals || existing.totals, amount: o.amount !== '0' ? o.amount : existing.amount });
    } else {
        map.set(o.refContract, o);
    }
});

const final = Array.from(map.values());
const newContent = 'export const INITIAL_ORDERS = ' + JSON.stringify(final, null, 4) + ';\n';
fs.writeFileSync(initialDataPath, newContent);
console.log('Successfully integrated ' + final.length + ' orders.');
