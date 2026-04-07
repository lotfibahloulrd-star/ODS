import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

const FULL_ACCESS_EMAILS = [
    'l.bahloul@esclab-algerie.com',
    'a.ouali@esclab-algerie.com',
    'w.boukacem@esclab-algerie.com',
    's.boukacem@esclab-algerie.com',
    'brikh.hamza@esclab-algerie.com',
    'katia.amkhoukh@esclab-algerie.com',
    'l.mayout@esclab-algerie.com',
    'b.rekkad@esclab-algerie.com',
    'e.saci@esclab-algerie.com',
    'mazouz.sonia@esclab-algerie.com',
    'belateche.taklit@esclab-algerie.com',
    'n.bouras@esclab-algerie.com',
    'm.aidli@esclab-algerie.com'
];

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(() => {
        const saved = localStorage.getItem('current_user');
        return saved ? JSON.parse(saved) : null;
    });

    // Synchronisation intelligente de la base d'utilisateurs
    useEffect(() => {
        const usersStr = localStorage.getItem('ods_users_v7');
        let currentUsers = usersStr ? JSON.parse(usersStr) : [];

        const defaultUsers = [
            { id: 1, firstName: 'Lotfi', lastName: 'Bahloul', email: 'l.bahloul@esclab-algerie.com', division: 'Super-Administrateur', role: 'Super-Administrateur', password: 'Admin123' },
            { id: 2, firstName: 'Ali', lastName: 'Ouali', email: 'a.ouali@esclab-algerie.com', division: 'Administrateur', role: 'Administrateur', password: 'user123' },
            { id: 3, firstName: 'Wissem', lastName: 'Boukacem', email: 'w.boukacem@esclab-algerie.com', division: 'Juriste', role: 'Utilisateur', password: 'user123' },
            { id: 4, firstName: 'Selma', lastName: 'Boukacem', email: 's.boukacem@esclab-algerie.com', division: 'Juriste', role: 'Utilisateur', password: 'user123' },
            { id: 5, firstName: 'Hamza', lastName: 'Brikh', email: 'brikh.hamza@esclab-algerie.com', division: 'Responsable des marchés', role: 'Utilisateur', password: 'user123' },
            { id: 6, firstName: 'Katia', lastName: 'Amkhoukh', email: 'katia.amkhoukh@esclab-algerie.com', division: 'Responsable importations', role: 'Utilisateur', password: 'user123' },
            { id: 7, firstName: 'Leila', lastName: 'Mayout', email: 'l.mayout@esclab-algerie.com', division: 'Responsable importations', role: 'Utilisateur', password: 'user123' },
            { id: 8, firstName: 'Bellal', lastName: 'Rekkad', email: 'b.rekkad@esclab-algerie.com', division: 'Responsable stock division laboratoire', role: 'Utilisateur', password: 'user123' },
            { id: 9, firstName: 'El Yazid', lastName: 'Saci', email: 'e.saci@esclab-algerie.com', division: 'Responsable stock division analytique', role: 'Utilisateur', password: 'user123' },
            { id: 10, firstName: 'Tarek', lastName: 'Ait El Hocine', email: 't.aitelhocine@esclab-algerie.com', division: 'Division Analytique', role: 'Administrateur', password: 'user123' },
            { id: 11, firstName: 'Farid', lastName: 'Taazibt', email: 'f.taazibt@esclab-algerie.com', division: 'Division Laboratoire', role: 'Administrateur', password: 'user123' },
            { id: 12, firstName: 'Sonia', lastName: 'Mazouz', email: 'mazouz.sonia@esclab-algerie.com', division: 'Administrateur', role: 'Administrateur', password: 'user123' },
            { id: 13, firstName: 'Taklit', lastName: 'Belateche', email: 'belateche.taklit@esclab-algerie.com', division: 'Administrateur', role: 'Administrateur', password: 'user123' },
            { id: 14, firstName: 'N.', lastName: 'Bouras', email: 'n.bouras@esclab-algerie.com', division: 'Administrateur', role: 'Administrateur', password: 'user123' },
            { id: 15, firstName: 'Melissa', lastName: 'Aidli', email: 'm.aidli@esclab-algerie.com', division: 'Recouvrement', role: 'Utilisateur', password: 'user123' }
        ];

        let hasChanges = false;
        defaultUsers.forEach(defUser => {
            const index = currentUsers.findIndex(u => u.email.toLowerCase() === defUser.email.toLowerCase());
            if (index === -1) {
                currentUsers.push(defUser);
                hasChanges = true;
            } else if (defUser.email === 'l.bahloul@esclab-algerie.com' && currentUsers[index].password !== defUser.password) {
                // Force le mot de passe admin s'il est modifié dans le code
                currentUsers[index].password = defUser.password;
                hasChanges = true;
            }
        });

        if (hasChanges || !usersStr) {
            localStorage.setItem('ods_users_v7', JSON.stringify(currentUsers));
        }
    }, []);

    const login = (email, password) => {
        let usersStr = localStorage.getItem('ods_users_v7');

        // Sécurité supplémentaire : Initialisation forcée au moment du login si vide
        if (!usersStr) {
            const defaultUsers = [
                { id: 1, firstName: 'Lotfi', lastName: 'Bahloul', email: 'l.bahloul@esclab-algerie.com', division: 'Super-Administrateur', role: 'Super-Administrateur', password: 'Admin123' },
                { id: 2, firstName: 'Ali', lastName: 'Ouali', email: 'a.ouali@esclab-algerie.com', division: 'Administrateur', role: 'Administrateur', password: 'user123' },
                { id: 3, firstName: 'Wissem', lastName: 'Boukacem', email: 'w.boukacem@esclab-algerie.com', division: 'Juriste', role: 'Utilisateur', password: 'user123' },
                { id: 4, firstName: 'Selma', lastName: 'Boukacem', email: 's.boukacem@esclab-algerie.com', division: 'Juriste', role: 'Utilisateur', password: 'user123' },
                { id: 5, firstName: 'Hamza', lastName: 'Brikh', email: 'brikh.hamza@esclab-algerie.com', division: 'Responsable des marchés', role: 'Utilisateur', password: 'user123' },
                { id: 6, firstName: 'Katia', lastName: 'Amkhoukh', email: 'katia.amkhoukh@esclab-algerie.com', division: 'Responsable importations', role: 'Utilisateur', password: 'user123' },
                { id: 7, firstName: 'Leila', lastName: 'Mayout', email: 'l.mayout@esclab-algerie.com', division: 'Responsable importations', role: 'Utilisateur', password: 'user123' },
                { id: 8, firstName: 'Bellal', lastName: 'Rekkad', email: 'b.rekkad@esclab-algerie.com', division: 'Responsable stock division laboratoire', role: 'Utilisateur', password: 'user123' },
                { id: 9, firstName: 'El Yazid', lastName: 'Saci', email: 'e.saci@esclab-algerie.com', division: 'Responsable stock division analytique', role: 'Utilisateur', password: 'user123' },
                { id: 10, firstName: 'Tarek', lastName: 'Ait El Hocine', email: 't.aitelhocine@esclab-algerie.com', division: 'Division Analytique', role: 'Administrateur', password: 'user123' },
                { id: 11, firstName: 'Farid', lastName: 'Taazibt', email: 'f.taazibt@esclab-algerie.com', division: 'Division Laboratoire', role: 'Administrateur', password: 'user123' },
                { id: 12, firstName: 'Sonia', lastName: 'Mazouz', email: 'mazouz.sonia@esclab-algerie.com', division: 'Administrateur', role: 'Administrateur', password: 'user123' },
                { id: 13, firstName: 'Taklit', lastName: 'Belateche', email: 'belateche.taklit@esclab-algerie.com', division: 'Administrateur', role: 'Administrateur', password: 'user123' },
                { id: 14, firstName: 'N.', lastName: 'Bouras', email: 'n.bouras@esclab-algerie.com', division: 'Administrateur', role: 'Administrateur', password: 'user123' },
                { id: 15, firstName: 'Melissa', lastName: 'Aidli', email: 'm.aidli@esclab-algerie.com', division: 'Recouvrement', role: 'Utilisateur', password: 'user123' }
            ];
            localStorage.setItem('ods_users_v7', JSON.stringify(defaultUsers));
            usersStr = JSON.stringify(defaultUsers);
        }

        const users = JSON.parse(usersStr);
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

        if (!user) return { success: false, message: "Utilisateur non trouvé" };
        if (user.password !== password) return { success: false, message: "Mot de passe incorrect" };

        setCurrentUser(user);
        localStorage.setItem('current_user', JSON.stringify(user));
        return { success: true };
    };

    const changePassword = (newPassword) => {
        if (!currentUser) return false;

        const usersStr = localStorage.getItem('ods_users_v7');
        if (!usersStr) return false;

        const users = JSON.parse(usersStr);
        const userIndex = users.findIndex(u => u.email === currentUser.email);

        if (userIndex === -1) return false;

        users[userIndex].password = newPassword;
        localStorage.setItem('ods_users_v7', JSON.stringify(users));

        const updatedUser = { ...currentUser, password: newPassword };
        setCurrentUser(updatedUser);
        localStorage.setItem('current_user', JSON.stringify(updatedUser));
        return true;
    };

    const resetUserPassword = (email, newPassword) => {
        if (!isSuperAdmin()) return false;

        const usersStr = localStorage.getItem('ods_users_v7');
        if (!usersStr) return false;

        const users = JSON.parse(usersStr);
        const userIndex = users.findIndex(u => u.email === email);

        if (userIndex === -1) return false;

        users[userIndex].password = newPassword;
        localStorage.setItem('ods_users_v7', JSON.stringify(users));
        return true;
    };

    const logout = () => {
        setCurrentUser(null);
        localStorage.removeItem('current_user');
    };

    const isAdmin = () => {
        return currentUser?.role === 'Administrateur' || currentUser?.role === 'Super-Administrateur';
    };

    const isSuperAdmin = () => {
        return currentUser?.role === 'Super-Administrateur';
    };

    const hasFullAccess = () => {
        return FULL_ACCESS_EMAILS.includes(currentUser?.email);
    };

    const isJuridique = () => {
        const emails = ['w.boukacem@esclab-algerie.com', 's.boukacem@esclab-algerie.com', 'brikh.hamza@esclab-algerie.com'];
        return isSuperAdmin() || emails.includes(currentUser?.email);
    };

    const isImport = () => {
        const emails = ['katia.amkhoukh@esclab-algerie.com', 'l.mayout@esclab-algerie.com'];
        return isSuperAdmin() || emails.includes(currentUser?.email);
    };

    const isStock = () => {
        const emails = ['b.rekkad@esclab-algerie.com', 'e.saci@esclab-algerie.com'];
        return isSuperAdmin() || emails.includes(currentUser?.email);
    };

    const isRecovery = () => {
        const emails = ['m.aidli@esclab-algerie.com'];
        return isSuperAdmin() || emails.includes(currentUser?.email);
    };

    const canCreateOds = () => {
        const authorizedEmails = [
            'l.bahloul@esclab-algerie.com',
            'w.boukacem@esclab-algerie.com',
            's.boukacem@esclab-algerie.com',
            'brikh.hamza@esclab-algerie.com',
            'mazouz.sonia@esclab-algerie.com',
            'belateche.taklit@esclab-algerie.com',
            'n.bouras@esclab-algerie.com'
        ];
        return isSuperAdmin() || authorizedEmails.includes(currentUser?.email);
    };

    const canEditAmount = () => {
        const authorizedEmails = [
            'l.bahloul@esclab-algerie.com',
            'w.boukacem@esclab-algerie.com',
            's.boukacem@esclab-algerie.com',
            'brikh.hamza@esclab-algerie.com',
            'mazouz.sonia@esclab-algerie.com',
            'belateche.taklit@esclab-algerie.com',
            'n.bouras@esclab-algerie.com'
        ];
        return isSuperAdmin() || authorizedEmails.includes(currentUser?.email);
    };

    const canViewOrder = (order) => {
        if (hasFullAccess()) return true;
        return order.division === currentUser?.division;
    };

    const canEditAdminFields = () => {
        const authorizedEmails = [
            'l.bahloul@esclab-algerie.com',
            'brikh.hamza@esclab-algerie.com',
            'mazouz.sonia@esclab-algerie.com',
            'belateche.taklit@esclab-algerie.com',
            'n.bouras@esclab-algerie.com'
        ];
        return isSuperAdmin() || authorizedEmails.includes(currentUser?.email);
    };

    const canExportData = () => {
        const authorizedEmails = [
            'l.bahloul@esclab-algerie.com',
            'brikh.hamza@esclab-algerie.com'
        ];
        return isSuperAdmin() || authorizedEmails.includes(currentUser?.email);
    };

    return (
        <AuthContext.Provider value={{ currentUser, login, logout, isAdmin, isSuperAdmin, hasFullAccess, canViewOrder, canCreateOds, canEditAmount, canEditAdminFields, canExportData, changePassword, resetUserPassword, isJuridique, isImport, isStock, isRecovery }}>
            {children}
        </AuthContext.Provider>
    );
};
