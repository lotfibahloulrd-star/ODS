import React from 'react';
import { LayoutDashboard, FileText, Users, LogOut, Bell, Sparkles } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
    const navItems = [
        { icon: LayoutDashboard, label: 'Tableau de Bord', path: '/' },
        { icon: FileText, label: 'Nouvel ODS', path: '/ods/new' },
        { icon: Users, label: 'Mon Équipe', path: '/users' },
    ];

    return (
        <div className="w-72 h-screen p-6 fixed left-0 top-0 z-20 flex flex-col">
            {/* Container Flottant effet verre */}
            <div className="flex-1 glass rounded-[2.5rem] flex flex-col overflow-hidden shadow-2xl shadow-slate-200/50">

                {/* Header Logo */}
                <div className="p-10 pb-6">
                    <div className="flex items-center gap-4 mb-2 group cursor-pointer">
                        <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl group-hover:rotate-12 transition-all duration-500">
                            <Sparkles size={24} fill="white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none mb-1">
                                ODS <span className="text-blue-600">Pilot</span>
                            </h1>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">v2.9 Premium</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-6 space-y-2 py-4">
                    <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Menu de Navigation</p>
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group ${isActive
                                    ? 'bg-slate-900 text-white shadow-xl shadow-slate-200 scale-[1.05] z-10'
                                    : 'text-slate-500 hover:bg-white hover:text-blue-600 hover:shadow-sm'
                                }`
                            }
                        >
                            <item.icon size={20} className="shrink-0" />
                            <span className="font-black text-xs uppercase tracking-widest">{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* Card Notification "Bubble" */}
                <div className="px-6 mb-6">
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl shadow-blue-200 relative overflow-hidden group hover:scale-[1.02] transition-all cursor-pointer">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700"></div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-3 text-[10px] font-black uppercase tracking-widest">
                                <Bell size={14} /> Alertes Actives
                            </div>
                            <p className="text-xs font-bold leading-relaxed mb-4 text-blue-50">3 échéances critiques arrivent à terme cette semaine.</p>
                            <div className="bg-white/20 backdrop-blur-sm rounded-xl py-3 px-4 text-center text-[10px] font-black uppercase tracking-widest hover:bg-white/30 transition-colors border border-white/20">
                                Analyser
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100/50">
                    <button className="flex items-center justify-center gap-3 w-full px-6 py-4 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all text-[10px] font-black uppercase tracking-[0.2em]">
                        <LogOut size={16} />
                        Déconnexion
                    </button>
                </div>

            </div>
        </div>
    );
};

export default Sidebar;
