import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  getAllPayments, 
  createPayment, 
  createUserPayment,
  getPaymentDetail,
  verifyPayment,
  getUserStoreBankAccounts,
  getPaymentStatusSummary 
} from '../payment.service';

// Mock apiClient
vi.mock('../api', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}));

describe('Payment Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllPayments', () => {
    it('ควรเรียก API และคืนค่ารายการการชำระเงิน', async () => {
      const mockPayments = [
        {
          id: '1',
          contract_id: '1',
          payment_date: '2024-01-15',
          amount: 4000,
          method: 'bank_transfer',
          verify_status: 'approved',
          created_at: '2024-01-15T10:30:00.000Z',
        },
      ];

      const mockApiResponse = {
        data: {
          items: mockPayments,
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

      const result = await getAllPayments();

      expect(apiClient.get).toHaveBeenCalledWith('/api/payment?');
      expect(result).toEqual(mockApiResponse.data);
    });

    it('ควรสร้าง query parameters เมื่อกำหนด params', async () => {
      const params = {
        page: 2,
        limit: 20,
        search: 'iPhone',
        status: 'approved',
        method: 'bank_transfer',
        start_date: '2024-01-01',
        end_date: '2024-01-31',
      };

      const mockApiResponse = {
        data: { items: [], total: 0, page: 2, limit: 20, total_pages: 0 },
        status: 200,
        message: 'OK',
      };

      const { apiClient } = await import('../api');
      vi.mocked(apiClient.get).mockResolvedValue(mockApiResponse);

      await getAllPayments(params);

      expect(apiClient.get).toHaveBeenCalledWith('/api/payment?page=2&limit=20&search=iPhone&status=approved&method=bank_transfer&start_date=2024-01-01&end_date=2024-01-31');
    });
  });

  describe('createPayment', () => {
    it('ควรสร้างการชำระเงินใหม่สำเร็จ', async () => {
      const payload = {
        contract_id: '1',
        payment_date: '2024-01-15',
        amount: 4000,
        method: 'bank_transfer' as const,
        proof_file: null,
      };

      const mockCreatedPayment = {
        id: '1',
        ...payload,
        verify_status: 'pending',
        created_at: '2024-01-15T10:30:00.000Z',
      };

      const mockApiResponse = {
        data: mockCreatedPayment,
        status: 201,
        message: 'Created',
      };

      const { apiClient } = await import('../api');
      vi.mocked(apiClient.post).mockResolvedValue(mockApiResponse);

      const result = await createPayment(payload);

      expect(apiClient.post).toHaveBeenCalledWith('/api/payment', expect.any(FormData), {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      expect(result).toEqual(mockCreatedPayment);
    });

    it('ควรสร้าง FormData ที่ถูกต้อง', async () => {
      const payload = {
        contract_id: '1',
        payment_date: '2024-01-15',
        amount: 4000,
        method: 'bank_transfer' as const,
        proof_file: new File(['test'], 'test.jpg', { type: 'image/jpeg' }),
      };

      const mockApiResponse = {
        data: { id: '1', ...payload },
        status: 201,
        message: 'Created',
      };

      const { apiClient } = await import('../api');
      vi.mocked(apiClient.post).mockResolvedValue(mockApiResponse);

      await createPayment(payload);

      const formDataCall = vi.mocked(apiClient.post).mock.calls[0][1] as FormData;
      expect(formDataCall.get('contract_id')).toBe('1');
      expect(formDataCall.get('payment_date')).toBe('2024-01-15');
      expect(formDataCall.get('amount')).toBe('4000');
      expect(formDataCall.get('method')).toBe('bank_transfer');
      expect(formDataCall.get('proof_file')).toBeInstanceOf(File);
    });
  });

  describe('createUserPayment', () => {
    it('ควรสร้างการชำระเงินของผู้ใช้สำเร็จ', async () => {
      const payload = {
        contract_id: '1',
        payment_date: '2024-01-15',
        amount: 4000,
        method: 'online' as const,
        proof_file: null,
      };

      const mockCreatedPayment = {
        id: '1',
        ...payload,
        verify_status: 'pending',
        created_at: '2024-01-15T10:30:00.000Z',
      };

      const mockApiResponse = {
        data: mockCreatedPayment,
        status: 201,
        message: 'Created',
      };

      const { apiClient } = await import('../api');
      vi.mocked(apiClient.post).mockResolvedValue(mockApiResponse);

      const result = await createUserPayment(payload);

      expect(apiClient.post).toHaveBeenCalledWith('/api/users/payment', expect.any(FormData), {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      expect(result).toEqual(mockCreatedPayment);
    });
  });

  describe('getPaymentDetail', () => {
    it('ควรดึงรายละเอียดการชำระเงิน', async () => {
      const paymentId = '1';
      const mockPaymentDetail = {
        id: '1',
        contract_id: '1',
        payment_date: '2024-01-15',
        amount: 4000,
        method: 'bank_transfer',
        proof_file_filename: 'payment_proof.jpg',
        verify_status: 'approved',
        verify_by: 'admin1',
        verify_by_name: 'Admin User',
        created_at: '2024-01-15T10:30:00.000Z',
        updated_at: '2024-01-15T11:30:00.000Z',
      };

      const mockApiResponse = {
        data: mockPaymentDetail,
        status: 200,
        message: 'OK',
      };

      const { apiClient } = await import('../api');
      vi.mocked(apiClient.get).mockResolvedValue(mockApiResponse);

      const result = await getPaymentDetail(paymentId);

      expect(apiClient.get).toHaveBeenCalledWith(`/api/payment/${paymentId}`);
      expect(result).toEqual(mockPaymentDetail);
    });
  });

  describe('verifyPayment', () => {
    it('ควรยืนยันการชำระเงิน', async () => {
      const paymentId = '1';
      const status = 'approved' as const;
      const adminId = 'admin1';

      const mockApiResponse = {
        data: { message: 'Payment verified successfully' },
        status: 200,
        message: 'OK',
      };

      const { apiClient } = await import('../api');
      vi.mocked(apiClient.post).mockResolvedValue(mockApiResponse);

      await verifyPayment(paymentId, status, adminId);

      expect(apiClient.post).toHaveBeenCalledWith(`/api/payment/${paymentId}/verify`, {
        status,
        admin_id: adminId,
      });
    });
  });

  describe('getUserStoreBankAccounts', () => {
    it('ควรดึงข้อมูลบัญชีธนาคารของร้าน', async () => {
      const mockBankAccounts = {
        bank_accounts: [
          {
            bank_name: 'ธนาคารกรุงเทพ',
            account_number: '1234567890',
            account_name: 'ร้านค้า ABC',
          },
        ],
        promptpay_accounts: [
          {
            promptpay_id: '0812345678',
            account_name: 'ร้านค้า ABC',
          },
        ],
      };

      const mockApiResponse = {
        data: mockBankAccounts,
        status: 200,
        message: 'OK',
      };

      const { apiClient } = await import('../api');
      vi.mocked(apiClient.get).mockResolvedValue(mockApiResponse);

      const result = await getUserStoreBankAccounts();

      expect(apiClient.get).toHaveBeenCalledWith('/api/user/store-bank-accounts');
      expect(result).toEqual(mockBankAccounts);
    });
  });

  describe('getPaymentStatusSummary', () => {
    it('ควรดึงสรุปสถานะการชำระเงิน', async () => {
      const params = { year: 2024, months: '1,2,3' };
      const mockSummary = {
        payment_status_summary: [
          { status: 'paid' as const, count: 10, amount: 40000 },
          { status: 'unpaid' as const, count: 5, amount: 20000 },
          { status: 'partial' as const, count: 3, amount: 12000 },
        ],
      };

      const mockApiResponse = {
        data: mockSummary,
        status: 200,
        message: 'OK',
      };

      const { apiClient } = await import('../api');
      vi.mocked(apiClient.get).mockResolvedValue(mockApiResponse);

      const result = await getPaymentStatusSummary(params);

      expect(apiClient.get).toHaveBeenCalledWith('/api/payment/status-summary?year=2024&months=1%2C2%2C3');
      expect(result).toEqual(mockSummary);
    });
  });
}); 