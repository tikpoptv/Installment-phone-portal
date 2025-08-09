import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  createProduct, 
  getProducts, 
  getProductDetail,
  updateProduct,
  setProductStoreLocked,
  getAvailableProducts,
  getStockSummary,
  markProductWarrantyReplaced
} from '../products.service';

// Mock apiClient
vi.mock('../api', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}));

describe('Products Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createProduct', () => {
    it('ควรสร้างสินค้าใหม่สำเร็จ', async () => {
      const payload = {
        phone_model_id: '1',
        status: 'available',
        imei: '123456789012345',
        price: 45000,
        cost_price: 40000,
        available_stock: 1,
        icloud_status: 'unlock',
        owner_id: 'owner1',
        remark: 'สินค้าใหม่',
        images: [new File(['test'], 'test.jpg', { type: 'image/jpeg' })],
      };

      const mockCreatedProduct = {
        id: '1',
        status: 'available',
        imei: '123456789012345',
        price: 45000,
        icloud_status: 'unlock',
        created_at: '2024-01-15T10:30:00.000Z',
      };

      const mockApiResponse = {
        data: mockCreatedProduct,
        status: 201,
        message: 'Created',
      };

      const { apiClient } = await import('../api');
      vi.mocked(apiClient.post).mockResolvedValue(mockApiResponse);

      const result = await createProduct(payload);

      expect(apiClient.post).toHaveBeenCalledWith('/api/products', expect.any(FormData), {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      expect(result).toEqual(mockCreatedProduct);
    });

    it('ควรสร้าง FormData ที่ถูกต้อง', async () => {
      const payload = {
        phone_model_id: '1',
        price: 45000,
        icloud_status: 'unlock',
        images: [new File(['test'], 'test.jpg', { type: 'image/jpeg' })],
      };

      const mockApiResponse = {
        data: { id: '1', ...payload },
        status: 201,
        message: 'Created',
      };

      const { apiClient } = await import('../api');
      vi.mocked(apiClient.post).mockResolvedValue(mockApiResponse);

      await createProduct(payload);

      const formDataCall = vi.mocked(apiClient.post).mock.calls[0][1] as FormData;
      expect(formDataCall.get('phone_model_id')).toBe('1');
      expect(formDataCall.get('price')).toBe('45000');
      expect(formDataCall.get('icloud_status')).toBe('unlock');
      expect(formDataCall.get('images')).toBeInstanceOf(File);
    });
  });

  describe('getProducts', () => {
    it('ควรเรียก API และคืนค่ารายการสินค้า', async () => {
      const mockProducts = [
        {
          id: '1',
          model_name: 'iPhone 15',
          status: 'available',
          imei: '123456789012345',
          price: 45000,
          icloud_status: 'unlock',
          remark: 'สินค้าใหม่',
          created_at: '2024-01-15T10:30:00.000Z',
          store_locked: false,
        },
      ];

      const mockApiResponse = {
        data: {
          items: mockProducts,
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

      const result = await getProducts();

      expect(apiClient.get).toHaveBeenCalledWith('/api/products?');
      expect(result).toEqual(mockApiResponse.data);
    });

    it('ควรสร้าง query parameters เมื่อกำหนด params', async () => {
      const params = {
        page: 2,
        limit: 20,
        search: 'iPhone',
        status: 'available',
        icloud_status: 'unlock',
        min_price: 40000,
        max_price: 50000,
      };

      const mockApiResponse = {
        data: { items: [], total: 0, page: 2, limit: 20, total_pages: 0 },
        status: 200,
        message: 'OK',
      };

      const { apiClient } = await import('../api');
      vi.mocked(apiClient.get).mockResolvedValue(mockApiResponse);

      await getProducts(params);

      expect(apiClient.get).toHaveBeenCalledWith('/api/products?page=2&limit=20&search=iPhone&status=available&icloud_status=unlock&min_price=40000&max_price=50000');
    });
  });

  describe('getProductDetail', () => {
    it('ควรดึงรายละเอียดสินค้า', async () => {
      const productId = '1';
      const mockProductDetail = {
        id: '1',
        model_name: 'iPhone 15',
        status: 'available',
        imei: '123456789012345',
        price: 45000,
        icloud_status: 'unlock',
        remark: 'สินค้าใหม่',
        created_at: '2024-01-15T10:30:00.000Z',
        store_locked: false,
        icloud_credential_id: 'cred1',
        owner_username: 'owner1',
      };

      const mockApiResponse = {
        data: mockProductDetail,
        status: 200,
        message: 'OK',
      };

      const { apiClient } = await import('../api');
      vi.mocked(apiClient.get).mockResolvedValue(mockApiResponse);

      const result = await getProductDetail(productId);

      expect(apiClient.get).toHaveBeenCalledWith(`/api/products/${productId}/detail`);
      expect(result).toEqual(mockProductDetail);
    });
  });

  describe('updateProduct', () => {
    it('ควรอัปเดตสินค้า', async () => {
      const productId = '1';
      const payload = {
        status: 'sold',
        imei: '123456789012345',
        price: 45000,
        cost_price: 40000,
        remark: 'ขายแล้ว',
      };

      const mockApiResponse = {
        data: { message: 'Product updated successfully' },
        status: 200,
        message: 'OK',
      };

      const { apiClient } = await import('../api');
      vi.mocked(apiClient.post).mockResolvedValue(mockApiResponse);

      await updateProduct(productId, payload);

      expect(apiClient.post).toHaveBeenCalledWith(`/api/products/${productId}/edit`, payload);
    });
  });

  describe('setProductStoreLocked', () => {
    it('ควรตั้งค่าการล็อกสินค้าในร้าน', async () => {
      const productId = '1';
      const locked = true;

      const mockResponse = {
        id: productId,
        store_locked: locked,
      };

      const mockApiResponse = {
        data: mockResponse,
        status: 200,
        message: 'OK',
      };

      const { apiClient } = await import('../api');
      vi.mocked(apiClient.post).mockResolvedValue(mockApiResponse);

      const result = await setProductStoreLocked(productId, locked);

      expect(apiClient.post).toHaveBeenCalledWith(`/api/products/${productId}/store-locked`, { store_locked: locked });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getAvailableProducts', () => {
    it('ควรดึงสินค้าที่มีอยู่', async () => {
      const mockProducts = [
        {
          id: '1',
          model_name: 'iPhone 15',
          status: 'available',
          imei: '123456789012345',
          price: 45000,
          icloud_status: 'unlock',
          remark: 'สินค้าใหม่',
          created_at: '2024-01-15T10:30:00.000Z',
          store_locked: false,
        },
      ];

      const mockApiResponse = {
        data: mockProducts,
        status: 200,
        message: 'OK',
      };

      const { apiClient } = await import('../api');
      vi.mocked(apiClient.get).mockResolvedValue(mockApiResponse);

      const result = await getAvailableProducts();

      expect(apiClient.get).toHaveBeenCalledWith('/api/products/available');
      expect(result).toEqual(mockProducts);
    });
  });

  describe('getStockSummary', () => {
    it('ควรดึงสรุปสต็อกสินค้า', async () => {
      const mockStockSummary = [
        {
          id: 1,
          name: 'iPhone 15',
          stock: 10,
          status: 'normal' as const,
        },
        {
          id: 2,
          name: 'Samsung Galaxy S24',
          stock: 3,
          status: 'warning' as const,
        },
      ];

      const mockApiResponse = {
        data: mockStockSummary,
        status: 200,
        message: 'OK',
      };

      const { apiClient } = await import('../api');
      vi.mocked(apiClient.get).mockResolvedValue(mockApiResponse);

      const result = await getStockSummary();

      expect(apiClient.get).toHaveBeenCalledWith('/api/products/stock-summary');
      expect(result).toEqual(mockStockSummary);
    });
  });

  describe('markProductWarrantyReplaced', () => {
    it('ควรเรียก PUT เพื่ออัปเดตสถานะเป็น warranty_replaced', async () => {
      const productId = 'PD00001';
      const mockResponse = { id: productId, status: 'warranty_replaced' as const };
      const mockApiResponse = { data: mockResponse, status: 200, message: 'OK' };

      const { apiClient } = await import('../api');
      vi.mocked(apiClient.put).mockResolvedValue(mockApiResponse);

      const result = await markProductWarrantyReplaced(productId);

      expect(apiClient.put).toHaveBeenCalledWith(`/api/products/${productId}/status/warranty-replaced`);
      expect(result).toEqual(mockResponse);
    });
  });
}); 