let API_URL = process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api` : 'http://localhost:3050/api';
if (API_URL && !API_URL.endsWith('/api')) {
    API_URL = `${API_URL}/api`;
}

export async function getSizeGuides() {
    try {
        const response = await fetch(`${API_URL}/size-guide`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            // Since this is a public page that updates infrequently, revalidate every hour or keep it dynamic
            cache: 'no-store',
        });

        if (!response.ok) {
            throw new Error('Failed to fetch size guides');
        }

        return await response.json();
    } catch (error) {
        console.error('Error in getSizeGuides:', error);
        return []; // Fallback empty array on error
    }
}
