import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getPhoneModels, createPhoneModel, updatePhoneModel } from '../phone-model.service';

// Mock apiClient
vi.mock('../api', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}));

describe('Phone Model Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getPhoneModels', () => {
    it('ควรเรียก API และคืนค่ารายการโทรศัพท์', async () => {
      const mockPhoneModels = [
        { id: '1', model_name: 'iPhone 15', created_at: '2024-01-15T10:30:00.000Z' },
        { id: '2', model_name: 'Samsung Galaxy S24', created_at: '2024-01-15T11:30:00.000Z' },
      ];

      const mockApiResponse = {
        data: { data: mockPhoneModels, message: 'Success' },
        status: 200,
        message: 'OK',
      };

      const { apiClient } = await import('../api');
      vi.mocked(apiClient.get).mockResolvedValue(mockApiResponse);

      const result = await getPhoneModels();

      expect(apiClient.get).toHaveBeenCalledWith('/api/phone-models');
      expect(result).toEqual(mockPhoneModels);
    });

    it('ควรจัดการ response format ใหม่ที่มี data wrapper', async () => {
      const mockApiResponse = {
        data: { data: [], message: 'No data' },
        status: 200,
        message: 'OK',
      };

      const { apiClient } = await import('../api');
      vi.mocked(apiClient.get).mockResolvedValue(mockApiResponse);

      const result = await getPhoneModels();

      expect(result).toEqual([]);
    });

    it('ควรจัดการ response format เดิมที่เป็น array โดยตรง', async () => {
      const mockPhoneModels = [
        { id: '1', model_name: 'iPhone 15', created_at: '2024-01-15T10:30:00.000Z' },
      ];

      const mockApiResponse = {
        data: mockPhoneModels,
        status: 200,
        message: 'OK',
      };

      const { apiClient } = await import('../api');
      vi.mocked(apiClient.get).mockResolvedValue(mockApiResponse);

      const result = await getPhoneModels();

      expect(result).toEqual(mockPhoneModels);
    });

    it('ควรคืนค่า array ว่างเมื่อ response ไม่ใช่ array และไม่มี data property', async () => {
      const mockApiResponse = {
        data: null,
        status: 200,
        message: 'OK',
      };

      const { apiClient } = await import('../api');
      vi.mocked(apiClient.get).mockResolvedValue(mockApiResponse);

      const result = await getPhoneModels();

      expect(result).toEqual([]);
    });
  });

  describe('createPhoneModel', () => {
    it('ควรสร้างโทรศัพท์ใหม่สำเร็จ', async () => {
      const newModel = { model_name: 'iPhone 16' };
      const createdModel = {
        id: '3',
        model_name: 'iPhone 16',
        created_at: '2024-01-15T12:30:00.000Z',
      };

      const mockApiResponse = {
        data: createdModel,
        status: 201,
        message: 'Created',
      };

      const { apiClient } = await import('../api');
      vi.mocked(apiClient.post).mockResolvedValue(mockApiResponse);

      const result = await createPhoneModel(newModel.model_name);

      expect(apiClient.post).toHaveBeenCalledWith('/api/phone-models', newModel);
      expect(result).toEqual(createdModel);
    });

    it('ควรจัดการ error เมื่อสร้างโทรศัพท์ล้มเหลว', async () => {
      const mockError = new Error('Creation failed');
      
      const { apiClient } = await import('../api');
      vi.mocked(apiClient.post).mockRejectedValue(mockError);

      await expect(createPhoneModel('iPhone 16')).rejects.toThrow('Creation failed');
      expect(apiClient.post).toHaveBeenCalledWith('/api/phone-models', { model_name: 'iPhone 16' });
    });
  });

  describe('updatePhoneModel', () => {
    it('ควรอัปเดตโทรศัพท์สำเร็จ', async () => {
      const updateData = { model_name: 'iPhone 16 Pro' };
      const updatedModel = {
        id: '1',
        model_name: 'iPhone 16 Pro',
        created_at: '2024-01-15T10:30:00.000Z',
        updated_at: '2024-01-15T13:30:00.000Z',
      };

      const mockApiResponse = {
        data: updatedModel,
        status: 200,
        message: 'OK',
      };

      const { apiClient } = await import('../api');
      vi.mocked(apiClient.put).mockResolvedValue(mockApiResponse);

      const result = await updatePhoneModel('1', updateData.model_name);

      expect(apiClient.put).toHaveBeenCalledWith('/api/phone-models/1', updateData);
      expect(result).toEqual(updatedModel);
    });

    it('ควรจัดการ error เมื่ออัปเดตโทรศัพท์ล้มเหลว', async () => {
      const mockError = new Error('Update failed');
      
      const { apiClient } = await import('../api');
      vi.mocked(apiClient.put).mockRejectedValue(mockError);

      await expect(updatePhoneModel('1', 'iPhone 16 Pro')).rejects.toThrow('Update failed');
      expect(apiClient.put).toHaveBeenCalledWith('/api/phone-models/1', { model_name: 'iPhone 16 Pro' });
    });
  });
}); 