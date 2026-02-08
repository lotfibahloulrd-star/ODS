import React, { useState, useEffect, useMemo } from 'react';
import { orderService } from '../services/orderService';
import { useAuth } from '../context/AuthContext';
import OrderDetailModal from '../components/OrderDetailModal';
import { notificationService } from '../services/notificationService';
import {
    FileText,
    FileCheck,
    Calendar,
    User,
    DollarSign,
    Clock,
    AlertTriangle,
    CheckCircle2,
    Package,
    ArrowRight,
    Search,
    Filter,
    Bell,
    BellDot,
    Truck,
    Plane,
    Box,
    Anchor,
    Ship,
    ShieldCheck,
    RotateCcw,
    Upload,
    Plus
} from 'lucide-react';

const Dashboard = () => {
    const auth = useAuth();
    const canCreate = auth?.canCreateOds();
    const currentUser = auth?.currentUser;
    const [orders, setOrders] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [syncStatus, setSyncStatus] = useState(""); // Nouveau : statut de migration

    const handleDirectUpload = (e, orderId, type) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        const reader = new FileReader();
        reader.onloadend = async () => {
            try {
                if (type === 'ods') {
                    await orderService.saveOdsFile(orderId, reader.result, file.name);
                } else {
                    await orderService.saveContractFile(orderId, reader.result, file.name);
                }
                loadOrders(); // Refresh table
                alert(`Document ${type.toUpperCase()} attaché avec succès !`);
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

    // Notifications state
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);

    const loadOrders = async () => {
        setIsLoading(true);
        try {
            const data = await orderService.getAllOrders();
            setOrders(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Dashboard: Error loading orders:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStorageRepair = () => {
        if (window.confirm("Voulez-vous optimiser le stockage ? Cela supprimera les anciens fichiers temporaires pour libérer de l'espace. Vos données actuelles resteront intactes.")) {
            orderService._cleanupLegacyStorage();
            alert("Stockage optimisé ! Veuillez rafraîchir la page si le problème persiste.");
            loadOrders();
        }
    };

    const loadNotifications = () => {
        if (!currentUser) return;
        const list = notificationService.getNotifications(currentUser.email);
        setNotifications(list);
    };

    useEffect(() => {
        loadOrders();
        loadNotifications();
        // Poll for notifications every 30 seconds
        const interval = setInterval(loadNotifications, 30000);
        return () => clearInterval(interval);
    }, [currentUser?.email]);

    useEffect(() => {
        loadOrders();
        loadNotifications();

        // Timer for polling shared data
        const timer = setInterval(loadOrders, 30000);
        return () => clearInterval(timer);
    }, [currentUser]);

    // Système de secours : Migration automatique des fichiers locaux vers le serveur
    useEffect(() => {
        const syncMissingFiles = async () => {
            if (!orders.length || syncStatus === "Terminé") return;

            const stores = ['storage_ods', 'storage_contracts', 'storage_stops_req', 'storage_stops_res'];
            let totalMissing = 0;
            let currentSync = 0;

            // Compter le travail à faire pour la barre de progression (optionnel)
            const tasks = [];
            for (const order of orders) {
                for (const store of stores) {
                    if (!order.files?.[store]) {
                        tasks.push({ order, store });
                    }
                }
            }

            if (tasks.length === 0) return;

            setSyncStatus(`Vérification de ${tasks.length} documents...`);

            for (const task of tasks) {
                try {
                    const localFile = await orderService._getFile(task.store, task.order.id);
                    if (localFile && (localFile.fileDataUrl || localFile.blob)) {
                        currentSync++;
                        setSyncStatus(`Transfert : ${task.order.client} (${currentSync}/${tasks.length})...`);

                        const success = await orderService._uploadToShared(task.store, task.order.id, localFile.blob || localFile.fileDataUrl, localFile.fileName);
                        if (success) {
                            console.log(`Migration réussie pour ${task.order.id} (${task.store})`);
                        }
                    }
                } catch (e) { console.error("Sync error:", e); }
            }

            if (currentSync > 0) {
                setSyncStatus("Synchronisation terminée !");
                setTimeout(() => setSyncStatus(""), 3000);
                loadOrders(); // Rafraîchir tout à la fin
            } else {
                setSyncStatus("");
            }
        };

        if (orders.length > 0 && !syncStatus) {
            syncMissingFiles();
        }
    }, [orders]);

    const hasUnread = notifications.some(n => !n.readBy.includes(currentUser?.email));

    const filteredOrders = useMemo(() => {
        return orders.filter(o => {
            // First check access
            if (!auth.canViewOrder(o)) return false;

            const search = searchTerm.toLowerCase();
            return (
                (o.client || "").toLowerCase().includes(search) ||
                (o.object || "").toLowerCase().includes(search) ||
                (o.refOds || o.ref || "").toLowerCase().includes(search) ||
                (o.refContract || "").toLowerCase().includes(search)
            );
        });
    }, [orders, searchTerm, auth]);

    const openPdf = (orderId, storageKey) => {
        // En mode partagé, on pointe vers l'API qui sert le fichier
        const fileUrl = `./api.php?action=get_file&orderId=${orderId}&storageKey=${storageKey}`;

        const newWindow = window.open();
        if (newWindow) {
            newWindow.document.write(`
                <html>
                    <head><title>Visualisation Document</title></head>
                    <body style="margin:0; background: #e2e8f0; display:flex; justify-content:center; align-items:center;">
                        <embed src="${fileUrl}" width="100%" height="100%" type="application/pdf" />
                        <div style="position:fixed; bottom:20px; right:20px;">
                            <a href="${fileUrl}" download style="background:#2563eb; color:white; padding:10px 20px; border-radius:10px; text-decoration:none; font-family:sans-serif; font-weight:bold; box-shadow:0 10px 15px -3px rgba(37, 99, 235, 0.4);">Télécharger</a>
                        </div>
                    </body>
                </html>
            `);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "-";
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return dateStr;
            return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
        } catch (e) { return "-"; }
    };

    const formatAmount = (amount) => {
        if (!amount) return "-";
        try {
            const cleanAmount = amount.toString().replace(/[^\d.,]/g, '').replace(',', '.');
            const num = parseFloat(cleanAmount);
            if (isNaN(num)) return amount;
            return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0 }).format(num) + " DA";
        } catch (e) { return amount; }
    };

    const getRemainingDays = (order) => {
        try {
            let endDate = order?.endDate;
            const start = order?.startDate || order?.dateOds;
            const delay = order?.delay;

            // Recalculate if missing but we have start and delay
            if (!endDate && start && delay) {
                const date = new Date(start);
                const daysToAdd = parseInt(delay);

                if (!isNaN(date.getTime()) && !isNaN(daysToAdd)) {
                    date.setDate(date.getDate() + daysToAdd);

                    // Add interruption if present
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
            const target = new Date(endDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            target.setHours(0, 0, 0, 0);
            if (isNaN(target.getTime())) return null;
            return Math.ceil((target - today) / (1000 * 60 * 60 * 24));
        } catch (e) { return null; }
    };

    const stats = useMemo(() => {
        const total = filteredOrders.length;
        const totalAmount = filteredOrders.reduce((sum, o) => {
            const cleanAmount = (o.amount || "0").toString().replace(/[^\d.,]/g, '').replace(',', '.');
            const num = parseFloat(cleanAmount);
            return sum + (isNaN(num) ? 0 : num);
        }, 0);
        const pendingAuth = filteredOrders.filter(o => o.authorization !== 'Oui').length;
        const overdue = filteredOrders.filter(order => {
            const days = getRemainingDays(order);
            return days !== null && days < 0;
        }).length;

        return { total, totalAmount, pendingAuth, overdue };
    }, [filteredOrders]);

    return (
        <div className="min-h-screen bg-slate-50/50 pb-12">
            <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-1">Tableau de Bord</h2>
                    <div className="flex flex-col gap-1">
                        <p className="text-slate-500 font-bold flex items-center gap-2">
                            <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
                            Suivi en temps réel des engagements <span className="text-[10px] opacity-30 font-black ml-2">V2.9-ROLES</span>
                        </p>
                        {syncStatus && (
                            <div className="flex items-center gap-2 mt-1">
                                <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-blue-600 text-xs font-black uppercase tracking-widest animate-pulse">{syncStatus}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Notification Bell */}
                    <div className="relative">
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="w-12 h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm relative group"
                        >
                            {hasUnread ? (
                                <BellDot className="text-blue-600 animate-bounce" size={24} />
                            ) : (
                                <Bell size={24} />
                            )}
                        </button>

                        {showNotifications && (
                            <>
                                <div className="fixed inset-0 z-[60]" onClick={() => setShowNotifications(false)}></div>
                                <div className="absolute right-0 mt-4 w-[400px] bg-white rounded-3xl shadow-2xl border border-slate-100 z-[70] overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                                    <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
                                        <div>
                                            <h3 className="text-sm font-black uppercase tracking-widest">Centre de Notifications</h3>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Dernières activités de l'équipe</p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                notifications.forEach(n => notificationService.markAsRead(n.id, currentUser.email));
                                                loadNotifications();
                                            }}
                                            className="text-[10px] font-black uppercase tracking-tighter hover:text-blue-400 transition-colors"
                                        >
                                            Tout marquer comme lu
                                        </button>
                                    </div>
                                    <div className="max-h-[400px] overflow-y-auto scrollbar-hide py-2">
                                        {notifications.length === 0 ? (
                                            <div className="p-10 text-center text-slate-400">
                                                <Bell className="mx-auto mb-4 opacity-20" size={48} />
                                                <p className="font-bold">Aucune notification</p>
                                            </div>
                                        ) : (
                                            notifications.map(n => (
                                                <div
                                                    key={n.id}
                                                    className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer relative ${!n.readBy.includes(currentUser.email) ? 'bg-blue-50/30' : ''}`}
                                                    onClick={() => {
                                                        notificationService.markAsRead(n.id, currentUser.email);
                                                        loadNotifications();
                                                        if (n.orderId) {
                                                            const ord = orders.find(o => o.id === n.orderId);
                                                            if (ord) setSelectedOrder(ord);
                                                        }
                                                        setShowNotifications(false);
                                                    }}
                                                >
                                                    {!n.readBy.includes(currentUser.email) && (
                                                        <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                                                    )}
                                                    <div className="flex items-start gap-3 pl-4">
                                                        <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${n.type === 'success' ? 'bg-emerald-500' : 'bg-blue-500'}`}></div>
                                                        <div>
                                                            <p className="text-[11px] font-bold text-slate-700 leading-relaxed mb-1">{n.message}</p>
                                                            <div className="flex items-center gap-2 text-[9px] text-slate-400 font-black uppercase">
                                                                <Clock size={10} />
                                                                {new Date(n.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
                                        <button className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-slate-900 transition-colors">Afficher tout l'historique</button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Rechercher un ODS, client, contrat..."
                            className="pl-12 pr-6 py-3.5 bg-white border border-slate-200 rounded-2xl w-72 md:w-[400px] shadow-sm focus:ring-4 focus:ring-blue-100 transition-all outline-none text-slate-700 font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleStorageRepair}
                            title="Réparer/Optimiser le stockage"
                            className="w-11 h-11 flex items-center justify-center bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm"
                        >
                            <ShieldCheck size={20} />
                        </button>

                        {currentUser && (
                            <div className="flex items-center gap-3 bg-white p-2.5 pr-5 rounded-2xl border border-slate-200 shadow-sm">
                                <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-blue-100">
                                    {currentUser.firstName ? currentUser.firstName[0] : 'U'}
                                </div>
                                <div className="hidden sm:block">
                                    <div className="text-xs font-black text-slate-900 leading-tight uppercase tracking-widest">{currentUser.lastName || currentUser.email}</div>
                                    <div className="text-[10px] font-bold text-blue-600 uppercase tracking-tighter">{currentUser.role}</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Statistics Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden group hover:border-blue-300 transition-all cursor-default">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <Package size={80} className="text-blue-600" />
                    </div>
                    <div className="relative z-10 text-slate-500 font-black text-[10px] uppercase tracking-widest mb-2">Total Engagements</div>
                    <div className="relative z-10 text-3xl font-black text-slate-900">{stats.total}</div>
                    <div className="relative z-10 flex items-center gap-2 mt-4">
                        <span className="text-[10px] px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full font-black uppercase">ODS Actifs</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden group hover:border-amber-300 transition-all cursor-default">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <Clock size={80} className="text-amber-600" />
                    </div>
                    <div className="relative z-10 text-slate-500 font-black text-[10px] uppercase tracking-widest mb-2">En Attente Autorisation</div>
                    <div className="relative z-10 text-3xl font-black text-slate-900">{stats.pendingAuth}</div>
                    <div className="relative z-10 flex items-center gap-2 mt-4">
                        <span className="text-[10px] px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full font-black uppercase">Validation Requise</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden group hover:border-red-300 transition-all cursor-default">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <AlertTriangle size={80} className="text-red-600" />
                    </div>
                    <div className="relative z-10 text-slate-500 font-black text-[10px] uppercase tracking-widest mb-2">Engagements Hors Délai</div>
                    <div className="relative z-10 text-3xl font-black text-red-600">{stats.overdue}</div>
                    <div className="relative z-10 flex items-center gap-2 mt-4">
                        <span className="text-[10px] px-2.5 py-1 bg-red-50 text-red-700 rounded-full font-black uppercase">Attention Retard</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden group hover:border-emerald-300 transition-all cursor-default">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <DollarSign size={80} className="text-emerald-600" />
                    </div>
                    <div className="relative z-10 text-slate-500 font-black text-[10px] uppercase tracking-widest mb-2">Montant global</div>
                    <div className="relative z-10 text-3xl font-black text-slate-900 tracking-tight">{formatAmount(stats.totalAmount)}</div>
                    <div className="relative z-10 flex items-center gap-2 mt-4">
                        <span className="text-[10px] px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full font-black uppercase">Valeur Totale</span>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1200px]">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-6 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Status</th>
                                <th className="px-6 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-blue-600">1. Réf ODS</th>
                                <th className="px-6 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-center text-slate-400">2. ODS</th>
                                <th className="px-6 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-indigo-600">3. Réf Contrat</th>
                                <th className="px-6 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-center text-slate-400">4. Contrat</th>
                                <th className="px-6 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Logistique</th>
                                <th className="px-6 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Client / Maître d'Ouvrage</th>
                                <th className="px-6 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Objet</th>
                                <th className="px-6 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Valeur</th>
                                <th className="px-6 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-center text-slate-400">Échéance</th>
                                <th className="px-6 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-right text-slate-400">Détails</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="11" className="px-6 py-20 text-center">
                                        <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                                        <p className="text-slate-500 font-bold tracking-tight">Analyse des données en cours...</p>
                                    </td>
                                </tr>
                            ) : filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan="11" className="px-6 py-20 text-center">
                                        <Package className="mx-auto text-slate-300 mb-6" size={64} />
                                        <p className="text-slate-500 font-black text-lg">Aucun engagement trouvé</p>
                                        <p className="text-slate-400 text-sm mt-1">Ajustez vos filtres ou créez un nouvel ODS</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map(order => {
                                    const daysLeft = getRemainingDays(order);
                                    const isOverdue = daysLeft !== null && daysLeft < 0;
                                    const isStopping = order.hasStopRequest === 'Oui';
                                    const hasOds = !!(order.files?.storage_ods);
                                    const hasContract = !!(order.files?.storage_contracts);

                                    const isImportLaunched = order.importStatus?.importLaunched;
                                    const isImportCleared = !!order.importStatus?.clearedAt;
                                    const isStockReceived = order.stockStatus?.reception === 'Totale';

                                    // Displayed end date fallback
                                    let displayEndDate = order.endDate;
                                    if (!displayEndDate && (order.startDate || order.dateOds) && order.delay) {
                                        try {
                                            const d = new Date(order.startDate || order.dateOds);
                                            const add = parseInt(order.delay);
                                            if (!isNaN(d.getTime()) && !isNaN(add)) {
                                                d.setDate(d.getDate() + add);
                                                if (!isNaN(d.getTime())) {
                                                    displayEndDate = d.toISOString().split('T')[0];
                                                }
                                            }
                                        } catch (e) {
                                            displayEndDate = null;
                                        }
                                    }

                                    return (
                                        <tr
                                            key={order.id || Math.random()}
                                            onClick={() => setSelectedOrder(order)}
                                            className="group hover:bg-blue-50/50 transition-all cursor-pointer border-b border-slate-50 last:border-0"
                                        >
                                            <td className="px-6 py-7">
                                                <div className="flex flex-col gap-1.5">
                                                    <div className="flex items-center gap-2">
                                                        <div
                                                            className={`w-7 h-7 rounded-xl flex items-center justify-center shadow-sm ${order.authorization === 'Oui' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}
                                                            title={order.authorization === 'Oui' ? 'Autorisé' : 'En attente'}
                                                        >
                                                            {order.authorization === 'Oui' ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                                                        </div>
                                                        {order.isReadyForDelivery ? (
                                                            <span className="text-[9px] font-black px-2 py-0.5 rounded-lg bg-emerald-600 text-white animate-pulse">PRÊT À LIVRER</span>
                                                        ) : (
                                                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg tracking-wider ${order.deliveryStatus === 'Totale' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                                                                {order.deliveryStatus === 'Totale' ? 'LIVRÉ' : 'EN COURS'}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-7">
                                                <div className="text-[11px] font-black text-blue-600 tracking-tight">{order.refOds || order.ref || "-"}</div>
                                            </td>
                                            <td className="px-6 py-7 text-center">
                                                <div className="flex items-center justify-center gap-1.5" onClick={e => e.stopPropagation()}>
                                                    {hasOds && (
                                                        <button onClick={e => { e.stopPropagation(); openPdf(order.id, 'storage_ods'); }} title="Voir ODS" className="w-8 h-8 flex items-center justify-center transition-all hover:bg-blue-600 hover:text-white text-blue-600 rounded-lg bg-blue-50 border border-blue-100">
                                                            <FileText size={14} />
                                                        </button>
                                                    )}
                                                    {canCreate && (
                                                        <label className="w-8 h-8 flex items-center justify-center cursor-pointer transition-all hover:bg-blue-600 hover:text-white text-blue-400 rounded-lg bg-slate-50 border border-dashed border-slate-300">
                                                            {isUploading ? <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div> : <Upload size={12} />}
                                                            <input type="file" className="hidden" accept=".pdf" onClick={e => e.target.value = null} onChange={e => handleDirectUpload(e, order.id, 'ods')} />
                                                        </label>
                                                    )}
                                                    {!hasOds && !canCreate && <span className="text-slate-200">-</span>}
                                                </div>
                                            </td>
                                            <td className="px-6 py-7">
                                                <div className="text-[11px] font-bold text-indigo-600 tracking-tight">{order.refContract || "-"}</div>
                                            </td>
                                            <td className="px-6 py-7 text-center">
                                                <div className="flex items-center justify-center gap-1.5" onClick={e => e.stopPropagation()}>
                                                    {hasContract && (
                                                        <button onClick={e => { e.stopPropagation(); openPdf(order.id, 'storage_contracts'); }} title="Voir Contrat" className="w-8 h-8 flex items-center justify-center transition-all hover:bg-indigo-600 hover:text-white text-indigo-600 rounded-lg bg-indigo-50 border border-indigo-100">
                                                            <FileCheck size={14} />
                                                        </button>
                                                    )}
                                                    {canCreate && (
                                                        <label className="w-8 h-8 flex items-center justify-center cursor-pointer transition-all hover:bg-indigo-600 hover:text-white text-indigo-400 rounded-lg bg-slate-50 border border-dashed border-slate-300">
                                                            {isUploading ? <div className="w-3 h-3 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div> : <Plus size={12} />}
                                                            <input type="file" className="hidden" accept=".pdf" onClick={e => e.target.value = null} onChange={e => handleDirectUpload(e, order.id, 'contract')} />
                                                        </label>
                                                    )}
                                                    {!hasContract && !canCreate && <span className="text-slate-200">-</span>}
                                                </div>
                                            </td>
                                            <td className="px-6 py-7">
                                                <div className="flex items-center gap-1.5">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isImportLaunched ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-300'}`} title="Import Lancé">
                                                        <Plane size={14} />
                                                    </div>
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isImportCleared ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-300'}`} title="Dédouané">
                                                        <Anchor size={14} />
                                                    </div>
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isStockReceived ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-300'}`} title="Réceptionné">
                                                        <Box size={14} />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-7">
                                                <div className="font-black text-slate-900 uppercase text-[11px] truncate max-w-[180px] tracking-tight" title={order.client}>
                                                    {order.client || "-"}
                                                </div>
                                            </td>
                                            <td className="px-6 py-7">
                                                <div className="text-[11px] font-bold text-slate-600 line-clamp-1 max-w-[250px] leading-relaxed" title={order.object}>
                                                    {order.object || "-"}
                                                </div>
                                            </td>
                                            <td className="px-6 py-7 shrink-0">
                                                <span className="text-xs font-black text-slate-900 whitespace-nowrap bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">{formatAmount(order.amount)}</span>
                                            </td>
                                            <td className="px-6 py-7">
                                                <div className={`p-2 rounded-xl border flex flex-col items-center min-w-[110px] transition-all shadow-sm ${isOverdue ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}`}>
                                                    <span className={`text-[10px] font-black ${isOverdue ? 'text-red-700' : 'text-blue-700'}`}>
                                                        {formatDate(displayEndDate)}
                                                    </span>
                                                    {daysLeft !== null && (
                                                        <span className={`text-[8px] font-black uppercase mt-1 ${isOverdue ? 'text-red-500' : 'text-blue-500'}`}>
                                                            {isOverdue ? `${Math.abs(daysLeft)} j retard` : `${daysLeft} j restants`}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-7 text-right">
                                                <div className="w-9 h-9 bg-slate-900 text-white rounded-xl flex items-center justify-center ml-auto opacity-0 group-hover:opacity-100 transition-all shadow-lg active:scale-90">
                                                    <ArrowRight size={16} />
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <OrderDetailModal
                order={selectedOrder}
                isOpen={!!selectedOrder}
                onClose={() => setSelectedOrder(null)}
                openPdf={openPdf}
                onUpdate={loadOrders}
            />
        </div>
    );
};

export default Dashboard;
