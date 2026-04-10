import { middleware } from '../src/middleware';
import { NextRequest, NextResponse } from 'next/server';

// Mock NextResponse
jest.mock('next/server', () => ({
    NextResponse: {
        next: jest.fn().mockReturnValue({ headers: new Map() }),
        redirect: jest.fn().mockReturnValue({ status: 307 })
    }
}));

describe('Middleware', () => {
    it('returns next() for normal requests', () => {
        const mockRequest = {
            nextUrl: { 
                pathname: '/catalog',
                clone: () => ({ 
                    pathname: '/catalog',
                    clone: jest.fn()
                })
            },
            url: 'http://localhost/catalog',
            headers: new Map()
        } as any;

        middleware(mockRequest);
        expect(NextResponse.next).toHaveBeenCalled();
    });
});
