"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface AuthContextType {
    isLoggedIn: boolean;
    userName: string | null;
    login: (token: string, customerData: any) => void;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userName, setUserName] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('customerToken');
        const customerData = localStorage.getItem('customerData');

        if (token && customerData) {
            setIsLoggedIn(true);
            try {
                const customer = JSON.parse(customerData);
                setUserName(customer.name || "Usuario");
            } catch {
                setUserName("Usuario");
            }
        }
        setLoading(false);
    }, []);

    const login = (token: string, customerData: any) => {
        localStorage.setItem('customerToken', token);
        localStorage.setItem('customerData', JSON.stringify(customerData));
        setIsLoggedIn(true);
        setUserName(customerData.name || "Usuario");
    };

    const logout = () => {
        localStorage.removeItem('customerToken');
        localStorage.removeItem('customerData');
        setIsLoggedIn(false);
        setUserName(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, userName, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
};
