import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock axios module
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
    })),
  },
}));

describe('API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      },
      writable: true,
    });
  });

  describe('Environment Variables', () => {
    it('ควรใช้ environment variables ที่ถูกต้อง', () => {
      // ตรวจสอบว่า environment variables ถูกตั้งค่าใน setup.ts
      expect(import.meta.env.VITE_API_BASE_URL).toBeDefined();
      expect(import.meta.env.VITE_GET_FETCH_ERROR).toBeDefined();
    });
  });

  describe('LocalStorage Mock', () => {
    it('ควร mock localStorage ได้ถูกต้อง', () => {
      const mockGetItem = vi.fn().mockReturnValue('test-token');
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: mockGetItem,
          setItem: vi.fn(),
          removeItem: vi.fn(),
          clear: vi.fn(),
        },
        writable: true,
      });

      expect(window.localStorage.getItem('auth_token')).toBe('test-token');
      expect(mockGetItem).toHaveBeenCalledWith('auth_token');
    });
  });

  describe('Window Location Mock', () => {
    it('ควร mock window.location ได้ถูกต้อง', () => {
      expect(window.location.pathname).toBe('/');
      expect(window.location.href).toBe('http://localhost:3000');
    });
  });

  describe('Window DispatchEvent Mock', () => {
    it('ควร mock window.dispatchEvent ได้ถูกต้อง', () => {
      const mockDispatchEvent = vi.fn();
      Object.defineProperty(window, 'dispatchEvent', {
        value: mockDispatchEvent,
        writable: true,
      });

      const event = new Event('test-event');
      window.dispatchEvent(event);
      
      expect(mockDispatchEvent).toHaveBeenCalledWith(event);
    });
  });
}); 