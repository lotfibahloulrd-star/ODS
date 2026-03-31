import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../services/orderService';
import { useAuth } from '../context/AuthContext';
import { 
    Clock, 
    ArrowRight, 
    CreditCard, 
    PlayCircle, 
    Package, 
    UserCheck,
    AlertTriangle,
    LayoutDashboard,
    Zap,
    Search,
    ChevronRight
} from 'lucide-react';

const Home = () => {
    const navigate = useNavigate();
    const auth = useAuth();
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const loadCounts = async () => {
            try {
                const data = await orderService.getAllOrders();
                setOrders(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Home: Error loading counts:", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadCounts();
    }, []);

    const stats = useMemo(() => {
        const byStatus = {
            'En attente de paiement': orders.filter(o => o.status === 'En attente de paiement').length,
            'En cours': orders.filter(o => o.status === 'En cours' || !o.status).length,
            'En attente d\'ODS': orders.filter(o => o.status === 'En attente d\'ODS').length,
            'Attribution en attente': orders.filter(o => o.status === 'Attribution en attente').length
        };
        
        const total = orders.length;
        const pendingAuth = orders.filter(o => o.authorization !== 'Oui').length;
        const overdue = orders.filter(order => {
            const start = order.startDate || order.dateOds;
            const delay = order.delay;
            let endDate = order.endDate;

            if (!endDate && start && delay) {
                const date = new Date(start);
                const daysToAdd = parseInt(delay);
                if (!isNaN(date.getTime()) && !isNaN(daysToAdd)) {
                    date.setDate(date.getDate() + daysToAdd);
                    if (order.stopDate) {
                        const stop = new Date(order.stopDate);
                        const resume = order.resumeDate ? new Date(order.resumeDate) : new Date();
                        if (!isNaN(stop.getTime())) {
                            const effectiveResume = !isNaN(resume.getTime()) ? resume : new Date();
                            if (effectiveResume > stop) {
                                date.setDate(date.getDate() + Math.ceil((effectiveResume - stop) / (1000 * 60 * 60 * 24)));
                            }
                        }
                    }
                    endDate = date.toISOString().split('T')[0];
                }
            }
            if (!endDate) return false;
            const target = new Date(endDate);
            const today = order.deliveryDate ? new Date(order.deliveryDate) : new Date();
            today.setHours(0, 0, 0, 0);
            target.setHours(0, 0, 0, 0);
            return !isNaN(target.getTime()) && target < today;
        }).length;
        
        return { byStatus, total, pendingAuth, overdue };
    }, [orders]);

    const filterButtons = [
        { 
            label: 'En attente de paiement', 
            status: 'En attente de paiement',
            icon: <CreditCard size={32} />, 
            color: 'from-amber-500 to-orange-600', 
            shadow: 'shadow-orange-200',
            description: 'Engagements validés en attente de règlement'
        },
        { 
            label: 'En cours', 
            status: 'En cours',
            icon: <PlayCircle size={32} />, 
            color: 'from-blue-500 to-indigo-600', 
            shadow: 'shadow-blue-200',
            description: 'Projets actifs et livraisons programmées'
        },
        { 
            label: 'En attente d\'ODS', 
            status: 'En attente d\'ODS',
            icon: <Package size={32} />, 
            color: 'from-purple-500 to-fuchsia-600', 
            shadow: 'shadow-fuchsia-200',
            description: 'Contrats signés en attente de l\'ordre de service'
        },
        { 
            label: 'Attribution en attente', 
            status: 'Attribution en attente',
            icon: <UserCheck size={32} />, 
            color: 'from-slate-600 to-slate-800', 
            shadow: 'shadow-slate-300',
            description: 'Consultations en cours de validation finale'
        }
    ];

    const quickFilters = [
        { label: 'Tous les ODS', type: 'all', icon: <LayoutDashboard size={20} />, count: stats.total, color: 'text-blue-600 bg-blue-50' },
        { label: 'Attente Autorisation', type: 'auth', icon: <Zap size={20} />, count: stats.pendingAuth, color: 'text-amber-600 bg-amber-50' },
        { label: 'Engagements Hors Délai', type: 'overdue', icon: <AlertTriangle size={20} />, count: stats.overdue, color: 'text-red-600 bg-red-50' }
    ];

    const handleNavigation = (status = null, authFilter = false, overdueFilter = false) => {
        let path = '/dashboard';
        const params = new URLSearchParams();
        if (status) params.append('status', status);
        if (authFilter) params.append('auth', 'true');
        if (overdueFilter) params.append('overdue', 'true');
        if (searchQuery) params.append('search', searchQuery);
        
        const queryString = params.toString();
        navigate(queryString ? `${path}?${queryString}` : path);
    };

    const handleQuickSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            handleNavigation();
        }
    };

    return (
        <div className="max-w-[1200px] mx-auto py-12 px-6">
            <header className="text-center mb-12 animate-in fade-in slide-in-from-top-8 duration-700">
                <h1 className="text-5xl font-black text-slate-900 tracking-tight mb-4 uppercase">
                    Portail de Gestion <span className="text-blue-600">ODS</span>
                </h1>
                <p className="text-lg text-slate-500 font-bold max-w-2xl mx-auto leading-relaxed">
                    Accédez instantanément à vos dossiers et pilotez vos projets en temps réel.
                </p>
            </header>

            {/* Search Panel */}
            <div className="max-w-3xl mx-auto mb-16 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150">
                <form onSubmit={handleQuickSearch} className="group relative">
                    <div className="absolute inset-0 bg-blue-600/5 rounded-[2.5rem] blur-2xl group-focus-within:bg-blue-600/10 transition-all duration-500"></div>
                    <div className="relative flex items-center bg-white/80 backdrop-blur-xl border-2 border-white shadow-2xl rounded-[2.5rem] p-2 focus-within:border-blue-100 transition-all duration-300">
                        <div className="pl-6 pr-4 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                            <Search size={28} strokeWidth={2.5} />
                        </div>
                        <input 
                            type="text" 
                            placeholder="Rechercher un ODS, un client ou une référence..."
                            className="flex-1 bg-transparent border-none focus:ring-0 text-xl font-bold text-slate-800 placeholder:text-slate-300 placeholder:font-bold py-5"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button 
                            type="submit"
                            className="bg-slate-900 hover:bg-blue-600 text-white px-8 py-5 rounded-[2.2rem] font-black uppercase text-sm tracking-widest transition-all shadow-lg active:scale-95 flex items-center gap-2"
                        >
                            Chercher <ChevronRight size={18} />
                        </button>
                    </div>
                </form>
            </div>

            {/* Quick Summary Row */}
            <div className="flex justify-center gap-4 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 flex-wrap">
                {quickFilters.map((q, idx) => (
                    <button
                        key={idx}
                        onClick={() => handleNavigation(null, q.type === 'auth', q.type === 'overdue')}
                        className={`flex items-center gap-3 px-6 py-3 rounded-2xl border border-transparent shadow-sm hover:shadow-md transition-all active:scale-95 ${q.color} font-black uppercase text-xs`}
                    >
                        {q.icon}
                        <span>{q.label}</span>
                        <span className="bg-white/50 px-2 py-0.5 rounded-lg text-[10px]">{q.count}</span>
                    </button>
                ))}
            </div>

            {/* Main Status Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {filterButtons.map((btn, idx) => (
                    <button
                        key={btn.label}
                        onClick={() => handleNavigation(btn.status)}
                        className={`group relative flex flex-col items-start p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 text-left overflow-hidden animate-in fade-in zoom-in-95 duration-700`}
                        style={{ animationDelay: `${idx * 100 + 200}ms` }}
                    >
                        {/* Background Decoration */}
                        <div className={`absolute -right-8 -top-8 w-48 h-48 bg-gradient-to-br ${btn.color} opacity-5 group-hover:opacity-10 rounded-full transition-all duration-700 group-hover:scale-150`}></div>
                        
                        <div className={`w-16 h-16 bg-gradient-to-br ${btn.color} ${btn.shadow} rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                            {btn.icon}
                        </div>
                        
                        <div className="mb-2">
                            <h2 className="text-2xl font-black text-slate-900 leading-tight uppercase tracking-tight group-hover:text-blue-600 transition-colors">
                                {btn.label}
                            </h2>
                        </div>
                        
                        <p className="text-slate-400 font-bold text-sm mb-8 leading-relaxed max-w-[80%]">
                            {btn.description}
                        </p>
                        
                        <div className="mt-auto flex items-center justify-between w-full">
                            <div className="flex items-center gap-2">
                                <span className={`text-4xl font-black ${btn.color.split(' ')[0].replace('from-', 'text-')}`}>
                                    {isLoading ? '...' : stats.byStatus[btn.status] || 0}
                                </span>
                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-2 px-3 py-1 border border-slate-100 rounded-full">Dossiers</span>
                            </div>
                            
                            <div className={`w-12 h-12 rounded-full border border-slate-100 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900 transition-all duration-500`}>
                                <ArrowRight size={24} className="-rotate-45 group-hover:rotate-0 transition-transform duration-500" />
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            <footer className="mt-20 text-center animate-in fade-in duration-1000 delay-500">
                <div className="inline-flex items-center gap-4 bg-slate-100/50 px-6 py-3 rounded-2xl border border-slate-100">
                    <AlertTriangle className="text-amber-500" size={20} />
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                        Système de pilotage centralisé <span className="text-slate-300 mx-2">|</span> Accès sécurisé
                    </span>
                </div>
            </footer>
        </div>
    );
};

export default Home;
