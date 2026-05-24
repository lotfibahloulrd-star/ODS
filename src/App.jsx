import React, { useState, useEffect, useMemo } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import NewOrder from './pages/NewOrder';
import UsersPage from './pages/Users';
import Login from './pages/Login';
import { LayoutDashboard, PlusCircle, Users, LogOut, Key, User, Briefcase, HelpCircle, Search } from 'lucide-react';
import './index.css';

import { HashRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import OrderDetails from './pages/OrderDetails';
import Tenders from './pages/Tenders';
import ChangePasswordModal from './components/ChangePasswordModal';
import Guide from './pages/Guide';
import logo from './assets/logo.png';
import { orderService } from './services/orderService';

function AppContent() {
    const { currentUser, logout, changePassword, isAdmin, isSuperAdmin, canCreateOds, canViewOrder } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isPassModalOpen, setIsPassModalOpen] = useState(false);

    const [allOrders, setAllOrders] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isSearchFocused, setIsSearchFocused] = useState(false);

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
    
    // Extract query params
    const searchParams = new URL(window.location.href).searchParams;
    const statusParam = searchParams.get('status');
    const authParam = searchParams.get('auth');

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
        if (location.pathname === '/ods/new') return 'new';
        if (location.pathname === '/users') return 'users';
        if (location.pathname === '/tenders') return 'tenders';
        if (location.pathname === '/guide') return 'guide';
        return '';
    };

    const activeTab = getActiveTab();

    return (
        <div className="min-h-screen bg-slate-50">
            <ChangePasswordModal 
                isOpen={isPassModalOpen} 
                onClose={() => setIsPassModalOpen(false)} 
                onConfirm={handleChangePassword} 
            />

            {/* Modern Premium Header */}
            <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200">
                <div className="max-w-[1600px] mx-auto px-6 py-4">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2 shrink-0 cursor-pointer" onClick={() => navigate('/')}>
                            <img src={logo} alt="ESCLAB Logo" className="w-auto h-12 object-contain" />
                            <h1 className="text-xl font-black text-slate-900 tracking-tight hidden md:block">ESCLAB-Contract <span className="text-blue-600">Hub</span> <span className="text-[10px] font-bold text-slate-400 align-top">v4.5</span></h1>
                        </div>

                        {/* Global Search Bar */}
                        <div className="relative flex-1 max-w-xs md:max-w-sm hidden sm:block z-30">
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={16} />
                                <input
                                    type="text"
                                    placeholder="Rechercher un ODS, un client, un contrat..."
                                    className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full w-full shadow-sm focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all outline-none text-xs text-slate-600 font-medium"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onFocus={() => setIsSearchFocused(true)}
                                    onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                                />
                            </div>
                            {isSearchFocused && searchTerm.trim() && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-100 shadow-2xl overflow-hidden max-h-80 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200 z-[100]">
                                    {searchResults.length === 0 ? (
                                        <div className="p-4 text-center text-xs font-bold text-slate-400 uppercase">Aucun ODS trouvé</div>
                                    ) : (
                                        <div className="divide-y divide-slate-50">
                                            {searchResults.map(o => (
                                                <div
                                                    key={o.id}
                                                    onClick={() => {
                                                        navigate(`/order/${o.id}`);
                                                        setSearchTerm("");
                                                    }}
                                                    className="p-4 hover:bg-slate-50 transition-colors cursor-pointer text-left"
                                                >
                                                    <div className="flex justify-between items-start gap-2">
                                                        <span className="font-black text-slate-900 text-xs uppercase truncate max-w-[180px]">
                                                            {o.client || "Client Inconnu"}
                                                        </span>
                                                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider shrink-0 ${
                                                            o.status === 'En cours' ? 'bg-blue-50 text-blue-600' :
                                                            (o.status === 'En attente de paiement' || o.status === 'Suivi financier') ? 'bg-amber-50 text-amber-600' :
                                                            'bg-slate-50 text-slate-500'
                                                        }`}>
                                                            {o.status || 'En cours'}
                                                        </span>
                                                    </div>
                                                    <div className="text-[10px] text-slate-500 font-bold uppercase mt-1 truncate">
                                                        {o.refOds || o.ref || "Sans Référence"} | {o.refContract || "Sans Contrat"}
                                                    </div>
                                                    {o.object && (
                                                        <div className="text-[9px] text-slate-400 truncate mt-0.5">
                                                            {o.object}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <nav className="hidden md:flex items-center gap-1 bg-slate-100/50 p-1 rounded-2xl border border-slate-200">
                            <button 
                                onClick={() => navigate('/dashboard')} 
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-600 hover:bg-white'}`}
                            >
                                <LayoutDashboard size={18} />
                                <span className="hidden lg:inline">Tableau ODS</span>
                            </button>
                            
                            <button 
                                onClick={() => navigate('/tenders')} 
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'tenders' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-600 hover:bg-white'}`}
                            >
                                <Briefcase size={18} />
                                <span className="hidden lg:inline">Appels d'Offres</span>
                            </button>

                            {canCreateOds() && (
                                <button
                                    onClick={() => navigate('/ods/new')}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'new' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30' : 'text-slate-600 hover:bg-white'}`}
                                >
                                    <PlusCircle size={18} />
                                    <span className="hidden lg:inline">Nouvel ODS</span>
                                </button>
                            )}

                            {isSuperAdmin() && (
                                <button
                                    onClick={() => navigate('/users')}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'users' ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/30' : 'text-slate-600 hover:bg-white'}`}
                                >
                                    <Users size={18} />
                                    <span className="hidden lg:inline">Utilisateurs</span>
                                </button>
                            )}

                            <button 
                                onClick={() => navigate('/guide')} 
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'guide' ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/30' : 'text-slate-600 hover:bg-white'}`}
                            >
                                <HelpCircle size={18} />
                                <span className="hidden lg:inline">Aide</span>
                            </button>
                        </nav>

                        {/* User Profile & Actions */}
                        <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100 shrink-0">
                            <div className="hidden lg:flex flex-col items-end px-3">
                                <span className="text-xs font-black text-slate-900 leading-none mb-0.5">{currentUser.firstName} {currentUser.lastName}</span>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{currentUser.division}</span>
                                <span className="text-[10px] opacity-30 font-black ml-2">V4.5-DEPLOY</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <button onClick={() => setIsPassModalOpen(true)} title="Changer de mot de passe" className="w-10 h-10 flex items-center justify-center hover:bg-white hover:text-blue-600 text-slate-400 rounded-xl transition-all">
                                    <Key size={18} />
                                </button>
                                <button onClick={logout} className="flex items-center gap-2 px-4 py-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-xl transition-all group">
                                    <LogOut size={18} className="group-hover:scale-110 transition-transform" />
                                    <span className="text-xs font-black uppercase tracking-tight hidden sm:inline">Déconnexion</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="max-w-[1600px] mx-auto px-6 py-10">
                <div className="animate-fade-in min-h-[400px]">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/home" element={<Home />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/tenders" element={<Tenders />} />
                        <Route path="/ods/new" element={canCreateOds() ? <NewOrder onSave={() => navigate('/dashboard')} /> : <div className="text-center py-20 text-slate-400">Accès restreint</div>} />
                        <Route path="/users" element={isSuperAdmin() ? <UsersPage /> : <div className="text-center py-20 text-slate-400">Accès restreint</div>} />
                        <Route path="/order/:id" element={<OrderDetails />} />
                        <Route path="/guide" element={<Guide />} />
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
