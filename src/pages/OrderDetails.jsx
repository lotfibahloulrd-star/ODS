import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    FileText, 
    ArrowLeft, 
    Calendar, 
    Clock, 
    CheckCircle2, 
    PlayCircle, 
    AlertCircle, 
    Truck, 
    Package, 
    Plus, 
    ChevronRight,
    Search,
    Download,
    Eye,
    Trash2,
    Edit3,
    ShieldCheck,
    FileCheck,
    User,
    Phone,
    Mail
} from 'lucide-react';
import { orderService } from '../services/orderService';
import { useAuth } from '../context/AuthContext';

const OrderDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentUser, isSuperAdmin, isImport, isStock, canEditAdminFields } = useAuth();
    
    const [order, setOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // Editing States
    const [isEditingAmount, setIsEditingAmount] = useState(false);
    const [isEditingBankDomiciliation, setIsEditingBankDomiciliation] = useState(false);
    const [isEditingJudicialProceedings, setIsEditingJudicialProceedings] = useState(false);
    const [isEditingRefOds, setIsEditingRefOds] = useState(false);
    const [isEditingRefContract, setIsEditingRefContract] = useState(false);
    const [isEditingDateOds, setIsEditingDateOds] = useState(false);
    const [isEditingDelay, setIsEditingDelay] = useState(false);
    const [isEditingStopDate, setIsEditingStopDate] = useState(false);
    const [isEditingResumeDate, setIsEditingResumeDate] = useState(false);
    const [isEditingDeliveryDate, setIsEditingDeliveryDate] = useState(false);
    const [isEditingClient, setIsEditingClient] = useState(false);
    const [isEditingObject, setIsEditingObject] = useState(false);
    const [isEditingDivision, setIsEditingDivision] = useState(false);

    // Temp inputs
    const [tempAmount, setTempAmount] = useState("");
    const [tempBankDomiciliation, setTempBankDomiciliation] = useState("");
    const [tempJudicialProceedings, setTempJudicialProceedings] = useState("");
    const [tempRefOds, setTempRefOds] = useState("");
    const [tempRefContract, setTempRefContract] = useState("");
    const [tempDateOds, setTempDateOds] = useState("");
    const [tempDelay, setTempDelay] = useState("");
    const [tempStopDate, setTempStopDate] = useState("");
    const [tempResumeDate, setTempResumeDate] = useState("");
    const [tempDeliveryDate, setTempDeliveryDate] = useState("");
    const [tempHt, setTempHt] = useState(0);
    const [tempTva, setTempTva] = useState(0);
    const [tempClient, setTempClient] = useState("");
    const [tempObject, setTempObject] = useState("");
    const [tempDivision, setTempDivision] = useState("");

    const [importData, setImportData] = useState({
        authImport: 'Non',
        orderPlaced: false,
        shippedAt: '',
        tracking: '',
        clearedAt: '',
        customsRef: ''
    });

    const [stockData, setStockData] = useState({
        reception: 'Non reçue',
        receivedAt: '',
        location: '',
        deliveryNote: ''
    });

    const [localArticles, setLocalArticles] = useState([]);
    const [editingArticleIndex, setEditingArticleIndex] = useState(null);
    const [editingArticleData, setEditingArticleData] = useState({});
    const [isAddingArticle, setIsAddingArticle] = useState(false);
    const [isEditingFooter, setIsEditingFooter] = useState(false);
    const [newArticle, setNewArticle] = useState({ no: "", ref: "", designation: "", qte: "", pu: "", marque: "", site: "" });
    const [isAddingContact, setIsAddingContact] = useState(false);
    const [newContactData, setNewContactData] = useState({ name: "", position: "", phone: "", email: "" });

    const loadOrder = async () => {
        setIsLoading(true);
        try {
            const data = await orderService.getOrderById(id);
            if (data) {
                setOrder(data);
                setImportData(data.importStatus || {
                    authImport: 'Non',
                    orderPlaced: false,
                    shippedAt: '',
                    tracking: '',
                    clearedAt: '',
                    customsRef: ''
                });
                setStockData(data.stockStatus || {
                    reception: 'Non reçue',
                    receivedAt: '',
                    location: '',
                    deliveryNote: ''
                });
                setLocalArticles(data.articles || []);
                setTempAmount(data.amount || "");
                setTempHt(data.totals?.ht || 0);
                setTempTva(data.totals?.tva || 0);
                setTempRefOds(data.refOds || "");
                setTempRefContract(data.refContract || "");
                setTempStopDate(data.stopDate || "");
                setTempResumeDate(data.resumeDate || "");
                setTempDateOds(data.startDate || data.dateOds || "");
                setTempDelay(data.delay || "");
                setTempDeliveryDate(data.deliveryDate || "");
                setTempClient(data.client || "");
                setTempObject(data.object || "");
                setTempDivision(data.division || "Division Laboratoire");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadOrder();
    }, [id]);

    const handleUpload = async (file, type) => {
        if (!file) return;
        setIsUploading(true);
        const reader = new FileReader();
        reader.onload = async () => {
            try {
                const orderId = order.id;
                if (type === 'ods') await orderService.saveOdsFile(orderId, reader.result, file.name);
                else if (type === 'contract') await orderService.saveContractFile(orderId, reader.result, file.name);
                else if (type === 'stop_req') await orderService.saveStopReqFile(orderId, reader.result, file.name);
                else if (type === 'stop_res') await orderService.saveStopResFile(orderId, reader.result, file.name);
                else if (type === 'auth') {
                    await orderService.saveAuthFile(orderId, reader.result, file.name);
                    await orderService.updateOrder(orderId, { authorization: 'Oui' }, currentUser.firstName);
                }
                loadOrder();
                alert(`Document ${type.replace('_', ' ').toUpperCase()} attaché avec succès !`);
            } catch (error) {
                console.error("Upload error:", error);
                alert("Erreur de stockage : " + error.message);
            } finally {
                setIsUploading(false);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleUpdateContacts = async (newContacts) => {
        setIsSaving(true);
        try {
            await orderService.updateOrder(order.id, { contacts: newContacts }, currentUser.firstName);
            loadOrder();
        } catch (e) {
            alert("Erreur lors de la mise à jour des contacts.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveAdminFields = async (field, value, tempSetter, editSetter, label) => {
        setIsSaving(true);
        try {
            await orderService.updateOrder(order.id, { [field]: value }, currentUser.firstName);
            editSetter(false);
            loadOrder();
            alert(`${label} mis à jour !`);
        } catch (e) {
            alert(`Erreur lors de la mise à jour de ${label}.`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveWorkflow = async () => {
        setIsSaving(true);
        try {
            await orderService.updateOrder(order.id, {
                importStatus: importData,
                stockStatus: stockData,
                articles: localArticles
            }, currentUser.firstName);
            loadOrder();
            alert("Suivi opérationnel mis à jour !");
        } catch (e) {
            alert("Erreur lors de la mise à jour.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddArticle = async () => {
        if (!newArticle.ref || !newArticle.designation) {
            alert("Remplissez au moins la référence et la désignation.");
            return;
        }
        const updatedArticles = [...localArticles, {
            ...newArticle,
            qte: parseInt(newArticle.qte) || 1,
            pu: parseFloat(newArticle.pu) || 0,
            total: (parseInt(newArticle.qte) || 1) * (parseFloat(newArticle.pu) || 0),
            available: false
        }];
        setLocalArticles(updatedArticles);
        await orderService.updateOrder(order.id, { articles: updatedArticles }, currentUser.firstName);
        setNewArticle({ no: "", ref: "", designation: "", qte: "", pu: "", marque: "", site: "" });
        setIsAddingArticle(false);
        loadOrder();
    };

    const handleUpdateArticle = async (index) => {
        const updatedArticles = [...localArticles];
        updatedArticles[index] = {
            ...editingArticleData,
            total: (parseInt(editingArticleData.qte) || 0) * (parseFloat(editingArticleData.pu) || 0)
        };
        setLocalArticles(updatedArticles);
        await orderService.updateOrder(order.id, { articles: updatedArticles }, currentUser.firstName);
        setEditingArticleIndex(null);
        loadOrder();
    };

    const handleDeleteArticle = async (index) => {
        if (window.confirm("Supprimer cet article ?")) {
            const updatedArticles = localArticles.filter((_, i) => i !== index);
            setLocalArticles(updatedArticles);
            await orderService.updateOrder(order.id, { articles: updatedArticles }, currentUser.firstName);
            loadOrder();
        }
    };

    const openPdf = (id, type) => {
        const fileData = order.files[type];
        if (fileData) {
            const win = window.open();
            win.document.write(`<iframe src="${fileData}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
        }
    };

    const remainingInfo = useMemo(() => {
        if (!order) return null;
        const start = new Date(order.startDate || order.dateOds);
        const delay = parseInt(order.delay) || 0;
        let end = new Date(start);
        end.setDate(end.getDate() + delay);

        if (order.stopDate) {
            const stop = new Date(order.stopDate);
            const resume = order.resumeDate ? new Date(order.resumeDate) : new Date();
            const diffTime = Math.abs(resume - stop);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            end.setDate(end.getDate() + diffDays);
        }

        const now = new Date();
        now.setHours(0,0,0,0);
        const isOverdue = now > end && order.deliveryStatus !== 'Livrée';
        const isDelivered = order.deliveryStatus === 'Livrée';

        return {
            endDate: end,
            formattedDate: end.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }),
            isOverdue,
            isDelivered,
            deliveryDate: order.deliveryDate,
            days: Math.ceil((end - now) / (1000 * 60 * 60 * 24))
        };
    }, [order]);

    if (isLoading || !order) return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-6">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-400 font-black uppercase tracking-[0.3em] animate-pulse">Chargement de l'ODS...</p>
        </div>
    );

    const formatAmount = (val) => new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD' }).format(val || 0);
    const formatDate = (date) => date ? new Date(date).toLocaleDateString('fr-FR') : "";

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-20">
            {/* Header Sticky */}
            <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-10 py-5 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-6">
                    <button onClick={() => navigate('/')} className="w-12 h-12 flex items-center justify-center bg-slate-50 border border-slate-200 rounded-2xl text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-all">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <span className="px-3 py-1 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg shadow-blue-100">ODS Détails</span>
                            <span className="text-slate-300">/</span>
                            <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">{order.refOds}</h2>
                        </div>
                        <p className="text-xs font-bold text-slate-400 italic">Dernière mise à jour par {order.updatedBy || "Système"}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className={`px-5 py-2.5 rounded-2xl flex items-center gap-3 border shadow-sm transition-all ${remainingInfo?.isOverdue ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100'}`}>
                        <div className={`w-2 h-2 rounded-full animate-pulse ${remainingInfo?.isOverdue ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${remainingInfo?.isOverdue ? 'text-red-600' : 'text-emerald-700'}`}>
                            {remainingInfo?.isOverdue ? "En retard / critique" : "En cours / conforme"}
                        </span>
                    </div>
                </div>
            </div>

            <div className="max-w-[1600px] mx-auto p-10 space-y-10">
                {/* Section 1: Client & Object */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2 space-y-10">
                        <div className="bg-white rounded-[3rem] p-12 border border-slate-200 shadow-xl shadow-slate-200/20 relative overflow-hidden group">
                           <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50/50 rounded-full -mr-32 -mt-32"></div>
                           <div className="relative z-10">
                               <div className="flex items-start justify-between mb-8">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] bg-blue-50 px-3 py-1 rounded-lg">Donneur d'ordre</span>
                                            {canEditAdminFields() && !isEditingClient && <button onClick={() => { setTempClient(order.client); setIsEditingClient(true); }} className="p-1 hover:bg-slate-100 rounded text-slate-300"><Edit3 size={12} /></button>}
                                        </div>
                                        {isEditingClient ? (
                                            <div className="flex gap-2">
                                                <input type="text" value={tempClient} onChange={e => setTempClient(e.target.value)} className="text-3xl font-black text-slate-900 uppercase tracking-tight outline-none border-b-2 border-blue-200 bg-transparent w-full" autoFocus />
                                                <button onClick={() => handleSaveAdminFields('client', tempClient, setTempClient, setIsEditingClient, 'Client')} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-black uppercase">OK</button>
                                            </div>
                                        ) : (
                                            <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tight leading-tight">{order.client}</h1>
                                        )}
                                    </div>
                                    <div className="flex flex-col items-end gap-3 text-right">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Affiliation / Division</span>
                                        {isEditingDivision ? (
                                            <div className="flex gap-2">
                                                <select value={tempDivision} onChange={e => setTempDivision(e.target.value)} className="p-2 bg-slate-50 border-2 border-blue-100 rounded-xl font-black text-blue-600 outline-none">
                                                    <option value="Division Laboratoire">Division Laboratoire</option>
                                                    <option value="Division Analytique">Division Analytique</option>
                                                    <option value="Division Analytique et Laboratoire">Division Analytique et Laboratoire (DL/DA)</option>
                                                    <option value="Laboratoire de Métrologie">Laboratoire de Métrologie</option>
                                                    <option value="Direction Maintenance SAV">Direction Maintenance SAV</option>
                                                </select>
                                                <button onClick={() => handleSaveAdminFields('division', tempDivision, setTempDivision, setIsEditingDivision, 'Division')} className="bg-blue-600 text-white px-4 py-1 rounded-xl text-[10px] font-black uppercase">OK</button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-3">
                                                <span className="bg-slate-900 text-white px-6 py-2 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-slate-200">
                                                    <ShieldCheck size={14} className="text-blue-400" />
                                                    {order.division || "Non classé"}
                                                </span>
                                                {canEditAdminFields() && <button onClick={() => { setTempDivision(order.division || "Division Laboratoire"); setIsEditingDivision(true); }} className="p-2 hover:bg-slate-100 rounded-lg text-slate-300"><Plus size={14} /></button>}
                                            </div>
                                        )}
                                    </div>
                               </div>
                               <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <FileText size={18} className="text-slate-400" />
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Objet du Marché / Prestation</span>
                                        {canEditAdminFields() && !isEditingObject && <button onClick={() => { setTempObject(order.object); setIsEditingObject(true); }} className="p-1 hover:bg-slate-100 rounded text-slate-300"><Edit3 size={12} /></button>}
                                    </div>
                                    {isEditingObject ? (
                                        <div className="flex flex-col gap-2">
                                            <textarea value={tempObject} onChange={e => setTempObject(e.target.value)} className="text-lg font-bold text-slate-700 leading-relaxed bg-slate-50 p-4 border-2 border-blue-100 rounded-2xl outline-none" rows={3} autoFocus />
                                            <button onClick={() => handleSaveAdminFields('object', tempObject, setTempObject, setIsEditingObject, 'Objet')} className="self-end bg-blue-600 text-white px-6 py-2 rounded-xl text-xs font-black uppercase">Enregistrer l'objet</button>
                                        </div>
                                    ) : (
                                        <p className="text-xl font-bold text-slate-600 leading-relaxed border-l-4 border-blue-100 pl-8">{order.object}</p>
                                    )}
                               </div>
                           </div>
                        </div>

                        {/* Financial and Admin Stats Row */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-lg shadow-slate-100/50 group">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">Montant Global TTC</span>
                                {isEditingAmount ? (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 gap-3">
                                            <div className="space-y-1">
                                                <label className="text-[8px] font-black uppercase text-slate-400">Montant HT</label>
                                                <input type="number" value={tempHt} onChange={e => { const ht = parseFloat(e.target.value); setTempHt(ht); setTempAmount((ht + tempTva).toFixed(2)); }} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-black text-slate-900" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[8px] font-black uppercase text-slate-400">TVA (19%)</label>
                                                <input type="number" value={tempTva} onChange={e => { const tva = parseFloat(e.target.value); setTempTva(tva); setTempAmount((tempHt + tva).toFixed(2)); }} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-black text-slate-900" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[8px] font-black uppercase text-slate-400">Total TTC</label>
                                                <input type="text" value={tempAmount} onChange={e => setTempAmount(e.target.value)} className="w-full p-2 bg-slate-50 border border-blue-200 rounded-lg font-black text-blue-600" />
                                            </div>
                                        </div>
                                        <button onClick={async () => {
                                            setIsSaving(true);
                                            try { await orderService.updateOrder(order.id, { amount: tempAmount, totals: { ht: tempHt, tva: tempTva, ttc: parseFloat(tempAmount) } }, currentUser.firstName); setIsEditingAmount(false); loadOrder(); } catch(e) { alert("Erreur mise à jour montant."); } finally { setIsSaving(false); }
                                        }} className="w-full py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase shadow-lg shadow-blue-100">Enregistrer</button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-4">
                                        <h3 className="text-2xl font-black text-slate-900 italic tracking-tight">{formatAmount(order.amount)}</h3>
                                        {canEditAdminFields() && <button onClick={() => setIsEditingAmount(true)} className="w-8 h-8 flex items-center justify-center bg-slate-50 text-slate-300 rounded-lg hover:text-blue-500 hover:bg-white border border-slate-100 transition-all"><Edit3 size={14} /></button>}
                                    </div>
                                )}
                            </div>
                            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-lg shadow-slate-100/50 group">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">Référence ODS</span>
                                {isEditingRefOds ? (
                                    <div className="flex gap-2">
                                        <input type="text" value={tempRefOds} onChange={e => setTempRefOds(e.target.value)} className="flex-1 p-2 bg-slate-50 border border-blue-200 rounded-xl font-black text-slate-900 outline-none" autoFocus />
                                        <button onClick={() => handleSaveAdminFields('refOds', tempRefOds, setTempRefOds, setIsEditingRefOds, 'Ref ODS')} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase">OK</button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-4">
                                        <h3 className="text-2xl font-black text-blue-600 uppercase italic tracking-tight">{order.refOds}</h3>
                                        {canEditAdminFields() && <button onClick={() => { setTempRefOds(order.refOds); setIsEditingRefOds(true); }} className="w-8 h-8 flex items-center justify-center bg-slate-50 text-slate-300 rounded-lg hover:text-blue-500 hover:bg-white border border-slate-100 transition-all"><Edit3 size={14} /></button>}
                                    </div>
                                )}
                            </div>
                            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-lg shadow-slate-100/50 group">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">Réf. Contrat / Marché</span>
                                {isEditingRefContract ? (
                                    <div className="flex gap-2">
                                        <input type="text" value={tempRefContract} onChange={e => setTempRefContract(e.target.value)} className="flex-1 p-2 bg-slate-50 border border-blue-200 rounded-xl font-black text-slate-900 outline-none" autoFocus />
                                        <button onClick={() => handleSaveAdminFields('refContract', tempRefContract, setTempRefContract, setIsEditingRefContract, 'Ref Contrat')} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase">OK</button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-4">
                                        <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tight truncate max-w-[200px]">{order.refContract}</h3>
                                        {canEditAdminFields() && <button onClick={() => { setTempRefContract(order.refContract); setIsEditingRefContract(true); }} className="w-8 h-8 flex items-center justify-center bg-slate-50 text-slate-300 rounded-lg hover:text-blue-500 hover:bg-white border border-slate-100 transition-all"><Edit3 size={14} /></button>}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Contacts Section - MOVED HERE */}
                        <div className="p-10 bg-white rounded-[3rem] border border-slate-200 shadow-xl shadow-slate-200/10 space-y-8">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                                        <span className="text-xl">👥</span>
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-black uppercase tracking-widest text-slate-900">Contacts de l'Organisme</h4>
                                        <p className="font-bold text-slate-400 text-xs">Interlocuteurs rattachés à cet ODS</p>
                                    </div>
                                </div>
                                {canEditAdminFields() && !isAddingContact && (
                                    <button
                                        onClick={() => setIsAddingContact(true)}
                                        className="px-6 py-3 bg-indigo-50 text-indigo-600 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-2"
                                    >
                                        <Plus size={16} /> Ajouter un contact
                                    </button>
                                )}
                            </div>

                            {isAddingContact && (
                                <div className="p-8 bg-indigo-50/50 rounded-[2.5rem] border border-indigo-100 animate-in fade-in zoom-in duration-300">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Nom et Prénom</label>
                                            <input type="text" className="w-full p-4 bg-white border border-indigo-100 rounded-2xl text-xs font-bold text-slate-700 shadow-sm" value={newContactData.name} onChange={e => setNewContactData({...newContactData, name: e.target.value})} placeholder="Ex: Lotfi Bahloul" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Poste Occupé</label>
                                            <input type="text" className="w-full p-4 bg-white border border-indigo-100 rounded-2xl text-xs font-bold text-slate-700 shadow-sm" value={newContactData.position} onChange={e => setNewContactData({...newContactData, position: e.target.value})} placeholder="Ex: Responsable Maintenance" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Téléphone</label>
                                            <input type="text" className="w-full p-4 bg-white border border-indigo-100 rounded-2xl text-xs font-bold text-slate-700 shadow-sm" value={newContactData.phone} onChange={e => setNewContactData({...newContactData, phone: e.target.value})} placeholder="Ex: 0550 XX XX XX" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Adresse Email</label>
                                            <input type="email" className="w-full p-4 bg-white border border-indigo-100 rounded-2xl text-xs font-bold text-slate-700 shadow-sm" value={newContactData.email} onChange={e => setNewContactData({...newContactData, email: e.target.value})} placeholder="Ex: l.bahloul@example.com" />
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <button 
                                            onClick={() => {
                                                const updated = [...(order.contacts || []), newContactData];
                                                handleUpdateContacts(updated);
                                                setIsAddingContact(false);
                                                setNewContactData({ name: "", position: "", phone: "", email: "" });
                                            }}
                                            className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
                                        >
                                            Valider et Enregistrer
                                        </button>
                                        <button onClick={() => setIsAddingContact(false)} className="px-8 py-4 bg-white border border-slate-200 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all">Annuler</button>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {(order.contacts || []).map((contact, cIdx) => (
                                    <div key={cIdx} className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 group hover:border-indigo-200 transition-all relative">
                                        <div className="flex items-start justify-between mb-6">
                                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-500 shadow-sm">
                                                <User size={22} />
                                            </div>
                                            {canEditAdminFields() && (
                                                <button 
                                                    onClick={() => {
                                                        if (window.confirm("Supprimer ce contact ?")) {
                                                            const updated = order.contacts.filter((_, i) => i !== cIdx);
                                                            handleUpdateContacts(updated);
                                                        }
                                                    }}
                                                    className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                        <div className="space-y-4">
                                            <div>
                                                <h5 className="text-[13px] font-black text-slate-900 uppercase tracking-tight">{contact.name}</h5>
                                                <div className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mt-0.5">{contact.position}</div>
                                            </div>
                                            <div className="space-y-2.5 pt-4 border-t border-slate-200/50">
                                                <div className="flex items-center gap-3 text-slate-600 text-[11px] font-medium">
                                                    <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center text-slate-400 shadow-sm"><Phone size={12} /></div>
                                                    {contact.phone || "Non renseigné"}
                                                </div>
                                                <div className="flex items-center gap-3 text-slate-600 text-[11px] font-medium">
                                                    <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center text-slate-400 shadow-sm"><Mail size={12} /></div>
                                                    {contact.email || "Non renseigné"}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {(order.contacts || []).length === 0 && !isAddingContact && (
                                    <div className="lg:col-span-3 py-12 text-center border-4 border-dashed border-slate-50 rounded-[3rem]">
                                        <p className="text-slate-300 font-bold text-xs uppercase tracking-[0.2em] italic">Aucun contact spécifique pour cet organisme</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Tables grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                            {/* Documents Section */}
                            <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
                                <div className="bg-slate-50 px-8 py-5 border-b border-slate-100 flex justify-between items-center">
                                    <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-600">Documents Contractuels</h4>
                                    {isUploading && <div className="text-[9px] font-black text-blue-500 animate-pulse">CHARGEMENT...</div>}
                                </div>
                                <table className="w-full text-left border-collapse">
                                    <tbody className="divide-y divide-slate-100">
                                        {[
                                            { key: 'storage_ods', label: 'Ordre de Service (ODS)', type: 'ods' },
                                            { key: 'storage_contracts', label: 'Contrat / Marché Signé', type: 'contract' },
                                            { key: 'storage_auth', label: 'Autorisation d\'Importation', type: 'auth' }
                                        ].map(doc => (
                                            <tr key={doc.key} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${order.files?.[doc.key] ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-slate-100 text-slate-300'}`}>
                                                            <FileText size={18} />
                                                        </div>
                                                        <div>
                                                            <div className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{doc.label}</div>
                                                            <div className="text-[9px] font-bold text-slate-400 mt-0.5">{order.files?.[doc.key] ? "Document disponible" : "Non attaché"}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <div className="flex items-center justify-end gap-3">
                                                        {order.files?.[doc.key] && (
                                                            <button onClick={() => openPdf(order.id, doc.key)} className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"><Eye size={16} /></button>
                                                        )}
                                                        {canEditAdminFields() && (
                                                            <label className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 cursor-pointer">
                                                                <Download size={16} className="rotate-180" />
                                                                <input type="file" className="hidden" onChange={e => handleUpload(e.target.files[0], doc.type)} accept=".pdf" />
                                                            </label>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Consistance (Articles Summary) */}
                            <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
                                <div className="bg-slate-50 px-8 py-5 border-b border-slate-100">
                                    <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-600">Consistance / Prestation</h4>
                                </div>
                                <div className="p-8 space-y-6">
                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white"><Package size={18} /></div>
                                            <div>
                                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Articles TOTAUX</div>
                                                <div className="text-xl font-black text-slate-900 leading-none">{localArticles.length}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-end">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">État de disponibilité</span>
                                            <span className="text-xs font-black text-emerald-600">{Math.round((localArticles.filter(a => a.available).length / (localArticles.length || 1)) * 100)}%</span>
                                        </div>
                                        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
                                            <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-1000 shadow-sm" style={{ width: `${(localArticles.filter(a => a.available).length / (localArticles.length || 1)) * 100}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Full Articles Table */}
                        <div className="bg-white rounded-[3rem] border border-slate-200 overflow-hidden shadow-xl shadow-slate-200/20">
                            <div className="bg-slate-900 px-10 py-6 flex justify-between items-center text-white">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center"><Search size={18} /></div>
                                    <h4 className="text-[11px] font-black uppercase tracking-[0.3em]">Bordereau des prix et quantités</h4>
                                </div>
                                {canEditAdminFields() && (
                                    <button onClick={() => setIsAddingArticle(true)} className="px-6 py-2.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">Ajouter manuellement</button>
                                )}
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-100">
                                            <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">N°</th>
                                            <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Référence</th>
                                            <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Désignation</th>
                                            <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 text-center">Qté</th>
                                            <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 text-right">PU HT</th>
                                            <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 text-right">Montant HT</th>
                                            <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 text-center">Marque</th>
                                            <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-emerald-600 text-center">Dispo</th>
                                            <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-blue-600 text-center">Suivi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {isAddingArticle && (
                                            <tr className="bg-blue-50/50 animate-in fade-in duration-300">
                                                <td className="p-4" colSpan={9}>
                                                    <div className="grid grid-cols-6 gap-4 p-4">
                                                        <input type="text" placeholder="Référence" value={newArticle.ref} onChange={e => setNewArticle({...newArticle, ref: e.target.value})} className="p-2 rounded border" />
                                                        <input type="text" placeholder="Désignation" value={newArticle.designation} onChange={e => setNewArticle({...newArticle, designation: e.target.value})} className="col-span-2 p-2 rounded border" />
                                                        <input type="number" placeholder="Qté" value={newArticle.qte} onChange={e => setNewArticle({...newArticle, qte: e.target.value})} className="p-2 rounded border" />
                                                        <input type="number" placeholder="PU" value={newArticle.pu} onChange={e => setNewArticle({...newArticle, pu: e.target.value})} className="p-2 rounded border" />
                                                        <button onClick={handleAddArticle} className="bg-blue-600 text-white p-2 rounded font-black uppercase text-[10px]">OK</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                        {localArticles.map((art, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                                                <td className="px-6 py-4 text-[10px] font-black text-slate-400">{idx + 1}</td>
                                                <td className="px-6 py-4 text-[10px] font-bold text-blue-600">{art.ref}</td>
                                                <td className="px-6 py-4 text-[10px] font-medium text-slate-600 leading-relaxed max-w-md">{art.designation}</td>
                                                <td className="px-6 py-4 text-[10px] font-black text-slate-900 text-center">{art.qte}</td>
                                                <td className="px-6 py-4 text-[10px] font-bold text-slate-700 text-right">{formatAmount(art.pu)}</td>
                                                <td className="px-6 py-4 text-[10px] font-black text-slate-900 text-right">{formatAmount(art.total)}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[8px] font-black uppercase italic">{art.marque}</span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <button onClick={async () => {
                                                        const newArts = [...localArticles];
                                                        newArts[idx].available = !newArts[idx].available;
                                                        setLocalArticles(newArts);
                                                        await orderService.updateOrder(order.id, { articles: newArts }, currentUser.firstName);
                                                    }} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${art.available ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' : 'bg-slate-100 text-slate-300'}`}>
                                                        <CheckCircle2 size={16} />
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex gap-1 justify-center opacity-0 group-hover:opacity-100 transition-all">
                                                        {canEditAdminFields() && <button onClick={() => handleDeleteArticle(idx)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={12} /></button>}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Operational Workflow section can be here if needed */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                             {/* Section Importation */}
                             <div className="bg-white rounded-[3rem] p-10 border border-slate-200 shadow-xl shadow-slate-200/5 space-y-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
                                        <Truck size={22} />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-black uppercase tracking-widest text-slate-900">Suivi Importation</h4>
                                        <p className="font-bold text-slate-400 text-xs">Phases logistiques transfrontalières</p>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Commande Étranger</span>
                                            <button onClick={() => setImportData({...importData, orderPlaced: !importData.orderPlaced})} className={`w-12 h-6 rounded-full transition-all relative ${importData.orderPlaced ? 'bg-blue-600 shadow-lg shadow-blue-100' : 'bg-slate-300'}`}>
                                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${importData.orderPlaced ? 'left-7' : 'left-1'}`}></div>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                             </div>
                             {/* Section Stock */}
                             <div className="bg-white rounded-[3rem] p-10 border border-slate-200 shadow-xl shadow-slate-200/5 space-y-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-100">
                                        <Package size={22} />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-black uppercase tracking-widest text-slate-900">Suivi Stock</h4>
                                        <p className="font-bold text-slate-400 text-xs">Réception et entreposage</p>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <select value={stockData.reception} onChange={e => setStockData({...stockData, reception: e.target.value})} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-slate-900 outline-none focus:border-emerald-500 transition-all">
                                        <option value="Non reçue">Non reçue</option>
                                        <option value="Partielle">Réception Partielle</option>
                                        <option value="Totale">Réception Totale ✅</option>
                                    </select>
                                </div>
                             </div>
                        </div>

                        {/* Operational Save Button */}
                        {(isImport() || isStock() || canEditAdminFields()) && (
                            <div className="flex justify-center pt-4">
                                <button onClick={handleSaveWorkflow} disabled={isSaving} className="px-12 py-5 bg-slate-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-slate-200 hover:bg-black hover:-translate-y-1 transition-all disabled:opacity-50 disabled:translate-y-0 active:scale-95 flex items-center gap-4">
                                    {isSaving ? "Synchronisation..." : "Valider les étapes opérationnelles"}
                                    <CheckCircle2 size={20} />
                                </button>
                            </div>
                        )}

                        {/* Chronology Section */}
                        <div className="bg-slate-900 rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl shadow-slate-900/20">
                            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 blur-[100px] rounded-full -mr-32 -mt-32 animate-pulse-slow"></div>
                            <div className="relative z-10 space-y-8">
                                <div className="flex items-center gap-3">
                                    <PlayCircle size={20} className="text-blue-500" />
                                    <h3 className="text-[11px] font-black uppercase tracking-[0.3em]">Chronologie de l'exécution</h3>
                                </div>
                                <div className="flex flex-col md:flex-row justify-between items-center gap-12 md:gap-4 px-4">
                                    <div className="text-center">
                                        <div className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Notification ODS</div>
                                        <div className="text-3xl font-black">{formatDate(order.startDate || order.dateOds)}</div>
                                    </div>
                                    <div className="flex-1 h-px bg-slate-800 relative hidden md:block">
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-6 bg-slate-900 border border-slate-700 rounded-full py-2 text-[10px] font-black text-blue-400 uppercase tracking-widest whitespace-nowrap shadow-xl">
                                            Délai: {order.delay} JOURS
                                        </div>
                                    </div>
                                    <div className="text-center group relative">
                                        <div className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">
                                            {order.deliveryStatus === 'Livrée' ? 'Livré le' : 'Échéance Contractuelle'}
                                        </div>
                                        <div className={`text-3xl font-black ${order.deliveryStatus === 'Livrée' ? 'text-blue-500' : (remainingInfo?.isOverdue ? 'text-red-500' : 'text-emerald-500')}`}>
                                            {order.deliveryStatus === 'Livrée' ? formatDate(order.deliveryDate) : remainingInfo?.formattedDate}
                                        </div>
                                        {canEditAdminFields() && (
                                            <button onClick={() => setIsEditingDeliveryDate(true)} className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 absolute left-full ml-4">
                                                <Plus size={14} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Suspension Section if active */}
                        {(order.hasStopRequest === 'Oui' || !!(order.files?.storage_stops_req) || !!(order.files?.storage_stops_res)) && (
                            <div className="bg-red-50 border border-red-100 rounded-[3rem] p-10 relative overflow-hidden">
                                <div className="flex items-center justify-between mb-10 relative z-10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-red-200 animate-pulse">
                                            <AlertCircle size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-red-900 uppercase">Suspension de Délai</h3>
                                            <p className="text-xs font-bold text-red-700">Calcul du délai neutralisé</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-8 relative z-10">
                                    <div className="bg-white p-8 rounded-[2rem] border border-red-50 shadow-sm">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Début Suspension</span>
                                        <span className="text-2xl font-black text-slate-900">{formatDate(order.stopDate)}</span>
                                    </div>
                                    <div className="bg-white p-8 rounded-[2rem] border border-red-50 shadow-sm">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Reprise d'activité</span>
                                        <span className="text-2xl font-black text-slate-900">{formatDate(order.resumeDate) || "EN COURS"}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Closing Footer Area */}
                <div className="p-10 bg-slate-50 border-t border-slate-100 flex justify-between items-center rounded-b-[4rem]">
                    <div className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Données synchronisées en temps réel</div>
                    <button onClick={() => navigate('/')} className="px-12 py-4 bg-slate-900 hover:bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95">Terminer Consultation</button>
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;
