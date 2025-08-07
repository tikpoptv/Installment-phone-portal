import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import styles from './OrderDetailPage.module.css';
import { getContractDetail, getContractPayments, getPdpaConsentFile } from '../../../services/contract.service';
import { updateContractStatus } from '../../../services/contract.service';
import type { ContractDetail, ContractPayment, Installment, Discount } from '../../../services/contract.service';
import PaymentDetailModal from '../payments/PaymentDetailModal';
import DiscountModal from './DiscountModal';
import { MdCheckCircle, MdRadioButtonUnchecked, MdPending, MdAutorenew, MdCancel, MdLock } from 'react-icons/md';
import PaymentCreateModal from '../payments/PaymentCreateModal';

function formatDate(dateStr: string) {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// ฟังก์ชัน helper สำหรับแสดง status ของ installment
function getInstallmentStatusLabel(status: string): string {
  switch (status) {
    case 'paid': return 'ชำระแล้ว';
    case 'unpaid': return 'ยังไม่ชำระ';
    case 'partial': return 'ชำระบางส่วน';
    case 'skipped': return 'ข้ามงวด';
    case 'final_payment': return 'ปิดยอด';
    default: return status;
  }
}

// ฟังก์ชัน helper สำหรับ CSS class ของ status
function getInstallmentStatusClass(status: string): string {
  switch (status) {
    case 'paid': return styles.statusPaid;
    case 'unpaid': return styles.statusUnpaid;
    case 'partial': return styles.statusPartial;
    case 'skipped': return styles.statusSkipped;
    case 'final_payment': return styles.statusFinalPayment;
    default: return styles.statusUnpaid;
  }
}

// นำ statusMap และ statusOptions จาก OrderListPage มาใช้
const statusMap: Record<string, { label: string; color: string; icon?: React.ReactNode }> = {
  active: { label: 'ผ่อนชำระอยู่', color: '#0ea5e9', icon: <MdCheckCircle color="#22c55e" size={18} style={{verticalAlign:'middle'}} /> },
  closed: { label: 'ปิดสัญญา', color: '#22c55e', icon: <MdRadioButtonUnchecked color="#64748b" size={18} style={{verticalAlign:'middle'}} /> },
  overdue: { label: 'ค้างชำระ', color: '#ef4444', icon: <MdCancel color="#ef4444" size={18} style={{verticalAlign:'middle'}} /> },
  repossessed: { label: 'ยึดสินค้า', color: '#a21caf', icon: <MdLock color="#a21caf" size={18} style={{verticalAlign:'middle'}} /> },
  processing: { label: 'รอดำเนินการ', color: '#f59e42', icon: <MdAutorenew color="#d97706" size={18} style={{verticalAlign:'middle'}} /> },
  returned: { label: 'คืนสินค้า', color: '#6366f1', icon: <MdRadioButtonUnchecked color="#6366f1" size={18} style={{verticalAlign:'middle'}} /> },
  hold_by_system: { label: 'ระบบถือครอง', color: '#8b5cf6', icon: <MdLock color="#8b5cf6" size={18} style={{verticalAlign:'middle'}} /> },
  default: { label: 'ค้างชำระ', color: '#ef4444', icon: <MdCancel color="#ef4444" size={18} style={{verticalAlign:'middle'}} /> },
};

const categoryMap: Record<string, { label: string; emoji: string }> = {
  rent: { label: 'ผ่อน', emoji: '📱' },
  buy: { label: 'ซื้อ', emoji: '💸' },
  cash_purchase: { label: 'ซื้อเงินสด', emoji: '💵' },
};

// Modal สำหรับแก้ไขสถานะคำสั่งซื้อ
const statusOptions = [
  { value: 'closed', label: 'เสร็จสิ้น' },
  { value: 'repossessed', label: 'ยึดคืน' },
  { value: 'returned', label: 'คืนสินค้า' },
];

interface OrderStatusEditModalProps {
  open: boolean;
  onClose: () => void;
  currentStatus: string;
  onSubmit: (status: string) => void;
}

const OrderStatusEditModal: React.FC<OrderStatusEditModalProps> = ({ open, onClose, currentStatus, onSubmit }) => {
  const [status, setStatus] = useState(currentStatus);
  useEffect(() => {
    const found = statusOptions.find(opt => opt.value === currentStatus);
    if (found) {
      setStatus(currentStatus);
    } else {
      setStatus('closed'); // default เป็น "เสร็จสิ้น"
    }
  }, [currentStatus]);
  if (!open) return null;
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent} style={{ maxWidth: 400, minWidth: 280 }}>
        <div className={styles.modalHeader}>
          <span>แก้ไขสถานะคำสั่งซื้อ</span>
          <button className={styles.closeBtn} onClick={onClose} aria-label="ปิด">×</button>
        </div>
        <div className={styles.modalBody}>
          <label style={{ fontWeight: 600, color: '#0ea5e9', marginBottom: 10, display: 'block' }}>สถานะใหม่</label>
          <select
            className={styles.select}
            value={status}
            onChange={e => setStatus(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', borderRadius: 8, fontSize: '1.08rem', marginBottom: 18 }}
          >
            {statusOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div className={styles.modalFooter}>
          <button className={styles.downloadBtn} style={{ background: '#e0e7ef', color: '#0ea5e9' }} onClick={onClose}>ยกเลิก</button>
          <button className={styles.downloadBtn} style={{ background: '#0ea5e9', color: '#fff' }} onClick={() => onSubmit(status)}>บันทึก</button>
        </div>
      </div>
    </div>
  );
};

// Modal แจ้งเตือนสำหรับสถานะจองโดยระบบ
function SystemHoldWarningModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.8)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 12, backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #fff 80%, #f8fafc 100%)',
        borderRadius: 24,
        padding: '40px 32px 32px 32px',
        maxWidth: 520,
        width: '100%',
        textAlign: 'center',
        position: 'relative',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3), 0 8px 32px rgba(139, 92, 246, 0.2)',
        border: '2px solid #e9d5ff',
        animation: 'modalSlideIn 0.3s ease-out'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 16, right: 16, background: 'none', border: 'none',
            fontSize: 28, color: '#8b5cf6', cursor: 'pointer', borderRadius: '50%', width: 40, height: 40,
            transition: 'background 0.15s', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
          aria-label="ปิด"
          onMouseOver={e => (e.currentTarget.style.background = '#f3f4f6')}
          onMouseOut={e => (e.currentTarget.style.background = 'none')}
        >×</button>
        
        <div style={{ 
          fontSize: 64, 
          marginBottom: 20, 
          filter: 'drop-shadow(0 4px 16px rgba(139, 92, 246, 0.3))',
          animation: 'pulse 2s ease-in-out infinite'
        }}>
          🔒
        </div>
        
        <div style={{ 
          fontWeight: 900, 
          fontSize: '1.5rem', 
          color: '#8b5cf6', 
          marginBottom: 16, 
          letterSpacing: 0.5 
        }}>
          คำสั่งซื้อถูกระบบถือครอง
        </div>
        
        <div style={{ 
          color: '#475569', 
          fontSize: '1.1rem', 
          marginBottom: 24, 
          lineHeight: 1.7, 
          fontWeight: 500 
        }}>
          คำสั่งซื้อนี้อยู่ในสถานะ <strong style={{ color: '#8b5cf6' }}>"ระบบถือครอง"</strong><br/>
          <span style={{ color: '#64748b', fontSize: '1rem' }}>
            การดำเนินการบางอย่างอาจถูกจำกัดหรือไม่สามารถทำได้
          </span>
        </div>
        
        <div style={{
          background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
          borderRadius: 12,
          padding: '16px 20px',
          marginBottom: 28,
          border: '1px solid #d1d5db'
        }}>
          <div style={{ 
            color: '#374151', 
            fontSize: '0.95rem', 
            fontWeight: 600,
            marginBottom: 8 
          }}>
            สาเหตุที่เป็นไปได้:
          </div>
          <ul style={{ 
            color: '#6b7280', 
            fontSize: '0.9rem', 
            textAlign: 'left',
            margin: 0,
            paddingLeft: 20,
            lineHeight: 1.6
          }}>
            <li>สินค้าถูกจองโดยระบบอัตโนมัติ</li>
            <li>อยู่ระหว่างการประมวลผลข้อมูล</li>
            <li>มีการบำรุงรักษาระบบ</li>
            <li>การตรวจสอบความถูกต้องของข้อมูล</li>
          </ul>
        </div>
        
        <button
          style={{
            background: 'linear-gradient(90deg, #8b5cf6 0%, #7c3aed 100%)', 
            color: '#fff', 
            border: 'none', 
            borderRadius: 16,
            padding: '16px 40px', 
            fontWeight: 800, 
            fontSize: '1.1rem', 
            cursor: 'pointer', 
            boxShadow: '0 4px 16px rgba(139, 92, 246, 0.3)',
            letterSpacing: 0.5, 
            transition: 'all 0.2s',
            minWidth: 160
          }}
          onClick={onClose}
          onMouseOver={e => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(139, 92, 246, 0.4)';
          }}
          onMouseOut={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(139, 92, 246, 0.3)';
          }}
        >
          เข้าใจแล้ว
        </button>
      </div>
    </div>
  );
}

const OrderDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contract, setContract] = useState<ContractDetail | null>(null);
  const [payments, setPayments] = useState<ContractPayment[]>([]);
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [remainingAmount, setRemainingAmount] = useState<number>(0);
  const [overdueMonths, setOverdueMonths] = useState<number>(0);
  const [totalDueThisMonth, setTotalDueThisMonth] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(true);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [showPdpaModal, setShowPdpaModal] = useState(false);
  const [pdpaBlobUrl, setPdpaBlobUrl] = useState<string | null>(null);
  const [pdpaLoading, setPdpaLoading] = useState(false);
  const [pdpaError, setPdpaError] = useState<string | null>(null);
  const [showPaymentDetailModal, setShowPaymentDetailModal] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  const [showAddDiscountModal, setShowAddDiscountModal] = useState(false);
  const [showInstallmentDetailModal, setShowInstallmentDetailModal] = useState(false);
  const [selectedInstallment, setSelectedInstallment] = useState<Installment | null>(null);
  const [showDiscountDetailModal, setShowDiscountDetailModal] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState<Discount | null>(null);
  const [showEditStatusModal, setShowEditStatusModal] = useState(false);
  const [showCreatePaymentModal, setShowCreatePaymentModal] = useState(false);
  const [showCreatePaymentTooltip, setShowCreatePaymentTooltip] = useState(false);
  const [showSystemHoldWarning, setShowSystemHoldWarning] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    getContractDetail(id)
      .then(data => setContract(data))
      .catch(() => setError('ไม่พบข้อมูลคำสั่งซื้อ'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id) return;
    setPaymentLoading(true);
    setPaymentError(null);
    getContractPayments(id)
      .then(data => {
        setPayments(data.payments ?? []);
        setInstallments(data.installments ?? []);
        setDiscounts(data.discounts ?? []);
        setRemainingAmount(data.remaining_amount ?? 0);
        setOverdueMonths(data.overdue_months ?? 0);
        setTotalDueThisMonth(data.total_due_this_month ?? 0);
      })
      .catch(() => setPaymentError('ไม่พบข้อมูลการชำระเงิน'))
      .finally(() => setPaymentLoading(false));
  }, [id]);

  // แสดง Modal ทันทีเมื่อสถานะเป็นจองโดยระบบ
  useEffect(() => {
    if (contract && contract.status === 'hold_by_system') {
      setShowSystemHoldWarning(true);
    }
  }, [contract]);

  const handleShowPdpaModal = async () => {
    setPdpaLoading(true);
    setPdpaError(null);
    setShowPdpaModal(true);
    try {
      const blob = await getPdpaConsentFile(
        contract?.id as string,
        contract?.pdpa_consent_file_filename as string
      );
      const url = URL.createObjectURL(blob);
      setPdpaBlobUrl(url);
    } catch (e) {
      setPdpaError('ไม่สามารถโหลดไฟล์ได้');
      console.error(e);
    } finally {
      setPdpaLoading(false);
    }
  };

  const handleClosePdpaModal = () => {
    setShowPdpaModal(false);
    if (pdpaBlobUrl) {
      URL.revokeObjectURL(pdpaBlobUrl);
    }
    setPdpaBlobUrl(null);
    setPdpaError(null);
    setPdpaLoading(false);
  };

  if (loading) return <div className={styles.container}><div className={styles.contentBox}>กำลังโหลดข้อมูล...</div></div>;
  if (error || !contract) return <div className={styles.container}><div className={styles.contentBox}>{error || 'ไม่พบข้อมูลคำสั่งซื้อ'}</div></div>;

  const o = contract;
  const status = statusMap[o.status] || { label: o.status, color: '', icon: null };
  const category = categoryMap[o.category] || { label: o.category, emoji: '' };

  // ตรวจสอบสถานะจองโดยระบบ
  const isSystemHold = o.status === 'hold_by_system';
  
  // ตรวจสอบว่าสามารถสร้างรายการชำระได้หรือไม่
  const canCreatePayment = (o.status === 'active' || o.status === 'default') && !isSystemHold;

  return (
    <div className={styles.container}>
      <SystemHoldWarningModal 
        open={showSystemHoldWarning} 
        onClose={() => {
          setShowSystemHoldWarning(false);
          // พาไปหน้า list เมื่อปิด Modal
          navigate('/admin/orders');
        }} 
      />
      <div className={styles.contentBox}>
        <div className={styles.topBar}>
          <button className={styles.backBtn} onClick={() => navigate(-1)} title="ย้อนกลับ">←</button>
          <div className={styles.title}>รายละเอียดคำสั่งซื้อ</div>
          <button
            className={styles.addDiscountBtn}
            style={{ 
              marginLeft: 'auto', 
              background: isSystemHold ? '#f3f4f6' : 'linear-gradient(90deg,#22c55e,#0ea5e9)', 
              color: isSystemHold ? '#6b7280' : '#fff', 
              fontWeight: 700, 
              border: 'none', 
              borderRadius: 8, 
              padding: '8px 18px', 
              fontSize: 16, 
              cursor: isSystemHold ? 'not-allowed' : 'pointer', 
              boxShadow: isSystemHold ? 'none' : '0 2px 8px #bae6fd55', 
              transition: 'background 0.18s',
              opacity: isSystemHold ? 0.6 : 1
            }}
            onClick={() => {
              if (isSystemHold) {
                setShowSystemHoldWarning(true);
              } else {
                setShowAddDiscountModal(true);
              }
            }}
            disabled={isSystemHold}
          >
            + เพิ่มส่วนลด
          </button>
        </div>
        <div className={styles.sectionCard}>
          <div className={styles.sectionTitle}>📝 ข้อมูลคำสั่งซื้อ
            <span
              className={styles.badge}
              style={{ background: (status.color || '#64748b') + '22', color: status.color || '#64748b' }}
            >
              {status.icon} {status.label}
            </span>
            <div className={styles.editOrderBtnWrapper}>
              <button
                className={styles.editOrderBtn}
                type="button"
                disabled={o.status === 'closed' || isSystemHold}
                onClick={() => {
                  if (isSystemHold) {
                    setShowSystemHoldWarning(true);
                  } else {
                    setShowEditStatusModal(true);
                  }
                }}
                style={{
                  ...(isSystemHold && {
                    background: '#f3f4f6',
                    color: '#6b7280',
                    cursor: 'not-allowed',
                    opacity: 0.6
                  })
                }}
              >
                แก้ไข
              </button>
              {(o.status === 'closed' || isSystemHold) && (
                <div className={styles.editOrderBtnTooltip}>
                  {o.status === 'closed' 
                    ? 'ไม่สามารถแก้ไขได้เมื่อสถานะเป็น "เสร็จสิ้น"'
                    : 'ไม่สามารถแก้ไขได้เมื่อสถานะเป็น "ระบบถือครอง"'
                  }
                </div>
              )}
            </div>
          </div>
          <div className={styles.section}><div className={styles.label}>รหัสคำสั่งซื้อ:</div><div className={styles.value}>{o.id}</div></div>
          <div className={styles.section}><div className={styles.label}>หมวดหมู่:</div><div className={styles.value}>{category.emoji} {category.label} ({o.category})</div></div>
          <div className={styles.section}><div className={styles.label}>วันที่เริ่มต้น:</div><div className={styles.value}>{formatDate(o.start_date)}</div></div>
          <div className={styles.section}><div className={styles.label}>วันที่สิ้นสุด:</div><div className={styles.value}>{formatDate(o.end_date)}</div></div>
          <div className={styles.section}><div className={styles.label}>วันที่ชำระเงินล่าสุด:</div><div className={styles.value}>{formatDate(o.last_payment_date || '')}</div></div>
        </div>
        <div className={styles.sectionCard}>
          <div className={styles.sectionTitle}>🙍‍♂️ ข้อมูลผู้เช่า</div>
          <div className={styles.section}><div className={styles.label}>ชื่อ-นามสกุล:</div><div className={styles.value}>{o.user ? `${o.user.first_name} ${o.user.last_name}` : '-'}</div></div>
          <div className={styles.section}><div className={styles.label}>รหัสผู้ใช้:</div><div className={styles.value}>{o.user ? o.user.id : '-'}</div></div>
          {o.user && <Link className={styles.linkBtn} to={`/admin/customers/${o.user.id}`}>ดูรายละเอียดผู้เช่า</Link>}
        </div>
        <div className={styles.sectionCard}>
          <div className={styles.sectionTitle}>📦 ข้อมูลสินค้า</div>
          <div className={styles.section}><div className={styles.label}>ชื่อรุ่น:</div><div className={styles.value}>{o.product ? o.product.model_name : '-'}</div></div>
          <div className={styles.section}><div className={styles.label}>Serial Number:</div><div className={styles.value}>{o.product ? o.product.imei : '-'}</div></div>
          <div className={styles.section}><div className={styles.label}>ราคาสินค้า:</div><div className={styles.value}>{o.product ? o.product.price.toLocaleString('th-TH', { style: 'currency', currency: 'THB' }) : '-'}</div></div>
          {o.product && <Link className={styles.linkBtn} to={`/admin/products/${o.product.id}`}>ดูรายละเอียดสินค้า</Link>}
        </div>
        <div className={styles.sectionCard}>
          <div className={styles.sectionTitle}>💳 ข้อมูลการผ่อนชำระ</div>
          {o.category === 'cash_purchase' ? (
            <>
              <div className={styles.section}><div className={styles.label}>ยอดรวม (ไม่รวมดอกเบี้ย):</div><div className={styles.value}>{o.total_price.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}</div></div>
              <div className={styles.section}><div className={styles.label}>ยอดรวม (รวมดอกเบี้ย):</div><div className={styles.value}></div></div>
              <div className={styles.section}><div className={styles.label}>เงินดาวน์:</div><div className={styles.value}></div></div>
              <div className={styles.section}><div className={styles.label}>ค่าเช่า/ผ่อน:</div><div className={styles.value}></div></div>
              <div className={styles.section}><div className={styles.label}>จำนวนงวด:</div><div className={styles.value}></div></div>
              <div className={styles.section}><div className={styles.label}>ยอดชำระต่อเดือน:</div><div className={styles.value}></div></div>
            </>
          ) : (
            <>
              <div className={styles.section}><div className={styles.label}>ยอดรวม (ไม่รวมดอกเบี้ย):</div><div className={styles.value}>{o.total_price.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}</div></div>
              <div className={styles.section}><div className={styles.label}>ยอดรวม (รวมดอกเบี้ย):</div><div className={styles.value}>{o.total_with_interest.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}</div></div>
              <div className={styles.section}><div className={styles.label}>เงินดาวน์:</div><div className={styles.value}>{typeof o.down_payment_amount === 'number' ? o.down_payment_amount.toLocaleString('th-TH', { style: 'currency', currency: 'THB' }) : '-'}</div></div>
              <div className={styles.section}><div className={styles.label}>ค่าเช่า/ผ่อน:</div><div className={styles.value}>{typeof o.rental_cost === 'number' ? o.rental_cost.toLocaleString('th-TH', { style: 'currency', currency: 'THB' }) : '-'}</div></div>
              <div className={styles.section}><div className={styles.label}>จำนวนงวด:</div><div className={styles.value}>{o.installment_months} เดือน</div></div>
              <div className={styles.section}><div className={styles.label}>ยอดชำระต่อเดือน:</div><div className={styles.value}>{o.monthly_payment.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}</div></div>
              {!paymentLoading && !paymentError && (
                <>
                  <div className={styles.section}><div className={styles.label}>ยอดคงเหลือ:</div><div className={styles.value} style={{ color: remainingAmount > 0 ? '#ef4444' : '#22c55e', fontWeight: 600 }}>{remainingAmount.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}</div></div>
                  <div className={styles.section}><div className={styles.label}>จำนวนเดือนที่ค้างชำระ:</div><div className={styles.value} style={{ color: overdueMonths > 0 ? '#ef4444' : '#22c55e', fontWeight: 600 }}>{overdueMonths} เดือน</div></div>
                  <div className={styles.section}><div className={styles.label}>ยอดที่ต้องชำระเดือนนี้:</div><div className={styles.value} style={{ color: totalDueThisMonth > 0 ? '#ef4444' : '#22c55e', fontWeight: 600 }}>{totalDueThisMonth.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}</div></div>
                </>
              )}
            </>
          )}
        </div>
        <div className={styles.sectionCard}>
          <div className={styles.sectionTitle}>📄 เอกสาร</div>
          {o.pdpa_consent_file_filename ? (
            <button
              className={styles.linkBtn}
              type="button"
              onClick={handleShowPdpaModal}
            >
              ดูไฟล์สัญญา
            </button>
          ) : (
            <div className={styles.value}>-</div>
          )}
        </div>
        {showPdpaModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
              <div className={styles.modalHeader}>
                <span>แสดงไฟล์สัญญา</span>
                <button className={styles.closeBtn} onClick={handleClosePdpaModal} aria-label="ปิด">&times;</button>
              </div>
              <div className={styles.modalBody}>
                {pdpaLoading ? (
                  <div style={{ padding: 32, textAlign: 'center' }}>กำลังโหลดไฟล์...</div>
                ) : pdpaError ? (
                  <div style={{ color: '#ef4444', padding: 32 }}>{pdpaError}</div>
                ) : pdpaBlobUrl ? (
                  <iframe
                    src={pdpaBlobUrl}
                    title="Contract File"
                    width="100%"
                    height="500px"
                    style={{ border: '1px solid #ddd', borderRadius: 8 }}
                  />
                ) : null}
              </div>
              <div className={styles.modalFooter}>
                {pdpaBlobUrl && (
                  <a
                    href={pdpaBlobUrl}
                    download={o.pdpa_consent_file_filename}
                    className={styles.downloadBtn}
                  >
                    ดาวน์โหลดไฟล์
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
        <div className={styles.sectionCard}>
          <div className={styles.sectionTitle} style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <span>💰 ประวัติการชำระเงิน</span>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <button
                className={styles.addDiscountBtn}
                style={{ 
                  background: canCreatePayment ? 'linear-gradient(90deg,#0ea5e9,#22c55e)' : '#f3f4f6', 
                  color: canCreatePayment ? '#fff' : '#6b7280', 
                  fontWeight: 700, 
                  border: 'none', 
                  borderRadius: 8, 
                  padding: '7px 18px', 
                  fontSize: 15, 
                  cursor: canCreatePayment ? 'pointer' : 'not-allowed', 
                  boxShadow: canCreatePayment ? '0 2px 8px #bae6fd55' : 'none', 
                  transition: 'background 0.18s', 
                  opacity: canCreatePayment ? 1 : 0.6 
                }}
                onClick={() => {
                  if (isSystemHold) {
                    setShowSystemHoldWarning(true);
                  } else if (canCreatePayment) {
                    setShowCreatePaymentModal(true);
                  }
                }}
                disabled={!canCreatePayment}
                onMouseEnter={() => { 
                  if (!canCreatePayment) setShowCreatePaymentTooltip(true); 
                }}
                onMouseLeave={() => setShowCreatePaymentTooltip(false)}
              >
                + สร้างรายการชำระ
              </button>
              {!canCreatePayment && showCreatePaymentTooltip && (
                <div style={{ position: 'absolute', top: '100%', left: 0, background: '#334155', color: '#fff', fontSize: 13, borderRadius: 6, padding: '6px 14px', marginTop: 6, whiteSpace: 'nowrap', zIndex: 10, boxShadow: '0 2px 8px #33415555' }}>
                  {isSystemHold 
                    ? 'ไม่สามารถสร้างรายการชำระได้เมื่อสถานะเป็น "ระบบถือครอง"'
                    : 'สร้างรายการชำระได้เฉพาะเมื่อสถานะคำสั่งซื้อเป็น "กำลังใช้งาน" หรือ "ค้างชำระ"'
                  }
                </div>
              )}
            </div>
          </div>
          {!paymentLoading && !paymentError && (
            <PaymentAlerts contract={o} payments={payments} installments={installments} remainingAmount={remainingAmount} overdueMonths={overdueMonths} totalDueThisMonth={totalDueThisMonth} />
          )}
          {/* ตาราง Installments */}
          {!paymentLoading && !paymentError && installments.length > 0 && (
            <div style={{marginBottom: 18}}>
              <div className={styles.sectionSubtitle}>📆 ตารางงวดผ่อน</div>
              <div style={{ overflowX: 'auto', width: '100%' }}>
                <table className={styles.paymentTable} style={{marginBottom: 8}}>
                  <thead>
                    <tr>
                      <th>งวดที่</th>
                      <th>ครบกำหนด</th>
                      <th>จำนวนเงิน</th>
                      <th className={styles.categoryCol}>หมวดหมู่</th>
                      <th>สถานะ</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {installments.map(inst => (
                      <tr key={inst.id}>
                        <td>{inst.installment_number}</td>
                        <td>{formatDate(inst.due_date)}</td>
                        <td>{inst.amount.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}</td>
                        <td className={styles.categoryCol}>
                          <span className={inst.category === 'down_payment' ? styles.categoryDown : styles.categoryRent}>
                            {inst.category === 'down_payment' ? 'ดาวน์' : 'ผ่อน'}
                          </span>
                        </td>
                        <td>
                          <span className={`${styles.installmentStatus} ${getInstallmentStatusClass(inst.status)}`}>
                            {getInstallmentStatusLabel(inst.status)}
                          </span>
                        </td>
                        <td>
                          <button 
                            type="button" 
                            className={styles.linkBtn} 
                            onClick={() => { 
                              setSelectedInstallment(inst); 
                              setShowInstallmentDetailModal(true); 
                            }}
                            style={{ fontSize: 12, padding: '3px 8px' }}
                          >
                            ดูรายละเอียด
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {/* ตาราง Discounts */}
          {!paymentLoading && !paymentError && discounts.length > 0 && (
            <div style={{marginBottom: 18}}>
              <div className={styles.sectionSubtitle}>🎁 ส่วนลด/ข้อเสนอพิเศษ</div>
              <div style={{ overflowX: 'auto', width: '100%' }}>
                <table className={styles.paymentTable} style={{marginBottom: 8}}>
                  <thead>
                    <tr>
                      <th>ประเภท</th>
                      <th>จำนวนส่วนลด</th>
                      <th>ยอดสุทธิ</th>
                      <th>วันที่อนุมัติ</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {discounts.map(ds => {
                      return (
                        <tr key={ds.id}>
                          <td>{ds.discount_type === 'early_closure' ? 'ปิดยอดก่อนกำหนด' : 'ข้อเสนอพิเศษ'}</td>
                          <td>{ds.discount_amount.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}</td>
                          <td>
                            {ds.final_amount.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}
                          </td>
                          <td>{formatDate(ds.approved_at)}</td>
                          <td>
                            <button 
                              type="button" 
                              className={styles.linkBtn} 
                              onClick={() => { 
                                setSelectedDiscount(ds); 
                                setShowDiscountDetailModal(true); 
                              }}
                              style={{ fontSize: 12, padding: '3px 8px' }}
                            >
                              ดูรายละเอียด
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {paymentLoading ? (
            <div style={{ padding: 16, color: '#64748b' }}>กำลังโหลดข้อมูล...</div>
          ) : paymentError ? (
            <div style={{ padding: 16, color: '#ef4444' }}>{paymentError}</div>
          ) : (
            <div className={styles.paymentTableWrapper}>
              <table className={styles.paymentTable}>
                <thead>
                  <tr>
                    <th>วันที่ชำระ</th>
                    <th>จำนวนเงิน</th>
                    <th>วิธีชำระ</th>
                    <th className={styles.statusCell}>สถานะการตรวจสอบ</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {payments.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', color: '#ef4444', fontWeight: 600, fontSize: 17, padding: 16 }}>
                        ยังไม่ได้ชำระเงินก้อนแรก{typeof o.down_payment_amount === 'number' && o.down_payment_amount > 0 ? ` (เงินดาวน์ ${o.down_payment_amount.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })})` : ''}
                      </td>
                    </tr>
                  ) : payments.map(pm => (
                    <tr key={pm.id}>
                      <td>{formatDate(pm.payment_date)}</td>
                      <td>{pm.amount.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}</td>
                      <td>{pm.method === 'bank_transfer' ? 'โอนธนาคาร' : pm.method === 'cash' ? 'เงินสด' : pm.method}</td>
                      <td className={styles.statusCell}>
                        {pm.verify_status === 'approved' ? (
                          <>
                            <MdCheckCircle color="#22c55e" size={18} style={{verticalAlign:'middle', marginRight:4}} /> อนุมัติแล้ว
                          </>
                        ) : pm.verify_status === 'rejected' ? (
                          <>
                            <MdCancel color="#ef4444" size={18} style={{verticalAlign:'middle', marginRight:4}} /> ไม่อนุมัติ
                          </>
                        ) : (
                          <>
                            <MdPending color="#eab308" size={18} style={{verticalAlign:'middle', marginRight:4}} /> รอตรวจสอบ
                          </>
                        )}
                      </td>
                      <td>
                        <button 
                          type="button" 
                          className={styles.linkBtn} 
                          onClick={() => { setSelectedPaymentId(pm.id); setShowPaymentDetailModal(true); }}
                          style={{ fontSize: 14, padding: '4px 8px' }}
                        >
                          ดูรายละเอียด
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <PaymentDetailModal
          open={showPaymentDetailModal}
          paymentId={selectedPaymentId}
          onClose={() => setShowPaymentDetailModal(false)}
          onActionSuccess={() => {
            if (id) {
              setPaymentLoading(true);
              setPaymentError(null);
              getContractPayments(id)
                .then(data => {
                  setPayments(data.payments ?? []);
                  setInstallments(data.installments ?? []);
                  setDiscounts(data.discounts ?? []);
                  setRemainingAmount(data.remaining_amount ?? 0);
                  setOverdueMonths(data.overdue_months ?? 0);
                  setTotalDueThisMonth(data.total_due_this_month ?? 0);
                })
                .catch(() => setPaymentError('ไม่พบข้อมูลการชำระเงิน'))
                .finally(() => setPaymentLoading(false));
            }
          }}
        />
        {showAddDiscountModal && (
          <DiscountModal
            open={showAddDiscountModal}
            onClose={() => setShowAddDiscountModal(false)}
            contractId={o.id}
            rentalCost={typeof o.rental_cost === 'number' ? o.rental_cost : 0}
            discounts={discounts}
            onSuccess={() => {
              setShowAddDiscountModal(false);
              if (id) {
                setPaymentLoading(true);
                setPaymentError(null);
                getContractPayments(id)
                  .then(data => {
                    setPayments(data.payments ?? []);
                    setInstallments(data.installments ?? []);
                    setDiscounts(data.discounts ?? []);
                    setRemainingAmount(data.remaining_amount ?? 0);
                    setOverdueMonths(data.overdue_months ?? 0);
                    setTotalDueThisMonth(data.total_due_this_month ?? 0);
                  })
                  .catch(() => setPaymentError('ไม่พบข้อมูลการชำระเงิน'))
                  .finally(() => setPaymentLoading(false));
              }
            }}
          />
        )}
        
        {/* Modal รายละเอียดงวดผ่อน */}
        {showInstallmentDetailModal && selectedInstallment && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
              <div className={styles.modalHeader}>
                <span>รายละเอียดงวดที่ {selectedInstallment.installment_number}</span>
                <button className={styles.closeBtn} onClick={() => { setShowInstallmentDetailModal(false); setSelectedInstallment(null); }} aria-label="ปิด">&times;</button>
              </div>
              <div className={styles.modalBody}>
                <div style={{ display: 'grid', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e5e7eb' }}>
                    <span style={{ fontWeight: 600, color: '#64748b' }}>งวดที่:</span>
                    <span style={{ fontWeight: 600 }}>{selectedInstallment.installment_number}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e5e7eb' }}>
                    <span style={{ fontWeight: 600, color: '#64748b' }}>ครบกำหนด:</span>
                    <span>{formatDate(selectedInstallment.due_date)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e5e7eb' }}>
                    <span style={{ fontWeight: 600, color: '#64748b' }}>จำนวนเงิน:</span>
                    <span style={{ fontWeight: 600, color: '#0ea5e9' }}>{selectedInstallment.amount.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e5e7eb' }}>
                    <span style={{ fontWeight: 600, color: '#64748b' }}>ชำระแล้ว:</span>
                    <span style={{ fontWeight: 600, color: selectedInstallment.amount_paid > 0 ? '#22c55e' : '#ef4444' }}>
                      {selectedInstallment.amount_paid.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e5e7eb' }}>
                    <span style={{ fontWeight: 600, color: '#64748b' }}>คงเหลือ:</span>
                    <span style={{ fontWeight: 600, color: '#ef4444' }}>
                      {(selectedInstallment.amount - selectedInstallment.amount_paid).toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e5e7eb' }}>
                    <span style={{ fontWeight: 600, color: '#64748b' }}>สถานะ:</span>
                    <span>
                      <span className={`${styles.installmentStatus} ${getInstallmentStatusClass(selectedInstallment.status)}`}>
                        {getInstallmentStatusLabel(selectedInstallment.status)}
                      </span>
                    </span>
                  </div>
                  {selectedInstallment.paid_at && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e5e7eb' }}>
                      <span style={{ fontWeight: 600, color: '#64748b' }}>วันที่ชำระ:</span>
                      <span>{formatDate(selectedInstallment.paid_at)}</span>
                    </div>
                  )}
                  {selectedInstallment.note && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e5e7eb' }}>
                      <span style={{ fontWeight: 600, color: '#64748b' }}>หมายเหตุ:</span>
                      <span>{selectedInstallment.note}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e5e7eb' }}>
                    <span style={{ fontWeight: 600, color: '#64748b' }}>หมวดหมู่:</span>
                    <span className={selectedInstallment.category === 'down_payment' ? styles.categoryDown : styles.categoryRent}>
                      {selectedInstallment.category === 'down_payment' ? 'ดาวน์' : 'ผ่อน'}
                    </span>
                  </div>
                  {selectedInstallment.is_final_payment && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e5e7eb' }}>
                      <span style={{ fontWeight: 600, color: '#64748b' }}>ประเภท:</span>
                      <span style={{ fontWeight: 600, color: '#0ea5e9' }}>งวดสุดท้าย</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        {showDiscountDetailModal && selectedDiscount && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
              <div className={styles.modalHeader}>
                <span>รายละเอียดส่วนลด/ข้อเสนอพิเศษ</span>
                <button className={styles.closeBtn} onClick={() => { setShowDiscountDetailModal(false); setSelectedDiscount(null); }} aria-label="ปิด">&times;</button>
              </div>
              <div className={styles.modalBody}>
                <div style={{ display: 'grid', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e5e7eb' }}>
                    <span style={{ fontWeight: 600, color: '#64748b' }}>ประเภท:</span>
                    <span>{selectedDiscount.discount_type === 'early_closure' ? 'ปิดยอดก่อนกำหนด' : 'ข้อเสนอพิเศษ'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e5e7eb' }}>
                    <span style={{ fontWeight: 600, color: '#64748b' }}>จำนวนส่วนลด:</span>
                    <span style={{ fontWeight: 600, color: '#0ea5e9' }}>{selectedDiscount.discount_amount.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e5e7eb' }}>
                    <span style={{ fontWeight: 600, color: '#64748b' }}>ยอดสุทธิ:</span>
                    <span style={{ fontWeight: 600, color: '#0ea5e9' }}>{selectedDiscount.final_amount.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e5e7eb' }}>
                    <span style={{ fontWeight: 600, color: '#64748b' }}>อนุมัติโดย:</span>
                    <span>{selectedDiscount.approved_by}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e5e7eb' }}>
                    <span style={{ fontWeight: 600, color: '#64748b' }}>วันที่อนุมัติ:</span>
                    <span>{formatDate(selectedDiscount.approved_at)}</span>
                  </div>
                  {selectedDiscount.note && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e5e7eb' }}>
                      <span style={{ fontWeight: 600, color: '#64748b' }}>หมายเหตุ:</span>
                      <span>{selectedDiscount.note}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        <PaymentCreateModal
          open={showCreatePaymentModal}
          onClose={() => setShowCreatePaymentModal(false)}
          onSuccess={() => {
            setShowCreatePaymentModal(false);
            if (id) {
              setPaymentLoading(true);
              setPaymentError(null);
              getContractPayments(id)
                .then(data => {
                  setPayments(data.payments ?? []);
                  setInstallments(data.installments ?? []);
                  setDiscounts(data.discounts ?? []);
                  setRemainingAmount(data.remaining_amount ?? 0);
                  setOverdueMonths(data.overdue_months ?? 0);
                  setTotalDueThisMonth(data.total_due_this_month ?? 0);
                })
                .catch(() => setPaymentError('ไม่พบข้อมูลการชำระเงิน'))
                .finally(() => setPaymentLoading(false));
            }
          }}
          contractId={o.id}
        />
        <div className={styles.meta}>
          <div>สร้างเมื่อ: {formatDate(o.created_at)}</div>
          <div>อัปเดตล่าสุด: {formatDate(o.updated_at)}</div>
        </div>
      </div>
      {/* Modal แก้ไขสถานะ */}
      <OrderStatusEditModal
        key={showEditStatusModal ? o.status : undefined}
        open={showEditStatusModal}
        onClose={() => setShowEditStatusModal(false)}
        currentStatus={o.status}
        onSubmit={async (newStatus) => {
          if (!id) return;
          setLoading(true);
          try {
            await updateContractStatus(id, newStatus);
            // refresh contract detail
            const data = await getContractDetail(id);
            setContract(data);
          } catch (error) {
            console.error(error);
            alert('เกิดข้อผิดพลาดในการอัปเดตสถานะ');
          } finally {
            setLoading(false);
            setShowEditStatusModal(false);
          }
        }}
      />
    </div>
  );
};

function PaymentAlerts({ contract, payments, installments, remainingAmount, overdueMonths, totalDueThisMonth }: { 
  contract: ContractDetail, 
  payments: ContractPayment[],
  installments: Installment[],
  remainingAmount: number,
  overdueMonths: number,
  totalDueThisMonth: number
}) {
  if (!contract) return null;
  const alerts: string[] = [];
  const now = new Date();
  const thisMonth = now.getMonth() + 1;
  const thisYear = now.getFullYear();
  
  // แสดงยอดคงเหลือ
  if (remainingAmount > 0) {
    alerts.push(`💰 ยอดคงเหลือ: ${remainingAmount.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}`);
  }
  
  // แสดงจำนวนเดือนที่ค้างชำระ
  if (overdueMonths > 0) {
    alerts.push(`⚠️ ค้างชำระ ${overdueMonths} เดือน`);
  }
  
  // แสดงยอดที่ต้องชำระเดือนนี้
  if (totalDueThisMonth > 0) {
    alerts.push(`📅 ยอดที่ต้องชำระเดือนนี้: ${totalDueThisMonth.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}`);
  }
  
  // เงินดาวน์ - อิงจาก installments ที่ category เป็น 'down_payment'
  if (Array.isArray(installments)) {
    const downInstallments = installments.filter(ins => ins.category === 'down_payment');
    if (downInstallments.length > 0) {
      const totalDown = downInstallments.reduce((sum, ins) => sum + (ins.amount || 0), 0);
      const paidDown = downInstallments.reduce((sum, ins) => sum + (ins.amount_paid || 0), 0);
      if (paidDown < totalDown) {
        alerts.push(`⚠️ เงินดาวน์ที่ต้องชำระ ${totalDown.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })} ชำระแล้ว ${paidDown.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })} คงเหลือ ${(totalDown - paidDown).toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}`);
      } else {
        alerts.push(`✅ เงินดาวน์ชำระครบแล้ว (${totalDown.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })})`);
      }
    }
  }
  
  // ตรวจสอบการจ่ายเดือนนี้ (ข้ามถ้าเป็นเดือนแรกของสัญญา)
  let paidThisMonth = 0;
  // เช็คว่าเดือนนี้เป็นเดือนแรกของสัญญา
  let isFirstMonth = false;
  if (contract.start_date) {
    const start = new Date(contract.start_date);
    isFirstMonth = (start.getFullYear() === thisYear && start.getMonth() + 1 === thisMonth);
  }
  
  // คำนวณการชำระเงินเดือนนี้เฉพาะที่อนุมัติแล้ว
  const approvedPaymentsThisMonth = payments.filter(p => {
    const d = new Date(p.payment_date);
    return d.getMonth() + 1 === thisMonth && 
           d.getFullYear() === thisYear && 
           p.verify_status === 'approved';
  });
  
  paidThisMonth = approvedPaymentsThisMonth.reduce((sum, p) => sum + (p.amount || 0), 0);
  
  if (!isFirstMonth && typeof contract.monthly_payment === 'number' && contract.monthly_payment > 0) {
    if (paidThisMonth < contract.monthly_payment) {
      alerts.push(`⚠️ เดือนนี้ควรชำระ ${contract.monthly_payment.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })} ชำระแล้ว ${paidThisMonth.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })} คงเหลือ ${ (contract.monthly_payment - paidThisMonth).toLocaleString('th-TH', { style: 'currency', currency: 'THB' }) }`);
    } else {
      alerts.push(`✅ เดือนนี้ชำระครบแล้ว (${contract.monthly_payment.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })})`);
    }
  }
  
  // ตรวจสอบค้างชำระย้อนหลัง
  let lastPaidDate: Date | null = null;
  const approvedPayments = payments.filter(p => p.verify_status === 'approved');
  if (approvedPayments.length > 0) {
    lastPaidDate = approvedPayments
      .map(p => new Date(p.payment_date))
      .reduce((latest, d) => (!latest || d > latest ? d : latest), null as Date | null);
  }
  
  if (lastPaidDate) {
    const lastMonth = lastPaidDate.getMonth() + 1;
    const lastYear = lastPaidDate.getFullYear();
    if (lastYear < thisYear || (lastYear === thisYear && lastMonth < thisMonth)) {
      const monthsLate = (thisYear - lastYear) * 12 + (thisMonth - lastMonth);
      if (monthsLate > 0) {
        alerts.push(`⚠️ ค้างชำระ ${monthsLate} เดือน (ชำระล่าสุด: ${lastPaidDate.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })})`);
      }
    }
  }
  
  if (alerts.length === 0) return null;
  return (
    <div style={{ marginBottom: 12 }}>
      {alerts.map((msg, idx) => (
        <div key={idx} style={{ color: msg.startsWith('✅') ? '#22c55e' : msg.startsWith('💰') ? '#0ea5e9' : '#ef4444', fontWeight: 600, fontSize: 15, marginBottom: 2 }}>{msg}</div>
      ))}
    </div>
  );
}

export default OrderDetailPage; 