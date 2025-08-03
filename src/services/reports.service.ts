import { apiClient } from './api';

// Types สำหรับ API Reports
export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface ReportFilters {
  contractStatus?: string[];
  paymentMethod?: string[];
  productModel?: string[];
  adminId?: string;
  customerProvince?: string[];
  contractCategory?: string[];
}

export interface BaseReportRequest {
  reportType: string;
  dateRange: DateRange;
  filters?: ReportFilters;
  includeCharts?: boolean;
  language?: string;
  timezone?: string;
}

export interface GenerateReportRequest extends BaseReportRequest {
  format?: 'pdf' | 'excel';
}

export interface GenerateDataRequest extends BaseReportRequest {
  format: 'json';
}

export interface PreviewRequest extends BaseReportRequest {
  format: 'preview';
  includeCharts?: boolean;
}

export interface ReportSummary {
  totalContracts: number;
  totalRevenue: number;
  totalWithInterest: number;
  totalPayments: number;
  outstandingAmount: number;
  activeContracts: number;
  closedContracts: number;
  defaultContracts: number;
  avgMonthlyPayment: number;
  avgContractValue: number;
}

export interface MonthlyBreakdown {
  month: string;
  contracts: number;
  revenue: number;
  payments: number;
  newCustomers: number;
}

export interface TopProduct {
  modelName: string;
  count: number;
  revenue: number;
  percentage: number;
}

export interface PaymentMethod {
  method: string;
  count: number;
  amount: number;
  percentage: number;
}

export interface SalesReportData {
  summary: ReportSummary;
  monthlyBreakdown: MonthlyBreakdown[];
  topProducts: TopProduct[];
  paymentMethods: PaymentMethod[];
}

export interface FinancialReportData {
  summary: {
    totalRevenue: number;
    totalCost: number;
    grossProfit: number;
    totalExpenses: number;
    netProfit: number;
    profitMargin: number;
  };
  cashFlow: Array<{
    month: string;
    inflow: number;
    outflow: number;
    netFlow: number;
  }>;
  outstandingBalances: Array<{
    contractId: string;
    customerName: string;
    outstandingAmount: number;
    daysOverdue: number;
  }>;
}

export interface ReportHistoryItem {
  reportId: string;
  reportType: string;
  generatedAt: string;
  dateRange: DateRange;
  status: 'completed' | 'processing' | 'failed';
  fileSize?: string;
  fileName?: string;
  format?: 'pdf' | 'excel' | 'json';
  createdBy?: string;
}

export interface ReportHistoryResponse {
  reports: ReportHistoryItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface GenerateDataResponse {
  reportId: string;
  reportType: string;
  generatedAt: string;
  dateRange: DateRange;
  summary: ReportSummary;
  details: unknown[];
  charts?: {
    monthlySales: Array<{ month: string; amount: number }>;
    productBreakdown: TopProduct[];
    paymentMethods: PaymentMethod[];
  };
}

export interface PreviewResponse {
  summary: Partial<ReportSummary>;
  sampleData: Array<{
    contractId: string;
    customerName: string;
    productName: string;
    totalPrice: number;
    status: string;
  }>;
}

// Report Types
export const REPORT_TYPES = {
  // Sales Reports
  SALES_SUMMARY: 'sales_summary',
  SALES_BY_PERIOD: 'sales_by_period',
  SALES_BY_PRODUCT: 'sales_by_product',
  SALES_BY_ADMIN: 'sales_by_admin',
  SALES_BY_PAYMENT_METHOD: 'sales_by_payment_method',
  
  // Financial Reports
  REVENUE_SUMMARY: 'revenue_summary',
  PAYMENT_COLLECTION: 'payment_collection',
  OUTSTANDING_BALANCE: 'outstanding_balance',
  PROFIT_LOSS: 'profit_loss',
  CASH_FLOW: 'cash_flow',
  
  // Customer Reports
  CUSTOMER_SUMMARY: 'customer_summary',
  CUSTOMER_BY_LOCATION: 'customer_by_location',
  CUSTOMER_VERIFICATION_STATUS: 'customer_verification_status',
  CUSTOMER_PAYMENT_HISTORY: 'customer_payment_history',
  
  // Inventory Reports
  INVENTORY_SUMMARY: 'inventory_summary',
  PRODUCT_PERFORMANCE: 'product_performance',
  ICLOUD_STATUS_REPORT: 'icloud_status_report',
  CONSIGNMENT_SUMMARY: 'consignment_summary',
  
  // Operational Reports
  CONTRACT_STATUS_SUMMARY: 'contract_status_summary',
  DEFAULT_CONTRACTS: 'default_contracts',
  COMMISSION_SUMMARY: 'commission_summary',
  AUDIT_LOGS: 'audit_logs'
} as const;

export type ReportType = typeof REPORT_TYPES[keyof typeof REPORT_TYPES];

// Date Range Options
export const DATE_RANGE_OPTIONS = {
  CUSTOM: 'custom',
  TODAY: 'today',
  YESTERDAY: 'yesterday',
  THIS_WEEK: 'this_week',
  THIS_MONTH: 'this_month',
  THIS_QUARTER: 'this_quarter',
  THIS_YEAR: 'this_year',
  LAST_WEEK: 'last_week',
  LAST_MONTH: 'last_month',
  LAST_QUARTER: 'last_quarter',
  LAST_YEAR: 'last_year'
} as const;

export type DateRangeOption = typeof DATE_RANGE_OPTIONS[keyof typeof DATE_RANGE_OPTIONS];

// Export Formats
export const EXPORT_FORMATS = {
  PDF: 'pdf',
  EXCEL: 'excel'
} as const;

export type ExportFormat = typeof EXPORT_FORMATS[keyof typeof EXPORT_FORMATS];

// API Functions
export async function generateReport(request: GenerateReportRequest): Promise<Blob> {
  const response = await apiClient.post('/api/reports/generate', request, {
    responseType: 'blob',
    headers: {
      'Content-Type': 'application/json',
    }
  });
  
  // สร้าง Blob จาก response data
  const mimeType = request.format === 'excel' 
    ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    : 'application/pdf';
  return new Blob([response.data as BlobPart], { type: mimeType });
}

export async function generateReportData(request: GenerateDataRequest): Promise<GenerateDataResponse> {
  const response = await apiClient.post<GenerateDataResponse>('/api/reports/generate-data', request);
  return response.data;
}

export async function previewReport(request: PreviewRequest): Promise<PreviewResponse> {
  const response = await apiClient.post<PreviewResponse>('/api/reports/preview', request);
  return response.data;
}

export async function getReportHistory(params?: {
  page?: number;
  limit?: number;
  reportType?: string;
  startDate?: string;
  endDate?: string;
}): Promise<ReportHistoryResponse> {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.reportType) queryParams.append('reportType', params.reportType);
  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);

  const url = `/api/reports/history${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await apiClient.get<{ success: boolean; data: ReportHistoryResponse }>(url);
  return response.data.data;
}

export async function deleteReport(reportId: string): Promise<{ success: boolean; message: string }> {
  const response = await apiClient.delete<{ success: boolean; message: string }>(`/api/reports/delete/${reportId}`);
  return response.data;
}

export async function downloadReportFromHistory(reportId: string): Promise<Blob> {
  const response = await apiClient.get(`/api/reports/download/${reportId}`, {
    responseType: 'blob'
  });
  return response.data as Blob;
}

// Helper function สำหรับสร้าง date range จาก option
export function createDateRangeFromOption(option: DateRangeOption): DateRange {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  switch (option) {
    case DATE_RANGE_OPTIONS.TODAY:
      return {
        startDate: today.toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0]
      };
      
    case DATE_RANGE_OPTIONS.YESTERDAY: {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      return {
        startDate: yesterday.toISOString().split('T')[0],
        endDate: yesterday.toISOString().split('T')[0]
      };
    }
      
    case DATE_RANGE_OPTIONS.THIS_WEEK: {
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      return {
        startDate: startOfWeek.toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0]
      };
    }
      
    case DATE_RANGE_OPTIONS.THIS_MONTH:
      return {
        startDate: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0]
      };
      
    case DATE_RANGE_OPTIONS.LAST_MONTH: {
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      return {
        startDate: lastMonth.toISOString().split('T')[0],
        endDate: endOfLastMonth.toISOString().split('T')[0]
      };
    }
      
    case DATE_RANGE_OPTIONS.THIS_YEAR:
      return {
        startDate: new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0]
      };
      
    case DATE_RANGE_OPTIONS.LAST_YEAR:
      return {
        startDate: new Date(now.getFullYear() - 1, 0, 1).toISOString().split('T')[0],
        endDate: new Date(now.getFullYear() - 1, 11, 31).toISOString().split('T')[0]
      };
      
    default:
      return {
        startDate: today.toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0]
      };
  }
}

// Helper function สำหรับดาวน์โหลดไฟล์
export function downloadBlob(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

// Helper function สำหรับสร้าง filename
export function generateFilename(reportType: string, dateRange: DateRange, format: ExportFormat): string {
  const extension = format === 'excel' ? 'xlsx' : 'pdf';
  return `${reportType}_${dateRange.startDate}_to_${dateRange.endDate}.${extension}`;
} 