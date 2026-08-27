import React, { useState, useEffect, useMemo } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Dashboard from './pages/Dashboard';
import Ods from './pages/Ods';
import Home from './pages/Home';
import NewOrder from './pages/NewOrder';
import UsersPage from './pages/Users';
import Login from './pages/Login';
import { LayoutDashboard, PlusCircle, Users, LogOut, Key, User, HelpCircle, Search, X, FileText, Home as HomeIcon, TrendingUp } from 'lucide-react';
import './index.css';

import { HashRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import OrderDetails from './pages/OrderDetails';
import ChangePasswordModal from './components/ChangePasswordModal';
import Guide from './pages/Guide';
import ContractStatusPage from './pages/ContractStatusPage';
import Kpis from './pages/Kpis';
import logo from './assets/logo.png';
import { orderService } from './services/orderService';

function AppContent() {
    const { currentUser, logout, changePassword, isAdmin, isSuperAdmin, canCreateOds, canViewOrder } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isPassModalOpen, setIsPassModalOpen] = useState(false);

    const [allOrders, setAllOrders] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isSearchDrawerOpen, setIsSearchDrawerOpen] = useState(false);

    useEffect(() => {
        if (!currentUser) return;
        const loadOrders = async () => {
            try {
                const data = await orderService.getAllOrders();
                setAllOrders(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Global search error:", error);
            }
        };
        loadOrders();
    }, [currentUser, location.pathname]);

    const searchResults = useMemo(() => {
        if (!searchTerm.trim()) return [];
        const term = searchTerm.toLowerCase();
        return allOrders
            .filter(o => !canViewOrder || canViewOrder(o))
            .filter(o => 
                (o.client || "").toLowerCase().includes(term) ||
                (o.object || "").toLowerCase().includes(term) ||
                (o.refOds || o.ref || "").toLowerCase().includes(term) ||
                (o.refContract || "").toLowerCase().includes(term)
            )
            .slice(0, 8);
    }, [allOrders, searchTerm, canViewOrder]);

    if (!currentUser) {
        return <Login />;
    }

    const handleChangePassword = (newPass) => {
        if (changePassword(newPass)) {
            alert("Mot de passe mis à jour avec succès !");
            setIsPassModalOpen(false);
        } else {
            alert("Erreur lors de la mise à jour.");
        }
    };

    const getActiveTab = () => {
        if (location.pathname === '/' || location.pathname === '/home') return 'home';
        if (location.pathname === '/dashboard') return 'dashboard';
        if (location.pathname === '/kpis') return 'kpis';
        if (location.pathname === '/ods') return 'ods';
        if (location.pathname === '/ods/new') return 'new';
        if (location.pathname === '/users') return 'users';
        if (location.pathname === '/guide') return 'guide';
        return '';
    };

    const activeTab = getActiveTab();

    return (
        <div className="min-h-screen bg-slate-50/60 font-sans">
            <ChangePasswordModal 
                isOpen={isPassModalOpen} 
                onClose={() => setIsPassModalOpen(false)} 
                onConfirm={handleChangePassword} 
            />

            {/* Ultra Modern Premium Glass Header */}
            <header className="glass-header sticky top-0 z-50 transition-all duration-300">
                <div className="max-w-[1650px] mx-auto px-6 py-3.5">
                    <div className="flex items-center justify-between gap-4">
                        {/* Brand Logo & Title */}
                        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
                            <div className="p-1.5 bg-white rounded-2xl border border-slate-200/80 shadow-sm group-hover:shadow-md transition-all">
                                <img src={logo} alt="ESCLAB Logo" className="w-auto h-9 object-contain group-hover:scale-105 transition-transform" />
                            </div>
                            <div className="hidden md:block">
                                <h1 className="text-lg font-black text-slate-900 tracking-tight leading-tight">
                                    ESCLAB <span className="text-blue-600">Hub</span>
                                </h1>
                                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                                    Gestion des Engagements
                                </p>
                            </div>
                        </div>

                        {/* Navigation Menu */}
                        <nav className="flex items-center gap-1.5 bg-slate-100/70 p-1.5 rounded-2xl border border-slate-200/60">
                            <button 
                                onClick={() => navigate('/home')} 
                                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-extrabold text-xs tracking-wide transition-all ${activeTab === 'home' ? 'bg-white text-slate-900 shadow-md shadow-slate-200/50' : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'}`}
                            >
                                <HomeIcon size={16} />
                                <span className="hidden sm:inline">Accueil</span>
                            </button>

                            <button 
                                onClick={() => navigate('/dashboard')} 
                                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-extrabold text-xs tracking-wide transition-all ${activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25' : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'}`}
                            >
                                <LayoutDashboard size={16} />
                                <span className="hidden sm:inline">Tableau de Bord</span>
                            </button>

                            <button 
                                onClick={() => navigate('/kpis')} 
                                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-extrabold text-xs tracking-wide transition-all ${activeTab === 'kpis' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25' : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'}`}
                            >
                                <TrendingUp size={16} />
                                <span className="hidden sm:inline">KPIs & Analyses</span>
                            </button>

                            <button 
                                onClick={() => navigate('/ods')} 
                                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-extrabold text-xs tracking-wide transition-all ${activeTab === 'ods' ? 'bg-slate-900 text-white shadow-md shadow-slate-900/25' : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'}`}
                            >
                                <FileText size={16} />
                                <span className="hidden sm:inline">Tableau des contrats</span>
                            </button>

                            {canCreateOds() && (
                                <button
                                    onClick={() => navigate('/ods/new')}
                                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-extrabold text-xs tracking-wide transition-all ${activeTab === 'new' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/25' : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'}`}
                                >
                                    <PlusCircle size={16} />
                                    <span className="hidden sm:inline">Nouveau Contrat</span>
                                </button>
                            )}

                            {isSuperAdmin() && (
                                <button
                                    onClick={() => navigate('/users')}
                                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-extrabold text-xs tracking-wide transition-all ${activeTab === 'users' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'}`}
                                >
                                    <Users size={16} />
                                    <span className="hidden sm:inline">Utilisateurs</span>
                                </button>
                            )}

                            <button 
                                onClick={() => navigate('/guide')} 
                                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-extrabold text-xs tracking-wide transition-all ${activeTab === 'guide' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'}`}
                            >
                                <HelpCircle size={16} />
                                <span className="hidden sm:inline">Aide</span>
                            </button>
                        </nav>

                        {/* Search & User Profile */}
                        <div className="flex items-center gap-2.5">
                            {/* Search Drawer Trigger */}
                            <button 
                                onClick={() => setIsSearchDrawerOpen(true)} 
                                className="w-10 h-10 bg-white hover:bg-blue-50/80 border border-slate-200/80 rounded-xl flex items-center justify-center text-slate-500 hover:text-blue-600 transition-all shadow-sm group"
                                title="Rechercher un ODS"
                            >
                                <Search size={18} className="group-hover:scale-110 transition-transform" />
                            </button>

                            {/* User Profile Info */}
                            <div className="flex items-center gap-2 bg-white/90 p-1 rounded-2xl border border-slate-200/80 shadow-sm">
                                <div className="hidden lg:flex flex-col items-end px-3">
                                    <span className="text-xs font-black text-slate-900 leading-none">{currentUser.firstName} {currentUser.lastName}</span>
                                    <span className="text-[10px] text-blue-600 font-extrabold uppercase tracking-tight mt-0.5">{currentUser.division || 'Opérateur'}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button 
                                        onClick={() => setIsPassModalOpen(true)} 
                                        title="Changer de mot de passe" 
                                        className="w-9 h-9 flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-blue-600 rounded-xl transition-all"
                                    >
                                        <Key size={16} />
                                    </button>
                                    <button 
                                        onClick={logout} 
                                        title="Déconnexion"
                                        className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-xl transition-all group"
                                    >
                                        <LogOut size={16} className="group-hover:scale-110 transition-transform" />
                                        <span className="text-xs font-black uppercase tracking-tight hidden xl:inline">Quitter</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Search Drawer */}
            {isSearchDrawerOpen && (
                <div className="fixed inset-0 z-50 flex animate-fade-in">
                    <div className="bg-white w-96 max-w-full p-6 shadow-2xl overflow-y-auto border-r border-slate-100 flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-lg font-black text-slate-900">Recherche Rapide</h2>
                                <p className="text-xs text-slate-400 font-bold">Retrouvez n'importe quel ODS instantanément</p>
                            </div>
                            <button 
                                onClick={() => setIsSearchDrawerOpen(false)} 
                                className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="relative mb-6">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Client, ODS, contrat, objet..."
                                className="pl-10 pr-4 py-3 w-full border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                autoFocus
                            />
                        </div>

                        <div className="flex-1 overflow-y-auto scrollbar-thin">
                            {searchTerm.trim() ? (
                                searchResults.length === 0 ? (
                                    <div className="p-8 text-center text-xs font-bold text-slate-400 bg-slate-50 rounded-2xl">
                                        Aucun ODS trouvé pour "{searchTerm}"
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {searchResults.map(o => (
                                            <div
                                                key={o.id}
                                                onClick={() => {
                                                    navigate(`/order/${o.id}`);
                                                    setSearchTerm('');
                                                    setIsSearchDrawerOpen(false);
                                                }}
                                                className="p-3 bg-slate-50/80 hover:bg-blue-50/60 border border-slate-100 hover:border-blue-200 rounded-2xl cursor-pointer transition-all group"
                                            >
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="font-extrabold text-xs text-slate-900 group-hover:text-blue-600 transition-colors">
                                                        {o.client || 'Client Inconnu'}
                                                    </span>
                                                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${
                                                        o.status === 'En cours' ? 'bg-blue-100 text-blue-700' :
                                                        o.status === 'En attente de paiement' ? 'bg-amber-100 text-amber-700' :
                                                        o.status === 'Suivi financier' ? 'bg-emerald-100 text-emerald-700' :
                                                        'bg-slate-200 text-slate-700'
                                                    }`}>
                                                        {o.status || 'En cours'}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-500 line-clamp-1 font-medium mb-1">{o.object || 'Sans objet'}</p>
                                                <div className="text-[10px] font-bold text-slate-400">
                                                    Réf: {o.refOds || o.ref || '-'}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )
                            ) : (
                                <div className="p-6 text-center text-slate-400 text-xs font-medium">
                                    Tapez au moins un caractère pour lancer la recherche...
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex-1 bg-slate-900/30 backdrop-blur-xs" onClick={() => setIsSearchDrawerOpen(false)} />
                </div>
            )}

            {/* Main Content Area */}
            <main className="max-w-[1650px] mx-auto px-6 py-8">
                <div className="animate-fade-in min-h-[500px]">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/home" element={<Home />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/kpis" element={<Kpis />} />
                        <Route path="/ods" element={<Ods />} />
                        <Route path="/attribution" element={<ContractStatusPage categoryKey="attribution" />} />
                        <Route path="/nouveaux-contrats" element={<ContractStatusPage categoryKey="nouveaux-contrats" />} />
                        <Route path="/en-attente-ods" element={<ContractStatusPage categoryKey="en-attente-ods" />} />
                        <Route path="/en-cours" element={<ContractStatusPage categoryKey="en-cours" />} />
                        <Route path="/en-attente-paiement" element={<ContractStatusPage categoryKey="en-attente-paiement" />} />
                        <Route path="/suivi-financier" element={<ContractStatusPage categoryKey="suivi-financier" />} />
                        <Route path="/ods/new" element={canCreateOds() ? <NewOrder /> : <div className="text-center py-20 text-slate-400 font-bold">Accès restreint</div>} />
                        <Route path="/users" element={isSuperAdmin() ? <UsersPage /> : <div className="text-center py-20 text-slate-400 font-bold">Accès restreint</div>} />
                        <Route path="/order/:id" element={<OrderDetails />} />
                        <Route path="/guide" element={<Guide />} />
                        {/* Fallback for old tenders route */}
                        <Route path="/tenders" element={<Dashboard />} />
                    </Routes>
                </div>
            </main>
        </div>
    );
}

function App() {
    return (
        <AuthProvider>
            <Router>
                <AppContent />
            </Router>
        </AuthProvider>
    );
}

export default App;

