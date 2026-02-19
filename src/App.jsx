import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Dashboard from './pages/Dashboard';
import NewOrder from './pages/NewOrder';
import UsersPage from './pages/Users';
import Login from './pages/Login';
import { LayoutDashboard, PlusCircle, Users, LogOut, Key, User } from 'lucide-react';
import './index.css';

import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import OrderDetails from './pages/OrderDetails';

function AppContent() {
    const { currentUser, logout, changePassword, isAdmin, isSuperAdmin, canCreateOds } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    if (!currentUser) {
        return <Login />;
    }

    const handleChangePassword = () => {
        const newPass = prompt("Saisissez votre nouveau mot de passe :");
        if (newPass && newPass.length >= 4) {
            if (changePassword(newPass)) alert("Mot de passe mis à jour avec succès !");
            else alert("Erreur lors de la mise à jour.");
        } else if (newPass) {
            alert("Le mot de passe doit faire au moins 4 caractères.");
        }
    };

    const getActiveTab = () => {
        if (location.pathname === '/') return 'dashboard';
        if (location.pathname === '/ods/new') return 'new';
        if (location.pathname === '/users') return 'users';
        return '';
    };

    const activeTab = getActiveTab();

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Modern Premium Header */}
            <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200">
                <div className="max-w-[1600px] mx-auto px-6 py-4">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2 shrink-0 cursor-pointer" onClick={() => navigate('/')}>
                            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                                <span className="font-black text-xl">O</span>
                            </div>
                            <h1 className="text-xl font-black text-slate-900 tracking-tight hidden md:block">ODS <span className="text-blue-600">PILOT</span> <span className="text-[10px] font-bold text-slate-400 align-top">v3.6</span></h1>
                        </div>

                        <nav className="flex items-center bg-slate-100/50 p-1.5 rounded-2xl border border-slate-100 overflow-x-auto no-scrollbar">
                            <button
                                onClick={() => navigate('/')}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black transition-all whitespace-nowrap ${activeTab === 'dashboard' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                            >
                                <LayoutDashboard size={18} />
                                <span className="hidden sm:inline">Tableau de Bord</span>
                            </button>
                            {canCreateOds() && (
                                <button
                                    onClick={() => navigate('/ods/new')}
                                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black transition-all whitespace-nowrap ${activeTab === 'new' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                                >
                                    <PlusCircle size={18} />
                                    <span className="hidden sm:inline">Nouvel ODS</span>
                                </button>
                            )}
                            {isSuperAdmin() && (
                                <button
                                    onClick={() => navigate('/users')}
                                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black transition-all whitespace-nowrap ${activeTab === 'users' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                                >
                                    <Users size={18} />
                                    <span className="hidden sm:inline">Utilisateurs</span>
                                </button>
                            )}
                        </nav>

                        {/* User Profile & Actions */}
                        <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100 shrink-0">
                            <div className="hidden lg:flex flex-col items-end px-3">
                                <span className="text-xs font-black text-slate-900 leading-none mb-0.5">{currentUser.firstName} {currentUser.lastName}</span>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{currentUser.division}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <button onClick={handleChangePassword} title="Changer de mot de passe" className="w-10 h-10 flex items-center justify-center hover:bg-white hover:text-blue-600 text-slate-400 rounded-xl transition-all">
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
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/ods/new" element={canCreateOds() ? <NewOrder onSave={() => navigate('/')} /> : <div className="text-center py-20 text-slate-400">Accès restreint</div>} />
                        <Route path="/users" element={isSuperAdmin() ? <UsersPage /> : <div className="text-center py-20 text-slate-400">Accès restreint</div>} />
                        <Route path="/order/:id" element={<OrderDetails />} />
                    </Routes>
                </div>
            </main>
        </div>
    );
}

function App() {
    return (
        <AuthProvider>
            <Router basename={import.meta.env.BASE_URL || '/'}>
                <AppContent />
            </Router>
        </AuthProvider>
    );
}

export default App;
