import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import styles from './OrderDetailPage.module.css';
import { getContractDetail, getContractPayments, getPdpaConsentFile } from '../../../services/contract.service';
import type { ContractDetail, Payment } from '../../../services/contract.service';

function formatDate(dateStr: string) {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

const statusMap: Record<string, { label: string; className: string; emoji: string }> = {
  active: { label: 'กำลังใช้งาน', className: styles.badgeActive, emoji: '🟢' },
  closed: { label: 'ปิดแล้ว', className: styles.badgeClosed, emoji: '⚪️' },
  pending: { label: 'รอดำเนินการ', className: styles.badgePending, emoji: '🟡' },
};

const categoryMap: Record<string, { label: string; emoji: string }> = {
  rent: { label: 'ผ่อน', emoji: '📱' },
  buy: { label: 'ซื้อ', emoji: '💸' },
  cash_purchase: { label: 'ซื้อเงินสด', emoji: '💵' },
};

const OrderDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contract, setContract] = useState<ContractDetail | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(true);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [showPdpaModal, setShowPdpaModal] = useState(false);
  const [pdpaBlobUrl, setPdpaBlobUrl] = useState<string | null>(null);
  const [pdpaLoading, setPdpaLoading] = useState(false);
  const [pdpaError, setPdpaError] = useState<string | null>(null);

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
      .then(data => setPayments(data ?? []))
      .catch(() => setPaymentError('ไม่พบข้อมูลการชำระเงิน'))
      .finally(() => setPaymentLoading(false));
  }, [id]);

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
  const status = statusMap[o.status] || { label: o.status, className: '', emoji: '' };
  const category = categoryMap[o.category] || { label: o.category, emoji: '' };

  return (
    <div className={styles.container}>
      <div className={styles.contentBox}>
        <div className={styles.topBar}>
          <button className={styles.backBtn} onClick={() => navigate(-1)} title="ย้อนกลับ">←</button>
          <div className={styles.title}>รายละเอียดคำสั่งซื้อ</div>
        </div>
        <div className={styles.sectionCard}>
          <div className={styles.sectionTitle}>📝 ข้อมูลคำสั่งซื้อ
            <span className={`${styles.badge} ${status.className}`}>{status.emoji} {status.label}</span>
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
          <div className={styles.section}><div className={styles.label}>IMEI:</div><div className={styles.value}>{o.product ? o.product.imei : '-'}</div></div>
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
              ดูไฟล์ความยินยอม PDPA
            </button>
          ) : (
            <div className={styles.value}>-</div>
          )}
        </div>
        {showPdpaModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
              <div className={styles.modalHeader}>
                <span>แสดงไฟล์ความยินยอม PDPA</span>
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
                    title="PDPA Consent File"
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
          <div className={styles.sectionTitle}>💰 ประวัติการชำระเงิน</div>
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
                    <th>หลักฐาน</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', color: '#ef4444', fontWeight: 600, fontSize: 17, padding: 16 }}>
                        ยังไม่ได้ชำระเงินก้อนแรก{typeof o.down_payment_amount === 'number' && o.down_payment_amount > 0 ? ` (เงินดาวน์ ${o.down_payment_amount.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })})` : ''}
                      </td>
                    </tr>
                  ) : payments.map(pm => (
                    <tr key={pm.id}>
                      <td>{formatDate(pm.payment_date)}</td>
                      <td>{pm.amount.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}</td>
                      <td>{pm.method === 'bank_transfer' ? 'โอนธนาคาร' : pm.method === 'cash' ? 'เงินสด' : pm.method}</td>
                      <td>
                        {pm.proof_url
                          ? <a href={pm.proof_url} target="_blank" rel="noopener noreferrer" className={styles.linkBtn}>ดูหลักฐาน</a>
                          : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className={styles.meta}>
          <div>สร้างเมื่อ: {formatDate(o.created_at)}</div>
          <div>อัปเดตล่าสุด: {formatDate(o.updated_at)}</div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage; 