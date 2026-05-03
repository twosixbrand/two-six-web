import '@testing-library/jest-dom';

// Mock next/navigation
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn(),
        replace: jest.fn(),
        prefetch: jest.fn(),
        back: jest.fn(),
    }),
    usePathname: () => '',
    useSearchParams: () => new URLSearchParams(),
}));

// Mock next/image to avoid non-boolean attribute warnings and simplify tests
jest.mock('next/image', () => ({
    __esModule: true,
    default: (props) => {
        // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
        const { fill, priority, unoptimized, ...rest } = props;
        return <img {...rest} />;
    },
}));

// Mock next/link to simplify tests
jest.mock('next/link', () => ({
    __esModule: true,
    default: ({ children, href, ...props }) => {
        return <a href={href} {...props}>{children}</a>;
    },
}));

// Polyfills or mocks can go here
beforeAll(() => {
    // Mock window.scrollTo
    window.scrollTo = jest.fn();

    // Mock for matchMedia which isn't present in JSDOM
    Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
            matches: false,
            media: query,
            onchange: null,
            addListener: jest.fn(), // deprecated
            removeListener: jest.fn(), // deprecated
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            dispatchEvent: jest.fn(),
        })),
    });

    // Mock for IntersectionObserver which isn't present in JSDOM
    class IntersectionObserver {
        observe() { return null; }
        unobserve() { return null; }
        disconnect() { return null; }
    }
    Object.defineProperty(window, 'IntersectionObserver', {
        writable: true,
        configurable: true,
        value: IntersectionObserver,
    });
    Object.defineProperty(global, 'IntersectionObserver', {
        writable: true,
        configurable: true,
        value: IntersectionObserver,
    });

    // Mock for ResizeObserver which isn't present in JSDOM
    class ResizeObserver {
        observe() { return null; }
        unobserve() { return null; }
        disconnect() { return null; }
    }
    Object.defineProperty(window, 'ResizeObserver', {
        writable: true,
        configurable: true,
        value: ResizeObserver,
    });
    Object.defineProperty(global, 'ResizeObserver', {
        writable: true,
        configurable: true,
        value: ResizeObserver,
    });
});
