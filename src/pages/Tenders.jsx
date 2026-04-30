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
    Bell
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Tenders = () => {
    const { currentUser, isSuperAdmin } = useAuth();
    const navigate = useNavigate();
    
    const [tenders, setTenders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [editingTender, setEditingTender] = useState(null);
    const [activeStatusFilter, setActiveStatusFilter] = useState("all");

    // Form states
    const [formData, setFormData] = useState({
        dispatchDate: "",
        deadlineDate: "",
        depositDate: "",
        salesPersons: "",
        refCdc: "",
        object: "",
        organism: "",
        confirmation: "En attente",
        status: "En préparation",
        comments: ""
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
            setEditingTender(tender);
            setFormData({ ...tender });
        } else {
            setEditingTender(null);
            setFormData({
                dispatchDate: new Date().toISOString().split('T')[0],
                deadlineDate: "",
                depositDate: "",
                salesPersons: "",
                refCdc: "",
                object: "",
                organism: "",
                confirmation: "En attente",
                status: "En préparation",
                comments: ""
            });
        }
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await tenderService.saveTender(formData, `${currentUser?.firstName} ${currentUser?.lastName}`);
        if (res) {
            setShowForm(false);
            loadTenders();
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Supprimer définitivement ce dossier ?")) {
            const ok = await tenderService.deleteTender(id, `${currentUser?.firstName} ${currentUser?.lastName}`);
            if (ok) loadTenders();
        }
    };

    const filteredTenders = useMemo(() => {
        return tenders.filter(t => {
            const matchesSearch = (
                (t.refCdc || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                (t.object || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                (t.organism || "").toLowerCase().includes(searchTerm.toLowerCase())
            );
            const matchesStatus = activeStatusFilter === "all" || t.status === activeStatusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [tenders, searchTerm, activeStatusFilter]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'En préparation': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'Déposé': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Adjugé': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'Perdu': return 'bg-rose-100 text-rose-700 border-rose-200';
            case 'Annulé': return 'bg-slate-100 text-slate-700 border-slate-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/50 pb-12">
            {/* Navigation Header (Simplified) */}
            <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <h1 className="text-xl font-black text-slate-900 tracking-tighter flex items-center gap-2">
                            <span className="bg-blue-600 text-white p-1.5 rounded-lg"><Briefcase size={18}/></span>
                            ESCLAB <span className="text-blue-600">TENDERS</span>
                        </h1>
                        <div className="hidden md:flex items-center gap-1">
                            <button onClick={() => navigate('/dashboard')} className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors">Dashboard ODS</button>
                            <button className="px-4 py-2 text-sm font-black text-blue-600 border-b-2 border-blue-600 bg-blue-50/50">Appels d'Offres</button>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-right mr-3 hidden sm:block">
                            <p className="text-[10px] font-black text-slate-400 uppercase leading-none">Connecté en tant que</p>
                            <p className="text-xs font-black text-slate-900">{currentUser?.firstName} {currentUser?.lastName}</p>
                        </div>
                        <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black text-sm">
                            {currentUser?.firstName?.[0]}{currentUser?.lastName?.[0]}
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 pt-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                    <div>
                        <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-1">Appels d'Offres & CDC</h2>
                        <p className="text-slate-500 font-bold flex items-center gap-2 italic">
                            <span className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></span>
                            Gestion des soumissions et cahiers des charges
                        </p>
                    </div>

                    <button 
                        onClick={() => handleOpenForm()}
                        className="bg-blue-600 text-white px-6 py-3.5 rounded-2xl font-black flex items-center gap-3 shadow-xl shadow-blue-600/20 hover:bg-blue-700 hover:-translate-y-0.5 transition-all active:translate-y-0"
                    >
                        <Plus size={20} />
                        Nouveau CDC
                    </button>
                </div>

                {/* Filters & Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
                    <div className="lg:col-span-3 flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input 
                                type="text" 
                                placeholder="Rechercher par référence, objet ou organisme..."
                                className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold shadow-sm focus:border-blue-400 outline-none transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex p-1 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-x-auto whitespace-nowrap">
                            {['all', 'En préparation', 'Déposé', 'Adjugé', 'Perdu'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setActiveStatusFilter(status)}
                                    className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
                                        activeStatusFilter === status 
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                                        : 'text-slate-500 hover:bg-slate-50'
                                    }`}
                                >
                                    {status === 'all' ? 'Tous' : status}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Tenders Table */}
                <div className="bg-white border border-slate-200 rounded-[32px] shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">CDC / Objet</th>
                                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Organisme</th>
                                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Dates Clés</th>
                                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Équipe</th>
                                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Statut</th>
                                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="6" className="p-20 text-center font-bold text-slate-400">Chargement...</td>
                                    </tr>
                                ) : filteredTenders.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="p-20 text-center font-bold text-slate-400 italic">Aucun dossier trouvé</td>
                                    </tr>
                                ) : (
                                    filteredTenders.map((tender) => (
                                        <tr key={tender.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="p-6">
                                                <div className="font-black text-slate-900 group-hover:text-blue-600 transition-colors">{tender.refCdc || "SANS RÉF"}</div>
                                                <div className="text-xs text-slate-500 font-bold mt-1 line-clamp-1">{tender.object}</div>
                                            </td>
                                            <td className="p-6">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                                                        <Building2 size={16} />
                                                    </div>
                                                    <span className="text-sm font-bold text-slate-700">{tender.organism}</span>
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                                                        <Clock size={12} className="text-blue-500" /> Limite: {tender.deadlineDate || '-'}
                                                    </div>
                                                    {tender.depositDate && (
                                                        <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600">
                                                            <CheckCircle2 size={12} /> Déposé le: {tender.depositDate}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-6 text-sm font-bold text-slate-600">
                                                {tender.salesPersons || "Non assigné"}
                                            </td>
                                            <td className="p-6">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight border ${getStatusColor(tender.status)}`}>
                                                    {tender.status}
                                                </span>
                                            </td>
                                            <td className="p-6">
                                                <div className="flex items-center gap-2">
                                                    <button 
                                                        onClick={() => handleOpenForm(tender)}
                                                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                                    >
                                                        <Edit3 size={18} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(tender.id)}
                                                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* Modal Form */}
            {showForm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowForm(false)}></div>
                    <div className="relative bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-black uppercase tracking-tight">
                                    {editingTender ? "Modifier le Dossier" : "Nouveau CDC / Soumission"}
                                </h3>
                                <p className="text-xs text-slate-400 font-bold uppercase mt-1">Saisie des informations de l'appel d'offre</p>
                            </div>
                            <button onClick={() => setShowForm(false)} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/10 transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-8 max-h-[70vh] overflow-y-auto bg-slate-50/50">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Référence CDC</label>
                                    <input 
                                        required
                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-sm outline-none focus:border-blue-400 transition-all"
                                        value={formData.refCdc}
                                        onChange={(e) => setFormData({...formData, refCdc: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Organisme / Client</label>
                                    <input 
                                        required
                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-sm outline-none focus:border-blue-400 transition-all"
                                        value={formData.organism}
                                        onChange={(e) => setFormData({...formData, organism: e.target.value})}
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Objet de la soumission</label>
                                    <textarea 
                                        required
                                        rows="2"
                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-sm outline-none focus:border-blue-400 transition-all resize-none"
                                        value={formData.object}
                                        onChange={(e) => setFormData({...formData, object: e.target.value})}
                                    ></textarea>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Date d'envoi du CDC</label>
                                    <input 
                                        type="date"
                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-sm outline-none focus:border-blue-400 transition-all"
                                        value={formData.dispatchDate}
                                        onChange={(e) => setFormData({...formData, dispatchDate: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Date limite de remise</label>
                                    <input 
                                        type="date"
                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-sm outline-none focus:border-blue-400 transition-all"
                                        value={formData.deadlineDate}
                                        onChange={(e) => setFormData({...formData, deadlineDate: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Commerciaux concernés</label>
                                    <input 
                                        placeholder="Ex: Ahmed, Sarah, Karim"
                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-sm outline-none focus:border-blue-400 transition-all"
                                        value={formData.salesPersons}
                                        onChange={(e) => setFormData({...formData, salesPersons: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Statut du Dossier</label>
                                    <select 
                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-sm outline-none focus:border-blue-400 transition-all"
                                        value={formData.status}
                                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                                    >
                                        <option value="En préparation">En préparation</option>
                                        <option value="Déposé">Déposé</option>
                                        <option value="Adjugé">Adjugé (Gagné)</option>
                                        <option value="Perdu">Perdu</option>
                                        <option value="Annulé">Annulé</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Commentaires / Suivi</label>
                                    <textarea 
                                        rows="3"
                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-sm outline-none focus:border-blue-400 transition-all resize-none"
                                        value={formData.comments}
                                        onChange={(e) => setFormData({...formData, comments: e.target.value})}
                                    ></textarea>
                                </div>
                            </div>
                            
                            <div className="mt-10 flex gap-4">
                                <button 
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="flex-1 px-8 py-4 bg-white border border-slate-200 rounded-2xl font-black text-slate-600 hover:bg-slate-50 transition-all"
                                >
                                    Annuler
                                </button>
                                <button 
                                    type="submit"
                                    className="flex-[2] px-8 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-600/20 hover:bg-blue-700 hover:-translate-y-0.5 transition-all active:translate-y-0"
                                >
                                    {editingTender ? "Enregistrer les modifications" : "Créer le dossier"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Tenders;
