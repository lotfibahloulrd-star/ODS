import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Tesseract from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';
import { orderService } from '../services/orderService';

// Config Worker PDF Local
pdfjsLib.GlobalWorkerOptions.workerSrc = `${import.meta.env.BASE_URL}pdf.worker.min.js`;

const NewOrder = ({ onSave }) => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [file, setFile] = useState(null);
    const [contractFile, setContractFile] = useState(null);
    const [stopRequestFile, setStopRequestFile] = useState(null);
    const [stopResponseFile, setStopResponseFile] = useState(null);
    const [authFile, setAuthFile] = useState(null); // Import authorization file
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
        resumeDate: '',
        bankDomiciliation: '',
        judicialProceedings: '',
        articles: [],
        totals: { ht: 0, tva: 0, ttc: 0 }
    });

    const calculateTotals = (articles) => {
        const ht = articles.reduce((sum, art) => sum + (parseFloat(art.total) || 0), 0);
        const tva = Math.round(ht * 0.19 * 100) / 100; // 19% TVA standard
        const ttc = Math.round((ht + tva) * 100) / 100;
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

            setDebugLog(prev => prev + "\n🧠 Lecture Intelligente (Extraction des données)...");
            const result = await Tesseract.recognize(imageToScan, 'eng+fra+ara', {
                logger: m => { if (m.status === 'recognizing text') console.log(m.progress); }
            });

            const text = result.data.text;
            if (!text || text.length < 10) throw new Error("Texte illisible");

            setDebugLog(prev => prev + `\n✅ Texte trouvé (${text.length} caractères). Extraction fine...`);
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

    const [docType, setDocType] = useState('ods'); // 'ods' or 'contract'

    const parseExtractedText = (text) => {
        setDebugLog(prev => prev + "\n🔍 Analyse structurelle profonde...");

        // Nettoyage et normalisation du texte pour faciliter la recherche
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        const fullText = lines.join(' ');

        // 1. Détection du type de document (ODS vs Marché/Contrat)
        const isContract = /marché|contrat|convention|engagement/i.test(fullText) &&
            !/ordre de service|ods/i.test(fullText.substring(0, 800));
        setDocType(isContract ? 'contract' : 'ods');

        // 2. Extraction du Client (Maître de l'ouvrage)
        // Recherche des patterns classiques ou de la première ligne significative si rien n'est trouvé
        let client = "";
        const clientPatterns = [
            /(?:mait?re\s+de\s+l['\s]ouvrage|client|organisme|destinataire|ministere|direction|universite|centre)\s*[:.-]?\s*([^0-9\n]{3,100})/i,
            /REP?UBL?IQUE\s+ALGERIENNE\s+[^\n]+\n+([^\n]+)/i // Souvent le ministère ou l'organisme sous l'en-tête
        ];

        for (const pattern of clientPatterns) {
            const match = fullText.match(pattern) || text.match(pattern);
            if (match) {
                client = match[1].trim().split(/\s{2,}/)[0]; // Prendre la première partie
                break;
            }
        }

        // 3. Extraction de la Référence (Numéro)
        let ref = "";
        const refPatterns = [
            /(?:numéro|n°|réf|ref|marché|ods)\s*[:.-]?\s*(\d+[\d\/.\-_ ]+)/i,
            /(?:\/)(202[2-6])\b/i // Trouver quelque chose qui ressemble à /2024, /2025
        ];

        for (const pattern of refPatterns) {
            const match = fullText.match(pattern);
            if (match) {
                ref = match[1].trim().split(' ')[0];
                break;
            }
        }

        // 4. Extraction de l'Objet (Le plus complexe)
        let object = "";
        const objectKeywords = /objet|lot|prestation|désignation|intitulé/i;
        const objectIndex = lines.findIndex(l => objectKeywords.test(l));

        if (objectIndex !== -1) {
            // Prendre la ligne de l'objet et éventuellement les 2 suivantes
            object = lines[objectIndex].replace(objectKeywords, '').replace(/[:.-]/, '').trim();
            if (object.length < 10 && lines[objectIndex + 1]) {
                object += " " + lines[objectIndex + 1];
            }
        } else {
            // Heuristique: Chercher un bloc de texte long au milieu du document
            const longLines = lines.filter(l => l.length > 40 && !l.includes('http'));
            object = longLines[0] || lines.slice(5, 8).join(' ');
        }

        // 5. Extraction de la Date
        let dateOds = "";
        // Chercher "le : 10/05/2025" ou "Fait à ... le ..."
        const datePatterns = [
            /(?:le|du|date)\s*[:.-]?\s*(\d{1,2}[\/\-. ]\d{1,2}[\/\-. ]\d{2,4})/,
            /(\d{1,2}[\/\-. ]\d{1,2}[\/\-. ]\d{4})/
        ];

        for (const pattern of datePatterns) {
            const match = fullText.match(pattern);
            if (match) {
                let dateStr = match[1].replace(/[. ]/g, '/');
                const parts = dateStr.split('/');
                if (parts.length === 3) {
                    // Normaliser vers YYYY-MM-DD
                    const day = parts[0].padStart(2, '0');
                    const month = parts[1].padStart(2, '0');
                    let year = parts[2];
                    if (year.length === 2) year = "20" + year;
                    dateOds = `${year}-${month}-${day}`;
                    break;
                }
            }
        }

        // 6. Extraction du Montant
        let amount = "";
        const amountPatterns = [
            /(?:montant|total|ttc|prix)\s*[:.-]?\s*([\d\s,.]+)\s*(?:da|dzd)/i,
            /(\d[\d\s,.]+\d)\s*DA/i
        ];

        for (const pattern of amountPatterns) {
            const match = fullText.match(pattern);
            if (match) {
                amount = match[1].replace(/\s/g, '').replace(/,/g, '.');
                // Nettoyer si plusieurs points
                const firstPoint = amount.indexOf('.');
                if (firstPoint !== -1) {
                    amount = amount.substring(0, firstPoint + 3);
                }
                break;
            }
        }

        // 7. Extraction du Délai
        let delay = "";
        const delayMatch = fullText.match(/(\d+)\s*(?:jours?|mois|jr)/i);
        if (delayMatch) delay = delayMatch[1];

        setFormData(prev => ({
            ...prev,
            client: client.substring(0, 100).toUpperCase() || prev.client,
            refOds: ref || prev.refOds,
            refContract: isContract ? (ref || prev.refContract) : prev.refContract,
            object: object.trim().substring(0, 250) || prev.object,
            dateOds: dateOds || prev.dateOds,
            startDate: dateOds || prev.startDate,
            delay: delay || prev.delay,
            amount: amount || prev.amount
        }));

        setDebugLog(prev => prev + "\n✨ Extraction fine terminée.");
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
        if (!formData.refOds && !formData.refContract) {
            alert("Veuillez remplir au moins la référence ODS ou Contrat.");
            return;
        }
        if (!formData.client) {
            alert("Le nom du client est obligatoire.");
            return;
        }

        setIsLoading(true);
        try {
            const savedOrder = await orderService.createOrder(formData);

            // Determine which file goes where based on docType for the scanned file
            const uploadPromises = [];

            // The 'file' state holds the document just scanned by AI
            if (docType === 'ods' && file) {
                uploadPromises.push(handleFileUpload(file, orderService.saveOdsFile, savedOrder.id));
            } else if (docType === 'contract' && file) {
                uploadPromises.push(handleFileUpload(file, orderService.saveContractFile, savedOrder.id));
            }

            // If user manually uploaded additional files in the other slots
            if (contractFile && docType === 'ods') {
                uploadPromises.push(handleFileUpload(contractFile, orderService.saveContractFile, savedOrder.id));
            }
            if (authFile) {
                uploadPromises.push(handleFileUpload(authFile, orderService.saveAuthFile, savedOrder.id));
            }

            if (stopRequestFile) uploadPromises.push(handleFileUpload(stopRequestFile, orderService.saveStopRequestFile, savedOrder.id));
            if (stopResponseFile) uploadPromises.push(handleFileUpload(stopResponseFile, orderService.saveStopResponseFile, savedOrder.id));

            await Promise.all(uploadPromises);

            alert('ODS enregistré avec succès !');
            setStep(1);
            setFile(null);
            setContractFile(null);
            setStopRequestFile(null);
            setStopResponseFile(null);
            setAuthFile(null);
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
            navigate('/');
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
                <p className="text-slate-500 font-medium font-bold">L'intelligence artificielle analyse votre document pour une saisie fluide et automatisée. Veuillez vérifier les champs extraits.</p>
            </div>

            {step === 1 && (
                <div
                    className="bg-white rounded-[3rem] border-4 border-dashed border-slate-200 p-24 text-center hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer group shadow-2xl shadow-slate-200/50"
                    onClick={() => document.getElementById('fileInput').click()}
                >
                    <input id="fileInput" type="file" hidden accept=".pdf,.jpg,.png" onClick={e => e.target.value = null} onChange={(e) => processFile(e.target.files[0])} />
                    <div className="w-24 h-24 bg-blue-600 rounded-[2rem] flex items-center justify-center text-4xl mx-auto mb-8 group-hover:scale-110 transition-transform shadow-xl shadow-blue-200">
                        📄
                    </div>
                    <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Déposez l'ODS ici</h3>
                    <p className="text-slate-500 font-black uppercase text-xs tracking-[0.2em]">PDF, JPG ou PNG • Analyse IA Automatique</p>
                    <div className="mt-8 flex justify-center gap-4">
                        <button className="px-6 py-2 bg-slate-100 text-slate-600 rounded-full text-xs font-black uppercase tracking-widest">Ou cliquez pour parcourir</button>
                    </div>
                    <button
                        onClick={(e) => { e.stopPropagation(); setStep(3); }}
                        className="mt-12 text-blue-600 font-black text-xs uppercase tracking-widest border-b-2 border-blue-600 hover:text-blue-800 transition-all"
                    >
                        Passer à la saisie manuelle
                    </button>
                </div>
            )}

            {step === 2 && (
                <div className="bg-white rounded-[3rem] shadow-2xl p-20 text-center border border-slate-100 max-w-4xl mx-auto">
                    <div className="relative w-32 h-32 mx-auto mb-12">
                        <div className="absolute inset-0 bg-blue-600 rounded-[2.5rem] animate-ping opacity-20"></div>
                        <div className="relative w-32 h-32 bg-slate-900 rounded-[2.5rem] flex items-center justify-center text-5xl shadow-2xl animate-pulse">
                            🧠
                        </div>
                    </div>
                    <h3 className="text-3xl font-black text-slate-900 mb-6 tracking-tight">Analyse IA en cours...</h3>
                    <div className="text-left font-mono text-[11px] bg-slate-950 text-emerald-400 p-10 rounded-[2.5rem] max-h-80 overflow-y-auto whitespace-pre-wrap leading-relaxed shadow-inner border border-white/10">
                        <div className="flex items-center gap-2 mb-4 border-b border-white/10 pb-4">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                            <span className="uppercase tracking-widest font-black text-[10px]">Neural Processing Engine v4.0</span>
                        </div>
                        {debugLog}
                        <div className="mt-4 animate-pulse">_</div>
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className="space-y-10 animate-fade-in">
                    <div className="bg-emerald-500 text-white px-8 py-6 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-emerald-200/50 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <span className="text-2xl bg-white/20 w-10 h-10 flex items-center justify-center rounded-xl">✓</span>
                            <div>
                                <p>Extraction terminée !</p>
                                <p className="text-[10px] opacity-70 italic">Veuillez vérifier le type de document et les données extraites.</p>
                            </div>
                        </div>

                        <div className="flex bg-white/10 p-1.5 rounded-2xl border border-white/20">
                            <button
                                onClick={() => setDocType('ods')}
                                className={`px-6 py-2 rounded-xl text-[10px] font-black transition-all ${docType === 'ods' ? 'bg-white text-emerald-600 shadow-lg' : 'text-white hover:bg-white/10'}`}
                            >
                                DOCUMENT TYPE: ODS
                            </button>
                            <button
                                onClick={() => setDocType('contract')}
                                className={`px-6 py-2 rounded-xl text-[10px] font-black transition-all ${docType === 'contract' ? 'bg-white text-emerald-600 shadow-lg' : 'text-white hover:bg-white/10'}`}
                            >
                                DOCUMENT TYPE: MARCHÉ
                            </button>
                        </div>

                        <button onClick={() => setStep(1)} className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-xl text-[10px] transition-all font-black border border-white/30">RE-NUMERISER</button>
                    </div>

                    <div className="bg-white rounded-[4rem] border border-slate-200 shadow-2xl shadow-slate-200/50 overflow-hidden">
                        <div className="p-12 space-y-16">
                            {/* Section 1: Documents & Références */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                                <div className={`p-10 rounded-[3rem] border transition-all ${docType === 'ods' ? 'bg-blue-50/50 border-blue-200 ring-2 ring-blue-500 ring-offset-4' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-lg shadow-blue-100">1</div>
                                            <h4 className="text-xs font-black uppercase tracking-widest text-blue-900">Ordre de Service (ODS)</h4>
                                        </div>
                                        {docType === 'ods' && <span className="text-[9px] font-black bg-blue-600 text-white px-2 py-1 rounded-full animate-pulse">NUMÉRISÉ</span>}
                                    </div>
                                    <div className="space-y-6">
                                        <div>
                                            <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest block mb-2 px-1">Référence ODS</label>
                                            <input
                                                type="text"
                                                className="w-full p-5 bg-white border-2 border-blue-100 rounded-2xl font-black text-blue-900 outline-none focus:border-blue-500 transition-all shadow-sm"
                                                value={formData.refOds}
                                                onChange={e => setFormData({ ...formData, refOds: e.target.value })}
                                                placeholder="Ex: 125/2026"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest block mb-2 px-1">Fichier ODS</label>
                                            <div className="relative">
                                                <input
                                                    type="file"
                                                    className="w-full text-xs font-bold text-slate-400 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-blue-600 file:text-white hover:file:bg-blue-700 transition-all border-2 border-dashed border-blue-200 p-4 rounded-3xl bg-white/50"
                                                    accept=".pdf,.jpg,.png"
                                                    onChange={e => {
                                                        const newFile = e.target.files[0];
                                                        if (docType === 'ods') setFile(newFile);
                                                        else setContractFile(newFile);
                                                    }}
                                                />
                                                {docType === 'ods' && file && (
                                                    <p className="mt-2 text-[10px] font-bold text-blue-600 italic px-2">✓ Fichier extrait par l'IA chargé ici</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className={`p-10 rounded-[3rem] border transition-all ${docType === 'contract' ? 'bg-indigo-50/50 border-indigo-200 ring-2 ring-indigo-500 ring-offset-4' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-lg shadow-indigo-200">2</div>
                                            <h4 className="text-xs font-black uppercase tracking-widest text-indigo-900">Marché / Contrat</h4>
                                        </div>
                                        {docType === 'contract' && <span className="text-[9px] font-black bg-indigo-600 text-white px-2 py-1 rounded-full animate-pulse">NUMÉRISÉ</span>}
                                    </div>
                                    <div className="space-y-6">
                                        <div>
                                            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block mb-2 px-1">Référence Contrat</label>
                                            <input
                                                type="text"
                                                className="w-full p-5 bg-white border-2 border-indigo-100 rounded-2xl font-black text-indigo-900 outline-none focus:border-indigo-500 transition-all shadow-sm"
                                                value={formData.refContract}
                                                onChange={e => setFormData({ ...formData, refContract: e.target.value })}
                                                placeholder="Ex: MARCHÉ N°45/2026"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block mb-2 px-1">Fichier de Contrat</label>
                                            <div className="relative">
                                                <input
                                                    type="file"
                                                    className="w-full text-xs font-bold text-slate-400 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 transition-all border-2 border-dashed border-indigo-200 p-4 rounded-3xl bg-white/50"
                                                    accept=".pdf,.jpg,.png"
                                                    onChange={e => {
                                                        const newFile = e.target.files[0];
                                                        if (docType === 'contract') setFile(newFile);
                                                        else setContractFile(newFile);
                                                    }}
                                                />
                                                {docType === 'contract' && file && (
                                                    <p className="mt-2 text-[10px] font-bold text-indigo-600 italic px-2">✓ Fichier extrait par l'IA chargé ici</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-emerald-50/50 p-10 rounded-[3rem] border border-emerald-100 space-y-6">
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="w-10 h-10 bg-emerald-600 rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-lg shadow-emerald-200">3</div>
                                        <h4 className="text-xs font-black uppercase tracking-widest text-emerald-900">Autorisation d'Import</h4>
                                    </div>
                                    <div className="space-y-6">
                                        <div>
                                            <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block mb-1 px-1">Statut</label>
                                            <select
                                                className="w-full p-4 bg-white border-2 border-emerald-100 rounded-2xl font-black text-emerald-900 outline-none focus:border-emerald-500 shadow-sm text-xs cursor-pointer"
                                                value={formData.authorization}
                                                onChange={e => setFormData({ ...formData, authorization: e.target.value })}
                                            >
                                                <option value="Non">Attente Autorisation</option>
                                                <option value="Oui">Autorisation confirmée</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block mb-2 px-1">Fichier de l'Autorisation</label>
                                            <input
                                                type="file"
                                                className="w-full text-xs font-bold text-slate-400 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 transition-all border-2 border-dashed border-emerald-200 p-4 rounded-3xl bg-white/50"
                                                accept=".pdf,.jpg,.png"
                                                onChange={e => {
                                                    const file = e.target.files[0];
                                                    setAuthFile(file);
                                                    if (file) setFormData(prev => ({ ...prev, authorization: 'Oui' }));
                                                }}
                                            />
                                            {authFile && (
                                                <p className="mt-2 text-[10px] font-bold text-emerald-600 italic px-2">✓ Fichier attaché (Statut mis à jour automatiquement)</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Identification */}
                            <div className="space-y-10">
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    <div className="lg:col-span-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3 px-1">Client / Maître d'Ouvrage</label>
                                        <input
                                            type="text"
                                            className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-[2rem] font-black text-slate-900 outline-none focus:border-blue-500 transition-all shadow-sm"
                                            value={formData.client}
                                            onChange={e => setFormData({ ...formData, client: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3 px-1">Classification / Division</label>
                                        <select
                                            className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-[2rem] font-black text-slate-900 outline-none focus:border-blue-500 transition-all shadow-sm cursor-pointer"
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
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3 px-1">Objet des prestations</label>
                                    <textarea
                                        rows={4}
                                        className="w-full p-8 bg-slate-50 border-2 border-slate-100 rounded-[3rem] font-bold text-slate-700 outline-none focus:border-blue-500 transition-all shadow-sm leading-relaxed"
                                        value={formData.object}
                                        onChange={e => setFormData({ ...formData, object: e.target.value })}
                                        placeholder="Décrivez l'objet de la commande..."
                                    ></textarea>
                                </div>
                            </div>

                            {/* Section 3: Financier & Délais */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                <div className="bg-slate-50 p-8 rounded-[3rem] border border-slate-100 group hover:border-blue-200 transition-all">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3 text-center">Total HT (DA)</label>
                                    <input
                                        type="number"
                                        className="w-full p-4 bg-white border-2 border-slate-200 rounded-2xl text-center font-black text-slate-900 outline-none focus:border-blue-500"
                                        value={formData.totals.ht}
                                        onChange={e => {
                                            const ht = parseFloat(e.target.value) || 0;
                                            const tva = Math.round(ht * 0.19 * 100) / 100;
                                            const ttc = Math.round((ht + tva) * 100) / 100;
                                            setFormData({ ...formData, amount: ttc.toString(), totals: { ht, tva, ttc } });
                                        }}
                                    />
                                </div>
                                <div className="bg-slate-50 p-8 rounded-[3rem] border border-slate-100 group hover:border-blue-200 transition-all">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3 text-center">TVA (19%)</label>
                                    <input
                                        type="number"
                                        className="w-full p-4 bg-white border-2 border-slate-200 rounded-2xl text-center font-black text-slate-900 outline-none focus:border-blue-500"
                                        value={formData.totals.tva}
                                        onChange={e => {
                                            const tva = parseFloat(e.target.value) || 0;
                                            const ttc = Math.round((formData.totals.ht + tva) * 100) / 100;
                                            setFormData({ ...formData, amount: ttc.toString(), totals: { ...formData.totals, tva, ttc } });
                                        }}
                                    />
                                </div>
                                <div className="bg-slate-50 p-8 rounded-[3rem] border border-slate-100 group hover:border-emerald-200 transition-all">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3 text-center">Montant TTC (DA)</label>
                                    <input
                                        type="text"
                                        className="w-full p-4 bg-white border-2 border-slate-200 rounded-2xl text-center font-black text-blue-700 outline-none focus:border-blue-500 text-xl"
                                        value={formData.amount}
                                        onChange={e => setFormData({ ...formData, amount: e.target.value, totals: { ...formData.totals, ttc: parseFloat(e.target.value) || 0 } })}
                                    />
                                </div>
                                <div className="bg-slate-50 p-8 rounded-[3rem] border border-slate-100 group hover:border-amber-200 transition-all">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3 text-center">Domiciliation Bancaire</label>
                                    <input
                                        type="text"
                                        className="w-full p-4 bg-white border-2 border-slate-200 rounded-2xl text-center font-black text-slate-900 outline-none focus:border-blue-500"
                                        value={formData.bankDomiciliation}
                                        onChange={e => setFormData({ ...formData, bankDomiciliation: e.target.value })}
                                        placeholder="Banque / Agence"
                                    />
                                </div>
                                <div className="bg-slate-50 p-8 rounded-[3rem] border border-slate-100 group hover:border-blue-200 transition-all">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3 text-center">Date ODS / Début</label>
                                    <input
                                        type="date"
                                        className="w-full p-4 bg-white border-2 border-slate-200 rounded-2xl text-center font-black text-slate-900 outline-none focus:border-blue-500"
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
                                <div className="bg-slate-900 p-8 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-5 transition-all"></div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3 text-center">Échéance Estimée</label>
                                    <div className="text-center font-black text-emerald-400 text-xl py-2 tracking-tight">
                                        {formData.endDate ? new Date(formData.endDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) : "--/--/----"}
                                    </div>
                                    <input
                                        type="number"
                                        className="mt-4 w-full p-2 bg-white/10 border border-white/10 rounded-xl text-center font-black text-white text-xs outline-none focus:border-emerald-500 transition-all"
                                        value={formData.delay}
                                        placeholder="Délai (j)"
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
                            </div>

                            {/* Section 4: Suspension Section */}
                            <div className={`rounded-[3rem] p-10 transition-all ${formData.hasStopRequest === 'Oui' ? 'bg-red-50 border-4 border-red-100 shadow-2xl shadow-red-100/30' : 'bg-slate-50 border border-slate-100'}`}>
                                <div className="flex items-center justify-between mb-10">
                                    <div className="flex items-center gap-6">
                                        <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-3xl shadow-2xl ${formData.hasStopRequest === 'Oui' ? 'bg-red-600 text-white shadow-red-200' : 'bg-slate-400 text-white shadow-slate-200'}`}>
                                            🚨
                                        </div>
                                        <div>
                                            <h4 className={`text-lg font-black uppercase tracking-widest ${formData.hasStopRequest === 'Oui' ? 'text-red-900' : 'text-slate-500'}`}>Interruption de prestation</h4>
                                            <p className="font-bold text-slate-400 text-xs">Gérez les ordres d'arrêt et de reprise</p>
                                        </div>
                                    </div>
                                    <select
                                        className={`px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest outline-none border-2 transition-all cursor-pointer ${formData.hasStopRequest === 'Oui' ? 'bg-white border-red-200 text-red-600 focus:border-red-500' : 'bg-white border-slate-200 text-slate-500'}`}
                                        value={formData.hasStopRequest}
                                        onChange={e => setFormData({ ...formData, hasStopRequest: e.target.value })}
                                    >
                                        <option value="Non">Pas d'arrêt</option>
                                        <option value="Oui">Arrêt déclaré</option>
                                    </select>
                                </div>

                                {formData.hasStopRequest === 'Oui' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 animate-in fade-in zoom-in duration-500">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-red-400 uppercase tracking-widest block px-1">Date d'Arrêt</label>
                                            <input type="date" className="w-full p-4 bg-white border-2 border-red-100 rounded-2xl font-black text-red-900 outline-none focus:border-red-500 shadow-sm" value={formData.stopDate}
                                                onChange={e => {
                                                    const val = e.target.value;
                                                    setFormData({ ...formData, stopDate: val, endDate: calculateEndDate(formData.startDate, formData.delay, val, formData.resumeDate) });
                                                }}
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-red-400 uppercase tracking-widest block px-1">Date de Reprise</label>
                                            <input type="date" className="w-full p-4 bg-white border-2 border-red-100 rounded-2xl font-black text-red-900 outline-none focus:border-red-500 shadow-sm" value={formData.resumeDate}
                                                onChange={e => {
                                                    const val = e.target.value;
                                                    setFormData({ ...formData, resumeDate: val, endDate: calculateEndDate(formData.startDate, formData.delay, formData.stopDate, val) });
                                                }}
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-red-400 uppercase tracking-widest block px-1">DOC Arrêt (PDF)</label>
                                            <input type="file" className="text-[10px] font-black text-red-400 file:mr-2 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-red-600 file:text-white transition-all bg-white p-3 rounded-2xl border-2 border-dashed border-red-200 w-full" onChange={e => setStopRequestFile(e.target.files[0])} />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-red-400 uppercase tracking-widest block px-1">DOC Reprise (PDF)</label>
                                            <input type="file" className="text-[10px] font-black text-red-400 file:mr-2 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-red-600 file:text-white transition-all bg-white p-3 rounded-2xl border-2 border-dashed border-red-200 w-full" onChange={e => setStopResponseFile(e.target.files[0])} />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Section 5: Consistance Detaillee */}
                            <div className="bg-slate-50 rounded-[3rem] p-12 space-y-10 border border-slate-100 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12 group-hover:rotate-0 transition-all pointer-events-none text-8xl">📦</div>
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 bg-slate-900 rounded-[1.25rem] flex items-center justify-center text-2xl text-white shadow-xl">📁</div>
                                    <h4 className="text-lg font-black uppercase tracking-widest text-slate-900">Consistance Technique Automatisée</h4>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center px-1">
                                            <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">🧪 Équipements</label>
                                            <button
                                                onClick={() => setFormData({ ...formData, equipmentDetails: "Système complet piloté par microprocesseur. Engagement incluant : Installation, Qualification (IQ/OQ) et Formation certifiante pour 03 utilisateurs. Garantie : 24 mois." })}
                                                className="text-[8px] font-black bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full hover:bg-blue-600 hover:text-white transition-all uppercase tracking-tighter shadow-sm"
                                            >
                                                Inspirez-moi
                                            </button>
                                        </div>
                                        <textarea rows={5} className="w-full p-6 bg-white border-2 border-slate-100 rounded-[2rem] font-bold text-slate-600 text-sm outline-none focus:border-blue-500 shadow-inner" placeholder="Liste des principaux équipements..." value={formData.equipmentDetails} onChange={e => setFormData({ ...formData, equipmentDetails: e.target.value })}></textarea>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center px-1">
                                            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">⚗️ Réactifs</label>
                                            <button
                                                onClick={() => setFormData({ ...formData, reagentDetails: "Kit de démarrage comprenant : Solutions étalons certifiées (NIST) et réactifs de grade analytique. Validité résiduelle minimale à la livraison : 18 mois." })}
                                                className="text-[8px] font-black bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-full hover:bg-indigo-600 hover:text-white transition-all uppercase tracking-tighter shadow-sm"
                                            >
                                                Inspirez-moi
                                            </button>
                                        </div>
                                        <textarea rows={5} className="w-full p-6 bg-white border-2 border-slate-100 rounded-[2rem] font-bold text-slate-600 text-sm outline-none focus:border-indigo-500 shadow-inner" placeholder="Consistance des réactifs..." value={formData.reagentDetails} onChange={e => setFormData({ ...formData, reagentDetails: e.target.value })}></textarea>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center px-1">
                                            <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">📦 Consommables</label>
                                            <button
                                                onClick={() => setFormData({ ...formData, consumableDetails: "Lot de consommables techniques pour 2000 analyses. Inclus : Accessoires de maintenance préventive de premier niveau (joints, septas, tubulures)." })}
                                                className="text-[8px] font-black bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full hover:bg-emerald-600 hover:text-white transition-all uppercase tracking-tighter shadow-sm"
                                            >
                                                Inspirez-moi
                                            </button>
                                        </div>
                                        <textarea rows={5} className="w-full p-6 bg-white border-2 border-slate-100 rounded-[2rem] font-bold text-slate-600 text-sm outline-none focus:border-emerald-500 shadow-inner" placeholder="Détails consommables..." value={formData.consumableDetails} onChange={e => setFormData({ ...formData, consumableDetails: e.target.value })}></textarea>
                                    </div>
                                </div>
                                <div className="mt-6 pt-10 border-t border-slate-200/50">
                                    <label className="text-[10px] font-black text-red-400 uppercase tracking-widest flex items-center gap-3 mb-4 px-1">
                                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                                        Aspects Juridiques & Litiges
                                    </label>
                                    <textarea rows={2} className="w-full p-6 bg-white border-2 border-slate-100 rounded-[2rem] font-bold text-slate-600 text-sm outline-none focus:border-red-500 shadow-inner" placeholder="Précisez ici si des poursuites sont en cours or prévues..." value={formData.judicialProceedings} onChange={e => setFormData({ ...formData, judicialProceedings: e.target.value })}></textarea>
                                </div>
                            </div>

                            {/* Section 6: Detail Quantitatif & Estimatif (Articles) */}
                            <div className="bg-slate-900 rounded-[4rem] p-12 space-y-10 text-white shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl -mr-48 -mt-48"></div>
                                <div className="flex items-center justify-between relative z-10">
                                    <div className="flex items-center gap-5">
                                        <div className="w-16 h-16 bg-blue-600 rounded-[1.5rem] flex items-center justify-center text-white font-black shadow-2xl shadow-blue-500/20 text-2xl">📋</div>
                                        <div>
                                            <h4 className="text-xl font-black uppercase tracking-tight">Détail Quantitatif & Estimatif</h4>
                                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1 opacity-50">Gestion structurée des articles</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={addArticle}
                                        type="button"
                                        className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-blue-50 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 shadow-2xl shadow-white/5"
                                    >
                                        <span className="text-xl">+</span> Ajouter une ligne
                                    </button>
                                </div>

                                <div className="overflow-x-auto relative z-10">
                                    <table className="w-full text-left border-collapse min-w-[1200px]">
                                        <thead>
                                            <tr className="border-b border-white/5">
                                                <th className="px-6 py-6 text-[11px] font-black uppercase tracking-widest text-slate-500">Item</th>
                                                <th className="px-6 py-6 text-[11px] font-black uppercase tracking-widest text-slate-500">Référence</th>
                                                <th className="px-6 py-6 text-[11px] font-black uppercase tracking-widest text-slate-500 w-[40%]">Désignation Complète</th>
                                                <th className="px-6 py-6 text-[11px] font-black uppercase tracking-widest text-slate-500 text-center">Quantité</th>
                                                <th className="px-6 py-6 text-[11px] font-black uppercase tracking-widest text-slate-500 text-right">P.U HT (DA)</th>
                                                <th className="px-6 py-6 text-[11px] font-black uppercase tracking-widest text-slate-500 text-right">TOTAL HT</th>
                                                <th className="px-6 py-6 text-[11px] font-black uppercase tracking-widest text-slate-500 text-center">Marque</th>
                                                <th className="px-6 py-6 text-[11px] font-black uppercase tracking-widest text-slate-500 text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {formData.articles.map((art, idx) => (
                                                <tr key={idx} className="group hover:bg-white/[0.03] transition-all">
                                                    <td className="px-6 py-6 font-black text-slate-600">{art.no}</td>
                                                    <td className="px-4 py-6">
                                                        <input
                                                            type="text"
                                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs font-bold text-white outline-none focus:border-blue-500 focus:bg-white/10 transition-all"
                                                            value={art.ref}
                                                            onChange={e => updateArticle(idx, 'ref', e.target.value)}
                                                            placeholder="REF"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-6">
                                                        <textarea
                                                            rows={1}
                                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs font-bold text-white outline-none focus:border-blue-500 focus:bg-white/10 resize-none transition-all scrollbar-hide"
                                                            value={art.designation}
                                                            onChange={e => updateArticle(idx, 'designation', e.target.value)}
                                                            placeholder="Désignation détaillée..."
                                                        />
                                                    </td>
                                                    <td className="px-4 py-6">
                                                        <input
                                                            type="number"
                                                            className="w-24 mx-auto bg-white/5 border border-white/10 rounded-xl p-3 text-xs font-black text-center text-white outline-none focus:border-blue-500 transition-all"
                                                            value={art.qte}
                                                            onChange={e => updateArticle(idx, 'qte', e.target.value)}
                                                        />
                                                    </td>
                                                    <td className="px-4 py-6">
                                                        <input
                                                            type="number"
                                                            className="w-40 ml-auto bg-white/5 border border-white/10 rounded-xl p-3 text-xs font-black text-right text-white outline-none focus:border-blue-500 transition-all"
                                                            value={art.pu}
                                                            onChange={e => updateArticle(idx, 'pu', e.target.value)}
                                                        />
                                                    </td>
                                                    <td className="px-6 py-6 text-right">
                                                        <span className="text-sm font-black text-blue-400 whitespace-nowrap">{new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2 }).format(art.total)}</span>
                                                    </td>
                                                    <td className="px-4 py-6">
                                                        <input
                                                            type="text"
                                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs font-bold text-center text-white outline-none focus:border-blue-500 transition-all"
                                                            value={art.marque}
                                                            onChange={e => updateArticle(idx, 'marque', e.target.value)}
                                                            placeholder="MARQUE"
                                                        />
                                                    </td>
                                                    <td className="px-6 py-6 text-right">
                                                        <button
                                                            onClick={() => removeArticle(idx)}
                                                            className="w-10 h-10 flex items-center justify-center bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 shadow-lg shadow-red-500/10"
                                                        >
                                                            ×
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}

                                            {formData.articles.length === 0 && (
                                                <tr>
                                                    <td colSpan="8" className="px-4 py-32 text-center text-slate-600 italic font-medium">
                                                        <div className="flex flex-col items-center gap-6">
                                                            <div className="text-6xl opacity-10">📥</div>
                                                            <p className="text-sm">Le tableau DQE est vide. Les données financières seront extraites de l'ODS ou saisies ici.</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                        {formData.articles.length > 0 && (
                                            <tfoot className="border-t-4 border-white/10 bg-white/[0.02]">
                                                <tr>
                                                    <td colSpan="5" className="px-8 py-8 text-right font-black text-slate-500 uppercase text-[11px] tracking-[0.2em]">Total HT Cumulé</td>
                                                    <td className="px-8 py-8 text-right font-black text-white text-lg whitespace-nowrap">{new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2 }).format(formData.totals.ht)} DA</td>
                                                    <td colSpan="2"></td>
                                                </tr>
                                                <tr>
                                                    <td colSpan="5" className="px-8 py-4 text-right font-black text-slate-500 uppercase text-[11px] tracking-[0.2em] opacity-50">TVA Statutaire (19%)</td>
                                                    <td className="px-8 py-4 text-right font-black text-slate-500 text-sm whitespace-nowrap">{new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2 }).format(formData.totals.tva)} DA</td>
                                                    <td colSpan="2"></td>
                                                </tr>
                                                <tr className="bg-blue-600/10">
                                                    <td colSpan="5" className="px-8 py-10 text-right font-black text-blue-500 uppercase text-[12px] tracking-[0.3em]">Montant Contractuel Global TTC</td>
                                                    <td className="px-8 py-10 text-right font-black text-blue-400 text-2xl whitespace-nowrap tabular-nums shadow-inner">{new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2 }).format(formData.totals.ttc)} DA</td>
                                                    <td colSpan="2"></td>
                                                </tr>
                                            </tfoot>
                                        )}
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="p-12 bg-slate-50 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-8">
                            <button
                                onClick={() => navigate('/')}
                                className="px-10 py-6 bg-white border-2 border-slate-200 text-slate-500 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 hover:border-slate-400 hover:text-slate-800 transition-all w-full md:w-auto shadow-sm"
                            >
                                ← Quitter sans enregistrer
                            </button>
                            <div className="flex gap-6 w-full md:w-auto">
                                <button
                                    onClick={handleSave}
                                    disabled={isLoading}
                                    className="px-16 py-6 bg-slate-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-slate-800 hover:scale-[1.05] active:scale-95 transition-all flex-1 md:flex-none flex items-center justify-center gap-4 group"
                                >
                                    {isLoading ? "Synchronisation..." : (
                                        <>
                                            Confirmer & Publier l'ODS
                                            <span className="text-xl group-hover:translate-x-2 transition-transform">→</span>
                                        </>
                                    )}
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
