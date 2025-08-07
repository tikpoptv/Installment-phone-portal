import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock environment variables
vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:3000');
vi.stubEnv('VITE_GET_FETCH_ERROR', 'false');

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    pathname: '/',
    href: 'http://localhost:3000',
  },
  writable: true,
});

// Mock window.dispatchEvent
window.dispatchEvent = vi.fn();

// Mock console methods to reduce noise in tests
Object.defineProperty(window, 'console', {
  value: {
    ...console,
    error: vi.fn(),
    warn: vi.fn(),
  },
  writable: true,
}); 