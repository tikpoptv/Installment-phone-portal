import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  getContracts, 
  createContract, 
  getContractDetail, 
  getContractPayments,
  updateContractStatus 
} from '../contract.service';

// Mock apiClient
vi.mock('../api', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}));

describe('Contract Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getContracts', () => {
    it('ควรเรียก API และคืนค่ารายการสัญญา', async () => {
      const mockContracts = [
        {
          id: '1',
          user_name: 'John Doe',
          product_name: 'iPhone 15',
          category: 'phone',
          total_price: 45000,
          status: 'active',
          start_date: '2024-01-15',
          end_date: '2025-01-15',
          created_at: '2024-01-15T10:30:00.000Z',
        },
      ];

      const mockApiResponse = {
        data: {
          items: mockContracts,
          total: 1,
          page: 1,
          limit: 10,
          total_pages: 1,
        },
        status: 200,
        message: 'OK',
      };

      const { apiClient } = await import('../api');
      vi.mocked(apiClient.get).mockResolvedValue(mockApiResponse);

      const result = await getContracts();

      expect(apiClient.get).toHaveBeenCalledWith('/api/orders?');
      expect(result).toEqual(mockApiResponse.data);
    });

    it('ควรส่ง parameters เมื่อกำหนด', async () => {
      const params = {
        page: 2,
        limit: 20,
        search: 'iPhone',
        status: 'active',
      };

      const mockApiResponse = {
        data: { items: [], total: 0, page: 2, limit: 20, total_pages: 0 },
        status: 200,
        message: 'OK',
      };

      const { apiClient } = await import('../api');
      vi.mocked(apiClient.get).mockResolvedValue(mockApiResponse);

      await getContracts(params);

      expect(apiClient.get).toHaveBeenCalledWith('/api/orders?page=2&limit=20&search=iPhone&status=active');
    });
  });

  describe('createContract', () => {
    it('ควรสร้างสัญญาใหม่สำเร็จ', async () => {
      const payload = {
        user_id: '1',
        product_id: '1',
        category: 'phone',
        total_price: 45000,
        installment_months: 12,
      };

      const mockCreatedContract = {
        id: '1',
        ...payload,
        status: 'pending',
        created_at: '2024-01-15T10:30:00.000Z',
      };

      const mockApiResponse = {
        data: mockCreatedContract,
        status: 201,
        message: 'Created',
      };

      const { apiClient } = await import('../api');
      vi.mocked(apiClient.post).mockResolvedValue(mockApiResponse);

      const result = await createContract(payload);

      expect(apiClient.post).toHaveBeenCalledWith('/api/contracts/transaction', expect.any(FormData), {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      expect(result).toEqual(mockApiResponse);
    });
  });

  describe('getContractDetail', () => {
    it('ควรดึงรายละเอียดสัญญา', async () => {
      const contractId = '1';
      const mockContractDetail = {
        id: '1',
        category: 'phone',
        total_price: 45000,
        total_with_interest: 48000,
        installment_months: 12,
        monthly_payment: 4000,
        status: 'active',
        start_date: '2024-01-15',
        end_date: '2025-01-15',
        last_payment_date: null,
        pdpa_consent_file_url: null,
        pdpa_consent_file_filename: null,
        created_at: '2024-01-15T10:30:00.000Z',
        updated_at: '2024-01-15T10:30:00.000Z',
        user: {
          id: '1',
          first_name: 'John',
          last_name: 'Doe',
        },
        product: {
          id: '1',
          model_name: 'iPhone 15',
          imei: '123456789',
          price: 45000,
        },
      };

      const mockApiResponse = {
        data: mockContractDetail,
        status: 200,
        message: 'OK',
      };

      const { apiClient } = await import('../api');
      vi.mocked(apiClient.get).mockResolvedValue(mockApiResponse);

      const result = await getContractDetail(contractId);

      expect(apiClient.get).toHaveBeenCalledWith(`/api/contracts/detail/${contractId}`);
      expect(result).toEqual(mockContractDetail);
    });
  });

  describe('getContractPayments', () => {
    it('ควรดึงข้อมูลการชำระเงินของสัญญา', async () => {
      const contractId = '1';
      const mockPaymentsResponse = {
        payments: [
          {
            id: '1',
            payment_date: '2024-01-15',
            amount: 4000,
            method: 'transfer',
            verify_status: 'approved' as const,
            created_at: '2024-01-15T10:30:00.000Z',
          },
        ],
        installments: [
          {
            id: 1,
            installment_number: 1,
            due_date: '2024-02-15',
            amount: 4000,
            amount_paid: 4000,
            status: 'paid' as const,
            paid_at: '2024-01-15T10:30:00.000Z',
            is_final_payment: false,
          },
        ],
        discounts: [],
        remaining_amount: 44000,
        overdue_months: 0,
        total_due_this_month: 4000,
      };

      const mockApiResponse = {
        data: mockPaymentsResponse,
        status: 200,
        message: 'OK',
      };

      const { apiClient } = await import('../api');
      vi.mocked(apiClient.get).mockResolvedValue(mockApiResponse);

      const result = await getContractPayments(contractId);

      expect(apiClient.get).toHaveBeenCalledWith(`/api/contracts/${contractId}/payments`);
      expect(result).toEqual(mockPaymentsResponse);
    });
  });

  describe('updateContractStatus', () => {
    it('ควรอัปเดตสถานะสัญญา', async () => {
      const contractId = '1';
      const newStatus = 'completed';

      const mockResponse = {
        id: contractId,
        status: newStatus,
      };

      const mockApiResponse = {
        data: mockResponse,
        status: 200,
        message: 'OK',
      };

      const { apiClient } = await import('../api');
      vi.mocked(apiClient.put).mockResolvedValue(mockApiResponse);

      const result = await updateContractStatus(contractId, newStatus);

      expect(apiClient.put).toHaveBeenCalledWith(`/api/contracts/${contractId}/status`, { status: newStatus });
      expect(result).toEqual(mockResponse);
    });
  });
}); 