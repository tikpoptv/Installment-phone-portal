import React, { useEffect, useState } from 'react';
import styles from './PaymentModal.module.css';
import type { UserContractPaymentsResponse } from '../../../services/user/contract.service';
import { getUserContractPayments } from '../../../services/user/contract.service';
import { createUserPayment, getUserPaymentProofFile, type CreateUserPaymentPayload, getUserStoreBankAccounts, type UserStoreBankAccountsResponse } from '../../../services/payment.service';
import { toast } from 'react-toastify';
import QRCode from 'react-qr-code';
import generatePayload from 'promptpay-qr';

type PaymentModalProps = {
  contractId: string;
  open: boolean;
  onClose: () => void;
  hasEarlyClosureDiscount?: boolean;
};

export default function PaymentModal({ contractId, open, onClose, hasEarlyClosureDiscount = false }: PaymentModalProps) {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<'cash' | 'bank_transfer' | 'online'>('bank_transfer');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentData, setPaymentData] = useState<UserContractPaymentsResponse | null>(null);
  const [amountError, setAmountError] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreviewUrl, setProofPreviewUrl] = useState<string | null>(null);
  const [showProofPreviewModal, setShowProofPreviewModal] = useState(false);
  const [selectedPaymentImage, setSelectedPaymentImage] = useState<string | null>(null);
  const [showPaymentImageModal, setShowPaymentImageModal] = useState(false);
  const [storeBankAccounts, setStoreBankAccounts] = useState<UserStoreBankAccountsResponse | null>(null);
  const [bankLoading, setBankLoading] = useState(false);
  const [showBankAccounts, setShowBankAccounts] = useState(true);
  const [showPromptpayAccounts, setShowPromptpayAccounts] = useState(false);
  const [showPromptpayQR, setShowPromptpayQR] = useState<null | string>(null); // promptpay id
  // เพิ่ม state
  const [currentPromptpayIndex, setCurrentPromptpayIndex] = useState(0);

  useEffect(() => {
    if (open && contractId) {
      getUserContractPayments(contractId)
        .then((data) => setPaymentData(data))
        .catch(() => setPaymentData(null));
    } else {
      setPaymentData(null);
    }
  }, [open, contractId]);

  useEffect(() => {
    if (open) {
      setAmount('');
      setMethod('bank_transfer');
      setIsSubmitting(false);
      setAmountError('');
      setProofFile(null);
      setProofPreviewUrl(null);
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      setBankLoading(true);
      getUserStoreBankAccounts()
        .then(data => setStoreBankAccounts(data))
        .catch(() => setStoreBankAccounts(null))
        .finally(() => setBankLoading(false));
    }
  }, [open]);

  // Auto กรอกจำนวนเงินเมื่อมี early_closure discount
  useEffect(() => {
    if (hasEarlyClosureDiscount && paymentData?.remaining_balance) {
      setAmount(paymentData.remaining_balance.toString());
    }
  }, [hasEarlyClosureDiscount, paymentData?.remaining_balance]);

  // Cleanup proofPreviewUrl when component unmounts
  useEffect(() => {
    return () => {
      if (proofPreviewUrl) {
        URL.revokeObjectURL(proofPreviewUrl);
      }
    };
  }, [proofPreviewUrl]);

  // Cleanup payment image URL when component unmounts
  useEffect(() => {
    return () => {
      if (selectedPaymentImage) {
        URL.revokeObjectURL(selectedPaymentImage);
      }
    };
  }, [selectedPaymentImage]);

  if (!open) return null;

  const methodLabel: Record<string, string> = {
    cash: 'เงินสด',
    bank_transfer: 'โอนธนาคาร',
    online: 'ออนไลน์',
  };
  
  const statusLabel: Record<string, string> = {
    approved: 'อนุมัติ',
    pending: 'รอตรวจสอบ',
    rejected: 'ไม่อนุมัติ',
  };

  const installmentStatusLabel: Record<string, string> = {
    paid: 'ชำระแล้ว',
    unpaid: 'ยังไม่ชำระ',
    overdue: 'ค้างชำระ',
    partial: 'ชำระบางส่วน'
  };

  function formatDate(dateStr: string) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('th-TH', { year: '2-digit', month: 'short', day: 'numeric' });
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProofFile(file);
      const url = URL.createObjectURL(file);
      setProofPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !paymentData || amountError) return;
    setIsSubmitting(true);
    try {
      const payload: CreateUserPaymentPayload = {
        contract_id: contractId,
        payment_date: new Date().toISOString().split('T')[0],
        amount: Number(amount),
        method,
        proof_file: proofFile,
      };
      
      await createUserPayment(payload);
      toast.success('แจ้งชำระเงินสำเร็จ! ระบบจะตรวจสอบและอัปเดตสถานะในภายหลัง');
      onClose();
    } catch (error) {
      console.error('Payment submission error:', error);
      toast.error('เกิดข้อผิดพลาดในการแจ้งชำระเงิน กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAmount(value);
    
    // Clear error when user starts typing
    if (amountError) {
      setAmountError('');
    }
    
    // Validate amount
    if (value && paymentData?.remaining_balance) {
      const numValue = Number(value);
      if (numValue > paymentData.remaining_balance) {
        setAmountError(`จำนวนเงินไม่สามารถเกิน ${paymentData.remaining_balance.toLocaleString()} บาท`);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return styles['status-approved'];
      case 'pending': return styles['status-pending'];
      case 'rejected': return styles['status-rejected'];
      case 'paid': return styles['status-approved'];
      case 'unpaid': return styles['status-pending'];
      case 'overdue': return styles['status-rejected'];
      case 'partial': return styles['status-partial'];
      default: return '';
    }
  };

  const handleViewPaymentImage = async (paymentId: string, filename: string) => {
    try {
      const blob = await getUserPaymentProofFile(paymentId, filename);
      const url = URL.createObjectURL(blob);
      setSelectedPaymentImage(url);
      setShowPaymentImageModal(true);
    } catch (error) {
      console.error('View image error:', error);
      toast.error('ไม่สามารถดูภาพได้');
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('คัดลอกเลขบัญชีแล้ว!');
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent} style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        <h2>
          {hasEarlyClosureDiscount ? 'แจ้งชำระเงิน (ปิดยอด)' : 'แจ้งชำระเงิน'}
        </h2>
        {/* สรุปข้อมูลสัญญา */}
        <div className={styles.summaryBox} style={{ marginBottom: 24 }}>
          <div><strong>ยอดผ่อนต่อเดือน:</strong> {paymentData?.monthly_payment?.toLocaleString() ?? '-'} บาท</div>
          <div><strong>งวดที่จ่ายไปแล้ว:</strong> {paymentData?.paid_installments ?? '-'} งวด</div>
          <div><strong>วันที่ชำระล่าสุด:</strong> {paymentData?.last_payment_date ? formatDate(paymentData.last_payment_date) : '-'}</div>
          {hasEarlyClosureDiscount && (
            <div style={{ color: '#7c3aed', fontWeight: 600 }}>
              <strong>โปรโมชั่นปิดยอด:</strong> แจ้งชำระปิดยอด
            </div>
          )}
        </div>
        <div className={styles.bankSection} style={{ marginBottom: 24 }}>
          <div className={styles.bankSectionTitle}>บัญชีสำหรับโอนเงิน</div>
          {bankLoading ? (
            <div style={{ color: '#0ea5e9', fontWeight: 600 }}>กำลังโหลดบัญชีธนาคาร...</div>
          ) : storeBankAccounts ? (
            <div className={styles.bankCategoryWrapper}>
              <div className={styles.bankTabRow}>
                {storeBankAccounts.bank_accounts.length > 0 && (
                  <button
                    type="button"
                    className={showBankAccounts ? styles.bankTabActive : styles.bankTab}
                    onClick={() => { setShowBankAccounts(true); setShowPromptpayAccounts(false); }}
                  >
                    โอนผ่านบัญชีธนาคาร
                  </button>
                )}
                {storeBankAccounts.promptpay_accounts.length > 0 && (
                  <button
                    type="button"
                    className={showPromptpayAccounts ? styles.bankTabActive : styles.bankTab}
                    onClick={() => { setShowBankAccounts(false); setShowPromptpayAccounts(true); }}
                  >
                    โอนผ่านพร้อมเพย์
                  </button>
                )}
              </div>
              {showBankAccounts && storeBankAccounts.bank_accounts.length > 0 && (
                <div className={styles.bankCategory}>
                  <div className={styles.bankCategoryTitle}>โอนผ่านบัญชีธนาคาร</div>
                  <div className={styles.accountList}>
                    {storeBankAccounts.bank_accounts.map((acc, idx) => (
                      <div key={idx} className={styles.accountCard} style={{ alignItems: 'flex-start', gap: 16 }}>
                        {/* ลบ div จุดกลมสีเขียวออก */}
                        <div>
                          {/* ชื่อธนาคารสีฟ้า */}
                          <div style={{ color: '#0ea5e9', fontWeight: 600, fontSize: '1.05rem', marginBottom: 2 }}>{acc.bank_name}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                            <div style={{ fontWeight: 700, fontSize: '1.15rem', letterSpacing: 2, color: '#222' }}>{acc.account_number.replace(/(\d{3})(\d{1})(\d{6})/, '$1-$2-$3')}</div>
                            <button
                              type="button"
                              style={{ background: '#e0f2fe', border: 'none', borderRadius: 6, padding: '2px 10px', marginLeft: 2, cursor: 'pointer' }}
                              onClick={() => handleCopy(acc.account_number)}
                              title="คัดลอกเลขบัญชี"
                            >
                              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="6" y="6" width="9" height="9" rx="2" stroke="#0ea5e9" strokeWidth="1.5"/>
                                <rect x="3" y="3" width="9" height="9" rx="2" stroke="#0ea5e9" strokeWidth="1.5" fill="#e0f2fe"/>
                              </svg>
                            </button>
                          </div>
                          <div style={{ color: '#64748b', fontWeight: 500, fontSize: '1.01rem' }}>{acc.account_name}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {showPromptpayAccounts && storeBankAccounts.promptpay_accounts.length > 0 && (
                <div className={styles.bankCategory}>
                  <div className={styles.bankCategoryTitle}>โอนผ่านพร้อมเพย์</div>
                  <div className={styles.promptpayCenter}>
                    {(() => {
                      const accounts = storeBankAccounts.promptpay_accounts;
                      const acc = accounts[currentPromptpayIndex];
                      let qrOptions = {};
                      if (hasEarlyClosureDiscount && paymentData?.remaining_balance) {
                        qrOptions = { amount: paymentData.remaining_balance };
                      }
                      return (
                        <>
                          <div className={styles.bankName} style={{ marginBottom: 12 }}>PromptPay</div>
                          <div className={styles.promptpayQR}>
                            <QRCode value={generatePayload(acc.promptpay_id, qrOptions)} size={200} />
                          </div>
                          <div className={styles.promptpayOwner}>{acc.account_name}</div>
                          {accounts.length > 1 && (
                            <div className={styles.promptpayNav}>
                              <button
                                type="button"
                                onClick={() => setCurrentPromptpayIndex(i => (i - 1 + accounts.length) % accounts.length)}
                                disabled={accounts.length <= 1}
                                className={styles.promptpayNavBtn}
                              >ย้อนกลับ</button>
                              <span className={styles.promptpayNavIndex}>{currentPromptpayIndex + 1} / {accounts.length}</span>
                              <button
                                type="button"
                                onClick={() => setCurrentPromptpayIndex(i => (i + 1) % accounts.length)}
                                disabled={accounts.length <= 1}
                                className={styles.promptpayNavBtn}
                              >ถัดไป</button>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}
              {storeBankAccounts.bank_accounts.length === 0 && storeBankAccounts.promptpay_accounts.length === 0 && (
                <div style={{ color: '#ef4444' }}>ไม่พบบัญชีธนาคารร้านค้า</div>
              )}
            </div>
          ) : (
            <div style={{ color: '#ef4444' }}>ไม่สามารถโหลดบัญชีธนาคารได้</div>
          )}
        </div>
        <form onSubmit={handleSubmit}>
          <label className={styles.formLabel}>
            <span>จำนวนเงินที่ชำระ <span style={{ color: 'red' }}>*</span></span>
            <input 
              type="number" 
              min={1} 
              max={paymentData?.remaining_balance}
              value={amount} 
              onChange={handleAmountChange} 
              required 
              className={styles.formInput}
              placeholder="กรอกจำนวนเงินที่ชำระ"
              disabled={hasEarlyClosureDiscount}
            />
            {amountError && (
              <div style={{ color: 'red', fontSize: '0.9em', marginTop: '4px' }}>
                {amountError}
              </div>
            )}
            {hasEarlyClosureDiscount && (
              <div style={{ color: '#7c3aed', fontSize: '0.9em', marginTop: '4px', fontStyle: 'italic' }}>
                💡 จำนวนเงินถูกกำหนดอัตโนมัติสำหรับโปรโมชั่นปิดยอด
              </div>
            )}
          </label>
          <label className={styles.formLabel}>
            <span>วิธีชำระเงิน <span style={{ color: 'red' }}>*</span></span>
            <select 
              value={method} 
              onChange={e => setMethod(e.target.value as 'cash' | 'bank_transfer' | 'online')} 
              required 
              className={styles.formSelect}
              disabled
            >
              <option value="bank_transfer">โอนธนาคาร</option>
            </select>
          </label>
          <label className={styles.formLabel}>
            <span>หลักฐานการชำระเงิน (สลิปโอนเงิน) <span style={{ color: 'red' }}>*</span></span>
            <input 
              type="file" 
              accept="image/*"
              onChange={handleFileChange}
              required 
              className={styles.formInput}
            />
          </label>
          {proofFile && proofPreviewUrl && (
            <div className={styles.proofPreview}>
              <div style={{ color: '#0ea5e9', fontSize: 14, marginBottom: 8, fontWeight: 500 }}>
                📎 ไฟล์: {proofFile.name}
              </div>
              <img 
                src={proofPreviewUrl} 
                alt="Proof" 
                className={styles.proofImage}
                onClick={() => setShowProofPreviewModal(true)}
              />
              <div className={styles.proofHint}>
                คลิกเพื่อดูขนาดใหญ่
              </div>
            </div>
          )}
          <div className={styles.buttonRow}>
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'กำลังส่งข้อมูล...' : 'ยืนยัน'}
            </button>
            <button type="button" onClick={onClose} disabled={isSubmitting}>ยกเลิก</button>
          </div>
        </form>
        {/* ตารางงวดผ่อน */}
        <div className={styles.paymentHistory}>
          <h3>ตารางงวดผ่อน</h3>
          <div className={styles.tableContainer}>
            <table className={styles.paymentTable}>
              <thead>
                <tr>
                  <th>งวดที่</th>
                  <th>ครบกำหนด</th>
                  <th className={styles.amountCol}>จำนวนเงิน</th>
                  <th className={styles.paidCol}>ชำระแล้ว</th>
                  <th>สถานะ</th>
                  <th>หมายเหตุ</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(paymentData?.installments) && paymentData.installments.map((installment) => (
                  <tr key={installment.id}>
                    <td>{installment.installment_number}</td>
                    <td>{formatDate(installment.due_date)}</td>
                    <td className={styles.amountCol}>{installment.amount.toLocaleString()} บาท</td>
                    <td className={styles.paidCol}>{installment.amount_paid.toLocaleString()} บาท</td>
                    <td className={getStatusColor(installment.status)}>
                      {installmentStatusLabel[installment.status] || '-'}
                    </td>
                    <td style={{ fontSize: '0.9em', color: '#666' }}>{installment.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* ประวัติการชำระเงิน */}
        <div className={styles.paymentHistory}>
          <h3>ประวัติการชำระเงิน</h3>
          {Array.isArray(paymentData?.payments) && paymentData.payments.length > 0 ? (
            <div className={styles.tableContainer}>
              <table className={styles.paymentTable}>
                <thead>
                  <tr>
                    <th>วันที่ชำระ</th>
                    <th>จำนวนเงิน</th>
                    <th>วิธี</th>
                    <th>หลักฐาน</th>
                    <th>สถานะ</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentData.payments.map((item) => (
                    <tr key={item.id}>
                      <td>{formatDate(item.payment_date)}</td>
                      <td style={{ textAlign: 'right' }}>{item.amount.toLocaleString()} บาท</td>
                      <td>{methodLabel[item.method] || '-'}</td>
                      <td>
                        {item.proof_file_filename ? (
                          <button
                            type="button"
                            onClick={() => handleViewPaymentImage(item.id, item.proof_file_filename!)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#0ea5e9',
                              textDecoration: 'underline',
                              cursor: 'pointer',
                              fontSize: '0.9em'
                            }}
                          >
                            ดูภาพ
                          </button>
                        ) : '-'}
                      </td>
                      <td className={getStatusColor(item.verify_status)}>
                        {statusLabel[item.verify_status] || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
              ไม่มีประวัติ
            </div>
          )}
        </div>
      </div>
      {showProofPreviewModal && proofPreviewUrl && (
        <div className={styles.previewModal}>
          <button 
            onClick={() => setShowProofPreviewModal(false)} 
            className={styles.closePreviewBtn}
            aria-label="ปิด"
          >
            ×
          </button>
          <img src={proofPreviewUrl} alt="Proof" className={styles.previewImage} />
        </div>
      )}
      {showPaymentImageModal && selectedPaymentImage && (
        <div className={styles.previewModal}>
          <button 
            onClick={() => setShowPaymentImageModal(false)} 
            className={styles.closePreviewBtn}
            aria-label="ปิด"
          >
            ×
          </button>
          <img src={selectedPaymentImage} alt="Payment Proof" className={styles.previewImage} />
        </div>
      )}
      {showPromptpayQR && (
        <div className={styles.previewModal}>
          <button 
            onClick={() => setShowPromptpayQR(null)} 
            className={styles.closePreviewBtn}
            aria-label="ปิด"
          >
            ×
          </button>
          <div style={{ background: '#fff', padding: 24, borderRadius: 12, boxShadow: '0 2px 16px rgba(0,0,0,0.18)' }}>
            <div style={{ textAlign: 'center', marginBottom: 12, fontWeight: 600, color: '#0ea5e9' }}>QR พร้อมเพย์</div>
            <QRCode value={generatePayload(showPromptpayQR, {})} size={220} />
            <div style={{ marginTop: 12, textAlign: 'center', color: '#64748b', fontSize: 14 }}>{showPromptpayQR}</div>
          </div>
        </div>
      )}
    </div>
  );
} 