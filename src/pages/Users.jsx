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
        const saved = localStorage.getItem('ods_users_v6'); // New version
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
        if (confirm('Supprimer cet utilisateur ?')) {
            setUsers(users.filter(u => u.id !== id));
        }
    };

    const getRoleIcon = (role) => {
        switch (role) {
            case ROLES.SUPER_ADMIN: return <Crown size={16} className="text-yellow-600" />;
            case ROLES.ADMIN: return <Shield size={16} className="text-blue-600" />;
            default: return <User size={16} className="text-gray-600" />;
        }
    };

    const getRoleBadgeColor = (role) => {
        switch (role) {
            case ROLES.SUPER_ADMIN: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case ROLES.ADMIN: return 'bg-blue-100 text-blue-800 border-blue-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Équipe & Notifications</h2>
                    <p className="text-gray-600">Gérez les utilisateurs et leurs rôles d'accès</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="btn btn-primary"
                >
                    <UserPlus size={18} />
                    {showForm ? 'Fermer' : 'Ajouter un Utilisateur'}
                </button>
            </div>

            {showForm && (
                <div className="bg-white p-6 rounded-lg shadow-lg border border-blue-100 mb-8">
                    <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Briefcase size={18} className="text-blue-500" /> Nouveau Compte
                    </h3>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
                            <input
                                placeholder="Prénom"
                                value={newUser.firstName}
                                onChange={e => setNewUser({ ...newUser, firstName: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                            <input
                                placeholder="Nom"
                                value={newUser.lastName}
                                onChange={e => setNewUser({ ...newUser, lastName: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email (pour notifs) *</label>
                            <input
                                type="email"
                                placeholder="email@example.com"
                                value={newUser.email}
                                onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                            <input
                                type="tel"
                                placeholder="0550000000"
                                value={newUser.phone}
                                onChange={e => setNewUser({ ...newUser, phone: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Division / Service *</label>
                            <select
                                value={newUser.division}
                                onChange={e => setNewUser({ ...newUser, division: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            >
                                <option value="">Choisir une division...</option>
                                <option value="Division Laboratoire">Division Laboratoire</option>
                                <option value="Division Analytique">Division Analytique</option>
                                <option value="DL et DA">DL et DA</option>
                                <option value="Direction">Direction / Full Access</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Rôle *</label>
                            <select
                                value={newUser.role}
                                onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value={ROLES.USER}>{ROLES.USER}</option>
                                <option value={ROLES.ADMIN}>{ROLES.ADMIN}</option>
                                <option value={ROLES.SUPER_ADMIN}>{ROLES.SUPER_ADMIN}</option>
                            </select>
                        </div>

                        <div className="md:col-span-2 flex justify-end gap-3 mt-2">
                            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                                Annuler
                            </button>
                            <button type="submit" className="btn btn-primary">
                                Enregistrer Utilisateur
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {users.map(user => (
                    <div key={user.id} className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow relative group">
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-700 font-bold text-lg">
                                    {user.firstName[0]}{user.lastName[0]}
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900">{user.firstName} {user.lastName}</h4>
                                    <p className="text-xs text-gray-500">{user.division}</p>
                                </div>
                            </div>
                            <button onClick={() => deleteUser(user.id)} className="text-gray-300 hover:text-red-500 transition-colors p-1">
                                <Trash2 size={16} />
                            </button>
                        </div>

                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border mb-3 ${getRoleBadgeColor(user.role)}`}>
                            {getRoleIcon(user.role)}
                            {user.role}
                        </div>

                        <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                                <Mail size={14} className="text-gray-400" />
                                <span className="truncate">{user.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone size={14} className="text-gray-400" />
                                {user.phone || 'Non renseigné'}
                            </div>
                        </div>

                        {isSuperAdmin() && (
                            <button
                                onClick={() => {
                                    const newPass = prompt(`Nouveau mot de passe pour ${user.firstName} ${user.lastName} :`);
                                    if (newPass && newPass.length >= 4) {
                                        if (resetUserPassword(user.email, newPass)) {
                                            alert("Mot de passe réinitialisé !");
                                            // Refresh local list to be safe
                                            setUsers(JSON.parse(localStorage.getItem('ods_users_v6')));
                                        }
                                    }
                                }}
                                className="mt-4 w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all"
                            >
                                <Key size={14} />
                                Réinitialiser le mot de passe
                            </button>
                        )}
                    </div>
                ))}
            </div>

            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">📋 Permissions par Rôle</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                    <li><strong>Utilisateur :</strong> Consultation uniquement</li>
                    <li><strong>Administrateur :</strong> Modification des ODS + Upload de fichiers</li>
                    <li><strong>Super-Administrateur :</strong> Gestion complète (utilisateurs + ODS)</li>
                </ul>
            </div>
        </div>
    );
};

export default UsersPage;
