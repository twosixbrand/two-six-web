"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Datos mínimos del cliente almacenados en localStorage.
 * Solo se guardan campos no sensibles necesarios para la UI.
 * Los datos completos (documento, teléfono, dirección) se obtienen vía API autenticada.
 */
interface StoredCustomer {
    id: number;
    name: string;
    email: string;
    is_consignment_ally?: boolean;
}

interface AuthContextType {
    isLoggedIn: boolean;
    userName: string | null;
    customerId: number | null;
    customerEmail: string | null;
    isConsignmentAlly: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    login: (token: string, customerData: any) => void;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Decodifica el payload de un JWT sin verificar la firma (eso lo hace el backend).
 * Se usa solo para verificar si el token ha expirado en el cliente.
 */
function decodeJwtPayload(token: string): { exp?: number } | null {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        const payload = JSON.parse(atob(parts[1]));
        return payload;
    } catch {
        return null;
    }
}

/**
 * Verifica si un JWT ha expirado comparando el campo `exp` con la hora actual.
 * Incluye un margen de 60 segundos para evitar problemas de clock skew.
 */
function isTokenExpired(token: string): boolean {
    const payload = decodeJwtPayload(token);
    if (!payload || !payload.exp) return true; // Sin exp = consideramos expirado
    const nowInSeconds = Math.floor(Date.now() / 1000);
    return nowInSeconds >= payload.exp - 60; // 60s de margen
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userName, setUserName] = useState<string | null>(null);
    const [customerId, setCustomerId] = useState<number | null>(null);
    const [customerEmail, setCustomerEmail] = useState<string | null>(null);
    const [isConsignmentAlly, setIsConsignmentAlly] = useState(false);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('customerToken');
        const customerData = localStorage.getItem('customerData');

        if (token && customerData) {
            // CRIT-04: Verificar que el token no haya expirado
            if (isTokenExpired(token)) {
                // Token expirado — limpiar sesión silenciosamente
                localStorage.removeItem('customerToken');
                localStorage.removeItem('customerData');
                setIsLoggedIn(false);
                setUserName(null);
                setCustomerId(null);
                setCustomerEmail(null);
                setLoading(false);
                return;
            }

            setIsLoggedIn(true);
            try {
                const customer: StoredCustomer = JSON.parse(customerData);
                setUserName(customer.name || "Usuario");
                setCustomerId(customer.id || null);
                setCustomerEmail(customer.email || null);
                setIsConsignmentAlly(!!customer.is_consignment_ally);
            } catch {
                setUserName("Usuario");
            }
        }
        setLoading(false);
    }, []);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const login = (token: string, customerData: any) => {
        localStorage.setItem('customerToken', token);

        // CRIT-05: Solo almacenar campos mínimos no sensibles en localStorage.
        // Datos como documento, teléfono, dirección se obtienen via API autenticada.
        const minimalData: StoredCustomer = {
            id: customerData.id,
            name: customerData.name || "Usuario",
            email: customerData.email || "",
            is_consignment_ally: !!customerData.is_consignment_ally,
        };
        setIsConsignmentAlly(!!customerData.is_consignment_ally);
        localStorage.setItem('customerData', JSON.stringify(minimalData));

        setIsLoggedIn(true);
        setUserName(minimalData.name);
        setCustomerId(minimalData.id);
        setCustomerEmail(minimalData.email);
    };

    const logout = () => {
        localStorage.removeItem('customerToken');
        localStorage.removeItem('customerData');
        setIsLoggedIn(false);
        setUserName(null);
        setCustomerId(null);
        setCustomerEmail(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, userName, customerId, customerEmail, isConsignmentAlly, login, logout, loading }}>
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
