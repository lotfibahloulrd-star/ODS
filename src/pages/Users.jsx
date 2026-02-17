import React, { useState, useEffect } from 'react';
import { UserPlus, Mail, Phone, Briefcase, Trash2, Shield, User, Crown, Key } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ROLES = {
    USER: 'Utilisateur',
    ADMIN: 'Administrateur',
    SUPER_ADMIN: 'Super-Administrateur'
};

const UsersPage = () => {
    const { resetUserPassword, isSuperAdmin } = useAuth();
    const [users, setUsers] = useState(() => {
        const saved = localStorage.getItem('ods_users_v6');
        return saved ? JSON.parse(saved) : [
            { id: 1, firstName: 'Lotfi', lastName: 'Bahloul', email: 'l.bahloul@esclab-algerie.com', division: 'Super-Administrateur', role: ROLES.SUPER_ADMIN, password: 'user123' },
            { id: 2, firstName: 'Ali', lastName: 'Ouali', email: 'a.ouali@esclab-algerie.com', division: 'Administrateur', role: ROLES.ADMIN, password: 'user123' },
            { id: 3, firstName: 'Wissem', lastName: 'Boukacem', email: 'w.boukacem@esclab-algerie.com', division: 'Juriste', role: ROLES.USER, password: 'user123' },
            { id: 4, firstName: 'Selma', lastName: 'Boukacem', email: 's.boukacem@esclab-algerie.com', division: 'Juriste', role: ROLES.USER, password: 'user123' },
            { id: 5, firstName: 'Hamza', lastName: 'Brikh', email: 'brikh.hamza@esclab-algerie.com', division: 'Responsable des marchés', role: ROLES.USER, password: 'user123' },
            { id: 6, firstName: 'Katia', lastName: 'Amkhoukh', email: 'katia.amkhoukh@esclab-algerie.com', division: 'Responsable importations', role: ROLES.USER, password: 'user123' },
            { id: 7, firstName: 'Leila', lastName: 'Mayout', email: 'l.mayout@esclab-algerie.com', division: 'Responsable importations', role: ROLES.USER, password: 'user123' },
            { id: 8, firstName: 'Bellal', lastName: 'Rekkad', email: 'b.rekkad@esclab-algerie.com', division: 'Responsable stock division laboratoire', role: ROLES.USER, password: 'user123' },
            { id: 9, firstName: 'El Yazid', lastName: 'Saci', email: 'e.saci@esclab-algerie.com', division: 'Responsable stock division analytique', role: ROLES.USER, password: 'user123' },
            { id: 10, firstName: 'Tarek', lastName: 'Ait El Hocine', email: 't.aitelhocine@esclab-algerie.com', division: 'Division Analytique', role: ROLES.ADMIN, password: 'user123' },
            { id: 11, firstName: 'Farid', lastName: 'Taazibt', email: 'f.taazibt@esclab-algerie.com', division: 'Division Laboratoire', role: ROLES.ADMIN, password: 'user123' }
        ];
    });

    const [showForm, setShowForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [newUser, setNewUser] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        division: '',
        role: ROLES.USER,
        password: 'user123'
    });

    useEffect(() => {
        localStorage.setItem('ods_users_v6', JSON.stringify(users));
    }, [users]);

    const filteredUsers = users.filter(u =>
        u.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!newUser.firstName || !newUser.email) return;

        setUsers([{ ...newUser, id: Date.now() }, ...users]);
        setNewUser({
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            division: '',
            role: ROLES.USER,
            password: 'user123'
        });
        setShowForm(false);
    };

    const deleteUser = (id) => {
        if (confirm('Supprimer cet collaborateur ?')) {
            setUsers(users.filter(u => u.id !== id));
        }
    };

    const getRoleIcon = (role) => {
        switch (role) {
            case ROLES.SUPER_ADMIN: return <Crown size={14} className="text-amber-600" />;
            case ROLES.ADMIN: return <Shield size={14} className="text-blue-600" />;
            default: return <User size={14} className="text-slate-500" />;
        }
    };

    const getRoleBadgeColor = (role) => {
        switch (role) {
            case ROLES.SUPER_ADMIN: return 'bg-amber-50 text-amber-700 border-amber-200';
            case ROLES.ADMIN: return 'bg-blue-50 text-blue-700 border-blue-200';
            default: return 'bg-slate-50 text-slate-600 border-slate-200';
        }
    };

    return (
        <div className="space-y-10 animate-fade-in">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Gestion d'Équipe</h2>
                    <p className="text-slate-500 font-bold flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                        Administration des accès et privilèges collaborateurs
                    </p>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:flex-none">
                        <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Rechercher un membre..."
                            className="pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-2xl w-full md:w-64 shadow-sm focus:ring-4 focus:ring-blue-100 transition-all outline-none font-bold text-slate-700"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-3 shadow-lg ${showForm ? 'bg-slate-900 text-white shadow-slate-200' : 'bg-blue-600 text-white shadow-blue-200 hover:bg-blue-700'}`}
                    >
                        {showForm ? <Briefcase size={18} /> : <UserPlus size={18} />}
                        {showForm ? 'Annuler' : 'Nouveau Compte'}
                    </button>
                </div>
            </div>

            {/* New User Form Section */}
            {showForm && (
                <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl p-10 animate-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-100">
                            <UserPlus size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Créer un nouveau profil</h3>
                            <p className="text-xs text-slate-500 font-bold">Remplissez les informations obligatoires ci-dessous</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Prénom</label>
                            <input
                                placeholder="ex: Jean"
                                className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-blue-500 transition-all outline-none font-bold text-slate-900"
                                value={newUser.firstName}
                                onChange={e => setNewUser({ ...newUser, firstName: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nom de famille</label>
                            <input
                                placeholder="ex: DUPONT"
                                className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-blue-500 transition-all outline-none font-bold text-slate-900"
                                value={newUser.lastName}
                                onChange={e => setNewUser({ ...newUser, lastName: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Adresse Email Professionnelle</label>
                            <input
                                type="email"
                                placeholder="email@esclab.dz"
                                className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-blue-500 transition-all outline-none font-bold text-slate-900"
                                value={newUser.email}
                                onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pôle / Division d'Affectation</label>
                            <select
                                value={newUser.division}
                                onChange={e => setNewUser({ ...newUser, division: e.target.value })}
                                className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-blue-500 transition-all outline-none font-bold text-slate-900"
                                required
                            >
                                <option value="">Choisir une division...</option>
                                <option value="Division Laboratoire">Division Laboratoire</option>
                                <option value="Division Analytique">Division Analytique</option>
                                <option value="DL et DA">DL et DA</option>
                                <option value="Direction">Direction</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Niveau d'Autorisation</label>
                            <select
                                value={newUser.role}
                                onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                                className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-blue-500 transition-all outline-none font-bold text-slate-900"
                            >
                                <option value={ROLES.USER}>{ROLES.USER}</option>
                                <option value={ROLES.ADMIN}>{ROLES.ADMIN}</option>
                                <option value={ROLES.SUPER_ADMIN}>{ROLES.SUPER_ADMIN}</option>
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button type="submit" className="w-full bg-slate-900 text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all">
                                Confirmer la création
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Users Table Card */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Collaborateur</th>
                                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Division / Service</th>
                                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Niveau d'Accès</th>
                                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Contact</th>
                                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-right text-slate-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-8 py-20 text-center text-slate-400 font-bold">
                                        <User size={48} className="mx-auto mb-4 opacity-20" />
                                        Aucun membre trouvé
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map(user => (
                                    <tr key={user.id} className="group hover:bg-blue-50/30 transition-all">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-900 to-blue-900 flex items-center justify-center text-white font-black text-xs shadow-lg group-hover:scale-110 transition-transform">
                                                    {user.firstName[0]}{user.lastName[0]}
                                                </div>
                                                <div>
                                                    <div className="font-black text-slate-900 text-sm tracking-tight">{user.firstName} {user.lastName}</div>
                                                    <div className="text-[10px] font-bold text-blue-600 uppercase tracking-tighter">Profil Actif</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest">{user.division}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-sm ${getRoleBadgeColor(user.role)}`}>
                                                {getRoleIcon(user.role)}
                                                {user.role}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                                <Mail size={14} className="text-slate-300" />
                                                {user.email}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {isSuperAdmin() && (
                                                    <button
                                                        onClick={() => {
                                                            const newPass = prompt(`Nouveau mot de passe pour ${user.firstName} :`);
                                                            if (newPass && newPass.length >= 4) {
                                                                if (resetUserPassword(user.email, newPass)) {
                                                                    alert("Mot de passe mis à jour avec succès !");
                                                                    setUsers(JSON.parse(localStorage.getItem('ods_users_v6')) || users);
                                                                }
                                                            }
                                                        }}
                                                        className="w-9 h-9 flex items-center justify-center bg-white border border-slate-200 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                                        title="Changer mot de passe"
                                                    >
                                                        <Key size={14} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => deleteUser(user.id)}
                                                    className="w-9 h-9 flex items-center justify-center bg-white border border-slate-200 text-slate-300 hover:text-red-600 hover:border-red-100 transition-all shadow-sm"
                                                    title="Supprimer collaborateur"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Role Permissions Card */}
            <div className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-slate-900/20">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 blur-[100px] rounded-full -mr-32 -mt-32"></div>
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-10">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 text-slate-500 font-black text-[10px] uppercase tracking-[0.2em] mb-4">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span> User
                        </div>
                        <h4 className="text-sm font-black uppercase tracking-widest text-white">Consultation</h4>
                        <p className="text-slate-400 text-xs leading-relaxed font-bold">Peut visualiser les ODS et documents, mais ne peut modifier aucune donnée.</p>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 text-blue-500 font-black text-[10px] uppercase tracking-[0.2em] mb-4">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Admin
                        </div>
                        <h4 className="text-sm font-black uppercase tracking-widest text-white">Gestion Opérationnelle</h4>
                        <p className="text-slate-400 text-xs leading-relaxed font-bold">Modification des ODS, upload de fichiers et suivi de l'import/stock.</p>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 text-amber-500 font-black text-[10px] uppercase tracking-[0.2em] mb-4">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Super Admin
                        </div>
                        <h4 className="text-sm font-black uppercase tracking-widest text-white">Full Control</h4>
                        <p className="text-slate-400 text-xs leading-relaxed font-bold">Accès total, incluant la gestion des comptes utilisateurs et la purge système.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UsersPage;
