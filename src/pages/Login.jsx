import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, AlertCircle, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import logo from '../assets/logo.png';

const Login = () => {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const result = login(email, password);
            if (!result.success) {
                setError(result.message);
            }
        } catch (err) {
            setError("Une erreur est survenue lors de la connexion.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center p-6 relative overflow-hidden font-sans">
            {/* Ambient Background Glows */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-ambient"></div>
            <div className="absolute bottom-10 right-10 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl"></div>

            <div className="max-w-md w-full relative z-10 animate-fade-in">
                <div className="text-center mb-8">
                    <div className="w-24 h-24 bg-white/95 rounded-[2rem] p-4 mx-auto mb-6 shadow-2xl border border-white/20 backdrop-blur-md flex items-center justify-center transform hover:scale-105 transition-transform">
                        <img src={logo} alt="ESCLAB Logo" className="w-full h-full object-contain" />
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tight mb-2">
                        ESCLAB <span className="text-blue-400">Hub</span>
                    </h1>
                    <p className="text-slate-400 font-semibold text-sm">
                        Espace sécurisé de suivi et gestion des ODS
                    </p>
                </div>

                <div className="bg-white/95 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl p-8 md:p-10 border border-white/20">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl text-xs font-extrabold flex items-center gap-3">
                                <AlertCircle size={18} className="shrink-0" />
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-slate-700 font-black text-xs uppercase tracking-widest mb-2.5 ml-1">
                                Adresse Email
                            </label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="votre@email.com"
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50/90 border border-slate-200 rounded-2xl focus:bg-white focus:border-blue-500 transition-all outline-none font-bold text-slate-900 text-sm placeholder:text-slate-300"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-slate-700 font-black text-xs uppercase tracking-widest mb-2.5 ml-1">
                                Mot de passe
                            </label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-12 pr-12 py-3.5 bg-slate-50/90 border border-slate-200 rounded-2xl focus:bg-white focus:border-blue-500 transition-all outline-none font-bold text-slate-900 text-sm placeholder:text-slate-300"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 active:scale-95 transition-all disabled:opacity-50 text-sm uppercase tracking-wider"
                        >
                            {isLoading ? "Connexion en cours..." : "Se connecter"}
                        </button>
                    </form>

                    <div className="mt-8 text-center pt-6 border-t border-slate-100">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100/80 rounded-full text-slate-500 text-[11px] font-bold">
                            <ShieldCheck size={14} className="text-blue-600" />
                            Mot de passe par défaut : <span className="text-blue-600 font-black">user123</span>
                        </div>
                    </div>
                </div>

                <p className="text-center mt-8 text-slate-400 font-semibold text-xs tracking-wide">
                    &copy; {new Date().getFullYear()} ESCLAB-Contract Hub — Plateforme de Gestion ODS
                </p>
            </div>
        </div>
    );
};

export default Login;
