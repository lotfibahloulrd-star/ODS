// Updated by Antigravity on 2026-08-26
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
    'l.naitsidous@esclab-algerie.com',
    'm.berri@esclab-algerie.com'
];

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(() => {
        const saved = localStorage.getItem('current_user');
        return saved ? JSON.parse(saved) : null;
    });

    // Initialise les utilisateurs par défaut si le stockage est vide
    useEffect(() => {
        const stored = localStorage.getItem('ods_users_v7');
        if (!stored) {
            const defaultUsers = [
                { id: 1, firstName: 'Lotfi', lastName: 'Bahloul', email: 'l.bahloul@esclab-algerie.com', division: 'Super-Administrateur', role: 'Super-Administrateur', password: 'Admin123' }
                // ... other default users can be added here
            ];
            localStorage.setItem('ods_users_v7', JSON.stringify(defaultUsers));
        }
    }, []);

    const login = (email, password) => {
        let storedUsersStr = localStorage.getItem('ods_users_v7');
        if (!storedUsersStr) {
            const defaultUsers = [];
            localStorage.setItem('ods_users_v7', JSON.stringify(defaultUsers));
            storedUsersStr = JSON.stringify(defaultUsers);
        }
        const users = JSON.parse(storedUsersStr);
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (!user) return { success: false, message: 'Utilisateur non trouvé' };
        if (user.password !== password) return { success: false, message: 'Mot de passe incorrect' };
        setCurrentUser(user);
        localStorage.setItem('current_user', JSON.stringify(user));
        return { success: true, user };
    };

    const logout = () => {
        setCurrentUser(null);
        localStorage.removeItem('current_user');
    };

    const register = (newUser) => {
        const stored = localStorage.getItem('ods_users_v7');
        const users = stored ? JSON.parse(stored) : [];
        users.push(newUser);
        localStorage.setItem('ods_users_v7', JSON.stringify(users));
        return { success: true };
    };

    // Persist current user in localStorage
    useEffect(() => {
        if (currentUser) {
            localStorage.setItem('current_user', JSON.stringify(currentUser));
        } else {
            localStorage.removeItem('current_user');
        }
    }, [currentUser]);

    // Permission helpers
    const isAdmin = () => currentUser && currentUser.role === 'Administrateur';
    const isSuperAdmin = () => currentUser && currentUser.role === 'Super-Administrateur';
    const hasFullAccess = () => currentUser && FULL_ACCESS_EMAILS.includes(currentUser.email);

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
        const authorized = [
            'l.bahloul@esclab-algerie.com',
            'w.boukacem@esclab-algerie.com',
            's.boukacem@esclab-algerie.com',
            'brikh.hamza@esclab-algerie.com',
            'mazouz.sonia@esclab-algerie.com',
            'belateche.taklit@esclab-algerie.com',
            'n.bouras@esclab-algerie.com'
        ];
        return isAdmin() || authorized.includes(currentUser?.email);
    };

    const canEditAmount = () => {
        const authorized = [
            'l.bahloul@esclab-algerie.com',
            'w.boukacem@esclab-algerie.com',
            's.boukacem@esclab-algerie.com',
            'brikh.hamza@esclab-algerie.com',
            'mazouz.sonia@esclab-algerie.com',
            'belateche.taklit@esclab-algerie.com',
            'n.bouras@esclab-algerie.com'
        ];
        return isAdmin() || authorized.includes(currentUser?.email);
    };

    const canEditAdminFields = () => {
        const authorized = [
            'l.bahloul@esclab-algerie.com',
            'brikh.hamza@esclab-algerie.com',
            'mazouz.sonia@esclab-algerie.com',
            'belateche.taklit@esclab-algerie.com',
            'n.bouras@esclab-algerie.com'
        ];
        return isAdmin() || authorized.includes(currentUser?.email);
    };

    const canExportData = () => {
        const authorized = [
            'l.bahloul@esclab-algerie.com',
            'brikh.hamza@esclab-algerie.com',
            'katia.amkhoukh@esclab-algerie.com'
        ];
        return isSuperAdmin() || authorized.includes(currentUser?.email);
    };

    const canDeleteOds = () => canEditAdminFields();
    const canReplaceOds = () => canEditAdminFields();

    const canDeleteDocuments = () => {
        const authorized = [
            'l.bahloul@esclab-algerie.com',
            'brikh.hamza@esclab-algerie.com',
            'mazouz.sonia@esclab-algerie.com',
            'belateche.taklit@esclab-algerie.com',
            'n.bouras@esclab-algerie.com'
        ];
        return isSuperAdmin() || authorized.includes(currentUser?.email);
    };

    const canUploadDocuments = () => {
        const authorized = ['boumedjmadjen.amina@esclab-algerie.com'];
        return authorized.includes(currentUser?.email);
    };

    const canEditDQE = () => {
        const authorized = ['b.rekkad@esclab-algerie.com'];
        return canEditAdminFields() || authorized.includes(currentUser?.email);
    };

    const canEditProgress = () => {
        const authorized = ['b.rekkad@esclab-algerie.com'];
        return isSuperAdmin() || authorized.includes(currentUser?.email);
    };

    const canViewOrder = (order) => {
        if (currentUser?.email === 'm.aidli@esclab-algerie.com') {
            return true;
        }
        if (hasFullAccess()) return true;
        return order.division === currentUser?.division;
    };

    const changePassword = (newPassword) => {
        if (!currentUser) return false;
        const usersStr = localStorage.getItem('ods_users_v7');
        if (!usersStr) return false;
        const users = JSON.parse(usersStr);
        const idx = users.findIndex(u => u.email === currentUser.email);
        if (idx === -1) return false;
        users[idx].password = newPassword;
        localStorage.setItem('ods_users_v7', JSON.stringify(users));
        const updated = { ...currentUser, password: newPassword };
        setCurrentUser(updated);
        localStorage.setItem('current_user', JSON.stringify(updated));
        return true;
    };

    const resetUserPassword = (email, newPassword) => {
        if (!isSuperAdmin()) return false;
        const usersStr = localStorage.getItem('ods_users_v7');
        if (!usersStr) return false;
        const users = JSON.parse(usersStr);
        const idx = users.findIndex(u => u.email === email);
        if (idx === -1) return false;
        users[idx].password = newPassword;
        localStorage.setItem('ods_users_v7', JSON.stringify(users));
        return true;
    };

    const isFullAccess = currentUser && FULL_ACCESS_EMAILS.includes(currentUser.email);

    return (
        <AuthContext.Provider value={{
            currentUser,
            login,
            logout,
            register,
            isFullAccess,
            isAdmin,
            isSuperAdmin,
            hasFullAccess,
            canViewOrder,
            canCreateOds,
            canEditAmount,
            canEditAdminFields,
            canExportData,
            canDeleteOds,
            canReplaceOds,
            canDeleteDocuments,
            canEditDQE,
            canEditProgress,
            changePassword,
            resetUserPassword,
            isJuridique,
            isImport,
            isStock,
            isRecovery,
            canUploadDocuments
        }}>
            {children}
        </AuthContext.Provider>
    );
};
