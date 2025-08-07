import { describe, it, expect, vi, beforeEach } from 'vitest';
import { deleteUser, restoreUser, getDeletedUsers } from '../user-management.service';
import { apiClient } from '../api';

// Mock apiClient
vi.mock('../api', () => ({
  apiClient: {
    delete: vi.fn(),
    post: vi.fn(),
    get: vi.fn(),
  },
}));

const mockApiClient = vi.mocked(apiClient);

describe('User Management Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      const mockResponse = {
        data: {
          message: 'ลบผู้ใช้สำเร็จ',
          user_id: 'user-uuid-here'
        },
        status: 200,
        message: 'OK'
      };

      mockApiClient.delete.mockResolvedValue(mockResponse);

      const result = await deleteUser('user-uuid-here');

      expect(mockApiClient.delete).toHaveBeenCalledWith('/api/admin/users/user-uuid-here');
      expect(result).toEqual({
        message: 'ลบผู้ใช้สำเร็จ',
        user_id: 'user-uuid-here'
      });
    });

    it('should handle error when user not found', async () => {
      const mockError = {
        error: 'ไม่พบผู้ใช้ในระบบ',
        status: 400
      };

      mockApiClient.delete.mockRejectedValue(mockError);

      await expect(deleteUser('nonexistent-uuid')).rejects.toEqual(mockError);
    });
  });

  describe('restoreUser', () => {
    it('should restore user successfully', async () => {
      const mockResponse = {
        data: {
          message: 'กู้คืนผู้ใช้สำเร็จ',
          user_id: 'user-uuid-here'
        },
        status: 200,
        message: 'OK'
      };

      mockApiClient.post.mockResolvedValue(mockResponse);

      const result = await restoreUser('user-uuid-here');

      expect(mockApiClient.post).toHaveBeenCalledWith('/api/admin/users/user-uuid-here/restore');
      expect(result).toEqual({
        message: 'กู้คืนผู้ใช้สำเร็จ',
        user_id: 'user-uuid-here'
      });
    });

    it('should handle error when user not found', async () => {
      const mockError = {
        error: 'ไม่พบผู้ใช้ที่ถูกลบในระบบ',
        status: 400
      };

      mockApiClient.post.mockRejectedValue(mockError);

      await expect(restoreUser('nonexistent-uuid')).rejects.toEqual(mockError);
    });
  });

  describe('getDeletedUsers', () => {
    it('should get deleted users successfully', async () => {
      const mockResponse = {
        data: {
          users: [
            {
              id: 'user-uuid-here',
              first_name: 'ชื่อ',
              last_name: 'นามสกุล',
              phone_number: '0812345678',
              email: 'user@example.com',
              created_at: '2024-01-01T00:00:00Z',
              updated_at: '2024-01-15T10:30:00Z'
            }
          ],
          count: 1
        },
        status: 200,
        message: 'OK'
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await getDeletedUsers();

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/admin/users/deleted');
      expect(result).toEqual({
        users: [
          {
            id: 'user-uuid-here',
            first_name: 'ชื่อ',
            last_name: 'นามสกุล',
            phone_number: '0812345678',
            email: 'user@example.com',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-15T10:30:00Z'
          }
        ],
        count: 1
      });
    });

    it('should handle empty deleted users list', async () => {
      const mockResponse = {
        data: {
          users: [],
          count: 0
        },
        status: 200,
        message: 'OK'
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await getDeletedUsers();

      expect(result).toEqual({
        users: [],
        count: 0
      });
    });
  });
}); 