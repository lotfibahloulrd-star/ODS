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
    'e.saci@esclab-algerie.com'
];

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(() => {
        const saved = localStorage.getItem('current_user');
        return saved ? JSON.parse(saved) : null;
    });

    const login = (email, password) => {
        const usersStr = localStorage.getItem('ods_users_v6');
        if (!usersStr) return { success: false, message: "Base d'utilisateurs introuvable" };

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

        const usersStr = localStorage.getItem('ods_users_v6');
        if (!usersStr) return false;

        const users = JSON.parse(usersStr);
        const userIndex = users.findIndex(u => u.email === currentUser.email);

        if (userIndex === -1) return false;

        users[userIndex].password = newPassword;
        localStorage.setItem('ods_users_v6', JSON.stringify(users));

        const updatedUser = { ...currentUser, password: newPassword };
        setCurrentUser(updatedUser);
        localStorage.setItem('current_user', JSON.stringify(updatedUser));
        return true;
    };

    const resetUserPassword = (email, newPassword) => {
        if (!isSuperAdmin()) return false;

        const usersStr = localStorage.getItem('ods_users_v6');
        if (!usersStr) return false;

        const users = JSON.parse(usersStr);
        const userIndex = users.findIndex(u => u.email === email);

        if (userIndex === -1) return false;

        users[userIndex].password = newPassword;
        localStorage.setItem('ods_users_v6', JSON.stringify(users));
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

    const canViewOrder = (order) => {
        if (hasFullAccess()) return true;
        return order.division === currentUser?.division;
    };

    return (
        <AuthContext.Provider value={{ currentUser, login, logout, isAdmin, isSuperAdmin, hasFullAccess, canViewOrder, changePassword, resetUserPassword, isJuridique, isImport, isStock }}>
            {children}
        </AuthContext.Provider>
    );
};
