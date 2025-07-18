import React, { useEffect, useState, useMemo, useRef } from 'react';
import styles from './ProductDetailPage.module.css';
import { useNavigate, useParams } from 'react-router-dom';
import { getProductDetail, getProductImageBlob, getContractsByProductId, bindIcloudCredentialToProduct, setProductStoreLocked } from '../../../services/products.service';
import type { ProductContract } from '../../../services/products.service';
import { getIcloudCredentials } from '../../../services/icloud.service';
import type { IcloudCredential } from '../../../services/icloud.service';
import IcloudLockModal from './IcloudLockModal';
import { toast } from 'react-toastify';
import IcloudUnlockModal from './IcloudUnlockModal';
import IcloudDetailModal from '../icloud/IcloudDetailModal';
import ProductEditModal from './ProductEditModal';

export interface ProductDetail {
  id: string;
  model_name: string;
  status: string;
  imei: string;
  price: number;
  cost_price: number;
  available_stock: number;
  icloud_status: string;
  owner_id: string | null;
  product_image_filenames: string[];
  remark?: string; // ปรับเป็น optional string
  created_at: string;
  updated_at: string;
  icloud_credential_id?: string;
  owner_username?: string;
  store_icloud_credential_id?: string;
  customer_icloud_credential_id?: string;
  store_locked?: boolean;
}

const statusLabel = (status: string) => {
  if (status === 'available') return <span style={{ color: '#22c55e', fontWeight: 600 }}>ว่าง</span>;
  if (status === 'leased') return <span style={{ color: '#f59e42', fontWeight: 600 }}>ติดสัญญา</span>;
  if (status === 'sold') return <span style={{ color: '#ef4444', fontWeight: 600 }}>ขายแล้ว</span>;
  return <span style={{ color: '#64748b', fontWeight: 600 }}>{status}</span>;
};

const icloudLabel = (icloud: string) => {
  if (icloud === 'unlocked') return 'Unlocked';
  if (icloud === 'locked') return 'Locked';
  return icloud;
};

// ฟังก์ชันแปลงสถานะ contract เป็นภาษาไทย
const contractStatusLabel = (status: string) => {
  switch (status) {
    case 'active': return 'กำลังดำเนินการ';
    case 'closed': return 'เสร็จสิ้น';
    case 'default': return 'ค้างชำระ';
    case 'repossessed': return 'ถูกยึดคืน';
    case 'returned': return 'ส่งคืน';
    case 'processing': return 'รอดำเนินการ';
    default: return status;
  }
};

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageUrls, setImageUrls] = useState<(string|null)[]>([]);
  const [imageLoading, setImageLoading] = useState<boolean[]>([]);
  const [previewIdx, setPreviewIdx] = useState<number | null>(null);
  const navigate = useNavigate();
  const imageUrlsRef = useRef<(string | null)[]>([]);
  const [contracts, setContracts] = useState<ProductContract[]>([]);
  const [showLockModal, setShowLockModal] = useState(false);
  const [icloudList, setIcloudList] = useState<IcloudCredential[]>([]);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [showIcloudDetailModal, setShowIcloudDetailModal] = useState<string | null>(null);
  const [confirmSoftLock, setConfirmSoftLock] = useState<null | 'lock' | 'unlock'>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const productImageFilenames = useMemo(() => product?.product_image_filenames || [], [product]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    getProductDetail(id)
      .then((data) => {
        setProduct(data as ProductDetail);
        setLoading(false);
        getContractsByProductId(id)
          .then(setContracts)
          .catch(() => setContracts([]));
      })
      .catch(() => {
        setError('ไม่พบข้อมูลสินค้า');
        setLoading(false);
        setContracts([]);
      });
  }, [id]);

  useEffect(() => {
    imageUrlsRef.current = imageUrls;
  }, [imageUrls]);

  // โหลดภาพแบบ async ทีละไฟล์ เมื่อ product เปลี่ยน
  useEffect(() => {
    if (!product || !productImageFilenames.length) {
      setImageUrls([]);
      setImageLoading([]);
      return;
    }
    setImageUrls(Array(productImageFilenames.length).fill(null));
    setImageLoading(Array(productImageFilenames.length).fill(true));

    productImageFilenames.forEach((filename, idx) => {
      setImageLoading(prev => {
        const arr = [...prev];
        arr[idx] = true;
        return arr;
      });
      getProductImageBlob(product.id, filename)
        .then(blob => {
          const url = URL.createObjectURL(blob);
          setImageUrls(prev => {
            const arr = [...prev];
            arr[idx] = url;
            return arr;
          });
        })
        .catch(() => {
          setImageUrls(prev => {
            const arr = [...prev];
            arr[idx] = null;
            return arr;
          });
        })
        .finally(() => {
          setImageLoading(prev => {
            const arr = [...prev];
            arr[idx] = false;
            return arr;
          });
        });
    });
    // cleanup revoke url (ใช้ imageUrlsRef)
    return () => {
      imageUrlsRef.current.forEach(url => { if (url) URL.revokeObjectURL(url); });
    };
  }, [product, productImageFilenames]);

  useEffect(() => {
    if (showLockModal) {
      getIcloudCredentials().then(data => setIcloudList(data.items)).catch(() => setIcloudList([]));
    }
  }, [showLockModal]);

  if (loading) return <div className={styles.container}>กำลังโหลดข้อมูล...</div>;
  if (error) return <div className={styles.container}>{error}</div>;
  if (!product) return <div className={styles.container}>ไม่พบข้อมูลสินค้า</div>;

  // เงื่อนไขสำหรับปุ่มแก้ไขสินค้า
  const canEditProduct = (() => {
    if (!product) return false;
    if (contracts.length === 0) return true; // ไม่มี contract กดได้
    const latestStatus = contracts[0]?.status;
    if (latestStatus === 'active' || latestStatus === 'closed') return false;
    return true;
  })();
  const editProductBtnTooltip = (() => {
    if (contracts.length > 0 && (contracts[0]?.status === 'active' || contracts[0]?.status === 'closed')) {
      return 'ไม่สามารถแก้ไขข้อมูลสินค้าได้ เนื่องจากมีคำสั่งซื้อที่กำลังดำเนินการหรือเสร็จสิ้นแล้ว';
    }
    return '';
  })();

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>รายละเอียดสินค้า</h2>

      {/* หมวดรูปภาพ */}
      <section className={styles.section}>
        <div className={styles.sectionTitle}>รูปสินค้า</div>
        <div className={styles.imageList}>
          {productImageFilenames.length === 0 ? (
            <div className={styles.noImage}>ไม่มีรูป</div>
          ) : productImageFilenames.map((filename, idx) => (
            <div key={filename} className={styles.imageBox} onClick={() => {
              if (imageUrls[idx]) {
                setPreviewIdx(idx);
              }
            }}>
              {imageLoading[idx] && (
                <div className={styles.imageLoading}>กำลังโหลด...</div>
              )}
              {imageUrls[idx] ? (
                <img
                  src={imageUrls[idx] as string}
                  alt={filename}
                  title={filename}
                  className={styles.image}
                  style={imageLoading[idx] ? {opacity:0.5,filter:'blur(2px)'} : {}}
                />
              ) : !imageLoading[idx] ? (
                <div className={styles.imageError}>โหลดรูปไม่สำเร็จ</div>
              ) : null}
            </div>
          ))}
        </div>
        {/* Modal Preview (with next/prev) */}
        {previewIdx !== null && imageUrls[previewIdx] && (
          <div className={styles.imageModalOverlay} onClick={() => setPreviewIdx(null)}>
            <div className={styles.imageModalContent} onClick={e => e.stopPropagation()}>
              <img src={imageUrls[previewIdx] as string} alt={productImageFilenames[previewIdx]} className={styles.imageModalImg} />
              <div className={styles.imageModalFilename}>{productImageFilenames[previewIdx]}</div>
              <button className={styles.imageModalClose} onClick={() => setPreviewIdx(null)}>&times;</button>
              {productImageFilenames.length > 1 && (
                <>
                  <button
                    className={styles.imageModalPrev}
                    onClick={() => setPreviewIdx((previewIdx - 1 + productImageFilenames.length) % productImageFilenames.length)}
                    aria-label="ดูรูปก่อนหน้า"
                  >&#8592;</button>
                  <button
                    className={styles.imageModalNext}
                    onClick={() => setPreviewIdx((previewIdx + 1) % productImageFilenames.length)}
                    aria-label="ดูรูปถัดไป"
                  >&#8594;</button>
                </>
              )}
            </div>
          </div>
        )}
      </section>

      {/* หมวดข้อมูลหลัก */}
      <section className={styles.section} style={{position:'relative'}}>
        <div className={styles.sectionTitle}>
          ข้อมูลสินค้า
          {/* ปุ่มแก้ไขสินค้า */}
          {product && (
            <div className={styles.editProductBtnWrapper}>
              <button
                className={styles.editProductBtn}
                style={{ opacity: canEditProduct ? 1 : 0.5 }}
                onClick={() => setShowEditModal(true)}
                disabled={!canEditProduct}
              >
                แก้ไขสินค้า
              </button>
              {!canEditProduct && editProductBtnTooltip && (
                <div className={styles.editProductBtnTooltip}>
                  {editProductBtnTooltip}
                </div>
              )}
            </div>
          )}
        </div>
        <div className={styles.detailRow}><span className={styles.label}>รหัสสินค้า:</span> <span className={styles.value}>{product.id}</span></div>
        <div className={styles.detailRow}><span className={styles.label}>ชื่อรุ่น:</span> <span className={styles.value}>{product.model_name}</span></div>
        <div className={styles.detailRow}><span className={styles.label}>IMEI:</span> <span className={styles.value}>{product.imei}</span></div>
        <div className={styles.detailRow}><span className={styles.label}>หมายเหตุ:</span> <span className={styles.value}>{product.remark || '-'}</span></div>
      </section>

      {/* หมวดราคา */}
      <section className={styles.section}>
        <div className={styles.sectionTitle}>ราคา</div>
        <div className={styles.detailRow}><span className={styles.label}>ราคาขาย:</span> <span className={styles.value}>{product.price.toLocaleString('th-TH')} บาท</span></div>
        <div className={styles.detailRow}><span className={styles.label}>ราคาทุน:</span> <span className={styles.value}>{product.cost_price?.toLocaleString('th-TH') ?? '-'}</span></div>
        <div className={styles.detailRow}><span className={styles.label}>จำนวนคงเหลือ:</span> <span className={styles.value}>{product.available_stock}</span></div>
      </section>

      {/* หมวดสถานะ */}
      <section className={styles.section}>
        <div className={styles.sectionTitle}>สถานะ</div>
        <div className={styles.detailRow}><span className={styles.label}>สถานะ:</span> <span className={styles.value}>{statusLabel(product.status)}</span></div>
        <div className={styles.detailRow}>
          <span className={styles.label}>iCloud:</span> <span className={styles.value}>{icloudLabel(product.icloud_status)}</span>
          {product.icloud_status === 'unlocked' && (
            <button className={styles.orderBoxBtn} style={{marginLeft:16,marginTop:0}} onClick={() => setShowLockModal(true)}>
              แจ้งสถานะล็อก iCloud
            </button>
          )}
        </div>
        <div className={styles.detailRow}>
          <span className={styles.label}>สถานะล็อก:</span>
          <span className={styles.value} style={{color: product.store_locked ? '#f59e42' : '#22c55e', fontWeight: 600}}>
            {product.store_locked ? 'ล็อกโดยร้าน' : 'ไม่ล็อกโดยร้าน'}
          </span>
        </div>
        {product && (
          <div className={styles.orderBox}>
            <div className={styles.orderBoxTitle}>เชื่อมโยงกับรายการสั่งซื้อ</div>
            {contracts.length > 0 ? (
              <table className={styles.contractTable} style={{width:'100%',marginBottom:8}}>
                <thead>
                  <tr>
                    <th style={{textAlign:'left'}}>รหัสคำสั่งซื้อ</th>
                    <th style={{textAlign:'center'}}>สถานะ</th>
                    <th style={{textAlign:'right'}}></th>
                  </tr>
                </thead>
                <tbody>
                  {contracts.map(contract => (
                    <tr key={contract.contract_id}>
                      <td>{contract.contract_id}</td>
                      <td>{contractStatusLabel(contract.status)}</td>
                      <td style={{textAlign:'right'}}>
                        <button className={styles.orderBoxBtn} onClick={()=>navigate(`/admin/orders/${contract.contract_id}`)}>
                          ดูข้อมูลคำสั่งซื้อ
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className={styles.detailRow} style={{color:'#64748b'}}>ไม่พบคำสั่งซื้อที่เชื่อมโยงกับสินค้านี้</div>
            )}
          </div>
        )}
        {product.icloud_status === 'locked' && (
          <div className={styles.orderBox}>
            <div className={styles.orderBoxTitle}>แจ้งเตือน: เครื่องนี้ถูกล็อก iCloud</div>
            <div className={styles.detailRow}><span className={styles.label}>สถานะ iCloud:</span> <span className={styles.value}>Locked</span></div>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <button className={styles.orderBoxBtn} style={{ minWidth: 140, padding: '8px 18px', fontSize: '1.01rem', marginTop: 0 }} onClick={() => setShowIcloudDetailModal('store')}>
                ดูรายละเอียด (ร้านค้า)
              </button>
              <button className={styles.orderBoxBtn} style={{ minWidth: 140, padding: '8px 18px', fontSize: '1.01rem', marginTop: 0 }} onClick={() => setShowIcloudDetailModal('customer')}>
                ดูรายละเอียด (ลูกค้า)
              </button>
            </div>
            <div style={{ marginTop: 12, display: 'flex', gap: 12 }}>
              <button
                className={styles.orderBoxBtn}
                style={{
                  background: 'linear-gradient(90deg, #22c55e 0%, #4ade80 100%)',
                  color: '#fff',
                  minWidth: 140,
                  padding: '8px 18px',
                  fontSize: '1.01rem',
                  fontWeight: 700,
                  boxShadow: '0 1px 8px #bbf7d0',
                  border: 'none',
                  transition: 'background 0.18s, color 0.18s, box-shadow 0.18s',
                  marginTop: 0
                }}
                onClick={() => setShowUnlockModal(true)}
              >
                ปลดล็อก iCloud
              </button>
              {/* ปุ่มล็อก/ปลดล็อกโดยร้าน */}
              {!product.store_locked ? (
                <button
                  className={`${styles.orderBoxBtn} ${styles.softLockBtn}`}
                  onClick={() => setConfirmSoftLock('lock')}
                >
                  ล็อกโดยร้าน
                </button>
              ) : (
                <button
                  className={`${styles.orderBoxBtn} ${styles.softUnlockBtn}`}
                  onClick={() => setConfirmSoftLock('unlock')}
                >
                  ปลดล็อกโดยร้าน
                </button>
              )}
            </div>
            <IcloudUnlockModal
              open={showUnlockModal}
              onClose={() => setShowUnlockModal(false)}
              onConfirm={async () => {
                setShowUnlockModal(false);
                try {
                  await bindIcloudCredentialToProduct(product.id, {
                    mode: 'single',
                    type: 'store',
                    icloud_credential_id: product.store_icloud_credential_id,
                    icloud_status: 'unlock',
                  });
                  toast.success('ปลดล็อก iCloud สำเร็จ!');
                  setLoading(true);
                  getProductDetail(product.id)
                    .then((data) => setProduct(data as ProductDetail))
                    .catch(() => setError('ไม่พบข้อมูลสินค้า'))
                    .finally(() => setLoading(false));
                } catch (err) {
                  let msg = 'เกิดข้อผิดพลาดในการปลดล็อก iCloud';
                  if (typeof err === 'object' && err !== null) {
                    if ('message' in err && typeof (err as Record<string, unknown>).message === 'string') {
                      msg = (err as Record<string, unknown>).message as string;
                    } else if ('error' in err && typeof (err as Record<string, unknown>).error === 'string') {
                      msg = (err as Record<string, unknown>).error as string;
                    }
                  }
                  toast.error(msg);
                }
              }}
            />
          </div>
        )}
      </section>

      {/* หมวดอื่นๆ */}
      <section className={styles.section}>
        <div className={styles.sectionTitle}>ข้อมูลอื่น ๆ</div>
        <div className={styles.detailRow}><span className={styles.label}>หมายเหตุ:</span> <span className={styles.value}>{product.remark || '-'}</span></div>
        <div className={styles.detailRow}><span className={styles.label}>วันที่เพิ่ม:</span> <span className={styles.value}>{new Date(product.created_at).toLocaleString('th-TH')}</span></div>
        <div className={styles.detailRow}><span className={styles.label}>อัปเดตล่าสุด:</span> <span className={styles.value}>{new Date(product.updated_at).toLocaleString('th-TH')}</span></div>
        <div className={styles.detailRow}><span className={styles.label}>ผู้ลงทะเบียนสินค้า:</span> <span className={styles.value}>{product.owner_username ? `${product.owner_username} (${product.owner_id})` : (product.owner_id || '-')}</span></div>
      </section>

      <IcloudLockModal
        open={showLockModal}
        productId={product.id}
        productImei={product.imei}
        icloudList={icloudList}
        onClose={() => setShowLockModal(false)}
        onConfirm={() => {
          setShowLockModal(false);
          toast.success('เชื่อมโยงบัญชี iCloud สำเร็จ!');
          // refresh ข้อมูล product ถ้าต้องการ
        }}
        onReloadIcloudList={async () => {
          const list = await getIcloudCredentials();
          setIcloudList(list.items);
        }}
        customer_icloud_credential_id={product.customer_icloud_credential_id}
        store_icloud_credential_id={product.store_icloud_credential_id}
      />

      <IcloudDetailModal
        open={!!showIcloudDetailModal}
        onClose={() => setShowIcloudDetailModal(null)}
        icloudId={
          showIcloudDetailModal === 'store'
            ? product.store_icloud_credential_id || null
            : showIcloudDetailModal === 'customer'
              ? product.customer_icloud_credential_id || null
              : null
        }
      />

      <ProductEditModal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        product={product}
        onSuccess={() => {
          setLoading(true);
          getProductDetail(product.id)
            .then((data) => setProduct(data as ProductDetail))
            .catch(() => setError('ไม่พบข้อมูลสินค้า'))
            .finally(() => setLoading(false));
        }}
      />

      {/* Modal ยืนยันการล็อก/ปลดล็อกโดยร้าน */}
      {confirmSoftLock && (
        <div className={styles.confirmModalOverlay}>
          <div className={styles.confirmModalContent}>
            <button
              className={styles.modalCloseBtn}
              onClick={() => setConfirmSoftLock(null)}
              aria-label="ปิด"
              title="ปิด"
            >
              ×
            </button>
            <div className={styles.confirmModalTitle}>
              {confirmSoftLock === 'lock' ? 'ยืนยันการล็อกโดยร้าน?' : 'ยืนยันการปลดล็อกโดยร้าน?'}
            </div>
            <div className={styles.confirmModalMessage}>
              {confirmSoftLock === 'lock'
                ? 'คุณแน่ใจหรือไม่ว่าต้องการล็อกเครื่องนี้โดยร้านค้า?'
                : 'คุณแน่ใจหรือไม่ว่าต้องการปลดล็อกเครื่องนี้โดยร้านค้า?'}
            </div>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
              <button
                className={`${styles.confirmModalButton} ${confirmSoftLock === 'lock' ? styles.confirmModalButtonLock : styles.confirmModalButtonUnlock}`}
                onClick={async () => {
                  setConfirmSoftLock(null);
                  const toSend = confirmSoftLock === 'lock';
                  console.log('DEBUG setProductStoreLocked', {
                    id: product.id,
                    confirmSoftLock,
                    toSend,
                    typeofToSend: typeof toSend
                  });
                  try {
                    await setProductStoreLocked(product.id, toSend);
                    toast.success(
                      toSend
                        ? 'ล็อกโดยร้าน (soft lock) สำเร็จ!'
                        : 'ปลดล็อกโดยร้าน (soft unlock) สำเร็จ!'
                    );
                    setLoading(true);
                    getProductDetail(product.id)
                      .then((data) => setProduct(data as ProductDetail))
                      .catch(() => setError('ไม่พบข้อมูลสินค้า'))
                      .finally(() => setLoading(false));
                  } catch {
                    toast.error('เกิดข้อผิดพลาดในการเปลี่ยนสถานะล็อกโดยร้าน');
                  }
                }}
              >
                ยืนยัน
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage; 