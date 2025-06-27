import React, { useEffect, useState } from 'react';
import styles from './ProductDetailPage.module.css';
import { useNavigate } from 'react-router-dom';

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

// mock data สำหรับทดสอบ
const mockProduct: ProductDetail = {
  id: 'PD00001',
  model_name: 'iPhone 13 Pro Max',
  status: 'leased',
  imei: '123456789012345',
  price: 29900.00,
  cost_price: 25000.00,
  available_stock: 1,
  icloud_status: 'locked',
  owner_id: null,
  product_image_filenames: ['abc123.jpg', 'def456.png', 'ghi789.jpg'],
  remark: 'สภาพดีมาก',
  created_at: '2024-07-01T12:00:00Z',
  updated_at: '2024-07-01T12:00:00Z',
};

// mock order info
const mockOrder = mockProduct.status === 'leased' || mockProduct.status === 'sold'
  ? {
      id: 'ORDER12345',
      status: mockProduct.status === 'leased' ? 'ติดสัญญา' : 'ขายแล้ว',
      detailUrl: `/admin/orders/ORDER12345`,
    }
  : null;

const ProductDetailPage: React.FC = () => {
  const product = mockProduct; // ในอนาคตจะ fetch จาก API ตาม id
  const order = mockOrder;
  const navigate = useNavigate();

  // โหลดภาพแบบ async ทีละไฟล์
  const [imageUrls, setImageUrls] = useState<(string|null)[]>([]);
  const [imageLoading, setImageLoading] = useState<boolean[]>([]);

  useEffect(() => {
    if (!product || !product.product_image_filenames.length) {
      setImageUrls([]);
      setImageLoading([]);
      return;
    }
    setImageUrls(Array(product.product_image_filenames.length).fill(null));
    setImageLoading(Array(product.product_image_filenames.length).fill(true));

    product.product_image_filenames.forEach((filename, idx) => {
      setImageLoading(prev => {
        const arr = [...prev];
        arr[idx] = true;
        return arr;
      });
      fetch(`/api/products/files/product_image/${product.id}/${filename}`)
        .then(res => {
          if (!res.ok) throw new Error('โหลดรูปไม่สำเร็จ');
          return res.blob();
        })
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
    // cleanup revoke url
    return () => {
      imageUrls.forEach(url => { if (url) URL.revokeObjectURL(url); });
    };
    // eslint-disable-next-line
  }, [product.id, product.product_image_filenames.join(',')]);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>รายละเอียดสินค้า</h2>

      {/* หมวดรูปภาพ */}
      <section className={styles.section}>
        <div className={styles.sectionTitle}>รูปสินค้า</div>
        <div className={styles.imageList}>
          {product.product_image_filenames.length === 0 ? (
            <div className={styles.noImage}>ไม่มีรูป</div>
          ) : product.product_image_filenames.map((filename, idx) => (
            <div key={filename} className={styles.imageBox}>
              {imageLoading[idx] && (
                <div className={styles.imageLoading}>กำลังโหลด...</div>
              )}
              {imageUrls[idx] ? (
                <img
                  src={imageUrls[idx] as string}
                  alt={`product-img-${idx}`}
                  className={styles.image}
                  style={imageLoading[idx] ? {opacity:0.5,filter:'blur(2px)'} : {}}
                />
              ) : !imageLoading[idx] ? (
                <div className={styles.imageError}>โหลดรูปไม่สำเร็จ</div>
              ) : null}
            </div>
          ))}
        </div>
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
        {order && (
          <div className={styles.orderBox}>
            <div className={styles.orderBoxTitle}>เชื่อมโยงกับรายการสั่งซื้อ</div>
            <div className={styles.detailRow}><span className={styles.label}>รหัสคำสั่งซื้อ:</span> <span className={styles.value}>{order.id}</span></div>
            <div className={styles.detailRow}><span className={styles.label}>สถานะคำสั่งซื้อ:</span> <span className={styles.value}>{order.status}</span></div>
            <button className={styles.orderBoxBtn} onClick={()=>navigate(order.detailUrl)}>
              ดูข้อมูลคำสั่งซื้อเพิ่มเติม
            </button>
          </div>
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