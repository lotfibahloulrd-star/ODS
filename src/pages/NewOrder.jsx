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
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            try {
                storageMethod(orderId, reader.result, file.name);
            } catch (e) {
                console.error("Storage error:", e);
                throw e; // Propagate to handleSave
            }
        };
        reader.readAsDataURL(file);
    };

    const handleSave = async () => {
        try {
            const savedOrder = await orderService.createOrder(formData);

            // Save files
            if (file) handleFileUpload(file, orderService.saveOdsFile, savedOrder.id);
            if (contractFile) handleFileUpload(contractFile, orderService.saveContractFile, savedOrder.id);
            if (stopRequestFile) handleFileUpload(stopRequestFile, orderService.saveStopRequestFile, savedOrder.id);
            if (stopResponseFile) handleFileUpload(stopResponseFile, orderService.saveStopResponseFile, savedOrder.id);

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
                alert("Erreur : La mémoire du navigateur est pleine. Les fichiers PDF sont trop volumineux pour être stockés localement. L'ODS a été créé mais sans les documents joints.");
            } else {
                alert("Erreur lors de l'enregistrement : " + error.message);
            }
        }
    };

    return (
        <div className="pb-10">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Importer un Nouvel ODS</h2>
                <p className="text-gray-600">L'IA va extraire automatiquement les informations du document</p>
            </div>

            {step === 1 && (
                <div className="bg-white rounded-lg shadow p-12 text-center border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors cursor-pointer"
                    onClick={() => document.getElementById('fileInput').click()}>
                    <input id="fileInput" type="file" hidden accept=".pdf,.jpg,.png" onChange={(e) => processFile(e.target.files[0])} />
                    <div className="text-6xl mb-4">📄</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Cliquez pour sélectionner un fichier</h3>
                    <p className="text-gray-600">PDF, JPG ou PNG acceptés</p>
                </div>
            )}

            {step === 2 && (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                    <div className="text-6xl mb-4 animate-pulse">⏳</div>
                    <h3 className="text-lg font-semibold mb-4">Analyse en cours...</h3>
                    <div className="text-xs font-mono text-left bg-gray-50 p-4 rounded border border-gray-200 max-h-40 overflow-y-auto whitespace-pre-wrap text-gray-600">
                        {debugLog}
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="bg-green-50 border border-green-200 rounded p-3 mb-6 text-green-800 text-sm">
                        ✓ Extraction terminée. Vérifiez et complétez les informations ci-dessous.
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        {/* 1. RÉFÉRENCE ODS & UPLOAD ODS */}
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                            <label className="block text-sm font-bold text-blue-900 mb-2">1. Référence de l'ODS</label>
                            <input
                                type="text"
                                className="w-full p-2 border border-blue-200 rounded-lg mb-4"
                                value={formData.refOds}
                                onChange={e => setFormData({ ...formData, refOds: e.target.value })}
                                placeholder="Numéro de l'ODS..."
                            />
                            <label className="block text-sm font-bold text-blue-900 mb-2">2. Upload ODS (Document)</label>
                            <input
                                type="file"
                                className="text-xs w-full"
                                accept=".pdf,.jpg,.png"
                                onChange={e => setFile(e.target.files[0])}
                            />
                            {file && <p className="text-[10px] text-blue-600 mt-1 font-medium italic">Fichier actuel: {file.name}</p>}
                        </div>

                        {/* 2. RÉFÉRENCE CONTRAT & UPLOAD CONTRAT */}
                        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                            <label className="block text-sm font-bold text-indigo-900 mb-2">3. Référence du Contrat (Marché)</label>
                            <input
                                type="text"
                                className="w-full p-2 border border-indigo-200 rounded-lg mb-4"
                                value={formData.refContract}
                                onChange={e => setFormData({ ...formData, refContract: e.target.value })}
                                placeholder="Numéro du marché/contrat..."
                            />
                            <label className="block text-sm font-bold text-indigo-900 mb-2">4. Upload Contrat (Document)</label>
                            <input
                                type="file"
                                className="text-xs w-full"
                                accept=".pdf,.jpg,.png"
                                onChange={e => setContractFile(e.target.files[0])}
                            />
                            {contractFile && <p className="text-[10px] text-indigo-600 mt-1 font-medium italic">Fichier actuel: {contractFile.name}</p>}
                        </div>

                        {/* CLIENT & OBJET */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Client / Maître d'Ouvrage</label>
                            <input
                                type="text"
                                className="w-full p-2 border border-gray-300 rounded-lg"
                                value={formData.client}
                                onChange={e => setFormData({ ...formData, client: e.target.value })}
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Objet de la Prestation</label>
                            <textarea
                                rows={2}
                                value={formData.object}
                                onChange={e => setFormData({ ...formData, object: e.target.value })}
                                className="w-full p-2 border border-gray-300 rounded-lg"
                            ></textarea>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-slate-700 mb-1 italic">Classification Contrat / Division</label>
                            <select
                                value={formData.division}
                                onChange={e => setFormData({ ...formData, division: e.target.value })}
                                className="w-full p-3 border-2 border-slate-200 rounded-xl bg-slate-50 font-black text-slate-700 focus:border-blue-500 transition-all outline-none"
                            >
                                <option value="Division Laboratoire">Division Laboratoire</option>
                                <option value="Division Analytique">Division Analytique</option>
                                <option value="DL et DA">DL et DA</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date ODS</label>
                            <input
                                type="date"
                                className="w-full p-2 border border-gray-300 rounded-lg"
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
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Délai (Jours)</label>
                            <input
                                type="number"
                                className="w-full p-2 border border-gray-300 rounded-lg"
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

                        {/* ARRET ODS SECTION */}
                        <div className="md:col-span-2 bg-red-50 p-4 rounded-lg border border-red-100">
                            <label className="block text-sm font-bold text-red-800 mb-2">Demande d'ODS d'Arrêt / Interruption</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Soumettre une demande d'arrêt ?</label>
                                    <select
                                        value={formData.hasStopRequest}
                                        onChange={e => setFormData({ ...formData, hasStopRequest: e.target.value })}
                                        className="w-full p-2 border border-blue-100 rounded bg-white"
                                    >
                                        <option value="Non">Non</option>
                                        <option value="Oui">Oui</option>
                                    </select>
                                </div>
                                {formData.hasStopRequest === 'Oui' && (
                                    <>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Date d'Arrêt</label>
                                            <input
                                                type="date"
                                                className="w-full p-2 border border-gray-300 rounded-lg"
                                                value={formData.stopDate}
                                                onChange={e => {
                                                    const val = e.target.value;
                                                    setFormData({
                                                        ...formData,
                                                        stopDate: val,
                                                        endDate: calculateEndDate(formData.startDate, formData.delay, val, formData.resumeDate)
                                                    });
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Date de Reprise</label>
                                            <input
                                                type="date"
                                                className="w-full p-2 border border-gray-300 rounded-lg"
                                                value={formData.resumeDate}
                                                onChange={e => {
                                                    const val = e.target.value;
                                                    setFormData({
                                                        ...formData,
                                                        resumeDate: val,
                                                        endDate: calculateEndDate(formData.startDate, formData.delay, formData.stopDate, val)
                                                    });
                                                }}
                                            />
                                        </div>
                                        <div className="md:col-span-1">
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Fichier de Demande d'Arrêt</label>
                                            <input type="file" className="text-xs" accept=".pdf,.jpg,.png" onChange={e => setStopRequestFile(e.target.files[0])} />
                                        </div>
                                        <div className="md:col-span-1">
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Réponse de l'Organisme</label>
                                            <input type="file" className="text-xs" accept=".pdf,.jpg,.png" onChange={e => setStopResponseFile(e.target.files[0])} />
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
                            <input
                                type="date"
                                className="w-full p-2 border border-gray-300 rounded-lg"
                                value={formData.startDate}
                                onChange={e => {
                                    const val = e.target.value;
                                    setFormData({
                                        ...formData,
                                        startDate: val,
                                        endDate: calculateEndDate(val, formData.delay, formData.stopDate, formData.resumeDate)
                                    });
                                }}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 font-bold text-red-600">Date de fin (Mise à jour)</label>
                            <input
                                type="date"
                                value={formData.endDate}
                                readOnly
                                className="w-full p-2 border border-gray-300 rounded-lg bg-gray-100 font-bold"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Autorisation obtenue</label>
                            <select
                                value={formData.authorization}
                                onChange={e => setFormData({ ...formData, authorization: e.target.value })}
                                className="w-full p-2 border border-gray-300 rounded-lg"
                            >
                                <option value="Non">Non</option>
                                <option value="Oui">Oui</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">État de livraison</label>
                            <select
                                value={formData.deliveryStatus}
                                onChange={e => setFormData({ ...formData, deliveryStatus: e.target.value })}
                                className="w-full p-2 border border-gray-300 rounded-lg"
                            >
                                <option value="Non livrée">Non livrée</option>
                                <option value="Partielle">Partielle</option>
                                <option value="Totale">Totale</option>
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1 text-blue-700 font-bold">Détails des Lots (Equipements, Réactifs, Consommables)</label>
                            <div className="grid grid-cols-1 gap-4 bg-blue-50 p-4 rounded-lg border border-blue-100">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Équipements</label>
                                    <textarea
                                        rows={2}
                                        placeholder="Liste des équipements..."
                                        value={formData.equipmentDetails}
                                        onChange={e => setFormData({ ...formData, equipmentDetails: e.target.value })}
                                        className="w-full p-2 border border-gray-300 rounded-lg"
                                    ></textarea>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Réactifs</label>
                                    <textarea
                                        rows={2}
                                        placeholder="Liste des réactifs..."
                                        value={formData.reagentDetails}
                                        onChange={e => setFormData({ ...formData, reagentDetails: e.target.value })}
                                        className="w-full p-2 border border-gray-300 rounded-lg"
                                    ></textarea>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Consommables</label>
                                    <textarea
                                        rows={2}
                                        placeholder="Liste des consommables..."
                                        value={formData.consumableDetails}
                                        onChange={e => setFormData({ ...formData, consumableDetails: e.target.value })}
                                        className="w-full p-2 border border-gray-300 rounded-lg"
                                    ></textarea>
                                </div>
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Montant Total (DA)</label>
                            <input
                                type="text"
                                className="w-full p-2 border border-gray-300 rounded-lg"
                                value={formData.amount}
                                onChange={e => setFormData({ ...formData, amount: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                        <button
                            onClick={() => setStep(1)}
                            className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium"
                        >
                            Annuler
                        </button>
                        <button
                            onClick={handleSave}
                            className="btn btn-primary"
                        >
                            Enregistrer l'ODS
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NewOrder;
