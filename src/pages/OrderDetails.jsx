import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, FileCheck, ExternalLink, Calendar, User, Info, Clock, CheckCircle2, Package, Layers, FlaskConical, AlertCircle, PlayCircle, StopCircle, DollarSign, Plane, Truck, Anchor, Box, Ship, Upload, Plus } from 'lucide-react';
import { orderService } from '../services/orderService';
import { useAuth } from '../context/AuthContext';

const OrderDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentUser, isImport, isStock, canCreateOds, canEditAmount } = useAuth();

    const [order, setOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [importData, setImportData] = useState({});
    const [stockData, setStockData] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isEditingAmount, setIsEditingAmount] = useState(false);
    const [tempAmount, setTempAmount] = useState("");

    const loadOrder = async () => {
        setIsLoading(true);
        try {
            const data = await orderService.getAllOrders();
            const found = data.find(o => o.id === id);
            if (found) {
                setOrder(found);
                setImportData(found.importStatus || {});
                setStockData(found.stockStatus || {});
                setTempAmount(found.amount || "");
            }
        } catch (error) {
            console.error("Error loading order:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadOrder();

        // Système de secours : Migration automatique des fichiers locaux vers le serveur pour cet ordre précis
        const syncThisOrder = async () => {
            if (!id) return;
            const stores = ['storage_ods', 'storage_contracts', 'storage_stops_req', 'storage_stops_res'];
            let hasSynced = false;

            for (const store of stores) {
                // Si le document n'est pas marqué comme existant sur le serveur
                if (order && !order.files?.[store]) {
                    try {
                        const localFile = await orderService._getFile(store, id);
                        if (localFile && (localFile.fileDataUrl || localFile.blob)) {
                            const success = await orderService._uploadToShared(store, id, localFile.blob || localFile.fileDataUrl, localFile.fileName);
                            if (success) hasSynced = true;
                        }
                    } catch (e) {
                        console.error("Single order sync error:", e);
                    }
                }
            }
            if (hasSynced) loadOrder();
        };

        if (order) syncThisOrder();
    }, [id, !!order]);

    const handleDirectUpload = (e, orderId, type) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        const reader = new FileReader();
        reader.onloadend = async () => {
            try {
                if (type === 'ods') await orderService.saveOdsFile(orderId, reader.result, file.name);
                else if (type === 'contract') await orderService.saveContractFile(orderId, reader.result, file.name);
                else if (type === 'stop_request') await orderService.saveStopRequestFile(orderId, reader.result, file.name);
                else if (type === 'stop_response') await orderService.saveStopResponseFile(orderId, reader.result, file.name);

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

    const handleSaveWorkflow = async () => {
        setIsSaving(true);
        try {
            await orderService.updateOrder(order.id, {
                importStatus: importData,
                stockStatus: stockData
            }, currentUser.firstName);
            loadOrder();
            alert("Suivi opérationnel mis à jour !");
        } catch (e) {
            alert("Erreur lors de la mise à jour.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveAmount = async () => {
        setIsSaving(true);
        try {
            await orderService.updateOrder(order.id, { amount: tempAmount }, currentUser.firstName);
            setIsEditingAmount(false);
            loadOrder();
            alert("Montant mis à jour !");
        } catch (e) {
            alert("Erreur lors de la mise à jour du montant.");
        } finally {
            setIsSaving(false);
        }
    };

    const remainingInfo = useMemo(() => {
        if (!order) return null;
        try {
            let endDate = order?.endDate;
            const start = order?.startDate || order?.dateOds;
            const delay = order?.delay;

            if (!endDate && start && delay) {
                const date = new Date(start);
                const add = parseInt(delay);
                if (!isNaN(date.getTime()) && !isNaN(add)) {
                    date.setDate(date.getDate() + add);
                    if (order.stopDate && order.resumeDate) {
                        const stop = new Date(order.stopDate);
                        const resume = new Date(order.resumeDate);
                        if (!isNaN(stop.getTime()) && !isNaN(resume.getTime()) && resume > stop) {
                            date.setDate(date.getDate() + Math.ceil((resume - stop) / (1000 * 60 * 60 * 24)));
                        }
                    }
                    if (!isNaN(date.getTime())) endDate = date.toISOString().split('T')[0];
                }
            }

            if (!endDate) return null;
            const targetDate = new Date(endDate);
            if (isNaN(targetDate.getTime())) return null;

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            targetDate.setHours(0, 0, 0, 0);
            const diffDays = Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24));

            return {
                days: diffDays,
                isOverdue: diffDays < 0,
                formattedDate: new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }).format(targetDate)
            };
        } catch (e) { return null; }
    }, [order]);

    const formatDate = (dateStr) => {
        if (!dateStr) return "-";
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return dateStr;
            return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
        } catch (e) { return dateStr; }
    };

    const formatAmount = (amount) => {
        if (!amount) return "-";
        try {
            const num = parseFloat(amount.toString().replace(/[^\d.,]/g, '').replace(',', '.'));
            return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0 }).format(num) + " DA";
        } catch (e) { return amount + " DA"; }
    };

    const openPdf = (orderId, storageKey) => {
        // Construction du chemin absolu via le BASE_URL de Vite
        const baseUrl = import.meta.env.BASE_URL || '/';
        const apiPath = baseUrl.endsWith('/') ? `${baseUrl}api.php` : `${baseUrl}/api.php`;
        const fileUrl = `${apiPath}?action=get_file&orderId=${orderId}&storageKey=${storageKey}`;

        const newWindow = window.open();
        if (newWindow) {
            newWindow.document.write(`
                <html>
                    <head><title>Visualisation Document</title></head>
                    <body style="margin:0; background: #e2e8f0; display:flex; justify-content:center; align-items:center; font-family:sans-serif;">
                        <embed src="${fileUrl}" width="100%" height="100%" type="application/pdf" />
                        <div style="position:fixed; bottom:30px; right:30px; display:flex; gap:15px; align-items:center;">
                            <a href="${fileUrl}" download style="background:#2563eb; color:white; padding:12px 24px; border-radius:12px; text-decoration:none; font-weight:bold; box-shadow:0 10px 15px -3px rgba(37, 99, 235, 0.4); transition:all 0.3s; font-size:14px;">Télécharger le fichier</a>
                            <button onclick="window.close()" style="background:white; color:#64748b; padding:12px 24px; border-radius:12px; border:1px solid #e2e8f0; font-weight:bold; cursor:pointer; font-size:14px;">Fermer</button>
                        </div>
                    </body>
                </html>
            `);
        } else {
            // Fallback si popup bloquée
            window.location.href = fileUrl;
        }
    };

    if (isLoading) return (
        <div className="flex items-center justify-center py-40">
            <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
        </div>
    );

    if (!order) return (
        <div className="text-center py-40">
            <h2 className="text-2xl font-black text-slate-900 mb-4">Engagement non trouvé</h2>
            <button onClick={() => navigate('/')} className="px-6 py-2 bg-slate-900 text-white rounded-xl font-bold">Retour au tableau de bord</button>
        </div>
    );

    return (
        <div className="space-y-10 animate-fade-in">
            {/* Header / Top Navigation */}
            <div className="flex items-center justify-between">
                <button onClick={() => navigate('/')} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-black text-xs uppercase tracking-widest transition-all group">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center group-hover:border-blue-200 group-hover:bg-blue-50 transition-all">
                        <ArrowLeft size={18} />
                    </div>
                    Retour au tableau
                </button>
                <div className="flex items-center gap-3">
                    <span className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest ${order.authorization === 'Oui' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                        {order.authorization === 'Oui' ? 'Autorisé' : 'Attente Autorisation'}
                    </span>
                    {order.hasStopRequest === 'Oui' && (
                        <span className="px-4 py-2 bg-red-50 text-red-600 border border-red-100 text-[10px] font-black uppercase tracking-widest rounded-2xl flex items-center gap-2">
                            <StopCircle size={14} /> Arrêt Demandé
                        </span>
                    )}
                </div>
            </div>

            {/* Main Content Card */}
            <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 overflow-hidden border border-slate-100">
                {/* Hero section */}
                <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-10 text-white relative">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 blur-[100px] rounded-full -mr-20 -mt-20"></div>
                    <div className="relative z-10 space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-blue-600/30 backdrop-blur-md border border-blue-500/30 text-blue-200 text-[10px] font-black uppercase tracking-[0.2em] rounded-lg">Fiche État Engagement</span>
                            <span className="text-slate-500 font-bold">•</span>
                            <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">ID: {order.id}</span>
                        </div>
                        <h2 className="text-4xl font-black tracking-tight leading-tight">
                            {order.refOds || order.ref || "SANS RÉFÉRENCE"}
                        </h2>
                        <p className="text-slate-400 font-medium max-w-3xl text-lg leading-relaxed">{order.object}</p>
                    </div>
                </div>

                <div className="p-10 space-y-12">
                    {/* Key Stats Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 group hover:border-blue-200 transition-all">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">Client Engagé</span>
                            <span className="text-xl font-black text-slate-900 uppercase block">{order.client}</span>
                        </div>
                        <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 group hover:border-emerald-200 transition-all">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">Montant TTC</span>
                            {isEditingAmount ? (
                                <div className="flex gap-2">
                                    <input type="text" value={tempAmount} onChange={e => setTempAmount(e.target.value)} className="flex-1 p-2 bg-white border-2 border-blue-200 rounded-xl font-black text-blue-900 outline-none" autoFocus />
                                    <button onClick={handleSaveAmount} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase">OK</button>
                                </div>
                            ) : (
                                <div className="flex items-baseline gap-3">
                                    <span className="text-2xl font-black text-emerald-600">{formatAmount(order.amount)}</span>
                                    {canEditAmount() && <button onClick={() => { setTempAmount(order.amount); setIsEditingAmount(true); }} className="p-2 hover:bg-white text-slate-300 hover:text-blue-500 rounded-lg transition-all"><Plus size={14} /></button>}
                                </div>
                            )}
                        </div>
                        <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 group hover:border-blue-200 transition-all">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">Échéance Finale</span>
                            <div className="flex items-center gap-3">
                                <span className={`text-2xl font-black ${remainingInfo?.isOverdue ? 'text-red-500' : 'text-blue-600'}`}>{remainingInfo?.formattedDate}</span>
                                <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter ${remainingInfo?.isOverdue ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                                    {remainingInfo?.isOverdue ? `${Math.abs(remainingInfo.days)} J RETARD` : `${remainingInfo?.days} J RESTANTS`}
                                </span>
                            </div>
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
                                    <tr>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${order.files?.storage_ods ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-300'}`}>
                                                    <FileText size={16} />
                                                </div>
                                                <span className="text-xs font-black text-slate-700 uppercase">ODS Officiel (PDF)</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            {order.files?.storage_ods ? (
                                                <button onClick={() => openPdf(order.id, 'storage_ods')} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase flex items-center gap-2 ml-auto shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all">
                                                    <ExternalLink size={14} /> Voir l'ODS
                                                </button>
                                            ) : (
                                                <label className="flex items-center gap-2 justify-end text-slate-400 group cursor-pointer">
                                                    <span className="text-[10px] font-black uppercase tracking-widest group-hover:text-blue-500 transition-colors">Attacher</span>
                                                    <div className="w-10 h-10 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center group-hover:border-blue-500 group-hover:text-blue-500 transition-all">
                                                        <Plus size={16} />
                                                    </div>
                                                    <input type="file" className="hidden" accept=".pdf" onChange={e => handleDirectUpload(e, order.id, 'ods')} />
                                                </label>
                                            )}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${order.files?.storage_contracts ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-300'}`}>
                                                    <FileCheck size={16} />
                                                </div>
                                                <span className="text-xs font-black text-slate-700 uppercase">Contrat / Marché (PDF)</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            {order.files?.storage_contracts ? (
                                                <button onClick={() => openPdf(order.id, 'storage_contracts')} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase flex items-center gap-2 ml-auto shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">
                                                    <ExternalLink size={14} /> Voir le Contrat
                                                </button>
                                            ) : (
                                                <label className="flex items-center gap-2 justify-end text-slate-400 group cursor-pointer">
                                                    <span className="text-[10px] font-black uppercase tracking-widest group-hover:text-indigo-500 transition-colors">Attacher</span>
                                                    <div className="w-10 h-10 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center group-hover:border-indigo-500 group-hover:text-indigo-500 transition-all">
                                                        <Plus size={16} />
                                                    </div>
                                                    <input type="file" className="hidden" accept=".pdf" onChange={e => handleDirectUpload(e, order.id, 'contract')} />
                                                </label>
                                            )}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${order.files?.storage_stops_req ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-300'}`}>
                                                    <AlertCircle size={16} />
                                                </div>
                                                <span className="text-xs font-black text-slate-700 uppercase">Demande d'Arrêt (PDF)</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            {order.files?.storage_stops_req ? (
                                                <button onClick={() => openPdf(order.id, 'storage_stops_req')} className="px-4 py-2 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase flex items-center gap-2 ml-auto shadow-lg shadow-red-100 hover:bg-red-700 transition-all">
                                                    <ExternalLink size={14} /> Voir Demande
                                                </button>
                                            ) : (
                                                <label className="flex items-center gap-2 justify-end text-slate-400 group cursor-pointer">
                                                    <span className="text-[10px] font-black uppercase tracking-widest group-hover:text-red-500 transition-colors">Attacher</span>
                                                    <div className="w-10 h-10 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center group-hover:border-red-500 group-hover:text-red-500 transition-all">
                                                        <Plus size={16} />
                                                    </div>
                                                    <input type="file" className="hidden" accept=".pdf" onChange={e => handleDirectUpload(e, order.id, 'stop_request')} />
                                                </label>
                                            )}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${order.files?.storage_stops_res ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-300'}`}>
                                                    <CheckCircle2 size={16} />
                                                </div>
                                                <span className="text-xs font-black text-slate-700 uppercase">Reprise / Arrêt Officiel (PDF)</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            {order.files?.storage_stops_res ? (
                                                <button onClick={() => openPdf(order.id, 'storage_stops_res')} className="px-4 py-2 bg-amber-600 text-white rounded-xl text-[10px] font-black uppercase flex items-center gap-2 ml-auto shadow-lg shadow-amber-100 hover:bg-amber-700 transition-all">
                                                    <ExternalLink size={14} /> Voir Officiel
                                                </button>
                                            ) : (
                                                <label className="flex items-center gap-2 justify-end text-slate-400 group cursor-pointer">
                                                    <span className="text-[10px] font-black uppercase tracking-widest group-hover:text-amber-500 transition-colors">Attacher</span>
                                                    <div className="w-10 h-10 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center group-hover:border-amber-500 group-hover:text-amber-500 transition-all">
                                                        <Plus size={16} />
                                                    </div>
                                                    <input type="file" className="hidden" accept=".pdf" onChange={e => handleDirectUpload(e, order.id, 'stop_response')} />
                                                </label>
                                            )}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Consistance Section */}
                        <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100">
                                        <th colSpan="2" className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-indigo-600">Consistance de l'ODS</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    <tr>
                                        <td className="px-8 py-6 w-1/3 text-[10px] font-black text-slate-400 uppercase">Équipements</td>
                                        <td className="px-8 py-6 text-xs font-bold text-slate-600 leading-relaxed">{order.equipmentDetails || "-"}</td>
                                    </tr>
                                    <tr>
                                        <td className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase">Réactifs</td>
                                        <td className="px-8 py-6 text-xs font-bold text-slate-600 leading-relaxed">{order.reagentDetails || "-"}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Articles Section (BPU / DQE) if available */}
                    {order.articles && order.articles.length > 0 && (
                        <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
                            <div className="bg-slate-50 px-8 py-5 border-b border-slate-100 flex justify-between items-center">
                                <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-600">Détail Quantitatif et Estimatif (DQE)</h4>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{order.articles.length} Articles</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/50 border-b border-slate-100">
                                            <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">N°</th>
                                            <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Référence</th>
                                            <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Désignation</th>
                                            <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 text-center">Qté</th>
                                            <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 text-right">PU HT</th>
                                            <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 text-right">Montant HT</th>
                                            <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Marque</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {order.articles.map((art, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-4 text-[11px] font-black text-slate-400">{art.no}</td>
                                                <td className="px-6 py-4 text-[11px] font-bold text-blue-600">{art.ref}</td>
                                                <td className="px-6 py-4 text-[11px] font-medium text-slate-600 leading-relaxed max-w-md">{art.designation}</td>
                                                <td className="px-6 py-4 text-[11px] font-black text-slate-900 text-center">{art.qte}</td>
                                                <td className="px-6 py-4 text-[11px] font-bold text-slate-700 text-right">{formatAmount(art.pu)}</td>
                                                <td className="px-6 py-4 text-[11px] font-black text-slate-900 text-right">{formatAmount(art.total)}</td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[9px] font-black uppercase italic">{art.marque}</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    {order.totals && (
                                        <tfoot className="bg-slate-50">
                                            <tr>
                                                <td colSpan="5" className="px-6 py-4 text-right text-[10px] font-black uppercase text-slate-400 tracking-widest">Total HT</td>
                                                <td className="px-6 py-4 text-right text-xs font-black text-slate-900">{formatAmount(order.totals.ht)}</td>
                                                <td></td>
                                            </tr>
                                            <tr>
                                                <td colSpan="5" className="px-6 py-4 text-right text-[10px] font-black uppercase text-slate-400 tracking-widest">TVA 19%</td>
                                                <td className="px-6 py-4 text-right text-xs font-black text-slate-900">{formatAmount(order.totals.tva)}</td>
                                                <td></td>
                                            </tr>
                                            <tr className="bg-indigo-50/50">
                                                <td colSpan="5" className="px-6 py-4 text-right text-[10px] font-black uppercase text-indigo-600 tracking-[0.2em]">Total TTC</td>
                                                <td className="px-6 py-4 text-right text-sm font-black text-indigo-600">{formatAmount(order.totals.ttc)}</td>
                                                <td></td>
                                            </tr>
                                        </tfoot>
                                    )}
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Operational Flow */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {/* Import Table */}
                        <div className="bg-white rounded-[2.5rem] border border-blue-100 overflow-hidden shadow-sm">
                            <div className="bg-blue-600 p-6 text-white flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <Plane size={20} />
                                    <span className="text-[11px] font-black uppercase tracking-widest">Suivi Importation</span>
                                </div>
                                {importData.importLaunched && <span className="text-[9px] font-black bg-white/20 px-2 py-0.5 rounded-lg border border-white/20">LANCÉ</span>}
                            </div>
                            <div className="p-8 space-y-6">
                                <div className="grid grid-cols-2 gap-8">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase mb-3 block">Autorisation</label>
                                        <select disabled={!isImport()} value={importData.authImport || ''} onChange={e => setImportData({ ...importData, authImport: e.target.value })} className="w-full text-xs font-black uppercase border-2 border-slate-50 bg-slate-50 p-3 rounded-xl focus:border-blue-200 outline-none transition-all">
                                            <option value="">En attente...</option>
                                            <option value="Confirmée">Confirmée</option>
                                            <option value="Non disponible">Non disponible</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase mb-3 block">Lancement Import</label>
                                        <div className="flex items-center gap-3 h-[42px]">
                                            <input type="checkbox" disabled={!isImport()} checked={importData.importLaunched || false} onChange={e => setImportData({ ...importData, importLaunched: e.target.checked })} className="w-5 h-5 rounded text-blue-600 border-2 border-slate-200" />
                                            <span className="text-xs font-bold text-slate-600">{importData.importLaunched ? "Dossier Ouvert" : "À lancer"}</span>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase mb-3 block">Date Dédouanement</label>
                                    <input type="date" disabled={!isImport()} value={importData.clearedAt || ''} onChange={e => setImportData({ ...importData, clearedAt: e.target.value })} className="w-full text-xs font-black border-2 border-slate-50 bg-slate-50 p-3 rounded-xl focus:border-blue-200 outline-none transition-all" />
                                </div>
                            </div>
                        </div>

                        {/* Stock Table */}
                        <div className="bg-white rounded-[2.5rem] border border-emerald-100 overflow-hidden shadow-sm">
                            <div className="bg-emerald-600 p-6 text-white flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <Box size={20} />
                                    <span className="text-[11px] font-black uppercase tracking-widest">Suivi Réception Stock</span>
                                </div>
                                {stockData.reception === 'Totale' && <span className="text-[9px] font-black bg-white/20 px-2 py-0.5 rounded-lg border border-white/20">COMPLET</span>}
                            </div>
                            <div className="p-8 space-y-6">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase mb-3 block">État Réception</label>
                                    <select disabled={!isStock()} value={stockData.reception || 'Aucune'} onChange={e => setStockData({ ...stockData, reception: e.target.value })} className="w-full text-xs font-black uppercase border-2 border-slate-50 bg-slate-50 p-3 rounded-xl focus:border-emerald-200 outline-none transition-all">
                                        <option value="Aucune">Aucune</option>
                                        <option value="Partielle">Partielle</option>
                                        <option value="Totale">Totale</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase mb-3 block">Date Réception Magasin</label>
                                    <input type="date" disabled={!isStock()} value={stockData.receivedAt || ''} onChange={e => setStockData({ ...stockData, receivedAt: e.target.value })} className="w-full text-xs font-black border-2 border-slate-50 bg-slate-50 p-3 rounded-xl focus:border-emerald-200 outline-none transition-all" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Operational Save Button */}
                    {(isImport() || isStock()) && (
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
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-10">
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
                                <div className="text-center">
                                    <div className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Échéance Contractuelle</div>
                                    <div className={`text-3xl font-black ${remainingInfo?.isOverdue ? 'text-red-500' : 'text-emerald-500'}`}>{remainingInfo?.formattedDate}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Suspension Section if active */}
                    {order.hasStopRequest === 'Oui' && (
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
                                <div className="flex gap-4">
                                    {order.files?.storage_stops_req && <button onClick={() => openPdf(order.id, 'storage_stops_req')} className="px-6 py-3 bg-white border border-red-100 text-red-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-100 transition-all flex items-center gap-2">Demande PDF</button>}
                                    {order.files?.storage_stops_res && <button onClick={() => openPdf(order.id, 'storage_stops_res')} className="px-6 py-3 bg-red-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-100 flex items-center gap-2">Accord PDF</button>}
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

                {/* Closing Footer Area */}
                <div className="p-10 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                    <div className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Données synchronisées en temps réel</div>
                    <button onClick={() => navigate('/')} className="px-12 py-4 bg-slate-900 hover:bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95">Terminer Consultation</button>
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;
