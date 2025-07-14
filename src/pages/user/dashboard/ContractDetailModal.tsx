import styles from './ContractDetailModal.module.css';
import { useEffect, useState, useMemo } from 'react';
import { getUserProductImage, type ContractDetailType } from '../../../services/user/contract.service';
import { getUserPaymentProofFile } from '../../../services/payment.service';
import { toast } from 'react-toastify';

interface Props {
  openDetail: ContractDetailType | null;
  onClose: () => void;
  formatDate: (dateStr: string) => string;
}

const verifyStatusLabel: Record<string, string> = {
  approved: 'อนุมัติ',
  pending: 'รออนุมัติ',
  rejected: 'ไม่อนุมัติ',
};

export default function ContractDetailModal({ openDetail, onClose, formatDate }: Props) {
  const [imageUrls, setImageUrls] = useState<(string | null)[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedPaymentImage, setSelectedPaymentImage] = useState<string | null>(null);
  const [showPaymentImageModal, setShowPaymentImageModal] = useState(false);

  const uniqueFilenames = useMemo(() => (
    openDetail ? Array.from(new Set(openDetail.product.product_image_filenames)) : []
  ), [openDetail]);

  useEffect(() => {
    const revokeUrls: string[] = [];
    async function fetchImages() {
      if (!openDetail) return;
      setLoading(true);
      const urls: (string|null)[] = await Promise.all(uniqueFilenames.map(async (filename) => {
        try {
          const blob = await getUserProductImage(openDetail.product.id, filename);
          const url = URL.createObjectURL(blob);
          revokeUrls.push(url);
          return url;
        } catch {
          return null;
        }
      }));
      setImageUrls(urls);
      setLoading(false);
    }
    fetchImages();
    return () => {
      revokeUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [openDetail, uniqueFilenames]);

  useEffect(() => {
    if (openDetail) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [openDetail]);

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

  // Cleanup payment image URL when component unmounts
  useEffect(() => {
    return () => {
      if (selectedPaymentImage) {
        URL.revokeObjectURL(selectedPaymentImage);
      }
    };
  }, [selectedPaymentImage]);

  if (!openDetail) return null;
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <button className={styles.modalClose} onClick={onClose} aria-label="ปิด">×</button>
        <div className={styles.modalTitle}>รายละเอียดสัญญา</div>
        {loading && (
          <div style={{position:'absolute',left:0,top:0,width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',zIndex:2001,background:'rgba(255,255,255,0.7)'}}>
            <span style={{color:'#0ea5e9',fontWeight:600,fontSize:'1.1em'}}>กำลังโหลด...</span>
          </div>
        )}
        {imageUrls[selectedImageIdx] && (
          <>
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',width:'100%',position:'relative'}}>
              <div style={{position:'relative',width:'100%',display:'flex',justifyContent:'center',alignItems:'center'}}>
                {imageUrls.length > 1 && (
                  <>
                    <button
                      style={{
                        position: 'absolute',
                        left: 8,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'rgba(255,255,255,0.85)',
                        border: 'none',
                        borderRadius: '50%',
                        width: 36,
                        height: 36,
                        fontSize: 22,
                        color: '#0ea5e9',
                        cursor: 'pointer',
                        zIndex: 2,
                        boxShadow: '0 2px 8px #bae6fd55',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      aria-label="ภาพก่อนหน้า"
                      onClick={() => setSelectedImageIdx((selectedImageIdx - 1 + imageUrls.length) % imageUrls.length)}
                    >
                      &#8592;
                    </button>
                    <button
                      style={{
                        position: 'absolute',
                        right: 8,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'rgba(255,255,255,0.85)',
                        border: 'none',
                        borderRadius: '50%',
                        width: 36,
                        height: 36,
                        fontSize: 22,
                        color: '#0ea5e9',
                        cursor: 'pointer',
                        zIndex: 2,
                        boxShadow: '0 2px 8px #bae6fd55',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      aria-label="ภาพถัดไป"
                      onClick={() => setSelectedImageIdx((selectedImageIdx + 1) % imageUrls.length)}
                    >
                      &#8594;
                    </button>
                  </>
                )}
                <img
                  src={imageUrls[selectedImageIdx] || ''}
                  alt={openDetail.product.model_name}
                  className={styles.productImage + ' ' + styles.productImageLarge}
                  style={{ cursor: 'zoom-in', display: 'block' }}
                  onClick={() => setPreviewOpen(true)}
                />
              </div>
              {imageUrls.length > 1 && (
                <div className={styles.imageGalleryThumbs} style={{width:'100%',marginTop:0}}>
                  {imageUrls.map((url, idx) => (
                    <img
                      key={uniqueFilenames[idx]}
                      src={url || ''}
                      alt={`thumb-${idx}`}
                      className={
                        styles.imageThumb +
                        (idx === selectedImageIdx ? ' ' + styles.imageThumbActive : '')
                      }
                      style={{ cursor: 'pointer' }}
                      onClick={() => setSelectedImageIdx(idx)}
                    />
                  ))}
                </div>
              )}
            </div>
            {previewOpen && (
              <div className={styles.imagePreviewOverlay} onClick={() => setPreviewOpen(false)}>
                <img
                  src={imageUrls[selectedImageIdx] || ''}
                  alt={openDetail.product.model_name}
                  className={styles.imagePreview}
                  onClick={e => e.stopPropagation()}
                />
              </div>
            )}
          </>
        )}
        <div className={styles.sectionTitle}>ข้อมูลสินค้า</div>
        <div className={styles.productSection}>
          <div className={styles.labelRow}><span className={styles.label}>สินค้า</span><span className={styles.value}>{openDetail.product.model_name}</span></div>
          <div className={styles.labelRow}><span className={styles.label}>IMEI</span><span className={styles.value}>{openDetail.product.imei}</span></div>
        </div>
        <div className={styles.sectionTitle}>รายละเอียดสัญญา</div>
        <div className={styles.contractSection}>
          <div className={styles.group}>
            <div className={styles.labelRow}><span className={styles.label}>เงินดาวน์</span><span className={styles.value}>{openDetail.down_payment_amount.toLocaleString()} บาท</span></div>
            <div className={styles.labelRow}><span className={styles.label}>จำนวนงวด</span><span className={styles.value}>{openDetail.installment_months} เดือน</span></div>
            <div className={styles.labelRow}><span className={styles.label}>ผ่อนต่อเดือน</span><span className={styles.value}>{openDetail.monthly_payment.toLocaleString()} บาท</span></div>
            <div className={styles.labelRow}><span className={styles.label}>สถานะ</span><span className={styles.value}><span style={{display:'inline-block',width:10,height:10,borderRadius:'50%',marginRight:6,background:openDetail.status==='approved'?'#059669':openDetail.status==='rejected'?'#ef4444':'#f59e42'}}></span>{openDetail.status}</span></div>
          </div>
          <div className={styles.group}>
            <div className={styles.labelRow}><span className={styles.label}>เริ่มสัญญา</span><span className={styles.value}>{formatDate(openDetail.start_date)}</span></div>
            <div className={styles.labelRow}><span className={styles.label}>สิ้นสุด</span><span className={styles.value}>{formatDate(openDetail.end_date)}</span></div>
          </div>
        </div>
        <div className={styles.sectionTitle}>ประวัติการชำระเงิน</div>
        <div className={styles.paymentSection}>
          <table className={styles.paymentTable}>
            <thead>
              <tr>
                <th>วันที่</th>
                <th>จำนวนเงิน</th>
                <th>วิธี</th>
                <th>สถานะ</th>
                <th>หลักฐาน</th>
              </tr>
            </thead>
            <tbody>
              {openDetail.payments.map(pm => (
                <tr key={pm.id} className={styles.paymentRow}>
                  <td>{formatDate(pm.payment_date)}</td>
                  <td className={styles.paymentAmount}>{pm.amount.toLocaleString()} บาท</td>
                  <td>{pm.method === 'bank_transfer' ? 'โอน' : 'เงินสด'}</td>
                  <td>
                    <span
                      className={
                        pm.verify_status === 'approved'
                          ? styles.statusApproved
                          : pm.verify_status === 'rejected'
                          ? styles.statusRejected
                          : styles.statusPending
                      }
                    >
                      {verifyStatusLabel[pm.verify_status] || pm.verify_status}
                    </span>
                  </td>
                  <td>
                    {pm.proof_file_filename ? (
                      <button
                        type="button"
                        onClick={() => handleViewPaymentImage(pm.id, pm.proof_file_filename!)}
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {showPaymentImageModal && selectedPaymentImage && (
        <div className={styles.paymentImageModalOverlay} onClick={() => setShowPaymentImageModal(false)}>
          <div className={styles.paymentImageModalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.paymentImageModalClose} onClick={() => setShowPaymentImageModal(false)} aria-label="ปิด">×</button>
            <img src={selectedPaymentImage} alt="Payment Proof" className={styles.paymentImageModalImage} />
          </div>
        </div>
      )}
    </div>
  );
} 