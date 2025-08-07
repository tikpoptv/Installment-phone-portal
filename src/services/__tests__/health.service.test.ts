import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getHealth } from '../health.service';

// Mock apiClient
vi.mock('../api', () => ({
  default: {
    get: vi.fn(),
  },
}));

describe('Health Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('ควรเรียก getHealth และคืนค่าข้อมูลสุขภาพของระบบ', async () => {
    const mockHealthResponse = {
      status: 'healthy',
      timestamp: '2024-01-15T10:30:00.000Z',
    };

    const mockApiResponse = {
      data: mockHealthResponse,
      status: 200,
      message: 'OK',
    };

    const apiClient = (await import('../api')).default;
    vi.mocked(apiClient.get).mockResolvedValue(mockApiResponse);

    const result = await getHealth();

    expect(apiClient.get).toHaveBeenCalledWith('/api/health');
    expect(result).toEqual(mockHealthResponse);
  });

  it('ควรจัดการ error เมื่อ API call ล้มเหลว', async () => {
    const mockError = new Error('Network error');
    
    const apiClient = (await import('../api')).default;
    vi.mocked(apiClient.get).mockRejectedValue(mockError);

    await expect(getHealth()).rejects.toThrow('Network error');
    expect(apiClient.get).toHaveBeenCalledWith('/api/health');
  });

  it('ควรคืนค่า HealthResponse ที่มีโครงสร้างถูกต้อง', async () => {
    const mockHealthResponse = {
      status: 'degraded',
      timestamp: '2024-01-15T10:30:00.000Z',
    };

    const mockApiResponse = {
      data: mockHealthResponse,
      status: 200,
      message: 'OK',
    };

    const apiClient = (await import('../api')).default;
    vi.mocked(apiClient.get).mockResolvedValue(mockApiResponse);

    const result = await getHealth();

    expect(result).toHaveProperty('status');
    expect(result).toHaveProperty('timestamp');
    expect(typeof result.status).toBe('string');
    expect(typeof result.timestamp).toBe('string');
  });
}); 