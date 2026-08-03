import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { tenderService } from '../services/tenderService';
import { logService } from '../services/logService';
import {
    Briefcase,
    Calendar,
    Users,
    CheckCircle2,
    Clock,
    AlertCircle,
    Plus,
    Search,
    Filter,
    Edit3,
    Trash2,
    ArrowRight,
    ClipboardCheck,
    FileText,
    Activity,
    X,
    LayoutDashboard,
    Paperclip,
    FileUp,
    Eye,
    Check,
    Share2,
    ShoppingBag,
    DollarSign,
    FolderOpen,
    TrendingUp,
    ShieldAlert,
    Sparkles,
    Building2,
    ArrowLeftRight
} from 'lucide-react';
import * as XLSX from 'xlsx';

const PERSONNEL = [
    { name: "MOUHOUB IMENE", email: "mouhoub.imene@esclab-algerie.com", role: "Coordinatrice" },
    { name: "HASSIBA FOUDIL", email: "h.foudil@esclab-algerie.com", role: "Assistante commerciale" },
    { name: "RANIA MOULAOUI", email: "r.moulaoui@esclab-algerie.com", role: "Assistante commerciale" },
    { name: "ABDERRAHMANE CHERBAL", email: "y.cherbal@esclab-algerie.com", role: "Technico-commercial" },
    { name: "NOUR EL HOUDA BELHAMEL", email: "n.belhamel@esclab-algerie.com", role: "Assistante commerciale" },
    { name: "YOUCEF BELKADI", email: "belkadi.youcef@esclab-algerie.com", role: "Technico-commercial" },
    { name: "KAMELIA IDIRI", email: "k.idiri@esclab-algerie.com", role: "Assistante commerciale" },
    { name: "MOUNIR KHELFAOUI", email: "m.khelfaoui@esclab-algerie.com", role: "Technico-commercial" },
    { name: "ILIZA ABDELLI", email: "i.abdelli@esclab-algerie.com", role: "Assistante commerciale" },
    { name: "LYDIA BELHOCINE", email: "l.belhocine@esclab-algerie.com", role: "Assistante commerciale" },
    { name: "NAZIM MOKHTARI", email: "n.mokhtari@esclab-algerie.com", role: "Technico-commercial" },
    { name: "ALI AIT AZZOUZ", email: "a.aitazouz@esclab-algerie.com", role: "Technico-commercial" }
];

const Tenders = () => {
    const { currentUser, isAdmin, isSuperAdmin, canExportData } = useAuth();
    const navigate = useNavigate();
    
    const isSuper = isSuperAdmin();
    const isAdm = isAdmin();
    const isCoordinator = currentUser?.email === 'mouhoub.imene@esclab-algerie.com';

    const [tenders, setTenders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [selectedTender, setSelectedTender] = useState(null);
    const [activeStatusFilter, setActiveStatusFilter] = useState("all");
    const [isUploading, setIsUploading] = useState(false);
    const [activeTab, setActiveTab] = useState("docs"); // docs, dqe, cautions, administrative, logistics

    // Form states for creating/editing tenders
    const [formData, setFormData] = useState({
        dispatchDate: new Date().toISOString().split('T')[0],
        deadlineDate: "",
        refCdc: "",
        object: "",
        organism: "",
        status: "En préparation",
        assignments: [], // Array of { email, name, role, status: 'pending'|'done' }
        items: [], // Array of { id, designation, reference, quantity, accessories, brand, type, priceHT, priceTTC }
        cautions: [], // Array of { id, type, amount, bank, date, status }
        
        // Service des Marchés Fields
        contractNumber: "",
        assignedCommercial: "",
        deliveryDelay: "",
        odsDate: "",
        stopOdsDate: "",
        restartOdsDate: "",
        deliveryDeadline: "",

        // Importation Fields
        importLaunchStatus: "En attente",
        importAuthStatus: "En attente",
        importClearanceStatus: "En attente",

        // Logistics Fields
        logisticsStockStatus: "En attente",
        logisticsDeliveryStatus: "En attente",
        logisticsBillingStatus: "En attente",
        logisticsProvisionalPvStatus: "En attente",
        logisticsWarrantyStatus: "",
        logisticsFinalPvStatus: "En attente",

        // Finance Fields
        financePaymentStatus: "En attente"
    });

    // Sub-form state for adding items to DQE
    const [newItem, setNewItem] = useState({
        designation: "",
        reference: "",
        quantity: 1,
        accessories: "",
        brand: "",
        type: "Importation",
        priceHT: 0,
        priceTTC: 0
    });

    // Sub-form state for adding cautions
    const [newCaution, setNewCaution] = useState({
        type: "Provisoire",
        amount: "",
        bank: "BNA",
        date: new Date().toISOString().split('T')[0],
        status: "Déposée"
    });

    useEffect(() => {
        loadTenders();
    }, []);

    const loadTenders = async () => {
        setIsLoading(true);
        const data = await tenderService.getAllTenders();
        setTenders(data);
        setIsLoading(false);
    };

    const handleOpenForm = (tender = null) => {
        if (tender) {
            setFormData({
                ...tender,
                assignments: tender.assignments || [],
                items: tender.items || [],
                cautions: tender.cautions || []
            });
        } else {
            setFormData({
                dispatchDate: new Date().toISOString().split('T')[0],
                deadlineDate: "",
                refCdc: "",
                object: "",
                organism: "",
                status: "En préparation",
                assignments: [],
                items: [],
                cautions: [],
                contractNumber: "",
                assignedCommercial: "",
                deliveryDelay: "",
                odsDate: "",
                stopOdsDate: "",
                restartOdsDate: "",
                deliveryDeadline: "",
                importLaunchStatus: "En attente",
                importAuthStatus: "En attente",
                importClearanceStatus: "En attente",
                logisticsStockStatus: "En attente",
                logisticsDeliveryStatus: "En attente",
                logisticsBillingStatus: "En attente",
                logisticsProvisionalPvStatus: "En attente",
                logisticsWarrantyStatus: "",
                logisticsFinalPvStatus: "En attente",
                financePaymentStatus: "En attente"
            });
        }
        setShowForm(true);
    };

    const toggleAssignment = (person) => {
        const exists = formData.assignments.find(a => a.email === person.email);
        if (exists) {
            setFormData({
                ...formData,
                assignments: formData.assignments.filter(a => a.email !== person.email)
            });
        } else {
            setFormData({
                ...formData,
                assignments: [...formData.assignments, { ...person, status: 'pending', techStatus: 'pending', finStatus: 'pending' }]
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await tenderService.saveTender(formData, `${currentUser?.firstName} ${currentUser?.lastName}`);
        if (res) {
            setShowForm(false);
            loadTenders();
        }
    };

    const handleFileUpload = async (e, tenderId, storageKey) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const res = await tenderService.saveFile(tenderId, storageKey, file, file.name);
            if (res.success) {
                // Check if worker contribution
                const isTech = storageKey.startsWith('tech_');
                const isFin = storageKey.startsWith('fin_');
                
                if (isTech || isFin) {
                    const updatedTenders = [...tenders];
                    const tIndex = updatedTenders.findIndex(t => t.id === tenderId);
                    if (tIndex !== -1) {
                        const tender = updatedTenders[tIndex];
                        const aIndex = tender.assignments.findIndex(a => a.email === currentUser.email);
                        if (aIndex !== -1) {
                            if (isTech) tender.assignments[aIndex].techStatus = 'done';
                            if (isFin) tender.assignments[aIndex].finStatus = 'done';
                            
                            if (tender.assignments[aIndex].techStatus === 'done' && tender.assignments[aIndex].finStatus === 'done') {
                                tender.assignments[aIndex].status = 'done';
                            }
                            
                            await tenderService.saveTender(tender, currentUser.firstName);
                        }
                    }
                }
                
                // Force state update for the active view
                const allData = await tenderService.getAllTenders();
                setTenders(allData);
                const currentTender = allData.find(t => t.id === tenderId);
                if (currentTender) {
                    setSelectedTender(currentTender);
                }
                alert("Fichier téléversé et enregistré avec succès !");
            } else {
                alert("Erreur lors du téléversement du fichier.");
            }
        } catch (err) {
            console.error(err);
            alert("Erreur serveur pendant le transfert.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleBatchDownload = (type) => {
        const count = selectedTender.assignments?.filter(a => a[`${type}Status`] === 'done').length;
        if (count === 0) {
            alert(`Aucune offre ${type === 'tech' ? 'technique' : 'financière'} disponible pour la compilation.`);
            return;
        }
        alert(`Compilation automatique en cours : ${count} fichier(s) détecté(s).\nOuverture dans de nouveaux onglets...`);
        
        selectedTender.assignments.forEach(a => {
            if (a[`${type}Status`] === 'done') {
                const key = `${type}_${a.email.replace(/[^a-zA-Z0-9]/g, '_')}`;
                window.open(tenderService.getFileUrl(selectedTender.id, key), '_blank');
            }
        });
    };

    // Export to Excel function
    const exportToExcel = () => {
        const data = filteredTenders.map(t => ({
            Ref: t.refCdc,
            Organisme: t.organism,
            Objet: t.object,
            Statut: t.status,
            HT: calculateTotals(t.items).ht,
            TTC: calculateTotals(t.items).ttc,
            Cautions: t.cautions?.length || 0
        }));
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Tenders');
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'tenders_export.xlsx';
        a.click();
        URL.revokeObjectURL(url);
    };

    // Products DQE Management
    const handleAddItem = async () => {
        if (!newItem.designation) return;
        
        const itemWithId = { ...newItem, id: Date.now() };
        const updatedTender = {
            ...selectedTender,
            items: [...(selectedTender.items || []), itemWithId]
        };
        
        const success = await tenderService.saveTender(updatedTender, currentUser.firstName);
        if (success) {
            setSelectedTender(updatedTender);
            setNewItem({
                designation: "",
                reference: "",
                quantity: 1,
                accessories: "",
                brand: "",
                type: "Importation",
                priceHT: 0,
                priceTTC: 0
            });
            loadTenders();
        }
    };

    const handleDeleteItem = async (itemId) => {
        const updatedTender = {
            ...selectedTender,
            items: (selectedTender.items || []).filter(item => item.id !== itemId)
        };
        
        const success = await tenderService.saveTender(updatedTender, currentUser.firstName);
        if (success) {
            setSelectedTender(updatedTender);
            loadTenders();
        }
    };

    // Bank Cautions Management
    const handleAddCaution = async () => {
        if (!newCaution.amount) return;

        const cautionWithId = { 
            ...newCaution, 
            id: Date.now().toString(),
            amount: parseFloat(newCaution.amount) || 0
        };
        const updatedTender = {
            ...selectedTender,
            cautions: [...(selectedTender.cautions || []), cautionWithId]
        };

        const success = await tenderService.saveTender(updatedTender, currentUser.firstName);
        if (success) {
            setSelectedTender(updatedTender);
            setNewCaution({
                type: "Provisoire",
                amount: "",
                bank: "BNA",
                date: new Date().toISOString().split('T')[0],
                status: "Déposée"
            });
            loadTenders();
        }
    };

    const handleDeleteCaution = async (cautionId) => {
        const updatedTender = {
            ...selectedTender,
            cautions: (selectedTender.cautions || []).filter(c => c.id !== cautionId)
        };

        const success = await tenderService.saveTender(updatedTender, currentUser.firstName);
        if (success) {
            setSelectedTender(updatedTender);
            loadTenders();
        }
    };

    const handleUpdateCautionStatus = async (cautionId, newStatus) => {
        const updatedCautions = (selectedTender.cautions || []).map(c => 
            c.id === cautionId ? { ...c, status: newStatus } : c
        );
        const updatedTender = {
            ...selectedTender,
            cautions: updatedCautions
        };

        const success = await tenderService.saveTender(updatedTender, currentUser.firstName);
        if (success) {
            setSelectedTender(updatedTender);
            loadTenders();
        }
    };

    const calculateTotals = (items = []) => {
        return items.reduce((acc, item) => {
            acc.ht += (Number(item.priceHT) || 0) * (Number(item.quantity) || 1);
            acc.ttc += (Number(item.priceTTC) || 0) * (Number(item.quantity) || 1);
            return acc;
        }, { ht: 0, ttc: 0 });
    };

    const calculateCautionsTotal = (cautions = []) => {
        return cautions.reduce((sum, c) => sum + (Number(c.amount) || 0), 0);
    };

    const filteredTenders = useMemo(() => {
        return tenders.filter(t => {
            // Non-coordinator users only see tenders they are assigned to
            if (!isCoordinator && !isSuper && !isAdm) {
                const isAssigned = t.assignments?.some(a => a.email === currentUser?.email);
                if (!isAssigned) return false;
            }

            const matchesSearch = (
                (t.refCdc || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                (t.object || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                (t.organism || "").toLowerCase().includes(searchTerm.toLowerCase())
            );
            const matchesStatus = activeStatusFilter === "all" || t.status === activeStatusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [tenders, searchTerm, activeStatusFilter, isCoordinator, currentUser, isSuper, isAdm]);

    // Statistics calculations
    const stats = useMemo(() => {
        const total = tenders.length;
        const prep = tenders.filter(t => t.status === 'En préparation').length;
        const submitted = tenders.filter(t => t.status === 'Déposé').length;
        const won = tenders.filter(t => t.status === 'Adjugé').length;
        const lost = tenders.filter(t => t.status === 'Perdu').length;

        // Total won amount
        const wonAmount = tenders
            .filter(t => t.status === 'Adjugé')
            .reduce((sum, t) => sum + calculateTotals(t.items).ttc, 0);

        // Active provisional cautions amount
        const activeCautions = tenders
            .reduce((sum, t) => {
                const provCautions = (t.cautions || []).filter(c => c.type === 'Provisoire' && c.status === 'Déposée');
                return sum + calculateCautionsTotal(provCautions);
            }, 0);

        return { total, prep, submitted, won, lost, wonAmount, activeCautions };
    }, [tenders]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'En préparation': return 'bg-amber-50 text-amber-600 border-amber-200';
            case 'Déposé': return 'bg-blue-50 text-blue-600 border-blue-200';
            case 'Adjugé': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
            case 'Perdu': return 'bg-rose-50 text-rose-600 border-rose-200';
            default: return 'bg-slate-50 text-slate-600 border-slate-200';
        }
    };

    return (
        <div className="max-w-[1600px] mx-auto pb-20 px-6">
            
            {/* Header Dashboard */}
            <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mt-6">
                <div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
                        Appels d'Offres <span className="text-indigo-600">& CDC</span>
                    </h2>
                    <p className="text-slate-500 font-medium">
                        Pilotez vos cahiers des charges, gérez les cautions bancaires et consolidez les offres commerciales.
                    </p>
                </div>

                {isCoordinator && (
                    <div className="flex gap-4">
                        <button 
                            onClick={() => handleOpenForm()}
                            className="bg-indigo-600 text-white px-8 py-4.5 rounded-[2rem] font-black flex items-center gap-3 shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all active:translate-y-0 text-sm tracking-widest uppercase"
                        >
                            <Plus size={20} strokeWidth={3} />
                            Initialiser un CDC
                        </button>
                        {canExportData() && (
                            <button 
                                onClick={exportToExcel}
                                className="bg-green-600 text-white px-6 py-2 rounded-[2rem] font-black flex items-center gap-2 hover:bg-green-700 transition-all"
                            >
                                Exporter Excel
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* KPI Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6 mb-12">
                <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total CDC</span>
                        <div className="w-8 h-8 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600"><FolderOpen size={16} /></div>
                    </div>
                    <div>
                        <p className="text-3xl font-black text-slate-900 leading-none mb-1">{stats.total}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Dossiers enregistrés</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">En Préparation</span>
                        <div className="w-8 h-8 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600"><Clock size={16} /></div>
                    </div>
                    <div>
                        <p className="text-3xl font-black text-amber-600 leading-none mb-1">{stats.prep}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Offres en rédaction</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Soumis</span>
                        <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600"><ClipboardCheck size={16} /></div>
                    </div>
                    <div>
                        <p className="text-3xl font-black text-blue-600 leading-none mb-1">{stats.submitted}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Dossiers déposés</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Adjugés</span>
                        <div className="w-8 h-8 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600"><CheckCircle2 size={16} /></div>
                    </div>
                    <div>
                        <p className="text-3xl font-black text-emerald-600 leading-none mb-1">{stats.won}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Marchés remportés</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between lg:col-span-2 xl:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Garanties Provisoires</span>
                        <div className="w-8 h-8 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600"><DollarSign size={16} /></div>
                    </div>
                    <div>
                        <p className="text-2xl font-black text-slate-900 leading-none mb-1">
                            {new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2 }).format(stats.activeCautions)} <span className="text-sm font-black text-indigo-600">DA</span>
                        </p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Cautions provisoires engagées</p>
                    </div>
                </div>
            </div>

            {/* Filters and Search Panel */}
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm mb-8 flex flex-col lg:flex-row justify-between items-center gap-6">
                <div className="relative w-full lg:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Rechercher par référence, organisme..."
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-xs font-bold shadow-inner focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto scrollbar-hide py-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2 flex items-center gap-1 shrink-0"><Filter size={12} /> Statut :</span>
                    {['all', 'En préparation', 'Déposé', 'Adjugé', 'Perdu'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setActiveStatusFilter(status)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shrink-0 ${
                                activeStatusFilter === status 
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                                : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                            }`}
                        >
                            {status === 'all' ? 'Tout voir' : status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tenders Grid */}
            {isLoading ? (
                <div className="bg-white p-20 rounded-[3rem] border border-slate-100 text-center shadow-sm">
                    <Clock size={40} className="mx-auto text-indigo-300 animate-spin mb-4" />
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Chargement des Appels d'Offres...</p>
                </div>
            ) : filteredTenders.length === 0 ? (
                <div className="bg-white p-24 rounded-[3rem] border border-slate-100 text-center shadow-sm">
                    <Briefcase size={56} className="mx-auto text-slate-200 mb-6" />
                    <h3 className="text-xl font-black text-slate-900 mb-2">Aucun dossier trouvé</h3>
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-wider">Ajustez vos filtres ou créez une opportunité</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {filteredTenders.map((tender) => {
                        const { ht, ttc } = calculateTotals(tender.items);
                        const cautionsCount = tender.cautions?.length || 0;
                        
                        return (
                            <div 
                                key={tender.id}
                                className="bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-100/50 hover:shadow-2xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300 flex flex-col p-8 group relative overflow-hidden"
                            >
                                {/* Upper Header Card */}
                                <div className="flex items-center justify-between mb-6">
                                    <span className={`px-4.5 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusColor(tender.status)}`}>
                                        {tender.status}
                                    </span>
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                        <Calendar size={12} /> {tender.deadlineDate ? `Limite : ${new Date(tender.deadlineDate).toLocaleDateString('fr-FR')}` : 'Pas de date limite'}
                                    </span>
                                </div>

                                {/* Tender Title & Organism */}
                                <div className="mb-4">
                                    <h4 className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase leading-tight tracking-tight mb-1 truncate">
                                        {tender.refCdc || "SANS RÉFÉRENCE"}
                                    </h4>
                                    <p className="text-xs font-black text-indigo-500 uppercase tracking-wider flex items-center gap-1.5">
                                        <Building2 size={13} /> {tender.organism || "Organisme Inconnu"}
                                    </p>
                                </div>

                                {/* Objet text */}
                                <p className="text-slate-500 font-medium text-xs leading-relaxed line-clamp-3 mb-6 flex-1">
                                    {tender.object || "Aucune description renseignée."}
                                </p>

                                {/* Badges list */}
                                <div className="grid grid-cols-3 gap-3 border-t border-b border-slate-50 py-4 mb-6">
                                    <div className="text-center">
                                        <p className="text-[8px] font-black text-slate-400 uppercase mb-0.5">Offre TTC</p>
                                        <p className="text-xs font-black text-slate-900">{ttc > 0 ? `${ttc.toLocaleString('fr-FR')} DA` : '--'}</p>
                                    </div>
                                    <div className="text-center border-l border-r border-slate-100">
                                        <p className="text-[8px] font-black text-slate-400 uppercase mb-0.5">Cautions</p>
                                        <p className="text-xs font-black text-indigo-600">{cautionsCount} Caution(s)</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[8px] font-black text-slate-400 uppercase mb-0.5">Produits</p>
                                        <p className="text-xs font-black text-slate-900">{tender.items?.length || 0} Item(s)</p>
                                    </div>
                                </div>

                                {/* Team assignments summary */}
                                <div className="mb-8">
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-3">Assignations & Statut</p>
                                    <div className="flex flex-wrap gap-2">
                                        {tender.assignments?.slice(0, 4).map((a, idx) => (
                                            <div key={idx} className="flex items-center gap-1 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 text-[10px] font-bold text-slate-600">
                                                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full shrink-0"></span>
                                                <span className="truncate max-w-[80px] uppercase font-black">{a.name.split(' ')[0]}</span>
                                            </div>
                                        ))}
                                        {(!tender.assignments || tender.assignments.length === 0) && (
                                            <span className="text-[9px] text-slate-400 font-bold italic uppercase">Aucun collaborateur assigné</span>
                                        )}
                                        {tender.assignments?.length > 4 && (
                                            <div className="bg-slate-100 px-2 py-1.5 rounded-xl text-[9px] font-black text-slate-500 uppercase">
                                                +{tender.assignments.length - 4}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Bottom actions */}
                                <div className="flex gap-4 mt-auto">
                                    {isCoordinator && (
                                        <button 
                                            onClick={() => handleOpenForm(tender)}
                                            className="px-4 py-3 bg-slate-50 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 hover:text-slate-800 transition-all shadow-sm border border-slate-100"
                                        >
                                            Éditer
                                        </button>
                                    )}
                                    <button 
                                        onClick={() => {
                                            setSelectedTender(tender);
                                            setActiveTab("docs");
                                        }}
                                        className="flex-1 py-3 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.15em] hover:bg-indigo-600 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 shadow-md shadow-slate-950/10"
                                    >
                                        Gérer le dossier <ArrowRight size={14} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* CDC Form Creation / Modification Modal */}
            {showForm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-md" onClick={() => setShowForm(false)}></div>
                    <div className="relative bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-8 bg-indigo-900 text-white flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-black uppercase tracking-tight">{formData.id ? "Modifier le Dossier" : "Créer un Dossier CDC"}</h3>
                                <p className="text-xs text-indigo-300 font-bold uppercase mt-1">Saisie des informations de base pour l'Appel d'Offres</p>
                            </div>
                            <button onClick={() => setShowForm(false)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 transition-all border border-white/10">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-10 max-h-[75vh] overflow-y-auto bg-white space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Left side: General Info */}
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Référence du CDC / Appel d'Offres</label>
                                        <input 
                                            required
                                            type="text"
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-slate-800 text-xs outline-none focus:border-indigo-400 focus:bg-white transition-all shadow-inner"
                                            value={formData.refCdc}
                                            onChange={(e) => setFormData({...formData, refCdc: e.target.value})}
                                            placeholder="Ex: CDC N°03/2026"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Organisme Public / Client</label>
                                        <input 
                                            required
                                            type="text"
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-slate-800 text-xs outline-none focus:border-indigo-400 focus:bg-white transition-all shadow-inner"
                                            value={formData.organism}
                                            onChange={(e) => setFormData({...formData, organism: e.target.value})}
                                            placeholder="Ex: Ministère de la Santé"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Objet des prestations</label>
                                        <textarea 
                                            required
                                            rows="4"
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 text-xs outline-none focus:border-indigo-400 focus:bg-white transition-all resize-none shadow-inner leading-relaxed"
                                            value={formData.object}
                                            onChange={(e) => setFormData({...formData, object: e.target.value})}
                                            placeholder="Décrivez l'objet global du marché..."
                                        ></textarea>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date d'Envoi</label>
                                            <input 
                                                type="date"
                                                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-slate-800 text-xs outline-none focus:border-indigo-400 focus:bg-white transition-all shadow-inner"
                                                value={formData.dispatchDate}
                                                onChange={(e) => setFormData({...formData, dispatchDate: e.target.value})}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date Limite de Dépôt</label>
                                            <input 
                                                type="date"
                                                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-slate-800 text-xs outline-none focus:border-indigo-400 focus:bg-white transition-all shadow-inner"
                                                value={formData.deadlineDate}
                                                onChange={(e) => setFormData({...formData, deadlineDate: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Right side: Assignments */}
                                <div className="space-y-6">
                                    <div className="p-6 bg-slate-50 rounded-[2.5rem] border border-slate-200 shadow-inner">
                                        <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                            <Users size={14} /> Collaborateurs Assignés
                                        </h4>
                                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                            {PERSONNEL.filter(p => p.email !== 'mouhoub.imene@esclab-algerie.com').map(person => {
                                                const isSelected = formData.assignments.some(a => a.email === person.email);
                                                return (
                                                    <button
                                                        key={person.email}
                                                        type="button"
                                                        onClick={() => toggleAssignment(person)}
                                                        className={`w-full flex items-center justify-between p-3.5 rounded-xl border-2 transition-all ${
                                                            isSelected 
                                                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' 
                                                            : 'bg-white border-slate-100 text-slate-600 hover:border-indigo-200'
                                                        }`}
                                                    >
                                                        <div className="text-left">
                                                            <p className="text-xs font-black uppercase tracking-tight">{person.name}</p>
                                                            <p className={`text-[8px] font-bold uppercase ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                                                                {person.role}
                                                            </p>
                                                        </div>
                                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center border-2 ${isSelected ? 'bg-white text-indigo-600 border-white' : 'border-slate-200'}`}>
                                                            {isSelected && <Check size={10} strokeWidth={4} />}
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Statut Initial</label>
                                        <select 
                                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-slate-800 text-xs outline-none focus:border-indigo-400 focus:bg-white transition-all shadow-inner"
                                            value={formData.status}
                                            onChange={(e) => setFormData({...formData, status: e.target.value})}
                                        >
                                            <option value="En préparation">En préparation</option>
                                            <option value="Déposé">Déposé</option>
                                            <option value="Adjugé">Adjugé</option>
                                            <option value="Perdu">Perdu</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="pt-6 border-t border-slate-100 flex gap-4 justify-end">
                                <button 
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="px-8 py-4 bg-slate-50 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-200 shadow-sm"
                                >
                                    Annuler
                                </button>
                                <button 
                                    type="submit"
                                    className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all"
                                >
                                    {formData.id ? "Enregistrer" : "Créer le Dossier"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Main Immersive Management Modal (Tender Details & Cautions Workflow) */}
            {selectedTender && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm" onClick={() => setSelectedTender(null)}></div>
                    <div className="relative bg-white w-full max-w-6xl rounded-[3.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-300 flex flex-col md:flex-row h-[85vh]">
                        
                        {/* Sidebar inside modal */}
                        <div className="w-full md:w-[320px] bg-slate-900 p-8 text-white flex flex-col justify-between shrink-0 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent opacity-50"></div>
                            
                            <div className="relative z-10 space-y-8">
                                <button 
                                    onClick={() => setSelectedTender(null)} 
                                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 transition-all border border-white/10"
                                >
                                    <X size={18} />
                                </button>
                                
                                <div>
                                    <span className="px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border border-white/20 bg-white/5 inline-block mb-3">
                                        Réf : {selectedTender.refCdc || "Aucune"}
                                    </span>
                                    <h3 className="text-2xl font-black tracking-tight leading-tight uppercase mb-2">{selectedTender.organism || "Organisme"}</h3>
                                    <p className="text-slate-400 font-bold text-xs line-clamp-3 leading-relaxed">{selectedTender.object}</p>
                                </div>

                                <div className="space-y-4 pt-4 border-t border-white/10">
                                    <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Statut Marché</p>
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></span>
                                            <span className="text-xs font-black uppercase">{selectedTender.status}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Compteurs</p>
                                        <p className="text-xs font-black">
                                            {selectedTender.items?.length || 0} Produits | {selectedTender.cautions?.length || 0} Cautions
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="relative z-10 pt-6 border-t border-white/10 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                                ESCLAB Tenders Manager v4.5
                            </div>
                        </div>

                        {/* Content Area with tabs */}
                        <div className="flex-1 flex flex-col h-full bg-slate-50/50">
                            {/* Tabs Navigation */}
                            <div className="bg-white px-8 border-b border-slate-100 flex gap-2 overflow-x-auto scrollbar-hide shrink-0 pt-4">
                                {[
                                    { id: 'docs', label: 'Soumission Offres', icon: <Paperclip size={14} /> },
                                    { id: 'dqe', label: 'DQE / Commercial', icon: <ShoppingBag size={14} /> },
                                    { id: 'cautions', label: 'Cautions Bancaires', icon: <DollarSign size={14} /> },
                                    { id: 'administrative', label: 'Service des Marchés', icon: <ClipboardCheck size={14} /> }
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`px-5 py-4 border-b-2 font-black text-[10px] uppercase tracking-wider flex items-center gap-2 transition-all ${
                                            activeTab === tab.id 
                                            ? 'border-indigo-600 text-indigo-600' 
                                            : 'border-transparent text-slate-400 hover:text-slate-600'
                                        }`}
                                    >
                                        {tab.icon}
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* Scrollable Tab Content */}
                            <div className="flex-1 p-8 overflow-y-auto space-y-8">
                                
                                {/* TAB 1: Documents & File Submission */}
                                {activeTab === 'docs' && (
                                    <div className="space-y-6">
                                        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                                            <h4 className="text-sm font-black text-slate-900 uppercase mb-4 flex items-center gap-2">
                                                <FileText size={16} className="text-indigo-600" /> Documents Source
                                            </h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/60 hover:border-indigo-400 transition-all flex flex-col justify-between items-center text-center">
                                                    <FileUp size={24} className="text-slate-400 mb-2" />
                                                    <p className="text-xs font-black text-slate-800 uppercase mb-1">Cahier des Charges</p>
                                                    <p className="text-[9px] text-slate-400 font-bold mb-4">PDF, XLS, DOC</p>
                                                    
                                                    <input 
                                                        type="file" 
                                                        id="cdc-file" 
                                                        className="hidden" 
                                                        onChange={(e) => handleFileUpload(e, selectedTender.id, 'cdc')} 
                                                    />
                                                    
                                                    <div className="flex gap-2">
                                                        <label htmlFor="cdc-file" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-[9px] font-black uppercase cursor-pointer hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100">
                                                            {selectedTender.files?.cdc ? 'Remplacer' : 'Déposer'}
                                                        </label>
                                                        {selectedTender.files?.cdc && (
                                                            <a href={tenderService.getFileUrl(selectedTender.id, 'cdc')} target="_blank" className="px-4 py-2 bg-slate-900 text-white rounded-lg text-[9px] font-black uppercase flex items-center gap-1">
                                                                <Eye size={10} /> Voir
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/60 flex flex-col justify-between items-center text-center">
                                                    <FileUp size={24} className="text-slate-400 mb-2" />
                                                    <p className="text-xs font-black text-slate-800 uppercase mb-1">Offre Globale Validée</p>
                                                    <p className="text-[9px] text-slate-400 font-bold mb-4">Dossier final transmis</p>
                                                    
                                                    <input 
                                                        type="file" 
                                                        id="final-cdc" 
                                                        className="hidden" 
                                                        onChange={(e) => handleFileUpload(e, selectedTender.id, 'final_submission')} 
                                                    />
                                                    
                                                    <div className="flex gap-2">
                                                        <label htmlFor="final-cdc" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-[9px] font-black uppercase cursor-pointer hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100">
                                                            {selectedTender.files?.final_submission ? 'Remplacer' : 'Déposer'}
                                                        </label>
                                                        {selectedTender.files?.final_submission && (
                                                            <a href={tenderService.getFileUrl(selectedTender.id, 'final_submission')} target="_blank" className="px-4 py-2 bg-slate-900 text-white rounded-lg text-[9px] font-black uppercase flex items-center gap-1">
                                                                <Eye size={10} /> Voir
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                                            <div className="flex justify-between items-center mb-4">
                                                <h4 className="text-sm font-black text-slate-900 uppercase flex items-center gap-2">
                                                    <Users size={16} className="text-indigo-600" /> Dépôt des Offres par Collaborateur
                                                </h4>
                                                {(isCoordinator || isSuper) && (
                                                    <div className="flex gap-2">
                                                        <button onClick={() => handleBatchDownload('tech')} className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-[9px] font-black uppercase hover:bg-indigo-100">Compiler Tech</button>
                                                        <button onClick={() => handleBatchDownload('fin')} className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-black uppercase hover:bg-emerald-100">Compiler Fin</button>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="space-y-3">
                                                {selectedTender.assignments?.map((a) => {
                                                    const cleanEmail = a.email.replace(/[^a-zA-Z0-9]/g, '_');
                                                    const techKey = `tech_${cleanEmail}`;
                                                    const finKey = `fin_${cleanEmail}`;
                                                    const hasTech = selectedTender.files?.[techKey];
                                                    const hasFin = selectedTender.files?.[finKey];
                                                    const isMe = a.email === currentUser.email;

                                                    return (
                                                        <div key={a.email} className={`p-4 rounded-xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${isMe ? 'bg-indigo-50/50 border-indigo-100' : 'bg-slate-50/50 border-slate-100'}`}>
                                                            <div>
                                                                <p className="text-xs font-black text-slate-800 uppercase">{a.name} {isMe && "(Moi)"}</p>
                                                                <p className="text-[9px] font-bold text-slate-400 uppercase">{a.role}</p>
                                                            </div>

                                                            <div className="flex flex-wrap items-center gap-4">
                                                                {/* Technical offer input */}
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-[9px] font-black text-slate-400 uppercase">Technique :</span>
                                                                    {isMe ? (
                                                                        <>
                                                                            <input type="file" id={`upload-t-${cleanEmail}`} className="hidden" onChange={(e) => handleFileUpload(e, selectedTender.id, techKey)} />
                                                                            <label htmlFor={`upload-t-${cleanEmail}`} className="px-3 py-1.5 bg-white border border-slate-200 rounded text-[9px] font-black uppercase cursor-pointer hover:bg-slate-50">
                                                                                {hasTech ? 'Remplacer' : 'Uploader'}
                                                                            </label>
                                                                        </>
                                                                    ) : (
                                                                        <span className={`text-[8px] font-black px-2 py-1 rounded uppercase ${hasTech ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-400'}`}>
                                                                            {hasTech ? 'Prêt' : 'En attente'}
                                                                        </span>
                                                                    )}
                                                                    {hasTech && (
                                                                        <a href={tenderService.getFileUrl(selectedTender.id, techKey)} target="_blank" className="p-1.5 bg-slate-900 text-white rounded hover:bg-slate-800"><Eye size={10} /></a>
                                                                    )}
                                                                </div>

                                                                {/* Financial offer input */}
                                                                <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
                                                                    <span className="text-[9px] font-black text-slate-400 uppercase">Financière :</span>
                                                                    {isMe ? (
                                                                        <>
                                                                            <input type="file" id={`upload-f-${cleanEmail}`} className="hidden" onChange={(e) => handleFileUpload(e, selectedTender.id, finKey)} />
                                                                            <label htmlFor={`upload-f-${cleanEmail}`} className="px-3 py-1.5 bg-white border border-slate-200 rounded text-[9px] font-black uppercase cursor-pointer hover:bg-slate-50">
                                                                                {hasFin ? 'Remplacer' : 'Uploader'}
                                                                            </label>
                                                                        </>
                                                                    ) : (
                                                                        <span className={`text-[8px] font-black px-2 py-1 rounded uppercase ${hasFin ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-400'}`}>
                                                                            {hasFin ? 'Prêt' : 'En attente'}
                                                                        </span>
                                                                    )}
                                                                    {hasFin && (
                                                                        <a href={tenderService.getFileUrl(selectedTender.id, finKey)} target="_blank" className="p-1.5 bg-slate-900 text-white rounded hover:bg-slate-800"><Eye size={10} /></a>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* TAB 2: DQE Products table */}
                                {activeTab === 'dqe' && (
                                    <div className="space-y-6">
                                        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
                                            <div className="flex justify-between items-center">
                                                <h4 className="text-sm font-black text-slate-900 uppercase">Bordereau des Prix (DQE)</h4>
                                                <div className="flex gap-4">
                                                    <div className="text-right">
                                                        <p className="text-[8px] font-black text-slate-400 uppercase mb-0.5">Total TTC Marché</p>
                                                        <p className="text-base font-black text-indigo-600">
                                                            {calculateTotals(selectedTender.items).ttc.toLocaleString()} DA
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Add Item form */}
                                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                                <div className="space-y-1">
                                                    <label className="text-[8px] font-black text-slate-400 uppercase">Désignation Article</label>
                                                    <input 
                                                        type="text" 
                                                        value={newItem.designation} 
                                                        onChange={(e) => setNewItem({...newItem, designation: e.target.value})}
                                                        placeholder="Désignation..."
                                                        className="w-full p-3 bg-white border border-slate-200 rounded-lg text-[10px] font-bold outline-none"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[8px] font-black text-slate-400 uppercase">Référence</label>
                                                    <input 
                                                        type="text" 
                                                        value={newItem.reference} 
                                                        onChange={(e) => setNewItem({...newItem, reference: e.target.value})}
                                                        placeholder="Réf..."
                                                        className="w-full p-3 bg-white border border-slate-200 rounded-lg text-[10px] font-bold outline-none"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[8px] font-black text-slate-400 uppercase">Quantité</label>
                                                    <input 
                                                        type="number" 
                                                        value={newItem.quantity} 
                                                        onChange={(e) => setNewItem({...newItem, quantity: parseInt(e.target.value) || 1})}
                                                        className="w-full p-3 bg-white border border-slate-200 rounded-lg text-[10px] font-bold outline-none"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[8px] font-black text-slate-400 uppercase">Prix HT (DA)</label>
                                                    <input 
                                                        type="number" 
                                                        value={newItem.priceHT} 
                                                        onChange={(e) => {
                                                            const ht = parseFloat(e.target.value) || 0;
                                                            setNewItem({...newItem, priceHT: ht, priceTTC: Math.round(ht * 1.19 * 100) / 100});
                                                        }}
                                                        className="w-full p-3 bg-white border border-slate-200 rounded-lg text-[10px] font-bold outline-none"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[8px] font-black text-slate-400 uppercase">Marque</label>
                                                    <input 
                                                        type="text" 
                                                        value={newItem.brand} 
                                                        onChange={(e) => setNewItem({...newItem, brand: e.target.value})}
                                                        placeholder="Marque..."
                                                        className="w-full p-3 bg-white border border-slate-200 rounded-lg text-[10px] font-bold outline-none"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[8px] font-black text-slate-400 uppercase">Origine</label>
                                                    <select 
                                                        value={newItem.type} 
                                                        onChange={(e) => setNewItem({...newItem, type: e.target.value})}
                                                        className="w-full p-3 bg-white border border-slate-200 rounded-lg text-[10px] font-bold outline-none"
                                                    >
                                                        <option value="Importation">Importation</option>
                                                        <option value="Produit Local">Produit Local</option>
                                                    </select>
                                                </div>
                                                <div className="space-y-1 sm:col-span-2 flex items-end">
                                                    <button 
                                                        onClick={handleAddItem}
                                                        className="w-full h-11 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase hover:bg-indigo-600 transition-all shadow"
                                                    >
                                                        Ajouter au tableau
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Table list */}
                                            <div className="overflow-x-auto border border-slate-100 rounded-xl bg-white">
                                                <table className="w-full text-left">
                                                    <thead className="bg-slate-50">
                                                        <tr>
                                                            <th className="p-4 text-[9px] font-black text-slate-400 uppercase">Désignation</th>
                                                            <th className="p-4 text-[9px] font-black text-slate-400 uppercase">Réf</th>
                                                            <th className="p-4 text-[9px] font-black text-slate-400 uppercase text-center">Qté</th>
                                                            <th className="p-4 text-[9px] font-black text-slate-400 uppercase">Marque</th>
                                                            <th className="p-4 text-[9px] font-black text-slate-400 uppercase text-right">Prix HT</th>
                                                            <th className="p-4 text-[9px] font-black text-slate-400 uppercase text-right">Total TTC</th>
                                                            <th className="p-4"></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-100 text-xs">
                                                        {(selectedTender.items || []).map((item) => (
                                                            <tr key={item.id}>
                                                                <td className="p-4 font-black uppercase text-slate-800">{item.designation}</td>
                                                                <td className="p-4 text-slate-500 font-bold">{item.reference || '--'}</td>
                                                                <td className="p-4 text-center font-bold">{item.quantity}</td>
                                                                <td className="p-4 font-black text-indigo-600 uppercase">{item.brand || '--'}</td>
                                                                <td className="p-4 text-right font-bold">{(item.priceHT || 0).toLocaleString()} DA</td>
                                                                <td className="p-4 text-right font-black text-emerald-600">{(item.priceTTC * item.quantity || 0).toLocaleString()} DA</td>
                                                                <td className="p-4 text-right">
                                                                    <button onClick={() => handleDeleteItem(item.id)} className="text-rose-500 hover:bg-rose-50 p-2 rounded-lg transition-colors"><Trash2 size={12} /></button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                        {(selectedTender.items || []).length === 0 && (
                                                            <tr>
                                                                <td colSpan="7" className="p-8 text-center text-slate-400 font-medium italic">Le bordereau de prix est vide.</td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* TAB 3: Tenders Bank Cautions workflow */}
                                {activeTab === 'cautions' && (
                                    <div className="space-y-6">
                                        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
                                            <div className="flex justify-between items-center">
                                                <h4 className="text-sm font-black text-slate-900 uppercase">Suivi des Garanties & Cautions Bancaires</h4>
                                                <div className="text-right">
                                                    <p className="text-[8px] font-black text-slate-400 uppercase mb-0.5">Somme des Cautions</p>
                                                    <p className="text-base font-black text-indigo-600">
                                                        {calculateCautionsTotal(selectedTender.cautions).toLocaleString()} DA
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Add Caution Form */}
                                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                                                <div className="space-y-1">
                                                    <label className="text-[8px] font-black text-slate-400 uppercase">Type de Caution</label>
                                                    <select 
                                                        value={newCaution.type} 
                                                        onChange={(e) => setNewCaution({...newCaution, type: e.target.value})}
                                                        className="w-full p-3 bg-white border border-slate-200 rounded-lg text-[10px] font-bold outline-none"
                                                    >
                                                        <option value="Provisoire">Provisoire (Dépôt CDC)</option>
                                                        <option value="Définitive">Définitive (Bonne exécution)</option>
                                                        <option value="Restitution d'acompte">Restitution d'acompte</option>
                                                        <option value="Garantie">Garantie matériel</option>
                                                    </select>
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[8px] font-black text-slate-400 uppercase">Montant (DA)</label>
                                                    <input 
                                                        type="number" 
                                                        value={newCaution.amount} 
                                                        onChange={(e) => setNewCaution({...newCaution, amount: e.target.value})}
                                                        placeholder="Montant..."
                                                        className="w-full p-3 bg-white border border-slate-200 rounded-lg text-[10px] font-bold outline-none"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[8px] font-black text-slate-400 uppercase">Banque Émettrice</label>
                                                    <select 
                                                        value={newCaution.bank} 
                                                        onChange={(e) => setNewCaution({...newCaution, bank: e.target.value})}
                                                        className="w-full p-3 bg-white border border-slate-200 rounded-lg text-[10px] font-bold outline-none"
                                                    >
                                                        <option value="BNA">BNA</option>
                                                        <option value="BEA">BEA</option>
                                                        <option value="CPA">CPA</option>
                                                        <option value="BDL">BDL</option>
                                                        <option value="BADR">BADR</option>
                                                        <option value="AGB">AGB</option>
                                                    </select>
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[8px] font-black text-slate-400 uppercase">Date d'Émission</label>
                                                    <input 
                                                        type="date" 
                                                        value={newCaution.date} 
                                                        onChange={(e) => setNewCaution({...newCaution, date: e.target.value})}
                                                        className="w-full p-3 bg-white border border-slate-200 rounded-lg text-[10px] font-bold outline-none"
                                                    />
                                                </div>
                                                <div className="space-y-1 flex items-end">
                                                    <button 
                                                        onClick={handleAddCaution}
                                                        className="w-full h-11 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase hover:bg-indigo-600 transition-all shadow"
                                                    >
                                                        Enregistrer Caution
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Cautions List Table */}
                                            <div className="overflow-x-auto border border-slate-100 rounded-xl bg-white">
                                                <table className="w-full text-left">
                                                    <thead className="bg-slate-50">
                                                        <tr>
                                                            <th className="p-4 text-[9px] font-black text-slate-400 uppercase">Type de Caution</th>
                                                            <th className="p-4 text-[9px] font-black text-slate-400 uppercase text-right">Montant</th>
                                                            <th className="p-4 text-[9px] font-black text-slate-400 uppercase text-center">Banque</th>
                                                            <th className="p-4 text-[9px] font-black text-slate-400 uppercase text-center">Date Émission</th>
                                                            <th className="p-4 text-[9px] font-black text-slate-400 uppercase text-center">Statut</th>
                                                            <th className="p-4"></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-100 text-xs">
                                                        {(selectedTender.cautions || []).map((caution) => (
                                                            <tr key={caution.id} className="hover:bg-slate-50/20 transition-colors">
                                                                <td className="p-4 font-black text-slate-800">{caution.type}</td>
                                                                <td className="p-4 text-right font-black text-slate-950">{(caution.amount || 0).toLocaleString()} DA</td>
                                                                <td className="p-4 text-center font-bold text-slate-600">{caution.bank}</td>
                                                                <td className="p-4 text-center text-slate-500 font-bold">{new Date(caution.date).toLocaleDateString('fr-FR')}</td>
                                                                <td className="p-4 text-center">
                                                                    <select 
                                                                        value={caution.status}
                                                                        onChange={(e) => handleUpdateCautionStatus(caution.id, e.target.value)}
                                                                        className={`p-1.5 text-[9px] font-black rounded-lg border-none shadow-sm cursor-pointer outline-none uppercase ${
                                                                            caution.status === 'Libérée' 
                                                                            ? 'bg-emerald-50 text-emerald-600' 
                                                                            : caution.status === 'Déposée' 
                                                                            ? 'bg-blue-50 text-blue-600' 
                                                                            : 'bg-rose-50 text-rose-600'
                                                                        }`}
                                                                    >
                                                                        <option value="Déposée">Déposée</option>
                                                                        <option value="Libérée">Libérée</option>
                                                                        <option value="Confisquée">Confisquée</option>
                                                                        <option value="Annulée">Annulée</option>
                                                                    </select>
                                                                </td>
                                                                <td className="p-4 text-right">
                                                                    <button onClick={() => handleDeleteCaution(caution.id)} className="text-rose-500 hover:bg-rose-50 p-2 rounded-lg transition-colors"><Trash2 size={12} /></button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                        {(selectedTender.cautions || []).length === 0 && (
                                                            <tr>
                                                                <td colSpan="6" className="p-8 text-center text-slate-400 font-medium italic">Aucune caution bancaire enregistrée pour ce CDC.</td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* TAB 4: Service des Marchés & Administration */}
                                {activeTab === 'administrative' && (
                                    <div className="space-y-6">
                                        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-8">
                                            <h4 className="text-sm font-black text-slate-900 uppercase flex items-center gap-2">
                                                <ClipboardCheck size={16} className="text-indigo-600" /> Informations Administratives
                                            </h4>
                                            
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Numéro du Contrat / Marché</label>
                                                    <input 
                                                        type="text"
                                                        value={selectedTender.contractNumber || ""}
                                                        onChange={async (e) => {
                                                            const updated = { ...selectedTender, contractNumber: e.target.value };
                                                            setSelectedTender(updated);
                                                            await tenderService.saveTender(updated, currentUser.firstName);
                                                        }}
                                                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs text-slate-800 focus:bg-white outline-none focus:border-indigo-400 transition-all shadow-inner"
                                                        placeholder="Ex: MARCHÉ N°10/2026..."
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Commercial Responsable</label>
                                                    <select 
                                                        value={selectedTender.assignedCommercial || ""}
                                                        onChange={async (e) => {
                                                            const updated = { ...selectedTender, assignedCommercial: e.target.value };
                                                            setSelectedTender(updated);
                                                            await tenderService.saveTender(updated, currentUser.firstName);
                                                        }}
                                                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs text-slate-800 focus:bg-white outline-none focus:border-indigo-400 transition-all shadow-inner"
                                                    >
                                                        <option value="">Sélectionner...</option>
                                                        {PERSONNEL.map(p => <option key={p.email} value={p.name}>{p.name}</option>)}
                                                    </select>
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Délais de Livraison Contractuel</label>
                                                    <input 
                                                        type="text"
                                                        value={selectedTender.deliveryDelay || ""}
                                                        onChange={async (e) => {
                                                            const updated = { ...selectedTender, deliveryDelay: e.target.value };
                                                            setSelectedTender(updated);
                                                            await tenderService.saveTender(updated, currentUser.firstName);
                                                        }}
                                                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs text-slate-800 focus:bg-white outline-none focus:border-indigo-400 transition-all shadow-inner"
                                                        placeholder="Ex: 60 jours..."
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Date d'Enregistrement / ODS</label>
                                                    <input 
                                                        type="date"
                                                        value={selectedTender.odsDate || ""}
                                                        onChange={async (e) => {
                                                            const updated = { ...selectedTender, odsDate: e.target.value };
                                                            setSelectedTender(updated);
                                                            await tenderService.saveTender(updated, currentUser.firstName);
                                                        }}
                                                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs text-slate-800 focus:bg-white outline-none focus:border-indigo-400 transition-all shadow-inner"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-[9px] font-black text-rose-400 uppercase tracking-widest ml-1">Date ODS d'Arrêt</label>
                                                    <input 
                                                        type="date"
                                                        value={selectedTender.stopOdsDate || ""}
                                                        onChange={async (e) => {
                                                            const updated = { ...selectedTender, stopOdsDate: e.target.value };
                                                            setSelectedTender(updated);
                                                            await tenderService.saveTender(updated, currentUser.firstName);
                                                        }}
                                                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs text-slate-800 focus:bg-white outline-none focus:border-indigo-400 transition-all shadow-inner"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-[9px] font-black text-emerald-400 uppercase tracking-widest ml-1">Date ODS de Reprise</label>
                                                    <input 
                                                        type="date"
                                                        value={selectedTender.restartOdsDate || ""}
                                                        onChange={async (e) => {
                                                            const updated = { ...selectedTender, restartOdsDate: e.target.value };
                                                            setSelectedTender(updated);
                                                            await tenderService.saveTender(updated, currentUser.firstName);
                                                        }}
                                                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs text-slate-800 focus:bg-white outline-none focus:border-indigo-400 transition-all shadow-inner"
                                                    />
                                                </div>
                                            </div>

                                            {/* Sub-workflow cards */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-100">
                                                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-4">
                                                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2"><ArrowLeftRight size={14} /> Service Importation</h5>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-1">
                                                            <label className="text-[8px] font-black text-slate-400 uppercase">Autorisation d'Import</label>
                                                            <select 
                                                                value={selectedTender.importAuthStatus || "En attente"}
                                                                onChange={async (e) => {
                                                                    const updated = { ...selectedTender, importAuthStatus: e.target.value };
                                                                    setSelectedTender(updated);
                                                                    await tenderService.saveTender(updated, currentUser.firstName);
                                                                }}
                                                                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-[9px] font-black uppercase outline-none"
                                                            >
                                                                <option value="En attente">En attente</option>
                                                                <option value="Accordée">Accordée</option>
                                                                <option value="Refusée">Refusée</option>
                                                            </select>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[8px] font-black text-slate-400 uppercase">Statut Dédouanement</label>
                                                            <select 
                                                                value={selectedTender.importClearanceStatus || "En attente"}
                                                                onChange={async (e) => {
                                                                    const updated = { ...selectedTender, importClearanceStatus: e.target.value };
                                                                    setSelectedTender(updated);
                                                                    await tenderService.saveTender(updated, currentUser.firstName);
                                                                }}
                                                                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-[9px] font-black uppercase outline-none"
                                                            >
                                                                <option value="En attente">En attente</option>
                                                                <option value="En cours">En cours</option>
                                                                <option value="Dédouané">Dédouané</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-4">
                                                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2"><Building2 size={14} /> Service Logistique</h5>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-1">
                                                            <label className="text-[8px] font-black text-slate-400 uppercase">Réception Stock</label>
                                                            <select 
                                                                value={selectedTender.logisticsStockStatus || "En attente"}
                                                                onChange={async (e) => {
                                                                    const updated = { ...selectedTender, logisticsStockStatus: e.target.value };
                                                                    setSelectedTender(updated);
                                                                    await tenderService.saveTender(updated, currentUser.firstName);
                                                                }}
                                                                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-[9px] font-black uppercase outline-none"
                                                            >
                                                                <option value="En attente">En attente</option>
                                                                <option value="Reçu Partiel">Reçu Partiel</option>
                                                                <option value="Reçu Total">Reçu Total</option>
                                                            </select>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[8px] font-black text-slate-400 uppercase">PV Provisoire</label>
                                                            <select 
                                                                value={selectedTender.logisticsProvisionalPvStatus || "En attente"}
                                                                onChange={async (e) => {
                                                                    const updated = { ...selectedTender, logisticsProvisionalPvStatus: e.target.value };
                                                                    setSelectedTender(updated);
                                                                    await tenderService.saveTender(updated, currentUser.firstName);
                                                                }}
                                                                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-[9px] font-black uppercase outline-none"
                                                            >
                                                                <option value="En attente">En attente</option>
                                                                <option value="Signé">Signé</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Tenders;
