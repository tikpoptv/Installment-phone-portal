import React, { useEffect, useState, useMemo, useRef } from 'react';
import styles from './ProductDetailPage.module.css';
import { useNavigate, useParams } from 'react-router-dom';
import { getProductDetail, getProductImageBlob, getLatestContractByProductId } from '../../../services/products.service';
import type { ProductLatestContract } from '../../../services/products.service';

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
  remark: string;
  created_at: string;
  updated_at: string;
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
  const [latestContract, setLatestContract] = useState<ProductLatestContract | null>(null);

  const productImageFilenames = useMemo(() => product?.product_image_filenames || [], [product]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    getProductDetail(id)
      .then((data) => {
        setProduct(data as ProductDetail);
        setLoading(false);
        getLatestContractByProductId(id)
          .then(setLatestContract)
          .catch(() => setLatestContract(null));
      })
      .catch(() => {
        setError('ไม่พบข้อมูลสินค้า');
        setLoading(false);
        setLatestContract(null);
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

  if (loading) return <div className={styles.container}>กำลังโหลดข้อมูล...</div>;
  if (error) return <div className={styles.container}>{error}</div>;
  if (!product) return <div className={styles.container}>ไม่พบข้อมูลสินค้า</div>;

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
      <section className={styles.section}>
        <div className={styles.sectionTitle}>ข้อมูลสินค้า</div>
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
            <button className={styles.orderBoxBtn} style={{marginLeft:16,marginTop:0}}>
              แจ้งสถานะล็อก iCloud
            </button>
          )}
        </div>
        {product && (
          latestContract ? (
            <div className={styles.orderBox}>
              <div className={styles.orderBoxTitle}>เชื่อมโยงกับรายการสั่งซื้อ</div>
              <div className={styles.detailRow}><span className={styles.label}>รหัสคำสั่งซื้อ:</span> <span className={styles.value}>{latestContract.contract_id}</span></div>
              <div className={styles.detailRow}><span className={styles.label}>สถานะคำสั่งซื้อ:</span> <span className={styles.value}>{latestContract.status}</span></div>
              <button className={styles.orderBoxBtn} onClick={()=>navigate(`/admin/orders/${latestContract.contract_id}`)}>
                ดูข้อมูลคำสั่งซื้อเพิ่มเติม
              </button>
            </div>
          ) : (
            <div className={styles.orderBox}>
              <div className={styles.orderBoxTitle}>เชื่อมโยงกับรายการสั่งซื้อ</div>
              <div className={styles.detailRow} style={{color:'#64748b'}}>ไม่พบคำสั่งซื้อที่เชื่อมโยงกับสินค้านี้</div>
            </div>
          )
        )}
        {product.icloud_status === 'locked' && (
          <div className={styles.orderBox}>
            <div className={styles.orderBoxTitle}>แจ้งเตือน: เครื่องนี้ถูกล็อก iCloud</div>
            <div className={styles.detailRow}><span className={styles.label}>สถานะ iCloud:</span> <span className={styles.value}>Locked</span></div>
            <button className={styles.orderBoxBtn} style={{marginTop:10}}>
              ดูรายละเอียด
            </button>
          </div>
        )}
      </section>

      {/* หมวดอื่นๆ */}
      <section className={styles.section}>
        <div className={styles.sectionTitle}>ข้อมูลอื่น ๆ</div>
        <div className={styles.detailRow}><span className={styles.label}>วันที่เพิ่ม:</span> <span className={styles.value}>{new Date(product.created_at).toLocaleString('th-TH')}</span></div>
        <div className={styles.detailRow}><span className={styles.label}>อัปเดตล่าสุด:</span> <span className={styles.value}>{new Date(product.updated_at).toLocaleString('th-TH')}</span></div>
        <div className={styles.detailRow}><span className={styles.label}>ผู้ลงทะเบียนสินค้า:</span> <span className={styles.value}>{product.owner_id || '-'}</span></div>
      </section>
    </div>
  );
};

export default ProductDetailPage; 