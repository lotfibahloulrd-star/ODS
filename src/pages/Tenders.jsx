import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { tenderService } from '../services/tenderService';
import { logService } from '../services/logService';
import {
    FileSearch,
    Calendar,
    Users,
    Briefcase,
    Building2,
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
    Send,
    ChevronDown,
    MoreVertical,
    FileText,
    Activity,
    X,
    LayoutDashboard,
    MessageSquare,
    Bell,
    Paperclip,
    FileUp,
    Eye,
    Check,
    Share2,
    Lock,
    User,
    ShoppingBag,
    DollarSign,
    Globe,
    Tag,
    Package,
    Calculator
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    
    const isCoordinator = currentUser?.email === 'mouhoub.imene@esclab-algerie.com';

    const [tenders, setTenders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [selectedTender, setSelectedTender] = useState(null);
    const [activeStatusFilter, setActiveStatusFilter] = useState("all");
    const [isUploading, setIsUploading] = useState(false);

    // Form states
    const [formData, setFormData] = useState({
        dispatchDate: new Date().toISOString().split('T')[0],
        deadlineDate: "",
        refCdc: "",
        object: "",
        organism: "",
        status: "En préparation",
        assignments: [], // Array of { email, name, role, status: 'pending'|'done' }
        items: [], // Array of { id, designation, reference, quantity, accessories, brand, type, priceHT, priceTTC }
        
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
        importClearanceStatus: "En attente"
    });

    const [editingItem, setEditingItem] = useState(null);
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
            setFormData({ ...tender });
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
                contractNumber: "",
                assignedCommercial: "",
                deliveryDelay: "",
                odsDate: "",
                stopOdsDate: "",
                restartOdsDate: "",
                deliveryDeadline: "",
                importLaunchStatus: "En attente",
                importAuthStatus: "En attente",
                importClearanceStatus: "En attente"
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
                assignments: [...formData.assignments, { ...person, status: 'pending' }]
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
    };    const handleFileUpload = async (e, tenderId, storageKey) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const res = await tenderService.saveFile(tenderId, storageKey, file, file.name);
            if (res.success) {
                // Determine if this is a worker contribution
                const isTech = storageKey.startsWith('tech_');
                const isFin = storageKey.startsWith('fin_');
                
                if (isTech || isFin) {
                    const updatedTenders = [...tenders];
                    const tIndex = updatedTenders.findIndex(t => t.id === tenderId);
                    if (tIndex !== -1) {
                        const tender = updatedTenders[tIndex];
                        const aIndex = tender.assignments.findIndex(a => a.email === currentUser.email);
                        if (aIndex !== -1) {
                            // Update assignment status
                            if (isTech) tender.assignments[aIndex].techStatus = 'done';
                            if (isFin) tender.assignments[aIndex].finStatus = 'done';
                            
                            // Overall status is 'done' if both are done
                            if (tender.assignments[aIndex].techStatus === 'done' && tender.assignments[aIndex].finStatus === 'done') {
                                tender.assignments[aIndex].status = 'done';
                            }
                            
                            await tenderService.saveTender(tender, currentUser.firstName);
                        }
                    }
                }
                loadTenders();
                alert("Fichier transmis avec succès !");
            } else {
                alert("Erreur lors de l'upload.");
            }
        } catch (err) {
            alert("Erreur serveur.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleBatchDownload = (type) => {
        // Simple implementation: alert with instructions since we can't easily merge PDFs in browser without lib
        const count = selectedTender.assignments?.filter(a => a[`${type}Status`] === 'done').length;
        if (count === 0) {
            alert(`Aucune offre ${type === 'tech' ? 'technique' : 'financière'} disponible pour la compilation.`);
            return;
        }
        alert(`Compilation automatique : ${count} fichiers détectés. \nLe système prépare le téléchargement groupé pour votre traitement manuel.`);
        
        selectedTender.assignments.forEach(a => {
            if (a[`${type}Status`] === 'done') {
                const key = `${type}_${a.email.replace(/[^a-zA-Z0-9]/g, '_')}`;
                window.open(tenderService.getFileUrl(selectedTender.id, key), '_blank');
            }
        });
    };

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
            items: selectedTender.items.filter(item => item.id !== itemId)
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

    const filteredTenders = useMemo(() => {
        return tenders.filter(t => {
            // Workers only see their assigned tenders
            if (!isCoordinator) {
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
    }, [tenders, searchTerm, activeStatusFilter, isCoordinator, currentUser]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'En préparation': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'Déposé': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Adjugé': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'Perdu': return 'bg-rose-100 text-rose-700 border-rose-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/50 pb-12">
            {/* Nav Header */}
            <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <h1 className="text-xl font-black text-slate-900 tracking-tighter flex items-center gap-2">
                            <span className="bg-indigo-600 text-white p-1.5 rounded-lg"><Briefcase size={18}/></span>
                            ESCLAB <span className="text-indigo-600">TENDERS</span>
                        </h1>
                        <div className="hidden md:flex items-center gap-1">
                            <button onClick={() => navigate('/dashboard')} className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">Dashboard ODS</button>
                            <button className="px-4 py-2 text-sm font-black text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50">Appels d'Offres</button>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-right mr-3 hidden sm:block">
                            <p className="text-[10px] font-black text-slate-400 uppercase leading-none">Session</p>
                            <p className="text-xs font-black text-slate-900">{currentUser?.firstName} {currentUser?.lastName}</p>
                        </div>
                        <div className="w-10 h-10 bg-indigo-900 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-lg shadow-indigo-200">
                            {currentUser?.firstName?.[0]}{currentUser?.lastName?.[0]}
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 pt-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                    <div>
                        <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Gestion des Appels d'Offres</h2>
                        <div className="flex items-center gap-3">
                            <span className="flex items-center gap-2 px-3 py-1 bg-white border border-slate-200 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                <Activity size={12} className="text-indigo-500" /> Workflow CDC
                            </span>
                            {isCoordinator && (
                                <span className="px-3 py-1 bg-indigo-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-md">
                                    Coordinatrice (Admin)
                                </span>
                            )}
                        </div>
                    </div>

                    {isCoordinator && (
                        <button 
                            onClick={() => handleOpenForm()}
                            className="bg-indigo-600 text-white px-8 py-4 rounded-[2rem] font-black flex items-center gap-3 shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 hover:-translate-y-1 transition-all active:translate-y-0"
                        >
                            <Plus size={22} />
                            Nouveau CDC
                        </button>
                    )}
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="relative flex-1">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input 
                            type="text" 
                            placeholder="Référence, Objet, Organisme..."
                            className="w-full pl-14 pr-6 py-4.5 bg-white border border-slate-200 rounded-[2rem] text-sm font-bold shadow-sm focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 outline-none transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex p-1.5 bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-x-auto">
                        {['all', 'En préparation', 'Déposé', 'Adjugé'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setActiveStatusFilter(status)}
                                className={`px-6 py-3 rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest transition-all ${
                                    activeStatusFilter === status 
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                                    : 'text-slate-500 hover:bg-slate-50'
                                }`}
                            >
                                {status === 'all' ? 'Tout voir' : status}
                            </button>
                        ))}
                    </div>
                </div>

                {/* List of Tenders */}
                <div className="grid grid-cols-1 gap-6">
                    {isLoading ? (
                        <div className="bg-white p-20 rounded-[3rem] border border-slate-200 text-center animate-pulse">
                            <Clock size={48} className="mx-auto text-indigo-200 mb-4" />
                            <p className="font-black text-slate-400 uppercase tracking-widest">Chargement des dossiers...</p>
                        </div>
                    ) : filteredTenders.length === 0 ? (
                        <div className="bg-white p-20 rounded-[3rem] border border-slate-200 text-center">
                            <FileSearch size={64} className="mx-auto text-slate-200 mb-6" />
                            <p className="text-xl font-black text-slate-900 mb-2">Aucun appel d'offre trouvé</p>
                            <p className="text-slate-400 font-bold italic">Ajustez vos filtres ou créez un nouveau dossier</p>
                        </div>
                    ) : (
                        filteredTenders.map(tender => (
                            <div 
                                key={tender.id} 
                                className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm hover:border-indigo-300 transition-all group"
                            >
                                <div className="flex flex-col lg:flex-row gap-8">
                                    {/* Main Info */}
                                    <div className="flex-1 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(tender.status)}`}>
                                                {tender.status}
                                            </span>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                Créé le {new Date(tender.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">
                                                {tender.refCdc || "SANS RÉFÉRENCE"}
                                            </h3>
                                            <p className="text-slate-500 font-bold text-sm mt-1 uppercase italic">{tender.organism}</p>
                                        </div>
                                        <p className="text-slate-700 font-medium leading-relaxed line-clamp-2">{tender.object}</p>
                                        
                                        <div className="flex flex-wrap gap-6 pt-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                                                    <Calendar size={18} />
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Date Limite</p>
                                                    <p className="text-sm font-black text-slate-900">{tender.deadlineDate || 'Non définie'}</p>
                                                </div>
                                            </div>
                                            {tender.files?.cdc && (
                                                <a 
                                                    href={tenderService.getFileUrl(tender.id, 'cdc')} 
                                                    target="_blank" 
                                                    className="flex items-center gap-3 px-4 py-2 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-100 transition-all"
                                                >
                                                    <FileText size={18} className="text-indigo-500" />
                                                    <span className="text-xs font-black text-slate-700 uppercase tracking-tight">Cahier des Charges</span>
                                                </a>
                                            )}
                                        </div>
                                    </div>

                                    {/* Assignments & Progress */}
                                    <div className="w-full lg:w-[400px] bg-slate-50 rounded-[2.5rem] p-6 border border-slate-100">
                                        <div className="flex items-center justify-between mb-6">
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Intervenants & Statut</h4>
                                            <Users size={16} className="text-slate-400" />
                                        </div>
                                        <div className="space-y-3">
                                            {tender.assignments?.map(a => {
                                                const isDone = a.status === 'done';
                                                const isMe = a.email === currentUser?.email;
                                                return (
                                                    <div key={a.email} className="flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black ${isDone ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                                                                {a.name[0]}
                                                            </div>
                                                            <div>
                                                                <p className={`text-xs font-black uppercase tracking-tight ${isMe ? 'text-indigo-600' : 'text-slate-900'}`}>
                                                                    {a.name} {isMe && "(Moi)"}
                                                                </p>
                                                                <p className="text-[9px] font-bold text-slate-400 uppercase">{a.role}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-1">
                                                            <div 
                                                                title="Offre Technique"
                                                                className={`w-5 h-5 rounded-lg flex items-center justify-center text-[8px] font-black ${a.techStatus === 'done' ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'}`}
                                                            >
                                                                T
                                                            </div>
                                                            <div 
                                                                title="Offre Financière"
                                                                className={`w-5 h-5 rounded-lg flex items-center justify-center text-[8px] font-black ${a.finStatus === 'done' ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'}`}
                                                            >
                                                                F
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            {(!tender.assignments || tender.assignments.length === 0) && (
                                                <p className="text-center text-[10px] font-bold text-slate-400 py-4 italic uppercase">Aucun intervenant assigné</p>
                                            )}
                                        </div>

                                        {/* Actions per user role */}
                                        <div className="mt-6 flex flex-col gap-2">
                                            {isCoordinator ? (
                                                <div className="grid grid-cols-2 gap-2">
                                                    <button 
                                                        onClick={() => handleOpenForm(tender)}
                                                        className="flex items-center justify-center gap-2 py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase hover:bg-slate-50 transition-all"
                                                    >
                                                        <Edit3 size={14} /> Modifier
                                                    </button>
                                                    <button 
                                                        onClick={() => {
                                                            setSelectedTender(tender);
                                                            // For manual build, we just set the tender
                                                        }}
                                                        className="flex items-center justify-center gap-2 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                                                    >
                                                        <LayoutDashboard size={14} /> Gérer
                                                    </button>
                                                </div>
                                            ) : tender.assignments?.some(a => a.email === currentUser?.email) && (
                                                <button 
                                                    onClick={() => setSelectedTender(tender)}
                                                    className="w-full flex items-center justify-center gap-3 py-4 bg-indigo-600 text-white rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
                                                >
                                                    <FileUp size={16} /> Déposer mes offres
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>

            {/* Creation Form Modal (Coordinator) */}
            {showForm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowForm(false)}></div>
                    <div className="relative bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-10 bg-indigo-900 text-white flex justify-between items-center">
                            <div>
                                <h3 className="text-2xl font-black uppercase tracking-tight">Nouveau Dossier CDC</h3>
                                <p className="text-xs text-indigo-300 font-bold uppercase mt-1">Initiation du workflow d'appel d'offre</p>
                            </div>
                            <button onClick={() => setShowForm(false)} className="w-12 h-12 flex items-center justify-center rounded-2xl hover:bg-white/10 transition-colors border border-white/10">
                                <X size={24} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-10 max-h-[75vh] overflow-y-auto bg-white">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Left Column: Info */}
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Référence du CDC</label>
                                        <input 
                                            required
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-sm outline-none focus:border-indigo-400 focus:bg-white transition-all"
                                            value={formData.refCdc}
                                            onChange={(e) => setFormData({...formData, refCdc: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Organisme / Client</label>
                                        <input 
                                            required
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-sm outline-none focus:border-indigo-400 focus:bg-white transition-all"
                                            value={formData.organism}
                                            onChange={(e) => setFormData({...formData, organism: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Objet</label>
                                        <textarea 
                                            required
                                            rows="3"
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-sm outline-none focus:border-indigo-400 focus:bg-white transition-all resize-none"
                                            value={formData.object}
                                            onChange={(e) => setFormData({...formData, object: e.target.value})}
                                        ></textarea>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Date d'envoi</label>
                                            <input 
                                                type="date"
                                                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-sm outline-none focus:border-indigo-400 focus:bg-white transition-all"
                                                value={formData.dispatchDate}
                                                onChange={(e) => setFormData({...formData, dispatchDate: e.target.value})}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Date Limite</label>
                                            <input 
                                                type="date"
                                                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-sm outline-none focus:border-indigo-400 focus:bg-white transition-all"
                                                value={formData.deadlineDate}
                                                onChange={(e) => setFormData({...formData, deadlineDate: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Assignments */}
                                <div className="space-y-6">
                                    <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-200">
                                        <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                            <Users size={14} /> Sélection des intervenants
                                        </h4>
                                        <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                                            {PERSONNEL.filter(p => p.email !== 'mouhoub.imene@esclab-algerie.com').map(person => {
                                                const isSelected = formData.assignments.some(a => a.email === person.email);
                                                return (
                                                    <button
                                                        key={person.email}
                                                        type="button"
                                                        onClick={() => toggleAssignment(person)}
                                                        className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                                                            isSelected 
                                                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' 
                                                            : 'bg-white border-slate-100 text-slate-600 hover:border-indigo-200'
                                                        }`}
                                                    >
                                                        <div className="text-left">
                                                            <p className="text-xs font-black uppercase tracking-tight">{person.name}</p>
                                                            <p className={`text-[9px] font-bold uppercase ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                                                                {person.role}
                                                            </p>
                                                        </div>
                                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center border-2 ${isSelected ? 'bg-white text-indigo-600 border-white' : 'border-slate-200'}`}>
                                                            {isSelected && <Check size={12} strokeWidth={4} />}
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-12 flex gap-6">
                                <button 
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="flex-1 px-8 py-5 bg-slate-100 text-slate-500 rounded-[2rem] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                                >
                                    Annuler
                                </button>
                                <button 
                                    type="submit"
                                    className="flex-[2] px-8 py-5 bg-indigo-600 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-2xl shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-1 transition-all"
                                >
                                    {formData.id ? "Enregistrer" : "Lancer le Workflow"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Workflow Management / Offer Submission Modal */}
            {selectedTender && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-xl" onClick={() => setSelectedTender(null)}></div>
                    <div className="relative bg-slate-50 w-full max-w-5xl rounded-[4rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 duration-500 flex flex-col md:flex-row h-[85vh]">
                        
                        {/* Sidebar: Status & Info */}
                        <div className="w-full md:w-[320px] bg-indigo-900 p-10 text-white space-y-10 shrink-0">
                            <button onClick={() => setSelectedTender(null)} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/10 hover:bg-white/20 transition-colors mb-4">
                                <X size={24} />
                            </button>
                            <div>
                                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] block mb-2">Dossier en cours</span>
                                <h3 className="text-2xl font-black tracking-tight leading-tight">{selectedTender.refCdc}</h3>
                                <p className="text-xs font-bold text-indigo-300 mt-2 line-clamp-3">{selectedTender.object}</p>
                            </div>

                            <div className="space-y-6">
                                <div className="p-5 bg-white/5 rounded-3xl border border-white/10">
                                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3">Statut Global</p>
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse shadow-lg shadow-indigo-500/50"></div>
                                        <span className="text-sm font-black uppercase">{selectedTender.status}</span>
                                    </div>
                                </div>
                                <div className="p-5 bg-white/5 rounded-3xl border border-white/10">
                                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3">Intervenants</p>
                                    <div className="flex -space-x-2">
                                        {selectedTender.assignments?.map(a => (
                                            <div key={a.email} title={a.name} className="w-8 h-8 rounded-full bg-indigo-700 border-2 border-indigo-900 flex items-center justify-center text-[10px] font-black uppercase">
                                                {a.name[0]}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 p-12 overflow-y-auto space-y-10 scroll-smooth">
                            {/* Section 1: Documents Sources (Imene/Admin) */}
                            {(isCoordinator || isSuperAdmin) && (
                                <div className="space-y-6">
                                    <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                                        <Paperclip className="text-indigo-600" /> Documents de Référence
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="p-8 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200 hover:border-indigo-400 transition-all group flex flex-col items-center text-center">
                                            <FileUp size={32} className="text-slate-300 group-hover:text-indigo-500 transition-colors mb-4" />
                                            <p className="text-xs font-black text-slate-900 uppercase tracking-widest mb-2">Cahier des Charges (CDC)</p>
                                            <p className="text-[10px] text-slate-400 font-bold mb-4 uppercase">PDF ou XLSX accepté</p>
                                            <input 
                                                type="file" 
                                                id="upload-cdc" 
                                                accept=".pdf,.xlsx,.xls"
                                                className="hidden" 
                                                onChange={(e) => handleFileUpload(e, selectedTender.id, 'cdc')}
                                            />
                                            <label 
                                                htmlFor="upload-cdc" 
                                                className="px-6 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                                            >
                                                {selectedTender.files?.cdc ? "Mettre à jour le CDC" : "Choisir un fichier"}
                                            </label>
                                            {selectedTender.files?.cdc && (
                                                <div className="mt-4 flex items-center gap-2">
                                                    <CheckCircle2 size={14} className="text-emerald-500" />
                                                    <span className="text-[10px] font-black text-slate-600 truncate max-w-[150px]">{selectedTender.files.cdc.name}</span>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="p-8 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200 hover:border-indigo-400 transition-all group flex flex-col items-center text-center">
                                            <Share2 size={32} className="text-slate-300 group-hover:text-indigo-500 transition-colors mb-4" />
                                            <p className="text-xs font-black text-slate-900 uppercase tracking-widest mb-2">Offre Globale Finalisée</p>
                                            <p className="text-[10px] text-slate-400 font-bold mb-4 uppercase">Compilation Manuelle Finale</p>
                                            <input 
                                                type="file" 
                                                id="upload-global" 
                                                className="hidden" 
                                                onChange={(e) => handleFileUpload(e, selectedTender.id, 'global_offer')}
                                            />
                                            <label 
                                                htmlFor="upload-global" 
                                                className="px-6 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-indigo-600 transition-all shadow-lg"
                                            >
                                                {selectedTender.files?.global_offer ? "Remplacer l'offre globale" : "Uploader l'offre finale"}
                                            </label>
                                            {selectedTender.files?.global_offer && (
                                                <div className="mt-4 flex items-center gap-2">
                                                    <CheckCircle2 size={14} className="text-emerald-500" />
                                                    <span className="text-[10px] font-black text-slate-600 truncate max-w-[150px]">{selectedTender.files.global_offer.name}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Section 2: Worker Contribution (2 Files) */}
                            {((!isCoordinator && assignedWorker) || (isSuperAdmin && assignedWorker)) && (
                                <div className="space-y-6 animate-in slide-in-from-right-10">
                                    <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                                        <Send className="text-indigo-600" /> Mes Propositions
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Technical Offer */}
                                        <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
                                            <div className="relative z-10">
                                                <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-indigo-200">Partie 1</p>
                                                <div className="flex items-center justify-between mb-4">
                                                    <h5 className="text-lg font-black uppercase">Offre Technique</h5>
                                                    {selectedTender.files?.[`tech_${currentUser.email.replace(/[^a-zA-Z0-9]/g, '_')}`] && (
                                                        <div className="flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full border border-white/20">
                                                            <CheckCircle2 size={12} className="text-emerald-300" />
                                                            <span className="text-[9px] font-black uppercase">Présent</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-col gap-4">
                                                    <input 
                                                        type="file" 
                                                        id="worker-upload-tech" 
                                                        accept=".pdf,.xlsx,.xls"
                                                        className="hidden" 
                                                        onChange={(e) => handleFileUpload(e, selectedTender.id, `tech_${currentUser.email.replace(/[^a-zA-Z0-9]/g, '_')}`)}
                                                    />
                                                    <label 
                                                        htmlFor="worker-upload-tech" 
                                                        className="inline-flex items-center justify-center gap-3 px-6 py-3 bg-white text-indigo-600 rounded-xl font-black text-[10px] uppercase tracking-widest cursor-pointer hover:scale-105 transition-all shadow-lg"
                                                    >
                                                        <FileUp size={16} /> {selectedTender.files?.[`tech_${currentUser.email.replace(/[^a-zA-Z0-9]/g, '_')}`] ? 'Remplacer le fichier' : 'Déposer mon fichier'}
                                                    </label>
                                                    
                                                    {selectedTender.files?.[`tech_${currentUser.email.replace(/[^a-zA-Z0-9]/g, '_')}`] && (
                                                        <a 
                                                            href={tenderService.getFileUrl(selectedTender.id, `tech_${currentUser.email.replace(/[^a-zA-Z0-9]/g, '_')}`)} 
                                                            target="_blank"
                                                            className="text-[10px] font-bold text-indigo-100 hover:text-white underline flex items-center gap-2"
                                                        >
                                                            <Eye size={12} /> Consulter mon dépôt
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Financial Offer */}
                                        <div className="bg-emerald-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-emerald-100 relative overflow-hidden">
                                            <div className="relative z-10">
                                                <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-emerald-200">Partie 2</p>
                                                <div className="flex items-center justify-between mb-4">
                                                    <h5 className="text-lg font-black uppercase">Offre Financière</h5>
                                                    {selectedTender.files?.[`fin_${currentUser.email.replace(/[^a-zA-Z0-9]/g, '_')}`] && (
                                                        <div className="flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full border border-white/20">
                                                            <CheckCircle2 size={12} className="text-emerald-300" />
                                                            <span className="text-[9px] font-black uppercase">Présent</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-col gap-4">
                                                    <input 
                                                        type="file" 
                                                        id="worker-upload-fin" 
                                                        accept=".pdf,.xlsx,.xls"
                                                        className="hidden" 
                                                        onChange={(e) => handleFileUpload(e, selectedTender.id, `fin_${currentUser.email.replace(/[^a-zA-Z0-9]/g, '_')}`)}
                                                    />
                                                    <label 
                                                        htmlFor="worker-upload-fin" 
                                                        className="inline-flex items-center justify-center gap-3 px-6 py-3 bg-white text-emerald-600 rounded-xl font-black text-[10px] uppercase tracking-widest cursor-pointer hover:scale-105 transition-all shadow-lg"
                                                    >
                                                        <FileUp size={16} /> {selectedTender.files?.[`fin_${currentUser.email.replace(/[^a-zA-Z0-9]/g, '_')}`] ? 'Remplacer le fichier' : 'Déposer mon fichier'}
                                                    </label>

                                                    {selectedTender.files?.[`fin_${currentUser.email.replace(/[^a-zA-Z0-9]/g, '_')}`] && (
                                                        <a 
                                                            href={tenderService.getFileUrl(selectedTender.id, `fin_${currentUser.email.replace(/[^a-zA-Z0-9]/g, '_')}`)} 
                                                            target="_blank"
                                                            className="text-[10px] font-bold text-emerald-100 hover:text-white underline flex items-center gap-2"
                                                        >
                                                            <Eye size={12} /> Consulter mon dépôt
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Section 3: Overview & Auto-Compilation (Imene/Admin) */}
                            {(isCoordinator || isSuperAdmin) && (
                                <div className="space-y-6">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight">Suivi & Compilation</h4>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => handleBatchDownload('tech')}
                                                className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-200 transition-all flex items-center gap-2"
                                            >
                                                <Share2 size={12} /> Compiler Tech.
                                            </button>
                                            <button 
                                                onClick={() => handleBatchDownload('fin')}
                                                className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-200 transition-all flex items-center gap-2"
                                            >
                                                <Share2 size={12} /> Compiler Fin.
                                            </button>
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
                                        <table className="w-full text-left">
                                            <thead className="bg-slate-50">
                                                <tr>
                                                    <th className="p-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">Intervenant</th>
                                                    <th className="p-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">Offre Tech.</th>
                                                    <th className="p-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">Offre Fin.</th>
                                                    <th className="p-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">Global</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {selectedTender.assignments?.map(a => {
                                                    const techKey = `tech_${a.email.replace(/[^a-zA-Z0-9]/g, '_')}`;
                                                    const finKey = `fin_${a.email.replace(/[^a-zA-Z0-9]/g, '_')}`;
                                                    const hasTech = selectedTender.files?.[techKey];
                                                    const hasFin = selectedTender.files?.[finKey];
                                                    return (
                                                        <tr key={a.email} className="hover:bg-slate-50/50 transition-colors">
                                                            <td className="p-6">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400">
                                                                        {a.name[0]}
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-xs font-black text-slate-900 uppercase">{a.name}</p>
                                                                        <p className="text-[8px] font-bold text-slate-400 uppercase">{a.role}</p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="p-6">
                                                                {hasTech ? (
                                                                    <a href={tenderService.getFileUrl(selectedTender.id, techKey)} target="_blank" className="flex items-center gap-2 text-indigo-600 hover:underline text-[9px] font-black uppercase">
                                                                        <Eye size={12} /> {hasTech.ext.toUpperCase()}
                                                                    </a>
                                                                ) : <span className="text-[8px] text-slate-300 font-bold uppercase italic">Manquant</span>}
                                                            </td>
                                                            <td className="p-6">
                                                                {hasFin ? (
                                                                    <a href={tenderService.getFileUrl(selectedTender.id, finKey)} target="_blank" className="flex items-center gap-2 text-emerald-600 hover:underline text-[9px] font-black uppercase">
                                                                        <Eye size={12} /> {hasFin.ext.toUpperCase()}
                                                                    </a>
                                                                ) : <span className="text-[8px] text-slate-300 font-bold uppercase italic">Manquant</span>}
                                                            </td>
                                                            <td className="p-6">
                                                                {a.status === 'done' ? (
                                                                    <div className="w-5 h-5 bg-emerald-500 text-white rounded flex items-center justify-center shadow-md">
                                                                        <Check size={12} strokeWidth={4} />
                                                                    </div>
                                                                ) : (
                                                                    <div className="w-5 h-5 bg-slate-200 text-slate-400 rounded flex items-center justify-center">
                                                                        <Clock size={12} />
                                                                    </div>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Section 3.5: Commercial Offer Details (Items Table) */}
                            {(isCoordinator || isSuperAdmin || selectedTender.assignments?.some(a => a.email === currentUser.email)) && (
                                <div className="space-y-8 p-10 bg-white rounded-[3rem] border border-slate-200 shadow-sm">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                                                <ShoppingBag size={24} />
                                            </div>
                                            <div>
                                                <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight">Détails de l'Offre Commerciale</h4>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Saisie des items du bordereau</p>
                                            </div>
                                        </div>
                                        
                                        {selectedTender.items?.length > 0 && (
                                            <div className="flex gap-4">
                                                <div className="bg-slate-50 px-5 py-3 rounded-2xl border border-slate-100">
                                                    <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Total HT</p>
                                                    <p className="text-sm font-black text-slate-900">{calculateTotals(selectedTender.items).ht.toLocaleString()} DA</p>
                                                </div>
                                                <div className="bg-indigo-50 px-5 py-3 rounded-2xl border border-indigo-100">
                                                    <p className="text-[8px] font-black text-indigo-400 uppercase mb-1">Total TTC</p>
                                                    <p className="text-sm font-black text-indigo-600">{calculateTotals(selectedTender.items).ttc.toLocaleString()} DA</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Item Entry Form */}
                                    <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                            <div className="md:col-span-2 space-y-2">
                                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Désignation Produit</label>
                                                <input 
                                                    type="text"
                                                    value={newItem.designation}
                                                    onChange={(e) => setNewItem({...newItem, designation: e.target.value})}
                                                    className="w-full px-6 py-4 bg-white rounded-2xl border-none text-xs font-bold shadow-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                                                    placeholder="Nom de l'article..."
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Référence</label>
                                                <input 
                                                    type="text"
                                                    value={newItem.reference}
                                                    onChange={(e) => setNewItem({...newItem, reference: e.target.value})}
                                                    className="w-full px-6 py-4 bg-white rounded-2xl border-none text-xs font-bold shadow-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                                                    placeholder="Réf catalogue..."
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Quantité</label>
                                                <input 
                                                    type="number"
                                                    value={newItem.quantity}
                                                    onChange={(e) => setNewItem({...newItem, quantity: e.target.value})}
                                                    className="w-full px-6 py-4 bg-white rounded-2xl border-none text-xs font-bold shadow-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Accessoires</label>
                                                <input 
                                                    type="text"
                                                    value={newItem.accessories}
                                                    onChange={(e) => setNewItem({...newItem, accessories: e.target.value})}
                                                    className="w-full px-6 py-4 bg-white rounded-2xl border-none text-xs font-bold shadow-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                                                    placeholder="Options..."
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Marque / Fournisseur</label>
                                                <input 
                                                    type="text"
                                                    value={newItem.brand}
                                                    onChange={(e) => setNewItem({...newItem, brand: e.target.value})}
                                                    className="w-full px-6 py-4 bg-white rounded-2xl border-none text-xs font-bold shadow-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                                                    placeholder="Marque..."
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Origine</label>
                                                <select 
                                                    value={newItem.type}
                                                    onChange={(e) => setNewItem({...newItem, type: e.target.value})}
                                                    className="w-full px-6 py-4 bg-white rounded-2xl border-none text-xs font-bold shadow-sm focus:ring-2 focus:ring-indigo-500 transition-all appearance-none"
                                                >
                                                    <option value="Importation">Importation</option>
                                                    <option value="Produit Local">Produit Local</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Prix HT (DA)</label>
                                                <input 
                                                    type="number"
                                                    value={newItem.priceHT}
                                                    onChange={(e) => setNewItem({...newItem, priceHT: e.target.value, priceTTC: e.target.value * 1.19})}
                                                    className="w-full px-6 py-4 bg-white rounded-2xl border-none text-xs font-bold shadow-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                                                />
                                            </div>
                                            <div className="flex items-end">
                                                <button 
                                                    onClick={handleAddItem}
                                                    className="w-full h-[52px] bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
                                                >
                                                    <Plus size={16} /> Ajouter Item
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Items Table */}
                                    {selectedTender.items?.length > 0 && (
                                        <div className="overflow-hidden border border-slate-100 rounded-[2rem] shadow-sm bg-white">
                                            <table className="w-full text-left">
                                                <thead className="bg-slate-50 border-b border-slate-100">
                                                    <tr>
                                                        <th className="p-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">Désignation</th>
                                                        <th className="p-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">Référence</th>
                                                        <th className="p-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">Qté</th>
                                                        <th className="p-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">Marque</th>
                                                        <th className="p-6 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Prix HT</th>
                                                        <th className="p-6 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Prix TTC</th>
                                                        <th className="p-6"></th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    {selectedTender.items.map(item => (
                                                        <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                                            <td className="p-6">
                                                                <p className="text-xs font-black text-slate-900 uppercase">{item.designation}</p>
                                                                <div className="flex flex-wrap gap-2 mt-1">
                                                                    <span className="text-[8px] font-black px-2 py-0.5 bg-slate-100 text-slate-400 rounded-md uppercase">{item.type}</span>
                                                                    {item.accessories && (
                                                                        <span className="text-[8px] font-black px-2 py-0.5 bg-indigo-50 text-indigo-400 rounded-md uppercase">Acc: {item.accessories}</span>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="p-6 text-xs font-bold text-slate-600">{item.reference}</td>
                                                            <td className="p-6 text-xs font-black text-slate-900">{item.quantity}</td>
                                                            <td className="p-6 text-xs font-bold text-indigo-600 uppercase">{item.brand}</td>
                                                            <td className="p-6 text-xs font-black text-slate-900 text-right">{item.priceHT?.toLocaleString()} DA</td>
                                                            <td className="p-6 text-xs font-black text-emerald-600 text-right">{item.priceTTC?.toLocaleString()} DA</td>
                                                            <td className="p-6 text-right">
                                                                <button 
                                                                    onClick={() => handleDeleteItem(item.id)}
                                                                    className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Section 3.6: Service des Marchés (Administrative Tracking) */}
                            {(isCoordinator || isSuperAdmin) && (
                                <div className="space-y-8 p-10 bg-slate-900 rounded-[3rem] text-white shadow-2xl shadow-indigo-200">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
                                            <ClipboardCheck size={24} />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-black uppercase tracking-tight">Service des Marchés</h4>
                                            <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">Suivi administratif et exécution du contrat</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-indigo-300 uppercase tracking-widest ml-1">N° Contrat</label>
                                            <input 
                                                type="text"
                                                value={selectedTender.contractNumber || ""}
                                                onChange={async (e) => {
                                                    const updated = { ...selectedTender, contractNumber: e.target.value };
                                                    setSelectedTender(updated);
                                                    await tenderService.saveTender(updated, currentUser.firstName);
                                                }}
                                                className="w-full px-6 py-4 bg-white/10 rounded-2xl border-none text-xs font-bold text-white placeholder:text-white/20 focus:ring-2 focus:ring-indigo-500 transition-all"
                                                placeholder="Référence contrat..."
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-indigo-300 uppercase tracking-widest ml-1">Commercial Responsable</label>
                                            <select 
                                                value={selectedTender.assignedCommercial || ""}
                                                onChange={async (e) => {
                                                    const updated = { ...selectedTender, assignedCommercial: e.target.value };
                                                    setSelectedTender(updated);
                                                    await tenderService.saveTender(updated, currentUser.firstName);
                                                }}
                                                className="w-full px-6 py-4 bg-white/10 rounded-2xl border-none text-xs font-bold text-white focus:ring-2 focus:ring-indigo-500 transition-all appearance-none"
                                            >
                                                <option value="" className="text-slate-900">Sélectionner...</option>
                                                {PERSONNEL.map(p => <option key={p.email} value={p.name} className="text-slate-900">{p.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-indigo-300 uppercase tracking-widest ml-1">Délais de livraison</label>
                                            <input 
                                                type="text"
                                                value={selectedTender.deliveryDelay || ""}
                                                onChange={async (e) => {
                                                    const updated = { ...selectedTender, deliveryDelay: e.target.value };
                                                    setSelectedTender(updated);
                                                    await tenderService.saveTender(updated, currentUser.firstName);
                                                }}
                                                className="w-full px-6 py-4 bg-white/10 rounded-2xl border-none text-xs font-bold text-white placeholder:text-white/20 focus:ring-2 focus:ring-indigo-500 transition-all"
                                                placeholder="Ex: 30 jours..."
                                            />
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-indigo-300 uppercase tracking-widest ml-1">DATE Dépôts ; ODS</label>
                                            <input 
                                                type="date"
                                                value={selectedTender.odsDate || ""}
                                                onChange={async (e) => {
                                                    const updated = { ...selectedTender, odsDate: e.target.value };
                                                    setSelectedTender(updated);
                                                    await tenderService.saveTender(updated, currentUser.firstName);
                                                }}
                                                className="w-full px-6 py-4 bg-white/10 rounded-2xl border-none text-xs font-bold text-white focus:ring-2 focus:ring-indigo-500 transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-rose-300 uppercase tracking-widest ml-1">DATE ODS D'ARRET</label>
                                            <input 
                                                type="date"
                                                value={selectedTender.stopOdsDate || ""}
                                                onChange={async (e) => {
                                                    const updated = { ...selectedTender, stopOdsDate: e.target.value };
                                                    setSelectedTender(updated);
                                                    await tenderService.saveTender(updated, currentUser.firstName);
                                                }}
                                                className="w-full px-6 py-4 bg-white/10 rounded-2xl border border-rose-500/30 text-xs font-bold text-white focus:ring-2 focus:ring-rose-500 transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-emerald-300 uppercase tracking-widest ml-1">DATE ODS DE REPRISE</label>
                                            <input 
                                                type="date"
                                                value={selectedTender.restartOdsDate || ""}
                                                onChange={async (e) => {
                                                    const updated = { ...selectedTender, restartOdsDate: e.target.value };
                                                    setSelectedTender(updated);
                                                    await tenderService.saveTender(updated, currentUser.firstName);
                                                }}
                                                className="w-full px-6 py-4 bg-white/10 rounded-2xl border border-emerald-500/30 text-xs font-bold text-white focus:ring-2 focus:ring-emerald-500 transition-all"
                                            />
                                        </div>
                                        <div className="md:col-span-3 space-y-2">
                                            <label className="text-[9px] font-black text-amber-300 uppercase tracking-widest ml-1">ECHEANCE DE LIVRAISON</label>
                                            <input 
                                                type="date"
                                                value={selectedTender.deliveryDeadline || ""}
                                                onChange={async (e) => {
                                                    const updated = { ...selectedTender, deliveryDeadline: e.target.value };
                                                    setSelectedTender(updated);
                                                    await tenderService.saveTender(updated, currentUser.firstName);
                                                }}
                                                className="w-full px-6 py-4 bg-indigo-500/20 rounded-2xl border border-amber-500/30 text-xs font-black text-white focus:ring-2 focus:ring-amber-500 transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Section 3.7: Importation (Logistics Tracking) */}
                            {(isCoordinator || isSuperAdmin || selectedTender.items?.some(item => item.type === 'Importation')) && (
                                <div className="space-y-8 p-10 bg-white rounded-[3rem] border-4 border-blue-100 shadow-xl shadow-blue-50">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                                            <Plane size={24} />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight">Suivi Importation & Logistique</h4>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gestion des commandes internationales</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Statut Lancement Commande</label>
                                            <div className="relative">
                                                <select 
                                                    value={selectedTender.importLaunchStatus || "En attente"}
                                                    onChange={async (e) => {
                                                        const updated = { ...selectedTender, importLaunchStatus: e.target.value };
                                                        setSelectedTender(updated);
                                                        await tenderService.saveTender(updated, currentUser.firstName);
                                                    }}
                                                    className={`w-full px-6 py-4 rounded-2xl border-2 text-xs font-black transition-all appearance-none ${
                                                        selectedTender.importLaunchStatus === 'Terminé' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 
                                                        selectedTender.importLaunchStatus === 'En attente' ? 'bg-slate-50 border-slate-100 text-slate-400' : 'bg-blue-50 border-blue-100 text-blue-600'
                                                    }`}
                                                >
                                                    <option value="En attente">En attente</option>
                                                    <option value="Lancé">Lancé</option>
                                                    <option value="Partiel">Partiel</option>
                                                    <option value="Terminé">Terminé</option>
                                                </select>
                                                <ChevronDown size={14} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Statut Autorisation (ALGEX/Banque)</label>
                                            <div className="relative">
                                                <select 
                                                    value={selectedTender.importAuthStatus || "En attente"}
                                                    onChange={async (e) => {
                                                        const updated = { ...selectedTender, importAuthStatus: e.target.value };
                                                        setSelectedTender(updated);
                                                        await tenderService.saveTender(updated, currentUser.firstName);
                                                    }}
                                                    className={`w-full px-6 py-4 rounded-2xl border-2 text-xs font-black transition-all appearance-none ${
                                                        selectedTender.importAuthStatus === 'Accordée' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 
                                                        selectedTender.importAuthStatus === 'En attente' ? 'bg-slate-50 border-slate-100 text-slate-400' : 'bg-amber-50 border-amber-100 text-amber-600'
                                                    }`}
                                                >
                                                    <option value="En attente">En attente</option>
                                                    <option value="Déposée">Déposée</option>
                                                    <option value="En cours">En cours</option>
                                                    <option value="Accordée">Accordée</option>
                                                    <option value="Rejetée">Rejetée</option>
                                                </select>
                                                <ChevronDown size={14} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Dédouanement</label>
                                            <div className="relative">
                                                <select 
                                                    value={selectedTender.importClearanceStatus || "En attente"}
                                                    onChange={async (e) => {
                                                        const updated = { ...selectedTender, importClearanceStatus: e.target.value };
                                                        setSelectedTender(updated);
                                                        await tenderService.saveTender(updated, currentUser.firstName);
                                                    }}
                                                    className={`w-full px-6 py-4 rounded-2xl border-2 text-xs font-black transition-all appearance-none ${
                                                        selectedTender.importClearanceStatus === 'Dédouané' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 
                                                        selectedTender.importClearanceStatus === 'En attente' ? 'bg-slate-50 border-slate-100 text-slate-400' : 'bg-indigo-50 border-indigo-100 text-indigo-600'
                                                    }`}
                                                >
                                                    <option value="En attente">En attente</option>
                                                    <option value="Arrivage Port/Aéroport">Arrivage Port/Aéroport</option>
                                                    <option value="Sous-douane">Sous-douane</option>
                                                    <option value="Dédouané">Dédouané</option>
                                                </select>
                                                <ChevronDown size={14} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Section 4: Finalization (Imene/Admin) */}
                            {(isCoordinator || isSuperAdmin) && selectedTender.files?.global_offer && (
                                <div className="p-10 bg-slate-900 rounded-[3rem] text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-indigo-100">
                                    <div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <Lock size={16} className="text-indigo-400" />
                                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Offre Globale Finalisée</p>
                                        </div>
                                        <h4 className="text-2xl font-black tracking-tight mb-2">Prêt pour diffusion ?</h4>
                                        <p className="text-sm font-bold text-slate-400">Le dossier est prêt. Vous pouvez le partager avec les cadres des marchés.</p>
                                    </div>
                                    <div className="flex gap-4">
                                        <a 
                                            href={tenderService.getFileUrl(selectedTender.id, 'global_offer')} 
                                            target="_blank"
                                            className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all shadow-xl"
                                        >
                                            Consulter le dossier final
                                        </a>
                                        <button 
                                            onClick={() => alert("Partage activé.")}
                                            className="w-14 h-14 bg-indigo-600 text-white flex items-center justify-center rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20"
                                        >
                                            <Share2 size={22} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Tenders;
