let API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3050/api';
if (API_URL && !API_URL.endsWith('/api')) {
    API_URL = `${API_URL}/api`;
}

export interface Department {
    id: number;
    name: string;
}

export interface City {
    id: number;
    name: string;
    id_department: number;
    active: boolean;
    shipping_cost: number;
}

export const getDepartments = async (): Promise<Department[]> => {
    const res = await fetch(`${API_URL}/locations/departments`);
    if (!res.ok) throw new Error('Failed to fetch departments');
    return res.json();
};

export const getCities = async (departmentId: number): Promise<City[]> => {
    const response = await fetch(`${API_URL}/locations/cities/${departmentId}?active=true`);
    if (!response.ok) {
        throw new Error('Error loading cities');
    }
    return response.json();
};
