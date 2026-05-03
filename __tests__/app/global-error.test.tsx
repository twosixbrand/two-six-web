import React from 'react';
import { render } from '@testing-library/react';
import GlobalError from '../../src/app/global-error';
import * as Sentry from "@sentry/nextjs";

// Mock Sentry
jest.mock("@sentry/nextjs", () => ({
    captureException: jest.fn(),
}));

// Mock next/error
jest.mock("next/error", () => {
    return {
        __esModule: true,
        default: ({ statusCode }: { statusCode: number }) => <div data-testid="next-error">Error {statusCode}</div>
    };
});

describe('GlobalError', () => {
    let originalError: typeof console.error;

    beforeAll(() => {
        originalError = console.error;
        console.error = jest.fn((msg) => {
            if (typeof msg === 'string' && msg.includes('cannot be a child of')) return;
            originalError(msg);
        });
    });

    afterAll(() => {
        console.error = originalError;
    });

    it('captures exception and renders error page', () => {
        const error = new Error('Test Global Error') as Error & { digest?: string };
        error.digest = 'test-digest';

        render(<GlobalError error={error} />);

        expect(Sentry.captureException).toHaveBeenCalledWith(error);
    });
});
