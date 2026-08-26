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
                { id: 1, firstName: 'Lotfi', lastName: 'Bahloul', email: 'l.bahloul@esclab-algerie.com', division: 'Super-Administrateur', role: 'Super-Administrateur', password: 'Admin123' },
                // ... (autres utilisateurs peuvent être ajoutés ici)
            ];
            localStorage.setItem('ods_users_v7', JSON.stringify(defaultUsers));
        }
    }, []);

    const login = (email, password) => {
        // Utilisation d'un nom de variable unique pour éviter les redéclarations
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
        return { success: true, user };
    };

    const logout = () => {
        setCurrentUser(null);
        localStorage.removeItem('current_user');
    };

    const register = (newUser) => {
        let stored = localStorage.getItem('ods_users_v7');
        let users = stored ? JSON.parse(stored) : [];
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

    const isFullAccess = currentUser && FULL_ACCESS_EMAILS.includes(currentUser.email);

    return (
        <AuthContext.Provider value={{ currentUser, login, logout, register, isFullAccess }}>
            {children}
        </AuthContext.Provider>
    );
};
