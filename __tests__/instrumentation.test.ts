import * as Sentry from "@sentry/nextjs";

jest.mock("@sentry/nextjs", () => ({
    init: jest.fn(),
    replayIntegration: jest.fn(),
    captureRouterTransitionStart: jest.fn(),
    captureRequestError: jest.fn(),
}));

describe('instrumentation', () => {
    let originalEnv: NodeJS.ProcessEnv;

    beforeAll(() => {
        originalEnv = process.env;
        // Mock dynamic imports
        jest.mock('../sentry.server.config', () => ({}), { virtual: true });
        jest.mock('../sentry.edge.config', () => ({}), { virtual: true });
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('handles register for nodejs runtime', async () => {
        process.env.NEXT_RUNTIME = 'nodejs';
        const { register } = require('../src/instrumentation');
        await register();
    });

    it('handles register for edge runtime', async () => {
        process.env.NEXT_RUNTIME = 'edge';
        const { register } = require('../src/instrumentation');
        await register();
    });

    it('onRequestError ignores NEXT_REDIRECT and NEXT_NOT_FOUND', () => {
        const { onRequestError } = require('../src/instrumentation');
        
        onRequestError(new Error('NEXT_REDIRECT'), {}, {});
        expect(Sentry.captureRequestError).not.toHaveBeenCalled();

        onRequestError(new Error('NEXT_NOT_FOUND'), {}, {});
        expect(Sentry.captureRequestError).not.toHaveBeenCalled();
    });

    it('onRequestError captures other errors', () => {
        const { onRequestError } = require('../src/instrumentation');
        const realError = new Error('Real error');
        onRequestError(realError, { url: '/test' }, { some: 'context' });
        expect(Sentry.captureRequestError).toHaveBeenCalledWith(realError, { url: '/test' }, { some: 'context' });
    });
});

describe('instrumentation-client', () => {
    it('initializes Sentry when imported', () => {
        jest.isolateModules(() => {
            require('../src/instrumentation-client');
            expect(Sentry.init).toHaveBeenCalledWith(expect.objectContaining({
                dsn: expect.any(String),
                sendDefaultPii: true
            }));
        });
    });
});
