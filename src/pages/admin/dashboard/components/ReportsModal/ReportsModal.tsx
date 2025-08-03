import type { FC } from 'react';
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import styles from './ReportsModal.module.css';
import MobileAccessModal from '../../../../../components/MobileAccessModal';
import {
  REPORT_TYPES,
  DATE_RANGE_OPTIONS,
  EXPORT_FORMATS,
  type ReportType,
  type DateRangeOption,
  type DateRange,
  type ReportFilters,
  type ExportFormat,
  generateReport,
  previewReport,
  getReportHistory,
  deleteReport,
  downloadReportFromHistory,
  createDateRangeFromOption,
  downloadBlob,
  generateFilename,
  type ReportHistoryItem,
  type PreviewResponse,
  generateReportData
} from '../../../../../services/reports.service';

// Feature Flags สำหรับระบบรายงาน
const REPORT_FEATURE_FLAGS = {
  REPORTS_SYSTEM_ENABLED: true, // เปิด/ปิดระบบรายงานทั้งหมด
  SALES_REPORTS_ENABLED: true, // เปิด/ปิดรายงานยอดขาย
  FINANCIAL_REPORTS_ENABLED: true, // เปิด/ปิดรายงานการเงิน
  CUSTOMER_REPORTS_ENABLED: true, // เปิด/ปิดรายงานลูกค้า
  INVENTORY_REPORTS_ENABLED: true, // เปิด/ปิดรายงานสินค้า
  OPERATIONAL_REPORTS_ENABLED: true, // เปิด/ปิดรายงานการดำเนินงาน
  REPORT_HISTORY_ENABLED: true, // เปิด/ปิดประวัติรายงาน
  REPORT_PREVIEW_ENABLED: true, // เปิด/ปิดการดูตัวอย่างรายงาน
  REPORT_EXPORT_ENABLED: true, // เปิด/ปิดการส่งออกรายงาน
  CONSIGNMENT_SUMMARY_ENABLED: false, // เปิด/ปิดรายงานสรุปสินค้าฝากขาย
  COMMISSION_SUMMARY_ENABLED: false, // เปิด/ปิดรายงานสรุปค่าคอมมิชชัน
  DEFAULT_CONTRACTS_ENABLED: false, // เปิด/ปิดรายงานสัญญาที่ผิดนัด
} as const;

interface ReportsModalProps {
  open: boolean;
  onClose: () => void;
}

interface ReportCategory {
  id: string;
  title: string;
  icon: string;
  color: string;
  reports: Array<{
    id: ReportType;
    title: string;
    description: string;
    icon: string;
  }>;
}

const reportCategories: ReportCategory[] = [
  {
    id: 'sales',
    title: 'รายงานยอดขาย',
    icon: '📈',
    color: '#10B981',
    reports: [
      {
        id: REPORT_TYPES.SALES_SUMMARY,
        title: 'สรุปยอดขายรวม',
        description: 'ดูสถิติยอดขายรวมทั้งหมด',
        icon: '📊'
      },
      {
        id: REPORT_TYPES.SALES_BY_PERIOD,
        title: 'ยอดขายแยกตามช่วงเวลา',
        description: 'วิเคราะห์ยอดขายรายวัน, สัปดาห์, เดือน',
        icon: '📅'
      },
      {
        id: REPORT_TYPES.SALES_BY_PRODUCT,
        title: 'ยอดขายแยกตามรุ่นโทรศัพท์',
        description: 'ดูประสิทธิภาพของแต่ละรุ่นสินค้า',
        icon: '📱'
      },
      {
        id: REPORT_TYPES.SALES_BY_ADMIN,
        title: 'ยอดขายแยกตามพนักงาน',
        description: 'ติดตามผลงานของพนักงานแต่ละคน',
        icon: '👤'
      },
      {
        id: REPORT_TYPES.SALES_BY_PAYMENT_METHOD,
        title: 'ยอดขายแยกตามวิธีชำระ',
        description: 'วิเคราะห์พฤติกรรมการชำระเงิน',
        icon: '💳'
      }
    ]
  },
  {
    id: 'financial',
    title: 'รายงานการเงิน',
    icon: '💰',
    color: '#F59E0B',
    reports: [
      {
        id: REPORT_TYPES.REVENUE_SUMMARY,
        title: 'สรุปรายได้',
        description: 'ดูรายได้รวมและรายละเอียด',
        icon: '💵'
      },
      {
        id: REPORT_TYPES.PAYMENT_COLLECTION,
        title: 'การเก็บเงิน',
        description: 'ติดตามการเก็บเงินและการชำระ',
        icon: '🏦'
      },
      {
        id: REPORT_TYPES.OUTSTANDING_BALANCE,
        title: 'ยอดค้างชำระ',
        description: 'ตรวจสอบยอดค้างชำระทั้งหมด',
        icon: '⚠️'
      },
      {
        id: REPORT_TYPES.PROFIT_LOSS,
        title: 'กำไร-ขาดทุน',
        description: 'วิเคราะห์ผลกำไรและขาดทุน',
        icon: '📊'
      },
      {
        id: REPORT_TYPES.CASH_FLOW,
        title: 'กระแสเงินสด',
        description: 'ติดตามการไหลของเงินสด',
        icon: '💸'
      }
    ]
  },
  {
    id: 'customers',
    title: 'รายงานลูกค้า',
    icon: '👥',
    color: '#EF4444',
    reports: [
      {
        id: REPORT_TYPES.CUSTOMER_SUMMARY,
        title: 'สรุปข้อมูลลูกค้า',
        description: 'ดูข้อมูลลูกค้าทั้งหมด',
        icon: '👤'
      },
      {
        id: REPORT_TYPES.CUSTOMER_BY_LOCATION,
        title: 'ลูกค้าแยกตามพื้นที่',
        description: 'วิเคราะห์ลูกค้าตามภูมิภาค',
        icon: '🗺️'
      },
      {
        id: REPORT_TYPES.CUSTOMER_VERIFICATION_STATUS,
        title: 'สถานะการยืนยันลูกค้า',
        description: 'ติดตามการยืนยันตัวตนลูกค้า',
        icon: '✅'
      },
      {
        id: REPORT_TYPES.CUSTOMER_PAYMENT_HISTORY,
        title: 'ประวัติการชำระของลูกค้า',
        description: 'ดูประวัติการชำระของแต่ละลูกค้า',
        icon: '📋'
      }
    ]
  },
  {
    id: 'inventory',
    title: 'รายงานสินค้า',
    icon: '📦',
    color: '#8B5CF6',
    reports: [
      {
        id: REPORT_TYPES.INVENTORY_SUMMARY,
        title: 'สรุปสินค้าคงเหลือ',
        description: 'ดูสินค้าคงเหลือทั้งหมด',
        icon: '📦'
      },
      {
        id: REPORT_TYPES.PRODUCT_PERFORMANCE,
        title: 'ประสิทธิภาพของสินค้า',
        description: 'วิเคราะห์ประสิทธิภาพของแต่ละสินค้า',
        icon: '📊'
      },
      {
        id: REPORT_TYPES.ICLOUD_STATUS_REPORT,
        title: 'สถานะ iCloud',
        description: 'ติดตามสถานะ iCloud ของสินค้า',
        icon: '☁️'
      },
      {
        id: REPORT_TYPES.CONSIGNMENT_SUMMARY,
        title: 'สรุปสินค้าฝากขาย',
        description: 'ดูสินค้าฝากขายทั้งหมด',
        icon: '🤝'
      }
    ]
  },
  {
    id: 'operational',
    title: 'รายงานการดำเนินงาน',
    icon: '⚙️',
    color: '#06B6D4',
    reports: [
      {
        id: REPORT_TYPES.CONTRACT_STATUS_SUMMARY,
        title: 'สรุปสถานะสัญญา',
        description: 'ดูสถานะสัญญาทั้งหมด',
        icon: '📄'
      },
      {
        id: REPORT_TYPES.DEFAULT_CONTRACTS,
        title: 'สัญญาที่ผิดนัด',
        description: 'ติดตามสัญญาที่ผิดนัดชำระ',
        icon: '🚨'
      },
      {
        id: REPORT_TYPES.COMMISSION_SUMMARY,
        title: 'สรุปค่าคอมมิชชัน',
        description: 'คำนวณค่าคอมมิชชันของพนักงาน',
        icon: '💼'
      },
      {
        id: REPORT_TYPES.AUDIT_LOGS,
        title: 'บันทึกการเปลี่ยนแปลง',
        description: 'ดูประวัติการเปลี่ยนแปลงในระบบ',
        icon: '📝'
      }
    ]
  }
];

const ReportsModal: FC<ReportsModalProps> = ({ open, onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('sales');
  const [selectedReport, setSelectedReport] = useState<ReportType | null>(null);
  const [dateRangeOption, setDateRangeOption] = useState<DateRangeOption>(DATE_RANGE_OPTIONS.THIS_MONTH);
  const [customDateRange, setCustomDateRange] = useState<DateRange>({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [filters] = useState<ReportFilters>({});
  const [exportFormat, setExportFormat] = useState<ExportFormat>(EXPORT_FORMATS.EXCEL);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewResponse | null>(null);
  const [previewResponseInfo, setPreviewResponseInfo] = useState<{
    status: number;
    headers: Record<string, string>;
    timestamp: string;
  } | null>(null);
  const [reportHistory, setReportHistory] = useState<ReportHistoryItem[]>([]);
  const [currentPage] = useState(1);
  const [selectedReportDetails, setSelectedReportDetails] = useState<ReportHistoryItem | null>(null);
  const [showMobileModal, setShowMobileModal] = useState(false);

  // ตรวจสอบหน้าจอมือถือ
  const isMobile = () => {
    return window.innerWidth <= 768;
  };

  // ตรวจสอบเมื่อเปิด modal
  useEffect(() => {
    if (open && isMobile()) {
      setShowMobileModal(true);
    }
  }, [open]);

  const handleMobileCancel = () => {
    setShowMobileModal(false);
    onClose();
  };

  const loadReportHistory = useCallback(async () => {
    try {
      const response = await getReportHistory({
        page: currentPage,
        limit: 10
      });
      setReportHistory(response.reports);
    } catch (error) {
      console.error('Error loading report history:', error);
      toast.error('ไม่สามารถโหลดประวัติรายงานได้');
    }
  }, [currentPage]);

  useEffect(() => {
    if (open) {
      loadReportHistory();
    }
  }, [open, loadReportHistory]);

  // ถ้าระบบรายงานถูกปิดใช้งาน ให้แสดงข้อความแจ้งเตือน
  if (!REPORT_FEATURE_FLAGS.REPORTS_SYSTEM_ENABLED) {
    return (
      <div className={styles.overlay}>
        <div className={styles.modal}>
          <div className={styles.header}>
            <h2 className={styles.title}>ระบบรายงาน</h2>
            <button className={styles.closeButton} onClick={onClose}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={styles.closeIcon}>
                <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          <div className={styles.content}>
            <div className={styles.featureDisabled}>
              <div className={styles.disabledIcon}>🚫</div>
              <h3>ฟีเจอร์ไม่พร้อมใช้งาน</h3>
              <p>ระบบรายงานกำลังอยู่ในระหว่างการบำรุงรักษา</p>
              <p>กรุณาลองใหม่อีกครั้งในภายหลัง</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleReportSelect = (reportId: ReportType) => {
    // Log การเลือกรายงาน
    console.log('📊 เลือกรายงาน:', {
      reportId,
      timestamp: new Date().toISOString(),
      featureFlags: {
        reportsSystemEnabled: REPORT_FEATURE_FLAGS.REPORTS_SYSTEM_ENABLED,
        salesReportsEnabled: REPORT_FEATURE_FLAGS.SALES_REPORTS_ENABLED,
        financialReportsEnabled: REPORT_FEATURE_FLAGS.FINANCIAL_REPORTS_ENABLED,
        customerReportsEnabled: REPORT_FEATURE_FLAGS.CUSTOMER_REPORTS_ENABLED,
        inventoryReportsEnabled: REPORT_FEATURE_FLAGS.INVENTORY_REPORTS_ENABLED,
        operationalReportsEnabled: REPORT_FEATURE_FLAGS.OPERATIONAL_REPORTS_ENABLED
      }
    });

    // ตรวจสอบ feature flags ตามประเภทรายงาน
    const isReportEnabled = (() => {
      switch (reportId) {
        case REPORT_TYPES.SALES_SUMMARY:
        case REPORT_TYPES.SALES_BY_PERIOD:
        case REPORT_TYPES.SALES_BY_PRODUCT:
        case REPORT_TYPES.SALES_BY_ADMIN:
        case REPORT_TYPES.SALES_BY_PAYMENT_METHOD:
          return REPORT_FEATURE_FLAGS.SALES_REPORTS_ENABLED;
        
        case REPORT_TYPES.REVENUE_SUMMARY:
        case REPORT_TYPES.PAYMENT_COLLECTION:
        case REPORT_TYPES.OUTSTANDING_BALANCE:
        case REPORT_TYPES.PROFIT_LOSS:
        case REPORT_TYPES.CASH_FLOW:
          return REPORT_FEATURE_FLAGS.FINANCIAL_REPORTS_ENABLED;
        
        case REPORT_TYPES.CUSTOMER_SUMMARY:
        case REPORT_TYPES.CUSTOMER_BY_LOCATION:
        case REPORT_TYPES.CUSTOMER_VERIFICATION_STATUS:
        case REPORT_TYPES.CUSTOMER_PAYMENT_HISTORY:
          return REPORT_FEATURE_FLAGS.CUSTOMER_REPORTS_ENABLED;
        
        case REPORT_TYPES.INVENTORY_SUMMARY:
        case REPORT_TYPES.PRODUCT_PERFORMANCE:
        case REPORT_TYPES.ICLOUD_STATUS_REPORT:
          return REPORT_FEATURE_FLAGS.INVENTORY_REPORTS_ENABLED;
        
        case REPORT_TYPES.CONSIGNMENT_SUMMARY:
          return REPORT_FEATURE_FLAGS.CONSIGNMENT_SUMMARY_ENABLED;
        
        case REPORT_TYPES.CONTRACT_STATUS_SUMMARY:
          return REPORT_FEATURE_FLAGS.OPERATIONAL_REPORTS_ENABLED;
        
        case REPORT_TYPES.DEFAULT_CONTRACTS:
          return REPORT_FEATURE_FLAGS.DEFAULT_CONTRACTS_ENABLED;
        
        case REPORT_TYPES.COMMISSION_SUMMARY:
          return REPORT_FEATURE_FLAGS.COMMISSION_SUMMARY_ENABLED;
        
        case REPORT_TYPES.AUDIT_LOGS:
          return REPORT_FEATURE_FLAGS.OPERATIONAL_REPORTS_ENABLED;
        
        default:
          return true;
      }
    })();

    if (!isReportEnabled) {
      toast.error('รายงานนี้ไม่พร้อมใช้งานในขณะนี้');
      console.log('❌ รายงานถูกปิดใช้งาน:', reportId);
      return;
    }

    setSelectedReport(reportId);
    setPreviewData(null);
    
    console.log('✅ เลือกรายงานสำเร็จ:', reportId);
  };

  const handleDateRangeChange = (option: DateRangeOption) => {
    setDateRangeOption(option);
    if (option !== DATE_RANGE_OPTIONS.CUSTOM) {
      setCustomDateRange(createDateRangeFromOption(option));
    }
  };

  const getCurrentDateRange = (): DateRange => {
    if (dateRangeOption === DATE_RANGE_OPTIONS.CUSTOM) {
      return customDateRange;
    }
    return createDateRangeFromOption(dateRangeOption);
  };

  const handlePreview = async () => {
    if (!selectedReport) {
      toast.error('กรุณาเลือกรายงาน');
      return;
    }

    setIsPreviewing(true);
    try {
      const dateRange = getCurrentDateRange();
      const startTime = new Date();
      
      const previewResponse = await previewReport({
        reportType: selectedReport,
        dateRange,
        filters,
        format: 'preview',
        includeCharts: false,
        language: 'th',
        timezone: 'Asia/Bangkok'
      });
      
      const endTime = new Date();
      const responseTime = endTime.getTime() - startTime.getTime();
      
      setPreviewData(previewResponse);
      setPreviewResponseInfo({
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'X-Response-Time': `${responseTime}ms`
        },
        timestamp: endTime.toISOString()
      });
      
      toast.success('ดูตัวอย่างรายงานสำเร็จ');
    } catch (error) {
      console.error('Error previewing report:', error);
      toast.error('ไม่สามารถดูตัวอย่างรายงานได้');
      setPreviewResponseInfo({
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        },
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsPreviewing(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!selectedReport) {
      toast.error('กรุณาเลือกรายงาน');
      return;
    }

    setIsGenerating(true);
    try {
      const dateRange = getCurrentDateRange();
      
      // สร้างรายงานและบันทึกลงฐานข้อมูล
      await generateReportData({
        reportType: selectedReport,
        dateRange,
        filters,
        format: 'json',
        language: 'th',
        timezone: 'Asia/Bangkok'
      });
      
      // ดาวน์โหลดไฟล์ Excel
      const blob = await generateReport({
        reportType: selectedReport,
        dateRange,
        filters,
        includeCharts: false,
        format: exportFormat,
        language: 'th',
        timezone: 'Asia/Bangkok'
      });

      const filename = generateFilename(selectedReport, dateRange, exportFormat);
      downloadBlob(blob, filename);
      
      toast.success('สร้างรายงาน Excel สำเร็จ');
      
      // โหลดประวัติใหม่หลังจากสร้างรายงานสำเร็จ
      loadReportHistory();
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('ไม่สามารถสร้างรายงานได้');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (!confirm('คุณต้องการลบรายงานนี้หรือไม่?')) return;

    try {
      await deleteReport(reportId);
      toast.success('ลบรายงานสำเร็จ');
      loadReportHistory();
    } catch (error) {
      console.error('Error deleting report:', error);
      toast.error('ไม่สามารถลบรายงานได้');
    }
  };

  const handleDownloadReport = async (reportId: string) => {
    try {
      const blob = await downloadReportFromHistory(reportId);
      const filename = `report_${reportId}.xlsx`;
      downloadBlob(blob, filename);
      toast.success('ดาวน์โหลดรายงานสำเร็จ');
      
      // โหลดประวัติใหม่หลังจากดาวน์โหลดสำเร็จ
      loadReportHistory();
    } catch (error) {
      console.error('Error downloading report:', error);
      toast.error('ไม่สามารถดาวน์โหลดรายงานได้');
    }
  };

  const formatFileSize = (size: string) => {
    return size || 'N/A';
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'N/A';
    }
  };

  // ถ้าเป็นมือถือและเปิด modal ให้แสดง MobileAccessModal แทน
  if (open && isMobile()) {
    return (
      <MobileAccessModal
        open={showMobileModal}
        mode="block"
        onCancel={handleMobileCancel}
      />
    );
  }

  // ถ้าไม่เปิด modal หรือเป็นมือถือ ให้ไม่แสดงอะไร
  if (!open) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>ระบบรายงาน</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={styles.closeIcon}>
              <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.sidebar}>
            <div className={styles.categoryTabs}>
              {reportCategories.map((category) => (
                <button
                  key={category.id || `category-${Math.random()}`}
                  className={`${styles.categoryTab} ${selectedCategory === (category.id || '') ? styles.active : ''}`}
                  onClick={() => setSelectedCategory(category.id || '')}
                >
                  <span className={styles.categoryIcon}>{category.icon || '📄'}</span>
                  <span className={styles.categoryTitle}>{category.title || 'N/A'}</span>
                </button>
              ))}
            </div>

            <div className={styles.reportList}>
              <h3 className={styles.sectionTitle}>เลือกรายงาน</h3>
              {reportCategories
                .find(cat => (cat.id || '') === selectedCategory)
                ?.reports.map((report) => {
                  // ตรวจสอบ feature flags ตามประเภทรายงาน
                  const isReportEnabled = (() => {
                    switch (report.id) {
                      case REPORT_TYPES.SALES_SUMMARY:
                      case REPORT_TYPES.SALES_BY_PERIOD:
                      case REPORT_TYPES.SALES_BY_PRODUCT:
                      case REPORT_TYPES.SALES_BY_ADMIN:
                      case REPORT_TYPES.SALES_BY_PAYMENT_METHOD:
                        return REPORT_FEATURE_FLAGS.SALES_REPORTS_ENABLED;
                      
                      case REPORT_TYPES.REVENUE_SUMMARY:
                      case REPORT_TYPES.PAYMENT_COLLECTION:
                      case REPORT_TYPES.OUTSTANDING_BALANCE:
                      case REPORT_TYPES.PROFIT_LOSS:
                      case REPORT_TYPES.CASH_FLOW:
                        return REPORT_FEATURE_FLAGS.FINANCIAL_REPORTS_ENABLED;
                      
                      case REPORT_TYPES.CUSTOMER_SUMMARY:
                      case REPORT_TYPES.CUSTOMER_BY_LOCATION:
                      case REPORT_TYPES.CUSTOMER_VERIFICATION_STATUS:
                      case REPORT_TYPES.CUSTOMER_PAYMENT_HISTORY:
                        return REPORT_FEATURE_FLAGS.CUSTOMER_REPORTS_ENABLED;
                      
                      case REPORT_TYPES.INVENTORY_SUMMARY:
                      case REPORT_TYPES.PRODUCT_PERFORMANCE:
                      case REPORT_TYPES.ICLOUD_STATUS_REPORT:
                        return REPORT_FEATURE_FLAGS.INVENTORY_REPORTS_ENABLED;
                      
                      case REPORT_TYPES.CONSIGNMENT_SUMMARY:
                        return REPORT_FEATURE_FLAGS.CONSIGNMENT_SUMMARY_ENABLED;
                      
                      case REPORT_TYPES.CONTRACT_STATUS_SUMMARY:
                        return REPORT_FEATURE_FLAGS.OPERATIONAL_REPORTS_ENABLED;
                      
                      case REPORT_TYPES.DEFAULT_CONTRACTS:
                        return REPORT_FEATURE_FLAGS.DEFAULT_CONTRACTS_ENABLED;
                      
                      case REPORT_TYPES.COMMISSION_SUMMARY:
                        return REPORT_FEATURE_FLAGS.COMMISSION_SUMMARY_ENABLED;
                      
                      case REPORT_TYPES.AUDIT_LOGS:
                        return REPORT_FEATURE_FLAGS.OPERATIONAL_REPORTS_ENABLED;
                      
                      default:
                        return true;
                    }
                  })();

                  return (
                    <div
                      key={report.id || `report-${Math.random()}`}
                      className={`${styles.reportItem} ${selectedReport === (report.id || '') ? styles.selected : ''} ${!isReportEnabled ? styles.disabled : ''}`}
                      onClick={() => isReportEnabled ? handleReportSelect(report.id || '' as ReportType) : null}
                    >
                      <div className={styles.reportIcon}>
                        {report.icon || '📄'}
                        {!isReportEnabled && <span className={styles.disabledIndicator}>🚫</span>}
                      </div>
                      <div className={styles.reportInfo}>
                        <h4 className={styles.reportTitle}>
                          {report.title || 'N/A'}
                        </h4>
                        <p className={styles.reportDescription}>
                          {report.description || 'N/A'}
                        </p>
                      </div>
                      
                      {!isReportEnabled && (
                        <div className={styles.disabledOverlay}>
                          <div className={styles.disabledContent}>
                            <div className={styles.disabledRow}>
                              <div className={styles.disabledIcon}>🚫</div>
                              <div className={styles.disabledText}>ไม่พร้อมใช้งาน</div>
                            </div>
                            <div className={styles.disabledSubtext}>ไม่รวมในแพ็คเกจปัจจุบัน</div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>

          <div className={styles.mainContent}>
            {selectedReport ? (
              <div className={styles.reportOptions}>
                <h3 className={styles.sectionTitle}>ตัวเลือกรายงาน</h3>
                
                {/* แจ้งเตือนข้อมูล */}
                <div className={styles.warningBanner}>
                  <div className={styles.warningIcon}>⚠️</div>
                  <div className={styles.warningContent}>
                    <div className={styles.warningTitle}>ข้อมูลอาจไม่ครบถ้วน</div>
                    <div className={styles.warningText}>
                      รายงานนี้แสดงข้อมูลพื้นฐานเท่านั้น อาจไม่ตรงกับความต้องการที่ซับซ้อน 
                      กรุณาตรวจสอบข้อมูลก่อนนำไปใช้งาน
                    </div>
                  </div>
                </div>
                
                <div className={styles.optionGroup}>
                  <label className={styles.optionLabel}>ช่วงเวลา:</label>
                  <select 
                    className={styles.dateSelect}
                    value={dateRangeOption}
                    onChange={(e) => handleDateRangeChange(e.target.value as DateRangeOption)}
                  >
                    <option value={DATE_RANGE_OPTIONS.TODAY}>วันนี้</option>
                    <option value={DATE_RANGE_OPTIONS.YESTERDAY}>เมื่อวาน</option>
                    <option value={DATE_RANGE_OPTIONS.THIS_WEEK}>สัปดาห์นี้</option>
                    <option value={DATE_RANGE_OPTIONS.THIS_MONTH}>เดือนนี้</option>
                    <option value={DATE_RANGE_OPTIONS.LAST_MONTH}>เดือนที่แล้ว</option>
                    <option value={DATE_RANGE_OPTIONS.THIS_YEAR}>ปีนี้</option>
                    <option value={DATE_RANGE_OPTIONS.LAST_YEAR}>ปีที่แล้ว</option>
                    <option value={DATE_RANGE_OPTIONS.CUSTOM}>กำหนดเอง</option>
                  </select>
                </div>

                {dateRangeOption === DATE_RANGE_OPTIONS.CUSTOM && (
                  <div className={styles.customDateRange}>
                    <div className={styles.dateInput}>
                      <label>วันที่เริ่มต้น:</label>
                      <input
                        type="date"
                        value={customDateRange?.startDate || ''}
                        onChange={(e) => setCustomDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                      />
                    </div>
                    <div className={styles.dateInput}>
                      <label>วันที่สิ้นสุด:</label>
                      <input
                        type="date"
                        value={customDateRange?.endDate || ''}
                        onChange={(e) => setCustomDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                      />
                    </div>
                  </div>
                )}

                <div className={styles.optionGroup}>
                  <label className={styles.optionLabel}>รูปแบบไฟล์:</label>
                  <div className={styles.formatOptions}>
                    <label className={styles.formatOption}>
                      <input
                        type="radio"
                        name="format"
                        value={EXPORT_FORMATS.EXCEL}
                        checked={exportFormat === EXPORT_FORMATS.EXCEL}
                        onChange={(e) => setExportFormat(e.target.value as ExportFormat)}
                      />
                      <span className={styles.formatIcon}>📊</span>
                      <span>Excel</span>
                    </label>
                  </div>
                </div>

                <div className={styles.actionButtons}>
                  {REPORT_FEATURE_FLAGS.REPORT_PREVIEW_ENABLED ? (
                    <button 
                      className={styles.previewButton}
                      onClick={handlePreview}
                      disabled={isPreviewing}
                    >
                      {isPreviewing ? 'กำลังดูตัวอย่าง...' : 'ดูตัวอย่าง'}
                    </button>
                  ) : (
                    <button 
                      className={`${styles.previewButton} ${styles.disabled}`}
                      disabled={true}
                      title="การดูตัวอย่างรายงานไม่พร้อมใช้งาน"
                    >
                      ดูตัวอย่าง (ไม่พร้อมใช้งาน)
                    </button>
                  )}
                  
                  {REPORT_FEATURE_FLAGS.REPORT_EXPORT_ENABLED ? (
                    <button 
                      className={styles.generateButton}
                      onClick={handleGenerateReport}
                      disabled={isGenerating}
                    >
                      {isGenerating ? 'กำลังสร้างรายงาน...' : 'สร้างรายงาน Excel'}
                    </button>
                  ) : (
                    <button 
                      className={`${styles.generateButton} ${styles.disabled}`}
                      disabled={true}
                      title="การส่งออกรายงานไม่พร้อมใช้งาน"
                    >
                      สร้างรายงาน Excel (ไม่พร้อมใช้งาน)
                    </button>
                  )}
                </div>

                {previewData && (
                  <div className={styles.previewSection}>
                    <h4>API Response (Preview):</h4>
                    <div className={styles.apiResponse}>
                      <p><strong>URL:</strong> /api/reports/preview</p>
                      <p><strong>Method:</strong> POST</p>
                      {previewResponseInfo && (
                        <>
                          <p><strong>Status:</strong> {previewResponseInfo.status}</p>
                          <p><strong>Timestamp:</strong> {new Date(previewResponseInfo.timestamp).toLocaleString('th-TH')}</p>
                          <p><strong>Response Time:</strong> {previewResponseInfo.headers['X-Response-Time'] || 'N/A'}</p>
                        </>
                      )}
                      <p><strong>Request:</strong></p>
                      <pre className={styles.jsonDisplay}>
                        {JSON.stringify({
                          reportType: selectedReport,
                          dateRange: getCurrentDateRange(),
                          filters,
                          format: 'preview',
                          includeCharts: false,
                          language: 'th',
                          timezone: 'Asia/Bangkok'
                        }, null, 2)}
                      </pre>
                      <p><strong>Response:</strong></p>
                      <pre className={styles.jsonDisplay}>
                        {JSON.stringify(previewData, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>📊</div>
                <h3>เลือกรายงาน</h3>
                <p>กรุณาเลือกรายงานที่ต้องการจากเมนูด้านซ้าย</p>
              </div>
            )}
          </div>

          <div className={styles.historySection}>
            <div className={styles.historyHeader}>
              <h3 className={styles.sectionTitle}>ประวัติรายงาน</h3>
            </div>

            {REPORT_FEATURE_FLAGS.REPORT_HISTORY_ENABLED ? (
              <div className={styles.historyList}>
                {reportHistory && reportHistory.length > 0 ? (
                  <>
                    <div className={styles.apiResponse}>
                      <h4>API Response (JSON):</h4>
                      <p><strong>จำนวนรายการ:</strong> {reportHistory.length}</p>
                      <p><strong>Page:</strong> {currentPage}</p>
                      <p><strong>Limit:</strong> 10</p>
                      <p><strong>Total:</strong> {reportHistory.length}</p>
                      <p><strong>Total Pages:</strong> {Math.ceil(reportHistory.length / 10)}</p>
                    </div>
                    <h4>รายการรายงาน:</h4>
                    {reportHistory.map((report) => (
                      <div key={report.reportId || `report-${Math.random()}`} className={styles.historyItem}>
                        <div className={styles.historyInfo}>
                          <div className={styles.historyHeader}>
                            <h4>ID: {report.reportId || 'N/A'}</h4>
                            <span className={styles.reportType}>{report.reportType || 'N/A'}</span>
                          </div>
                          <p>สถานะ: <span className={`${styles.status} ${styles[report.status || 'unknown']}`}>
                            {report.status === 'completed' ? 'เสร็จสิ้น' : 
                             report.status === 'processing' ? 'กำลังประมวลผล' : 'ล้มเหลว'}
                          </span></p>
                          {report.createdBy && <p>สร้างโดย: {report.createdBy}</p>}
                          <div className={styles.historyActions}>
                            <button 
                              className={styles.viewDetailsButton}
                              onClick={() => setSelectedReportDetails(report)}
                            >
                              ดูรายละเอียด
                            </button>
                            {report.status === 'completed' && (
                              <button 
                                className={styles.downloadButton}
                                onClick={() => {
                                  if (report.reportId) {
                                    handleDownloadReport(report.reportId);
                                  } else {
                                    toast.error('ไม่พบ ID รายงาน');
                                  }
                                }}
                              >
                                ดาวน์โหลด
                              </button>
                            )}
                            <button 
                              className={styles.deleteButton}
                              onClick={() => report.reportId && handleDeleteReport(report.reportId)}
                            >
                              ลบ
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className={styles.emptyHistory}>
                    <p>ยังไม่มีรายงานที่สร้างไว้</p>
                  </div>
                )}
              </div>
            ) : (
              <div className={styles.featureDisabled}>
                <div className={styles.disabledIcon}>📋</div>
                <h3>ประวัติรายงานไม่พร้อมใช้งาน</h3>
                <p>ฟีเจอร์ประวัติรายงานกำลังอยู่ในระหว่างการบำรุงรักษา</p>
                <p>กรุณาลองใหม่อีกครั้งในภายหลัง</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal สำหรับแสดงรายละเอียดรายงาน */}
      {selectedReportDetails && (
        <div className={styles.detailsModal}>
          <div className={styles.detailsContent}>
            <div className={styles.detailsHeader}>
              <h3>รายละเอียดรายงาน</h3>
              <button 
                className={styles.closeDetailsButton}
                onClick={() => setSelectedReportDetails(null)}
              >
                ✕
              </button>
            </div>
            <div className={styles.detailsBody}>
              <div className={styles.detailItem}>
                <strong>ID:</strong> {selectedReportDetails.reportId}
              </div>
              <div className={styles.detailItem}>
                <strong>ประเภท:</strong> {selectedReportDetails.reportType}
              </div>
              <div className={styles.detailItem}>
                <strong>สร้างเมื่อ:</strong> {formatDate(selectedReportDetails.generatedAt || '')}
              </div>
              <div className={styles.detailItem}>
                <strong>ช่วงเวลา:</strong> {selectedReportDetails.dateRange?.startDate || 'N/A'} - {selectedReportDetails.dateRange?.endDate || 'N/A'}
              </div>
              <div className={styles.detailItem}>
                <strong>สถานะ:</strong> 
                <span className={`${styles.status} ${styles[selectedReportDetails.status || 'unknown']}`}>
                  {selectedReportDetails.status === 'completed' ? 'เสร็จสิ้น' : 
                   selectedReportDetails.status === 'processing' ? 'กำลังประมวลผล' : 'ล้มเหลว'}
                </span>
              </div>
              {selectedReportDetails.createdBy && (
                <div className={styles.detailItem}>
                  <strong>สร้างโดย:</strong> {selectedReportDetails.createdBy}
                </div>
              )}
              {selectedReportDetails.fileSize && (
                <div className={styles.detailItem}>
                  <strong>ขนาดไฟล์:</strong> {formatFileSize(selectedReportDetails.fileSize)}
                </div>
              )}
              {selectedReportDetails.fileName && (
                <div className={styles.detailItem}>
                  <strong>ชื่อไฟล์:</strong> {selectedReportDetails.fileName}
                </div>
              )}
            </div>
            <div className={styles.detailsActions}>
              {selectedReportDetails.status === 'completed' && (
                <button 
                  className={styles.downloadButton}
                  onClick={() => {
                    if (selectedReportDetails.reportId) {
                      handleDownloadReport(selectedReportDetails.reportId);
                    }
                  }}
                >
                  ดาวน์โหลด
                </button>
              )}
              <button 
                className={styles.deleteButton}
                onClick={() => {
                  if (selectedReportDetails.reportId) {
                    handleDeleteReport(selectedReportDetails.reportId);
                    setSelectedReportDetails(null);
                  }
                }}
              >
                ลบรายงาน
              </button>
            </div>
          </div>
        </div>
      )}

      {showMobileModal && (
        <MobileAccessModal
          open={showMobileModal}
          mode="block"
          onCancel={handleMobileCancel}
        />
      )}
    </div>
  );
};

export default ReportsModal; 