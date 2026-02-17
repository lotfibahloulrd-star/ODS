import React, { useMemo, useState } from 'react';
import { X, FileText, FileCheck, ExternalLink, Calendar, User, Info, Clock, CheckCircle2, Package, Layers, FlaskConical, AlertCircle, PlayCircle, StopCircle, DollarSign, Plane, Truck, Anchor, Box, Ship, Upload, Plus } from 'lucide-react';
import { orderService } from '../services/orderService';
import { useAuth } from '../context/AuthContext';

const OrderDetailModal = ({ order, isOpen, onClose, openPdf, onUpdate }) => {
    const { currentUser, isImport, isStock, canCreateOds, canEditAmount } = useAuth();
    const canCreate = canCreateOds();
    const canEditPrice = canEditAmount();

    // Local state for operational updates
    const [importData, setImportData] = useState(order?.importStatus || {});
    const [stockData, setStockData] = useState(order?.stockStatus || {});
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isEditingAmount, setIsEditingAmount] = useState(false);
    const [tempAmount, setTempAmount] = useState(order?.amount || "");

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

                if (onUpdate) onUpdate();
                alert(`Document ${type.replace('_', ' ').toUpperCase()} attaché avec succès !`);
            } catch (error) {
                console.error("Upload error:", error);
                alert("Erreur de stockage : " + error.message);
            } finally {
                setIsUploading(false);
            }
        };
        reader.onerror = () => {
            alert("Erreur lors de la lecture du fichier.");
            setIsUploading(false);
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
            if (onUpdate) onUpdate();
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
            await orderService.updateOrder(order.id, {
                amount: tempAmount
            }, currentUser.firstName);
            setIsEditingAmount(false);
            if (onUpdate) onUpdate();
            alert("Montant mis à jour !");
        } catch (e) {
            alert("Erreur lors de la mise à jour du montant.");
        } finally {
            setIsSaving(false);
        }
    };
    // Fetch files - Hooks MUST be at the top level
    const hasOds = !!(order?.files?.storage_ods);
    const hasContract = !!(order?.files?.storage_contracts);
    const hasStopRequest = !!(order?.files?.storage_stops_req);
    const hasStopResponse = !!(order?.files?.storage_stops_res);

    const remainingInfo = useMemo(() => {
        try {
            let endDate = order?.endDate;
            const start = order?.startDate || order?.dateOds;
            const delay = order?.delay;

            // Robust recalculation if missing
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
                    if (!isNaN(date.getTime())) {
                        endDate = date.toISOString().split('T')[0];
                    }
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
                formattedDate: new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }).format(targetDate),
                rawDate: endDate
            };
        } catch (e) {
            console.error("Error calculating remaining info:", e);
            return null;
        }
    }, [order?.endDate, order?.startDate, order?.dateOds, order?.delay, order?.stopDate, order?.resumeDate]);

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

    if (!isOpen || !order) return null;

    return (
        <div
            className="fixed inset-0 bg-slate-900/80 z-[99999] flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="bg-white w-full max-w-[1500px] rounded-[3rem] shadow-2xl max-h-[95vh] flex flex-col overflow-hidden ring-1 ring-white/20 animate-in fade-in zoom-in-95 duration-300"
                onClick={e => e.stopPropagation()}
            >
                {/* Header Section */}
                <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-8 text-white relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full -mr-20 -mt-20"></div>
                    <div className="relative z-10 flex justify-between items-start">
                        <div className="space-y-3">
                            <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1 bg-blue-600/30 backdrop-blur-md border border-blue-500/30 text-blue-200 text-[10px] font-black uppercase tracking-widest rounded-lg">Consultation Engagement</span>
                                {order.hasStopRequest === 'Oui' && (
                                    <span className="px-3 py-1 bg-red-600 border border-red-500 text-white text-[10px] font-black uppercase tracking-widest rounded-lg flex items-center gap-1.5 shadow-lg shadow-red-900/20">
                                        <StopCircle size={12} /> Arrêt Demandé
                                    </span>
                                )}
                                <span className={`px-3 py-1 border text-[10px] font-black uppercase tracking-widest rounded-lg ${order.authorization === 'Oui' ? 'bg-emerald-600/20 border-emerald-500/30 text-emerald-400' : 'bg-amber-600/20 border-amber-500/30 text-amber-400'}`}>
                                    {order.authorization === 'Oui' ? 'Autorisé' : 'Attente Autorisation'}
                                </span>
                            </div>
                            <h2 className="text-3xl font-black tracking-tight leading-tight">
                                {order.refOds || order.ref || "Sans Référence"}
                            </h2>
                            <p className="text-slate-400 font-medium max-w-2xl line-clamp-2">{order.object}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-all duration-200 group border border-white/10 backdrop-blur-md"
                        >
                            <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
                        </button>
                    </div>
                </div>

                {/* Body Content - Fluid Table Layout */}
                <div className="flex-1 overflow-y-auto p-10 space-y-12 scrollbar-hide">
                    {/* General Information Table */}
                    <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    <th colSpan="2" className="px-8 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-blue-600">Informations Générales</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                <tr>
                                    <td className="px-8 py-5 w-1/3 text-[11px] font-black text-slate-400 uppercase tracking-widest">Client Engagement</td>
                                    <td className="px-8 py-5 text-sm font-black text-slate-900 uppercase">{order.client}</td>
                                </tr>
                                <tr>
                                    <td className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-blue-500">Montant Total TTC</td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            {isEditingAmount ? (
                                                <div className="flex gap-2 w-full max-w-sm">
                                                    <input
                                                        type="text"
                                                        value={tempAmount}
                                                        onChange={e => setTempAmount(e.target.value)}
                                                        className="flex-1 p-2 bg-blue-50 border-2 border-blue-200 rounded-xl font-black text-blue-900 outline-none"
                                                        autoFocus
                                                    />
                                                    <button onClick={handleSaveAmount} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase">Valider</button>
                                                    <button onClick={() => setIsEditingAmount(false)} className="px-4 py-2 bg-slate-200 text-slate-600 rounded-xl text-[10px] font-black uppercase">Annuler</button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xl font-black text-blue-700">{formatAmount(order.amount)}</span>
                                                    {canEditPrice && (
                                                        <button onClick={() => { setTempAmount(order.amount); setIsEditingAmount(true); }} className="p-2 hover:bg-blue-50 text-blue-400 rounded-lg transition-colors">
                                                            <Layers size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Échéance Contractuelle</td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <span className={`text-lg font-black ${remainingInfo?.isOverdue ? 'text-red-500' : 'text-emerald-500'}`}>
                                                {remainingInfo?.formattedDate}
                                            </span>
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${remainingInfo?.isOverdue ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                                {remainingInfo?.isOverdue ? `${Math.abs(remainingInfo.days)} jours de retard` : `${remainingInfo?.days} jours restants`}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Documents Table */}
                    <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    <th className="px-8 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Type Document</th>
                                    <th className="px-8 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Référence</th>
                                    <th className="px-8 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-right text-slate-400">Action Client / Consultation</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                <tr>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center"><FileText size={16} /></div>
                                            <span className="text-xs font-black text-slate-700 uppercase">Ordre de Service</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-sm font-black text-slate-900">{order.refOds || order.ref || "-"}</td>
                                    <td className="px-8 py-6">
                                        <div className="flex justify-end gap-3">
                                            {hasOds && (
                                                <button onClick={() => openPdf(order.id, 'storage_ods')} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase hover:bg-blue-700 transition-all flex items-center gap-2">
                                                    <ExternalLink size={14} /> Consulter
                                                </button>
                                            )}
                                            {canCreate && (
                                                <label className="px-4 py-2 border-2 border-dashed border-blue-200 text-blue-600 rounded-xl text-[10px] font-black uppercase cursor-pointer hover:border-blue-500 transition-all flex items-center gap-2">
                                                    {isUploading ? <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div> : <Upload size={14} />}
                                                    {hasOds ? "Actualiser" : "Attacher"}
                                                    <input type="file" className="hidden" accept=".pdf" onClick={e => e.target.value = null} onChange={e => handleDirectUpload(e, order.id, 'ods')} />
                                                </label>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center"><FileCheck size={16} /></div>
                                            <span className="text-xs font-black text-slate-700 uppercase">Marché / Contrat</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-sm font-black text-slate-900">{order.refContract || "-"}</td>
                                    <td className="px-8 py-6">
                                        <div className="flex justify-end gap-3">
                                            {hasContract && (
                                                <button onClick={() => openPdf(order.id, 'storage_contracts')} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase hover:bg-indigo-700 transition-all flex items-center gap-2">
                                                    <ExternalLink size={14} /> Consulter
                                                </button>
                                            )}
                                            {canCreate && (
                                                <label className="px-4 py-2 border-2 border-dashed border-indigo-200 text-indigo-600 rounded-xl text-[10px] font-black uppercase cursor-pointer hover:border-indigo-500 transition-all flex items-center gap-2">
                                                    {isUploading ? <div className="w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div> : <Plus size={14} />}
                                                    {hasContract ? "Actualiser" : "Attacher"}
                                                    <input type="file" className="hidden" accept=".pdf" onClick={e => e.target.value = null} onChange={e => handleDirectUpload(e, order.id, 'contract')} />
                                                </label>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Prestations Table */}
                    <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    <th className="px-8 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 w-1/3">Lot Prestation</th>
                                    <th className="px-8 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Détails de Consistance</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                <tr>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3 text-blue-600 font-black text-xs uppercase tracking-widest"><FlaskConical size={16} /> Équipements</div>
                                    </td>
                                    <td className="px-8 py-6 text-sm font-bold text-slate-600 leading-relaxed">{order.equipmentDetails || "Aucun détail saisi"}</td>
                                </tr>
                                <tr>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3 text-indigo-600 font-black text-xs uppercase tracking-widest"><Info size={16} /> Réactifs</div>
                                    </td>
                                    <td className="px-8 py-6 text-sm font-bold text-slate-600 leading-relaxed">{order.reagentDetails || "Aucun détail saisi"}</td>
                                </tr>
                                <tr>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3 text-emerald-600 font-black text-xs uppercase tracking-widest"><Package size={16} /> Consommables</div>
                                    </td>
                                    <td className="px-8 py-6 text-sm font-bold text-slate-600 leading-relaxed">{order.consumableDetails || "Aucun détail saisi"}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Operational Table */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="bg-white rounded-[2rem] border border-blue-100 overflow-hidden shadow-sm">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-blue-50 border-b border-blue-100">
                                        <th colSpan="2" className="px-8 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-blue-600">Suivi Importation</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    <tr>
                                        <td className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase">Autorisation</td>
                                        <td className="px-8 py-4">
                                            <select disabled={!isImport()} value={importData.authImport || ''} onChange={e => setImportData({ ...importData, authImport: e.target.value })} className="w-full text-xs font-black uppercase border-0 bg-transparent focus:ring-0">
                                                <option value="">En attente...</option>
                                                <option value="Confirmée">Confirmée</option>
                                                <option value="Non disponible">Non disponible</option>
                                            </select>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase">Lancement</td>
                                        <td className="px-8 py-4">
                                            <input type="checkbox" disabled={!isImport()} checked={importData.importLaunched || false} onChange={e => setImportData({ ...importData, importLaunched: e.target.checked })} className="w-5 h-5 rounded text-blue-600" />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase">Dédouanement</td>
                                        <td className="px-8 py-4">
                                            <input type="date" disabled={!isImport()} value={importData.clearedAt || ''} onChange={e => setImportData({ ...importData, clearedAt: e.target.value })} className="w-full text-xs font-black border-0 bg-transparent focus:ring-0" />
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="bg-white rounded-[2rem] border border-emerald-100 overflow-hidden shadow-sm">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-emerald-50 border-b border-emerald-100">
                                        <th colSpan="2" className="px-8 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-emerald-600">Suivi Stock</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    <tr>
                                        <td className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase">Réception</td>
                                        <td className="px-8 py-4">
                                            <select disabled={!isStock()} value={stockData.reception || 'Aucune'} onChange={e => setStockData({ ...stockData, reception: e.target.value })} className="w-full text-xs font-black uppercase border-0 bg-transparent focus:ring-0">
                                                <option value="Aucune">Aucune</option>
                                                <option value="Partielle">Partielle</option>
                                                <option value="Totale">Totale</option>
                                            </select>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase">Date Réception</td>
                                        <td className="px-8 py-4">
                                            <input type="date" disabled={!isStock()} value={stockData.receivedAt || ''} onChange={e => setStockData({ ...stockData, receivedAt: e.target.value })} className="w-full text-xs font-black border-0 bg-transparent focus:ring-0" />
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Global Save */}
                    {(isImport() || isStock()) && (
                        <div className="flex justify-center pt-8">
                            <button onClick={handleSaveWorkflow} disabled={isSaving} className="px-12 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-slate-800 transition-all flex items-center gap-3">
                                {isSaving ? "Enregistrement..." : "Valider les étapes opérationnelles"}
                                <CheckCircle2 size={18} />
                            </button>
                        </div>
                    )}
                </div>

                {/* Execution Dates Chronology */}
                <div className="bg-slate-900 rounded-[3rem] p-12 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 blur-[80px] rounded-full -mr-32 -mt-32"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-10">
                            <PlayCircle size={20} className="text-blue-500" />
                            <h3 className="text-sm font-black uppercase tracking-widest">Chronologie du délai d'exécution</h3>
                        </div>
                        <div className="flex flex-col md:flex-row justify-between items-center gap-8 md:gap-4 px-4">
                            <div className="text-center group">
                                <div className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Lancement Officiel</div>
                                <div className="text-2xl font-black group-hover:text-blue-400 transition-colors">{formatDate(order.startDate || order.dateOds)}</div>
                            </div>
                            <div className="flex-1 h-px bg-slate-800 relative hidden md:block">
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 bg-slate-900 border border-slate-800 rounded-full py-1 text-[10px] font-black text-blue-500 uppercase whitespace-nowrap">
                                    Durée: {order.delay} Jours
                                </div>
                            </div>
                            <div className="text-center group">
                                <div className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 group-hover:text-emerald-400 transition-colors">Échéance Contractuelle</div>
                                <div className="text-2xl font-black text-emerald-500">{remainingInfo?.formattedDate}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Suspension / Stop Section */}
                {order.hasStopRequest === 'Oui' && (
                    <div className="bg-red-50 border border-red-100 rounded-[2.5rem] p-8 relative overflow-hidden shadow-sm">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <StopCircle size={100} className="text-red-600" />
                        </div>
                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-red-200">
                                    <AlertCircle size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-red-900 uppercase">Suspension du Délai</h3>
                                    <p className="text-xs text-red-700 font-bold">Interruption d'activités déclarée</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                {hasStopRequest && (
                                    <button onClick={() => openPdf(order.id, 'storage_stops_req')} className="px-6 py-3 bg-white border border-red-200 text-red-600 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-red-50 transition-colors flex items-center gap-2 shadow-sm">
                                        <FileText size={16} /> Demande PDF
                                    </button>
                                )}
                                {canCreate && (
                                    <label className="px-6 py-3 bg-white border border-dashed border-red-200 text-red-400 hover:text-red-600 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all cursor-pointer flex items-center gap-2">
                                        {isUploading ? <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div> : <Upload size={14} />}
                                        {hasStopRequest ? "Mettre à jour Demande" : "Attacher Demande"}
                                        <input type="file" className="hidden" accept=".pdf" onClick={e => e.target.value = null} onChange={e => handleDirectUpload(e, order.id, 'stop_request')} />
                                    </label>
                                )}

                                {hasStopResponse && (
                                    <button onClick={() => openPdf(order.id, 'storage_stops_res')} className="px-6 py-3 bg-red-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-red-700 transition-colors flex items-center gap-2 shadow-lg shadow-red-200">
                                        <FileCheck size={16} /> Accord PDF
                                    </button>
                                )}
                                {canCreate && (
                                    <label className="px-6 py-3 bg-red-50 border border-dashed border-red-300 text-red-600 hover:bg-red-100 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all cursor-pointer flex items-center gap-2">
                                        {isUploading ? <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div> : <Plus size={14} />}
                                        {hasStopResponse ? "Mettre à jour Accord" : "Attacher Accord"}
                                        <input type="file" className="hidden" accept=".pdf" onClick={e => e.target.value = null} onChange={e => handleDirectUpload(e, order.id, 'stop_response')} />
                                    </label>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                            <div className="bg-white p-6 rounded-3xl border border-red-50 shadow-sm flex flex-col">
                                <span className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-2 block">Date de suspension</span>
                                <span className="text-xl font-black text-red-900">{formatDate(order.stopDate)}</span>
                            </div>
                            <div className="bg-white p-6 rounded-3xl border border-red-50 shadow-sm flex flex-col">
                                <span className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-2 block">Reprise d'activité</span>
                                <span className="text-xl font-black text-red-900">{formatDate(order.resumeDate) || "En cours..."}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer Action */}
            <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-black text-slate-500">
                        ODS
                    </div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Fin de consultation</span>
                </div>
                <button
                    onClick={onClose}
                    className="px-10 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-sm transition-all shadow-xl shadow-slate-200 active:scale-95"
                >
                    Fermer le dossier
                </button>
            </div>
        </div>
        </div >
    );
};

export default OrderDetailModal;
