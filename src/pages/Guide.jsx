import React, { useState } from 'react';
import { 
    HelpCircle, 
    BookOpen, 
    Briefcase, 
    LayoutDashboard, 
    MessageSquare, 
    Users, 
    ShieldCheck, 
    FileText, 
    Send,
    CheckCircle2,
    Lock,
    Calculator,
    ChevronRight,
    ArrowRight,
    Plus,
    FileUp,
    Bell
} from 'lucide-react';

const Guide = () => {
    const [activeSection, setActiveSection] = useState('intro');

    const sections = [
        { id: 'intro', title: 'Introduction', icon: <BookOpen size={18} /> },
        { id: 'tenders', title: "Appels d'Offres", icon: <Briefcase size={18} /> },
        { id: 'ods', title: 'Gestion ODS', icon: <LayoutDashboard size={18} /> },
        { id: 'messaging', title: 'Messagerie', icon: <MessageSquare size={18} /> },
        { id: 'roles', title: 'Rôles & Accès', icon: <ShieldCheck size={18} /> },
    ];

    const renderContent = () => {
        switch (activeSection) {
            case 'intro':
                return (
                    <div className="space-y-10 animate-in fade-in duration-500">
                        <div className="space-y-4">
                            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Bienvenue sur ESCLAB Contract Hub</h2>
                            <p className="text-lg text-slate-500 leading-relaxed max-w-3xl">
                                Cette plateforme centralise la gestion des contrats, de la phase de soumission (Appels d'Offres) jusqu'à l'exécution et le suivi des Ordres de Service (ODS).
                            </p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="p-8 bg-indigo-50 rounded-[2.5rem] border border-indigo-100">
                                <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-200">
                                    <Briefcase size={24} />
                                </div>
                                <h3 className="text-xl font-black text-slate-900 mb-2">Division Commerciale</h3>
                                <p className="text-sm text-slate-600 font-medium">Gestion complète des Appels d'Offres (CDC), soumissions techniques et financières, et suivi des marchés.</p>
                            </div>
                            <div className="p-8 bg-blue-50 rounded-[2.5rem] border border-blue-100">
                                <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-200">
                                    <LayoutDashboard size={24} />
                                </div>
                                <h3 className="text-xl font-black text-slate-900 mb-2">Gestion des ODS</h3>
                                <p className="text-sm text-slate-600 font-medium">Suivi des ordres de service, facturation, paiements, et archivage des documents contractuels.</p>
                            </div>
                        </div>
                    </div>
                );
            case 'tenders':
                return (
                    <div className="space-y-12 animate-in fade-in duration-500">
                        <div className="space-y-4">
                            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Workflow des Appels d'Offres</h2>
                            <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                                <Users size={16} /> Workflow Collaboratif (Équipe Commerciale)
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="relative pl-12 border-l-2 border-slate-100 space-y-12 pb-8">
                                <div className="relative">
                                    <div className="absolute -left-[60px] top-0 w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-black text-sm shadow-lg shadow-indigo-200">1</div>
                                    <h4 className="text-lg font-black text-slate-900 mb-2 uppercase">Initialisation du Dossier</h4>
                                    <p className="text-sm text-slate-500 font-medium">La coordinatrice (Imene) crée le dossier CDC, uploader le document source et assigne les technico-commerciaux ou assistantes concernés.</p>
                                </div>
                                <div className="relative">
                                    <div className="absolute -left-[60px] top-0 w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-black text-sm shadow-lg shadow-indigo-200">2</div>
                                    <h4 className="text-lg font-black text-slate-900 mb-2 uppercase">Réponse de l'Équipe</h4>
                                    <p className="text-sm text-slate-500 font-medium">Chaque intervenant assigné doit uploader deux fichiers : son **Offre Technique** et son **Offre Financière** (format PDF ou XLSX).</p>
                                    <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4 text-xs font-bold text-slate-600">
                                        <CheckCircle2 size={16} className="text-emerald-500" /> État Orange = En attente | État Vert = Soumis
                                    </div>
                                </div>
                                <div className="relative">
                                    <div className="absolute -left-[60px] top-0 w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-black text-sm shadow-lg shadow-indigo-200">3</div>
                                    <h4 className="text-lg font-black text-slate-900 mb-2 uppercase">Offre Commerciale détaillée</h4>
                                    <p className="text-sm text-slate-500 font-medium">En plus des fichiers, l'équipe saisit ligne par ligne les articles dans le **Tableau des Items** (Désignation, Marque, Prix HT/TTC, Origine).</p>
                                </div>
                                <div className="relative">
                                    <div className="absolute -left-[60px] top-0 w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-black text-sm shadow-lg shadow-indigo-200">4</div>
                                    <h4 className="text-lg font-black text-slate-900 mb-2 uppercase">Compilation & Attribution</h4>
                                    <p className="text-sm text-slate-500 font-medium">La coordinatrice utilise les fonctions **Compiler Tech/Fin** pour regrouper les travaux. Une fois l'offre globale validée, elle met à jour le statut (Adjugé ou Perdu).</p>
                                </div>
                                <div className="relative">
                                    <div className="absolute -left-[60px] top-0 w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center text-white font-black text-sm shadow-lg">5</div>
                                    <h4 className="text-lg font-black text-slate-900 mb-2 uppercase">Suivi du Marché</h4>
                                    <p className="text-sm text-slate-500 font-medium">Si adjugé, la section **Service des Marchés** apparaît pour le suivi administratif : N° Contrat, ODS, Arrêt/Reprise et Échéance de livraison.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'ods':
                return (
                    <div className="space-y-10 animate-in fade-in duration-500">
                        <div className="space-y-4">
                            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Gestion des Ordres de Service (ODS)</h2>
                            <p className="text-sm text-slate-500 font-medium">C'est le cœur opérationnel pour le suivi des dossiers en cours d'exécution.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
                                <Plus size={20} className="text-emerald-500 mb-4" />
                                <h4 className="text-sm font-black text-slate-900 uppercase mb-2">Création</h4>
                                <p className="text-[11px] text-slate-500 font-medium">Remplissez le formulaire avec la référence ODS, le montant HT/TTC et le client.</p>
                            </div>
                            <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
                                <FileUp size={20} className="text-blue-500 mb-4" />
                                <h4 className="text-sm font-black text-slate-900 uppercase mb-2">Pièces Jointes</h4>
                                <p className="text-[11px] text-slate-500 font-medium">Uploadez les factures, PV de réception et chèques directement dans le dossier.</p>
                            </div>
                            <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
                                <Calculator size={20} className="text-indigo-500 mb-4" />
                                <h4 className="text-sm font-black text-slate-900 uppercase mb-2">Paiements</h4>
                                <p className="text-[11px] text-slate-500 font-medium">Enregistrez les tranches de paiement pour suivre le reste à recouvrer en temps réel.</p>
                            </div>
                        </div>

                        <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white">
                            <h4 className="text-lg font-black uppercase mb-4 flex items-center gap-2">
                                <Lock size={18} className="text-indigo-400" /> Verrouillage de l'ODS
                            </h4>
                            <p className="text-sm text-slate-400 font-medium leading-relaxed">
                                Un ODS est considéré comme "Terminé" une fois que le paiement total est encaissé et que tous les documents (PV, Chèque) sont présents.
                            </p>
                        </div>
                    </div>
                );
            case 'messaging':
                return (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        <div className="space-y-4">
                            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Messagerie Interne</h2>
                            <p className="text-sm text-slate-500 font-medium">Communiquez efficacement avec vos collègues autour des dossiers.</p>
                        </div>
                        
                        <div className="space-y-6">
                            <div className="flex gap-6 items-start">
                                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
                                    <MessageSquare size={24} />
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-lg font-black text-slate-900 uppercase">Discussions de Groupe</h4>
                                    <p className="text-sm text-slate-500 font-medium">Sélectionnez un ou plusieurs collaborateurs pour lancer une discussion. Les fils sont séparés par groupes pour plus de clarté.</p>
                                </div>
                            </div>
                            <div className="flex gap-6 items-start">
                                <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center shrink-0">
                                    <Bell size={24} />
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-lg font-black text-slate-900 uppercase">Notifications</h4>
                                    <p className="text-sm text-slate-500 font-medium">Un badge rouge sur l'icône de messagerie vous indique les nouveaux messages non lus.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'roles':
                return (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        <div className="space-y-4">
                            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Rôles & Permissions</h2>
                            <p className="text-sm text-slate-500 font-medium">L'accès aux fonctionnalités dépend de votre profil utilisateur.</p>
                        </div>

                        <div className="space-y-4">
                            <div className="p-6 bg-white border border-slate-100 rounded-3xl flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black">SA</div>
                                    <div>
                                        <p className="text-sm font-black text-slate-900 uppercase">Super Administrateur</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Contrôle Total + Gestion des Comptes</p>
                                    </div>
                                </div>
                                <ShieldCheck className="text-slate-900" size={20} />
                            </div>
                            <div className="p-6 bg-white border border-slate-100 rounded-3xl flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-black">CO</div>
                                    <div>
                                        <p className="text-sm font-black text-slate-900 uppercase">Coordinatrice (Imene)</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Pilotage Appels d'Offres + Validation Marchés</p>
                                    </div>
                                </div>
                                <ShieldCheck className="text-indigo-600" size={20} />
                            </div>
                            <div className="p-6 bg-white border border-slate-100 rounded-3xl flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center font-black">US</div>
                                    <div>
                                        <p className="text-sm font-black text-slate-900 uppercase">Collaborateur (Commercial)</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Dépôt d'offres + Saisie Items + Consultation ODS</p>
                                    </div>
                                </div>
                                <ShieldCheck className="text-slate-300" size={20} />
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="max-w-7xl mx-auto py-10 px-6">
            <div className="flex flex-col md:flex-row gap-12">
                {/* Sidebar Navigation */}
                <div className="w-full md:w-64 space-y-6 shrink-0">
                    <div className="flex items-center gap-3 px-4 mb-8">
                        <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                            <HelpCircle size={20} />
                        </div>
                        <h1 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Guide <span className="text-blue-600">User</span></h1>
                    </div>
                    
                    <nav className="space-y-1">
                        {sections.map(section => (
                            <button
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}
                                className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                                    activeSection === section.id 
                                    ? 'bg-blue-600 text-white shadow-xl shadow-blue-100 translate-x-2' 
                                    : 'text-slate-500 hover:bg-slate-100'
                                }`}
                            >
                                {section.icon}
                                {section.title}
                            </button>
                        ))}
                    </nav>

                    <div className="mt-20 p-6 bg-slate-900 rounded-[2.5rem] text-white">
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Besoin d'aide ?</p>
                        <p className="text-[11px] font-bold text-slate-400 mb-4 leading-relaxed">Pour toute question technique ou bug, contactez le support ESCLAB.</p>
                        <a href="mailto:support@esclab-algerie.com" className="text-xs font-black text-white hover:underline flex items-center gap-2">
                            Contact Support <ArrowRight size={14} />
                        </a>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 min-h-[600px]">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default Guide;
