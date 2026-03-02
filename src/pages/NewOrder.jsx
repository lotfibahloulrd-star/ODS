import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../services/orderService';

const NewOrder = ({ onSave }) => {
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [contractFile, setContractFile] = useState(null);
    const [stopRequestFile, setStopRequestFile] = useState(null);
    const [stopResponseFile, setStopResponseFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        client: '',
        refOds: '',
        refContract: '',
        division: 'Division Laboratoire',
        object: '',
        dateOds: '',
        startDate: '',
        endDate: '',
        delay: '',
        amount: '',
        authorization: 'Non',
        deliveryStatus: 'Non livrée',
        equipmentDetails: '',
        reagentDetails: '',
        consumableDetails: '',
        hasStopRequest: 'Non',
        stopDate: '',
        resumeDate: '',
        bankDomiciliation: '',
        judicialProceedings: '',
        articles: [],
        totals: { ht: 0, tva: 0, ttc: 0 }
    });

    const calculateTotals = (articles) => {
        const ht = articles.reduce((sum, art) => sum + (parseFloat(art.total) || 0), 0);
        const tva = ht * 0.19; // 19% TVA standard
        const ttc = ht + tva;
        return { ht, tva, ttc };
    };

    const addArticle = () => {
        const nextNo = (formData.articles.length + 1).toString();
        const newArticles = [...formData.articles, {
            no: nextNo,
            ref: '',
            designation: '',
            qte: 1,
            pu: 0,
            total: 0,
            marque: '',
            available: false
        }];
        setFormData(prev => ({ ...prev, articles: newArticles }));
    };

    const removeArticle = (index) => {
        const newArticles = formData.articles.filter((_, i) => i !== index);
        const renumbered = newArticles.map((art, i) => ({ ...art, no: (i + 1).toString() }));
        const totals = calculateTotals(renumbered);
        setFormData(prev => ({
            ...prev,
            articles: renumbered,
            totals,
            amount: totals.ttc > 0 ? totals.ttc.toFixed(2) : prev.amount
        }));
    };

    const updateArticle = (index, field, value) => {
        const newArticles = [...formData.articles];
        const art = { ...newArticles[index], [field]: value };

        if (field === 'qte' || field === 'pu') {
            art.total = (parseFloat(art.qte) || 0) * (parseFloat(art.pu) || 0);
        }

        newArticles[index] = art;
        const totals = calculateTotals(newArticles);
        setFormData(prev => ({
            ...prev,
            articles: newArticles,
            totals,
            amount: totals.ttc > 0 ? totals.ttc.toFixed(2) : prev.amount
        }));
    };

    const calculateEndDate = (start, days, stopStr, resumeStr) => {
        if (!start || !days) return '';
        const date = new Date(start);
        let totalDays = parseInt(days);

        // Add interruption days if both dates are present
        if (stopStr && resumeStr) {
            const stop = new Date(stopStr);
            const resume = new Date(resumeStr);
            if (!isNaN(stop) && !isNaN(resume) && resume > stop) {
                const interruptionMs = resume - stop;
                const interruptionDays = Math.ceil(interruptionMs / (1000 * 60 * 60 * 24));
                totalDays += interruptionDays;
            }
        }

        date.setDate(date.getDate() + totalDays);
        return date.toISOString().split('T')[0];
    };

    const handleFileUpload = (file, storageMethod, orderId) => {
        if (!file) return Promise.resolve();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = async () => {
                try {
                    await storageMethod(orderId, reader.result, file.name);
                    resolve();
                } catch (e) {
                    console.error("Storage error:", e);
                    reject(e);
                }
            };
            reader.onerror = () => reject(new Error("Erreur de lecture du fichier"));
            reader.readAsDataURL(file);
        });
    };

    const handleSave = async () => {
        if (!formData.refOds || !formData.client) {
            alert("Veuillez remplir au moins la référence ODS et le client.");
            return;
        }

        setIsLoading(true);
        try {
            const savedOrder = await orderService.createOrder(formData);

            // Save files concurrently
            const uploadPromises = [];
            if (file) uploadPromises.push(handleFileUpload(file, orderService.saveOdsFile, savedOrder.id));
            if (contractFile) uploadPromises.push(handleFileUpload(contractFile, orderService.saveContractFile, savedOrder.id));
            if (stopRequestFile) uploadPromises.push(handleFileUpload(stopRequestFile, orderService.saveStopRequestFile, savedOrder.id));
            if (stopResponseFile) uploadPromises.push(handleFileUpload(stopResponseFile, orderService.saveStopResponseFile, savedOrder.id));

            await Promise.all(uploadPromises);

            alert('ODS enregistré avec succès !');
            setFile(null);
            setContractFile(null);
            setStopRequestFile(null);
            setStopResponseFile(null);
            setFormData({
                client: '',
                refOds: '',
                refContract: '',
                division: 'Division Laboratoire',
                object: '',
                dateOds: '',
                startDate: '',
                endDate: '',
                delay: '',
                amount: '',
                authorization: 'Non',
                deliveryStatus: 'Non livrée',
                equipmentDetails: '',
                reagentDetails: '',
                consumableDetails: '',
                hasStopRequest: 'Non',
                stopDate: '',
                resumeDate: '',
                bankDomiciliation: '',
                judicialProceedings: '',
                articles: [],
                totals: { ht: 0, tva: 0, ttc: 0 }
            });
            if (onSave) onSave();
        } catch (error) {
            console.error(error);
            if (error.name === 'QuotaExceededError' || error.message.includes('quota')) {
                alert("Erreur de stockage : L'espace est insuffisant. L'ODS a été créé mais certains documents n'ont pas pu être enregistrés.");
            } else {
                alert("Erreur lors de l'enregistrement : " + error.message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-[1600px] mx-auto pb-20">
            <div className="mb-12">
                <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-3">Nouvel ODS <span className="text-blue-600">Saisie Manuelle</span></h2>
                <p className="text-slate-500 font-medium">Veuillez renseigner manuellement toutes les informations relatives au nouvel ODS.</p>
            </div>

            <div className="space-y-10 animate-fade-in">
                <div className="bg-white rounded-[3rem] border border-slate-200 shadow-2xl shadow-slate-200/50 overflow-hidden">
                    <div className="p-10 space-y-12">
                        {/* Section 1: Documents & Références */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                            <div className="bg-blue-50/50 p-8 rounded-[2.5rem] border border-blue-100 space-y-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-xs">1</div>
                                    <h4 className="text-[11px] font-black uppercase tracking-widest text-blue-900">Ordre de Service (ODS)</h4>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest block mb-2">Référence ODS</label>
                                        <input
                                            type="text"
                                            className="w-full p-4 bg-white border-2 border-blue-100 rounded-2xl font-black text-blue-900 outline-none focus:border-blue-500 transition-all shadow-sm"
                                            value={formData.refOds}
                                            onChange={e => setFormData({ ...formData, refOds: e.target.value })}
                                            placeholder="Ex: 125/2026"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest block mb-2">Fichier Numérisé (PDF, JPG, PNG)</label>
                                        <input
                                            type="file"
                                            className="w-full text-xs font-bold text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-blue-600 file:text-white hover:file:bg-blue-700 transition-all"
                                            accept=".pdf,.jpg,.png"
                                            onChange={e => setFile(e.target.files[0])}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-indigo-50/50 p-8 rounded-[2.5rem] border border-indigo-100 space-y-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-xs">2</div>
                                    <h4 className="text-[11px] font-black uppercase tracking-widest text-indigo-900">Marché / Contrat</h4>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block mb-2">Référence Contrat</label>
                                        <input
                                            type="text"
                                            className="w-full p-4 bg-white border-2 border-indigo-100 rounded-2xl font-black text-indigo-900 outline-none focus:border-indigo-500 transition-all shadow-sm"
                                            value={formData.refContract}
                                            onChange={e => setFormData({ ...formData, refContract: e.target.value })}
                                            placeholder="Ex: MARCHÉ N°45/2026"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block mb-2">Fichier Numérisé (PDF, JPG, PNG)</label>
                                        <input
                                            type="file"
                                            className="w-full text-xs font-bold text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 transition-all"
                                            accept=".pdf,.jpg,.png"
                                            onChange={e => setContractFile(e.target.files[0])}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Identification */}
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Client / Maître d'Ouvrage</label>
                                    <input
                                        type="text"
                                        className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-slate-900 outline-none focus:border-blue-500 transition-all shadow-sm"
                                        value={formData.client}
                                        onChange={e => setFormData({ ...formData, client: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Classification / Division</label>
                                    <select
                                        className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-slate-900 outline-none focus:border-blue-500 transition-all shadow-sm"
                                        value={formData.division}
                                        onChange={e => setFormData({ ...formData, division: e.target.value })}
                                    >
                                        <option value="Division Laboratoire">Division Laboratoire</option>
                                        <option value="Division Analytique">Division Analytique</option>
                                        <option value="DL et DA">DL et DA</option>
                                        <option value="Direction">Direction</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Objet des prestations</label>
                                <textarea
                                    rows={3}
                                    className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] font-bold text-slate-700 outline-none focus:border-blue-500 transition-all shadow-sm leading-relaxed"
                                    value={formData.object}
                                    onChange={e => setFormData({ ...formData, object: e.target.value })}
                                ></textarea>
                            </div>
                        </div>

                        {/* Section 3: Financier & Délais */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 text-center">Montant TTC (DA)</label>
                                <input
                                    type="text"
                                    className="w-full p-3 bg-white border-2 border-slate-200 rounded-xl text-center font-black text-blue-700 outline-none focus:border-blue-500"
                                    value={formData.amount}
                                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                />
                            </div>
                            <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 text-center">Domiciliation Bancaire</label>
                                <input
                                    type="text"
                                    className="w-full p-3 bg-white border-2 border-slate-200 rounded-xl text-center font-black text-slate-900 outline-none focus:border-blue-500"
                                    value={formData.bankDomiciliation}
                                    onChange={e => setFormData({ ...formData, bankDomiciliation: e.target.value })}
                                    placeholder="Banque / Agence"
                                />
                            </div>
                            <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 text-center">Date ODS / Début</label>
                                <input
                                    type="date"
                                    className="w-full p-3 bg-white border-2 border-slate-200 rounded-xl text-center font-black text-slate-900 outline-none focus:border-blue-500"
                                    value={formData.dateOds}
                                    onChange={e => {
                                        const val = e.target.value;
                                        setFormData({
                                            ...formData,
                                            dateOds: val,
                                            startDate: val,
                                            endDate: calculateEndDate(val, formData.delay, formData.stopDate, formData.resumeDate)
                                        });
                                    }}
                                />
                            </div>
                            <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 text-center">Délai (Jours)</label>
                                <input
                                    type="number"
                                    className="w-full p-3 bg-white border-2 border-slate-200 rounded-xl text-center font-black text-slate-900 outline-none focus:border-blue-500"
                                    value={formData.delay}
                                    onChange={e => {
                                        const val = e.target.value;
                                        setFormData({
                                            ...formData,
                                            delay: val,
                                            endDate: calculateEndDate(formData.startDate, val, formData.stopDate, formData.resumeDate)
                                        });
                                    }}
                                />
                            </div>
                            <div className="bg-slate-900 p-6 rounded-[2rem] shadow-xl">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2 text-center">Échéance Estimée</label>
                                <div className="text-center font-black text-emerald-400 text-lg py-2">
                                    {formData.endDate ? new Date(formData.endDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) : "--/--/----"}
                                </div>
                            </div>
                        </div>

                        {/* Section 4: Suspension Section (Modern Highlight) */}
                        <div className={`rounded-[2.5rem] p-8 transition-all ${formData.hasStopRequest === 'Oui' ? 'bg-red-50 border-2 border-red-100 shadow-lg shadow-red-100/50' : 'bg-slate-50 border border-slate-100'}`}>
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${formData.hasStopRequest === 'Oui' ? 'bg-red-600 shadow-red-200' : 'bg-slate-400 shadow-slate-200'}`}>
                                        🚨
                                    </div>
                                    <div>
                                        <h4 className={`text-sm font-black uppercase tracking-widest ${formData.hasStopRequest === 'Oui' ? 'text-red-900' : 'text-slate-500'}`}>Suspension de délai (ODS d'Arrêt)</h4>
                                        <p className="text-[10px] font-bold text-slate-400">Interruption officielle de la prestation</p>
                                    </div>
                                </div>
                                <select
                                    className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest outline-none border-2 transition-all ${formData.hasStopRequest === 'Oui' ? 'bg-white border-red-200 text-red-600 focus:border-red-500' : 'bg-white border-slate-200 text-slate-500'}`}
                                    value={formData.hasStopRequest}
                                    onChange={e => setFormData({ ...formData, hasStopRequest: e.target.value })}
                                >
                                    <option value="Non">Aucun Arrêt</option>
                                    <option value="Oui">Arrêt Détecté / Prévu</option>
                                </select>
                            </div>

                            {formData.hasStopRequest === 'Oui' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 animate-in fade-in slide-in-from-top-4 duration-500">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-red-400 uppercase tracking-widest block">Date d'Arrêt</label>
                                        <input type="date" className="w-full p-4 bg-white border-2 border-red-100 rounded-2xl font-black text-red-900 outline-none focus:border-red-500" value={formData.stopDate}
                                            onChange={e => {
                                                const val = e.target.value;
                                                setFormData({ ...formData, stopDate: val, endDate: calculateEndDate(formData.startDate, formData.delay, val, formData.resumeDate) });
                                            }}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-red-400 uppercase tracking-widest block">Date de Reprise</label>
                                        <input type="date" className="w-full p-4 bg-white border-2 border-red-100 rounded-2xl font-black text-red-900 outline-none focus:border-red-500" value={formData.resumeDate}
                                            onChange={e => {
                                                const val = e.target.value;
                                                setFormData({ ...formData, resumeDate: val, endDate: calculateEndDate(formData.startDate, formData.delay, formData.stopDate, val) });
                                            }}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-red-400 uppercase tracking-widest block">Demande PDF</label>
                                        <input type="file" className="text-[9px] font-black text-red-300 file:bg-red-600 file:text-white file:border-0 file:rounded-lg file:px-3 file:py-1.5" onChange={e => setStopRequestFile(e.target.files[0])} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-red-400 uppercase tracking-widest block">Accord PDF</label>
                                        <input type="file" className="text-[9px] font-black text-red-300 file:bg-red-600 file:text-white file:border-0 file:rounded-lg file:px-3 file:py-1.5" onChange={e => setStopResponseFile(e.target.files[0])} />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Section 5: Consistance Detaillee */}
                        <div className="bg-slate-50 rounded-[2.5rem] p-10 space-y-8 border border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white">📦</div>
                                <h4 className="text-sm font-black uppercase tracking-widest text-slate-900">Consistance Intellectuelle & Matérielle</h4>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">🧪 Équipements</label>
                                    <textarea rows={4} className="w-full p-4 bg-white border-2 border-slate-100 rounded-2xl font-bold text-slate-600 text-sm outline-none focus:border-blue-500 shadow-sm" placeholder="Liste des principaux équipements..." value={formData.equipmentDetails} onChange={e => setFormData({ ...formData, equipmentDetails: e.target.value })}></textarea>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">⚗️ Réactifs</label>
                                    <textarea rows={4} className="w-full p-4 bg-white border-2 border-slate-100 rounded-2xl font-bold text-slate-600 text-sm outline-none focus:border-indigo-500 shadow-sm" placeholder="Consistance des réactifs..." value={formData.reagentDetails} onChange={e => setFormData({ ...formData, reagentDetails: e.target.value })}></textarea>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">📦 Consommables</label>
                                    <textarea rows={4} className="w-full p-4 bg-white border-2 border-slate-100 rounded-2xl font-bold text-slate-600 text-sm outline-none focus:border-emerald-500 shadow-sm" placeholder="Détails consommables..." value={formData.consumableDetails} onChange={e => setFormData({ ...formData, consumableDetails: e.target.value })}></textarea>
                                </div>
                            </div>
                            <div className="mt-8 pt-8 border-t border-slate-200/50">
                                <label className="text-[10px] font-black text-red-400 uppercase tracking-widest flex items-center gap-2 mb-3">⚖️ Poursuites Judiciaires / Contentieux</label>
                                <textarea rows={2} className="w-full p-4 bg-white border-2 border-slate-100 rounded-2xl font-bold text-slate-600 text-sm outline-none focus:border-red-500 shadow-sm" placeholder="Précisez ici si des poursuites sont en cours ou prévues..." value={formData.judicialProceedings} onChange={e => setFormData({ ...formData, judicialProceedings: e.target.value })}></textarea>
                            </div>
                        </div>

                        {/* Section 6: Detail Quantitatif et Estimatif (Articles) */}
                        <div className="bg-slate-900 rounded-[2.5rem] p-10 space-y-8 text-white shadow-2xl">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black shadow-lg shadow-blue-500/50">📋</div>
                                    <h4 className="text-sm font-black uppercase tracking-widest">Articles & DQE</h4>
                                </div>
                                <button
                                    onClick={addArticle}
                                    type="button"
                                    className="px-6 py-3 bg-white text-slate-900 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-50 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shadow-xl shadow-white/10"
                                >
                                    <span className="text-lg">+</span> Ajouter un article
                                </button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse min-w-[1000px]">
                                    <thead>
                                        <tr className="border-b border-white/10">
                                            <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">N°</th>
                                            <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Réf</th>
                                            <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 w-1/3">Désignation</th>
                                            <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Qté</th>
                                            <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">PU HT</th>
                                            <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Total HT</th>
                                            <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Marque</th>
                                            <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {formData.articles.map((art, idx) => (
                                            <tr key={idx} className="group hover:bg-white/5 transition-all">
                                                <td className="px-4 py-4 font-black text-slate-500">{art.no}</td>
                                                <td className="px-2 py-4">
                                                    <input
                                                        type="text"
                                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs font-bold text-white outline-none focus:border-blue-500 transition-all"
                                                        value={art.ref}
                                                        onChange={e => updateArticle(idx, 'ref', e.target.value)}
                                                    />
                                                </td>
                                                <td className="px-2 py-4">
                                                    <textarea
                                                        rows={1}
                                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs font-bold text-white outline-none focus:border-blue-500 resize-none transition-all"
                                                        value={art.designation}
                                                        onChange={e => updateArticle(idx, 'designation', e.target.value)}
                                                    />
                                                </td>
                                                <td className="px-2 py-4">
                                                    <input
                                                        type="number"
                                                        className="w-20 mx-auto bg-white/5 border border-white/10 rounded-lg p-2 text-xs font-black text-center text-white outline-none focus:border-blue-500 transition-all"
                                                        value={art.qte}
                                                        onChange={e => updateArticle(idx, 'qte', e.target.value)}
                                                    />
                                                </td>
                                                <td className="px-2 py-4">
                                                    <input
                                                        type="number"
                                                        className="w-32 ml-auto bg-white/5 border border-white/10 rounded-lg p-2 text-xs font-black text-right text-white outline-none focus:border-blue-500 transition-all"
                                                        value={art.pu}
                                                        onChange={e => updateArticle(idx, 'pu', e.target.value)}
                                                    />
                                                </td>
                                                <td className="px-4 py-4 text-right">
                                                    <span className="text-xs font-black text-blue-400 whitespace-nowrap">{new Intl.NumberFormat('fr-FR').format(art.total)} DA</span>
                                                </td>
                                                <td className="px-2 py-4">
                                                    <input
                                                        type="text"
                                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs font-bold text-center text-white outline-none focus:border-blue-500 transition-all"
                                                        value={art.marque}
                                                        onChange={e => updateArticle(idx, 'marque', e.target.value)}
                                                    />
                                                </td>
                                                <td className="px-4 py-4 text-right">
                                                    <button
                                                        onClick={() => removeArticle(idx)}
                                                        className="w-8 h-8 flex items-center justify-center bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                                                    >
                                                        ×
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}

                                        {formData.articles.length === 0 && (
                                            <tr>
                                                <td colSpan="8" className="px-4 py-20 text-center text-slate-500 italic font-medium">
                                                    <div className="flex flex-col items-center gap-4">
                                                        <div className="text-4xl opacity-20">📭</div>
                                                        <p>Aucun article ajouté. Utilisez le bouton ci-dessus pour commencer la saisie du DQE.</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                    {formData.articles.length > 0 && (
                                        <tfoot className="border-t-2 border-white/20 bg-white/2">
                                            <tr>
                                                <td colSpan="5" className="px-4 py-6 text-right font-black text-slate-400 uppercase text-[10px] tracking-widest">Total HT cumulé</td>
                                                <td className="px-4 py-6 text-right font-black text-white text-sm whitespace-nowrap">{new Intl.NumberFormat('fr-FR').format(formData.totals.ht)} DA</td>
                                                <td colSpan="2"></td>
                                            </tr>
                                            <tr>
                                                <td colSpan="5" className="px-4 py-2 text-right font-black text-slate-400 uppercase text-[10px] tracking-widest text-xs">TVA (19%)</td>
                                                <td className="px-4 py-2 text-right font-black text-slate-400 text-xs whitespace-nowrap">{new Intl.NumberFormat('fr-FR').format(formData.totals.tva)} DA</td>
                                                <td colSpan="2"></td>
                                            </tr>
                                            <tr className="bg-blue-600/10">
                                                <td colSpan="5" className="px-4 py-8 text-right font-black text-blue-400 uppercase text-[10px] tracking-widest">Montant Global TTC Final</td>
                                                <td className="px-4 py-8 text-right font-black text-blue-400 text-xl whitespace-nowrap">{new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2 }).format(formData.totals.ttc)} DA</td>
                                                <td colSpan="2"></td>
                                            </tr>
                                        </tfoot>
                                    )}
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-10 bg-slate-50 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
                        <button
                            onClick={() => navigate('/')}
                            className="px-8 py-5 bg-white border-2 border-slate-200 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 hover:border-slate-300 transition-all w-full md:w-auto"
                        >
                            Retour au Tableau
                        </button>
                        <div className="flex gap-4 w-full md:w-auto">
                            <button
                                onClick={handleSave}
                                disabled={isLoading}
                                className="px-12 py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-slate-800 hover:scale-[1.05] active:scale-95 transition-all flex-1 md:flex-none"
                            >
                                {isLoading ? "Enregistrement..." : "Confirmer & Enregistrer l'ODS"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewOrder;
