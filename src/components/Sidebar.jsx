import React from 'react';
import { LayoutDashboard, FileText, Users, LogOut, Bell, Sparkles } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
    const navItems = [
        { icon: LayoutDashboard, label: 'Tableau de Bord', path: '/' },
        { icon: FileText, label: 'Mes ODS', path: '/ods/new' }, // Changed to verify navigation
        { icon: Users, label: 'Mon Équipe', path: '/users' },
    ];

    return (
        <div className="w-72 h-screen p-4 fixed left-0 top-0 z-20 flex flex-col">
            {/* Container Flottant effet verre */}
            <div className="flex-1 glass-panel rounded-3xl flex flex-col overflow-hidden">

                {/* Header Logo */}
                <div className="p-8 pb-4">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                            <Sparkles size={20} fill="white" />
                        </div>
                        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-800 to-indigo-800">
                            ODS Pilot
                        </h1>
                    </div>
                    <p className="text-xs text-slate-500 font-medium ml-1">Gestion Intelligente v2.0</p>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-4 space-y-2">
                    <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Menu Principal</p>
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group ${isActive
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-[1.02]'
                                    : 'text-slate-500 hover:bg-blue-50/80 hover:text-blue-700'
                                }`
                            }
                        >
                            <item.icon size={22} className={({ isActive }) => isActive ? "animate-pulse" : ""} />
                            <span className="font-semibold">{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* Card Notification "Bubble" */}
                <div className="p-4">
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden group hover:scale-[1.02] transition-transform cursor-pointer">
                        {/* Decorative circles */}
                        <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-8 -mt-8"></div>
                        <div className="absolute bottom-0 left-0 w-10 h-10 bg-white/10 rounded-full -ml-5 -mb-5"></div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-2 font-semibold">
                                <Bell size={18} /> Rappels
                            </div>
                            <p className="text-sm text-indigo-100 mb-3">3 échéances arrivent à terme cette semaine.</p>
                            <div className="bg-white/20 backdrop-blur-sm rounded-lg py-2 px-3 text-center text-xs font-bold hover:bg-white/30 transition-colors">
                                Voir les détails
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100">
                    <button className="flex items-center justify-center gap-2 w-full px-4 py-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all text-sm font-semibold">
                        <LogOut size={18} />
                        Se déconnecter
                    </button>
                </div>

            </div>
        </div>
    );
};

export default Sidebar;
