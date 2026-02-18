import React, { useState } from 'react';
import Tesseract from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';
import { orderService } from '../services/orderService';

// Config Worker PDF Local
pdfjsLib.GlobalWorkerOptions.workerSrc = `${import.meta.env.BASE_URL}pdf.worker.min.js`;

const NewOrder = ({ onSave }) => {
    const [step, setStep] = useState(1);
    const [file, setFile] = useState(null);
    const [contractFile, setContractFile] = useState(null);
    const [stopRequestFile, setStopRequestFile] = useState(null);
    const [stopResponseFile, setStopResponseFile] = useState(null);
    const [debugLog, setDebugLog] = useState("");
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
        resumeDate: ''
    });

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

    const convertPdfToImage = async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        const page = await pdf.getPage(1);
        const scale = 2.0;
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        await page.render({ canvasContext: context, viewport: viewport }).promise;
        return canvas.toDataURL('image/png');
    };

    const processFile = async (selectedFile) => {
        if (!selectedFile) return;
        setFile(selectedFile);
        setStep(2);
        setIsLoading(true);
        setDebugLog("Démarrage de l'analyse IA...");

        try {
            let imageToScan = selectedFile;
            if (selectedFile.type === 'application/pdf') {
                setDebugLog(prev => prev + "\n📄 Conversion PDF en Image...");
                imageToScan = await convertPdfToImage(selectedFile);
            }

            setDebugLog(prev => prev + "\n🧠 Lecture Intelligente (FR/AR/EN)...");
            const result = await Tesseract.recognize(imageToScan, 'eng+fra+ara', {
                logger: m => { if (m.status === 'recognizing text') console.log(m.progress); }
            });

            const text = result.data.text;
            if (!text || text.length < 10) throw new Error("Texte illisible");

            setDebugLog(prev => prev + `\n✅ Texte trouvé (${text.length} chars). Extraction...`);
            parseExtractedText(text);
            setIsLoading(false);
            setStep(3);

        } catch (error) {
            console.error(error);
            setDebugLog(prev => prev + `\n❌ Erreur: ${error.message}`);
            setIsLoading(false);
            setStep(3);
        }
    };

    const parseExtractedText = (text) => {
        const clientMatch = text.match(/(?:maitre de l'ouvrage|client|organisme)\s?[:\.]?\s?(.+)/i);
        const refMatch = text.match(/(?:marché|référence|convention)\s?(?:n°|rèf)?\s?[:\.]?\s?([\d\/]+)/i);
        const objectMatch = text.match(/(?:objet|lot|prestation)\s?[:\.]?\s?(.+)/i);
        const dateMatch = text.match(/(\d{2}[\/\-]\d{2}[\/\-]\d{4})/);
        const delayMatch = text.match(/(\d+)\s?(?:jours|mois)/i);
        const amountMatch = text.match(/([\d\s\.,]+)(?:DA|DZD)/i);

        let finalObject = objectMatch ? objectMatch[1] : "";
        if (finalObject.length < 5) {
            finalObject = text.split('\n').slice(3, 5).join(' ').substring(0, 100);
        }

        setFormData(prev => ({
            ...prev,
            client: clientMatch ? clientMatch[1].trim() : "",
            refOds: refMatch ? refMatch[1].trim() : "",
            object: finalObject,
            dateOds: dateMatch ? dateMatch[1].split('/').reverse().join('-') : "",
            delay: delayMatch ? delayMatch[1] : "",
            amount: amountMatch ? amountMatch[1].replace(/[^0-9.]/g, '') : ""
        }));
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
            setStep(1);
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
                resumeDate: ''
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
                <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-3">Nouvel ODS <span className="text-blue-600">Digitalisé</span></h2>
                <p className="text-slate-500 font-medium">L'intelligence artificielle analyse votre document pour une saisie fluide et automatisée.</p>
            </div>

            {step === 1 && (
                <div
                    className="bg-white rounded-[3rem] border-2 border-dashed border-slate-200 p-24 text-center hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer group shadow-xl shadow-slate-200/50"
                    onClick={() => document.getElementById('fileInput').click()}
                >
                    <input id="fileInput" type="file" hidden accept=".pdf,.jpg,.png" onClick={e => e.target.value = null} onChange={(e) => processFile(e.target.files[0])} />
                    <div className="w-24 h-24 bg-blue-100 rounded-[2rem] flex items-center justify-center text-4xl mx-auto mb-8 group-hover:scale-110 transition-transform shadow-lg shadow-blue-100">
                        📄
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">Déposez votre document ici</h3>
                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em]">PDF, JPG ou PNG acceptés</p>
                </div>
            )}

            {step === 2 && (
                <div className="bg-white rounded-[3rem] shadow-2xl p-16 text-center border border-slate-100">
                    <div className="w-24 h-24 bg-slate-900 rounded-[2rem] flex items-center justify-center text-4xl mx-auto mb-8 animate-bounce shadow-xl">
                        ⏳
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 mb-6 tracking-tight">Analyse IA en cours...</h3>
                    <div className="max-w-xl mx-auto text-xs font-mono text-left bg-slate-950 text-blue-400 p-8 rounded-[2rem] max-h-64 overflow-y-auto whitespace-pre-wrap leading-relaxed shadow-inner">
                        {debugLog}
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className="space-y-10 animate-fade-in">
                    <div className="bg-emerald-500 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-200/50 flex items-center gap-3">
                        <span className="text-lg">✓</span> Extraction terminée avec succès. Veuillez valider les données ci-dessous.
                    </div>

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
                                            <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest block mb-2">Fichier Numérisé</label>
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
                                            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block mb-2">Fichier Numérisé</label>
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

                            {/* Section 5: Consistance (Lots) */}
                            <div className="bg-slate-50 rounded-[2.5rem] p-10 space-y-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white">📦</div>
                                    <h4 className="text-sm font-black uppercase tracking-widest text-slate-900">Consistance Intellectuelle & Matérielle</h4>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">🧪 Équipements</label>
                                            <button
                                                onClick={() => setFormData({ ...formData, equipmentDetails: "Système complet piloté par microprocesseur. Engagement incluant : Installation, Qualification (IQ/OQ) et Formation certifiante pour 03 utilisateurs. Garantie : 24 mois." })}
                                                className="text-[8px] font-black bg-blue-50 text-blue-600 px-2 py-1 rounded-lg hover:bg-blue-600 hover:text-white transition-all uppercase"
                                            >
                                                Inspirez-moi
                                            </button>
                                        </div>
                                        <textarea rows={4} className="w-full p-4 bg-white border-2 border-slate-100 rounded-2xl font-bold text-slate-600 text-sm outline-none focus:border-blue-500 shadow-sm" placeholder="Liste des principaux équipements..." value={formData.equipmentDetails} onChange={e => setFormData({ ...formData, equipmentDetails: e.target.value })}></textarea>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">⚗️ Réactifs</label>
                                            <button
                                                onClick={() => setFormData({ ...formData, reagentDetails: "Kit de démarrage comprenant : Solutions étalons certifiées (NIST) et réactifs de grade analytique. Validité résiduelle minimale à la livraison : 18 mois." })}
                                                className="text-[8px] font-black bg-indigo-50 text-indigo-600 px-2 py-1 rounded-lg hover:bg-indigo-600 hover:text-white transition-all uppercase"
                                            >
                                                Inspirez-moi
                                            </button>
                                        </div>
                                        <textarea rows={4} className="w-full p-4 bg-white border-2 border-slate-100 rounded-2xl font-bold text-slate-600 text-sm outline-none focus:border-indigo-500 shadow-sm" placeholder="Consistance des réactifs..." value={formData.reagentDetails} onChange={e => setFormData({ ...formData, reagentDetails: e.target.value })}></textarea>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">📦 Consommables</label>
                                            <button
                                                onClick={() => setFormData({ ...formData, consumableDetails: "Lot de consommables techniques pour 2000 analyses. Inclus : Accessoires de maintenance préventive de premier niveau (joints, septas, tubulures)." })}
                                                className="text-[8px] font-black bg-emerald-50 text-emerald-600 px-2 py-1 rounded-lg hover:bg-emerald-600 hover:text-white transition-all uppercase"
                                            >
                                                Inspirez-moi
                                            </button>
                                        </div>
                                        <textarea rows={4} className="w-full p-4 bg-white border-2 border-slate-100 rounded-2xl font-bold text-slate-600 text-sm outline-none focus:border-emerald-500 shadow-sm" placeholder="Détails consommables..." value={formData.consumableDetails} onChange={e => setFormData({ ...formData, consumableDetails: e.target.value })}></textarea>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="p-10 bg-slate-50 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
                            <div className="flex items-center gap-4">
                                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">En attente de validation finale</span>
                                <div className="flex h-1.5 w-32 bg-slate-200 rounded-full overflow-hidden">
                                    <div className="w-full bg-emerald-500 animate-pulse"></div>
                                </div>
                            </div>
                            <div className="flex gap-4 w-full md:w-auto">
                                <button
                                    onClick={() => setStep(1)}
                                    className="px-10 py-5 bg-white border-2 border-slate-200 text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 hover:text-slate-600 transition-all flex-1 md:flex-none"
                                >
                                    Annuler l'import
                                </button>
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
            )}
        </div>
    );
};

export default NewOrder;
