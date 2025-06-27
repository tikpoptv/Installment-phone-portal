import React, { useState, useRef, useEffect } from 'react';
import styles from './ProductCreateModal.module.css';
import PhoneModelModal from './PhoneModelModal';
import { getPhoneModels } from '../../../services/phone-model.service';
import { createProduct } from '../../../services/products.service';
import { authService } from '../../../services/auth/auth.service';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
// import { FaBarcode, FaUser } from 'react-icons/fa';

interface ProductCreateModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const icloudOptions = [
  { value: 'unlocked', label: 'ปลดล็อกแล้ว' },
  { value: 'locked', label: 'ล็อก' },
];

const statusOptions = [
  { value: 'available', label: 'ว่าง' },
  { value: 'leased', label: 'เช่าอยู่' },
  { value: 'sold', label: 'ขายแล้ว' },
];

const ProductCreateModal: React.FC<ProductCreateModalProps> = ({ open, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    phone_model_id: '',
    imei: '',
    price: '',
    cost_price: '',
    available_stock: 1,
    status: 'available',
    icloud_status: '',
    owner_id: '',
    remark: '',
    images: [] as File[],
  });
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [showModelModal, setShowModelModal] = useState(false);
  const [phoneModelsState, setPhoneModelsState] = useState<{ id: string; model_name: string }[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoadingModels(true);
    getPhoneModels()
      .then(data => setPhoneModelsState(data))
      .catch(() => setPhoneModelsState([]))
      .finally(() => setLoadingModels(false));
    // ดึง user id แล้ว set owner_id
    const user = authService.getUser();
    if (user && user.id) {
      setForm(prev => ({ ...prev, owner_id: user.id }));
    }
  }, [open]);

  if (!open) return null;

  // handle change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // handle image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setForm(prev => ({ ...prev, images: [...prev.images, ...files] }));
      setPreviewUrls(prev => [
        ...prev,
        ...files.map(file => URL.createObjectURL(file))
      ]);
    }
  };

  // remove image
  const handleRemoveImage = (idx: number) => {
    setForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== idx)
    }));
    setPreviewUrls(prev => {
      URL.revokeObjectURL(prev[idx]);
      return prev.filter((_, i) => i !== idx);
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // handle submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!form.phone_model_id || !form.price || !form.icloud_status || form.images.length === 0) {
      setError('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน');
      return;
    }
    setShowConfirm(true);
  };

  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);
    try {
      const created = await createProduct({
        phone_model_id: form.phone_model_id,
        status: form.status,
        imei: form.imei || undefined,
        price: Number(form.price),
        cost_price: form.cost_price ? Number(form.cost_price) : undefined,
        available_stock: form.available_stock ? Number(form.available_stock) : undefined,
        icloud_status: form.icloud_status,
        owner_id: form.owner_id || undefined,
        remark: form.remark || undefined,
        images: form.images,
      });
      toast.success('บันทึกสินค้าสำเร็จ!');
      setShowConfirm(false);
      if (onSuccess) onSuccess();
      if (created && created.id) {
        navigate(`/admin/products/${created.id}`);
      } else {
        navigate('/admin/products');
      }
    } catch (err: unknown) {
      let msg = 'เกิดข้อผิดพลาดในการสร้างสินค้าใหม่';
      if (typeof err === 'object' && err !== null) {
        const e = err as Record<string, unknown>;
        msg = (typeof e.error === 'string' && e.error) || (typeof e.message === 'string' && e.message) || msg;
      }
      setError(msg);
      setShowConfirm(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // เพิ่ม callback สำหรับปุ่ม +
  const handleAddModel = () => {
    setShowModelModal(true);
  };

  const handleModelModalClose = () => {
    setShowModelModal(false);
    // fetch models ใหม่หลัง modal ปิด (เผื่อมีการแก้ไขชื่อรุ่น)
    setLoadingModels(true);
    getPhoneModels()
      .then(data => setPhoneModelsState(data))
      .catch(() => setPhoneModelsState([]))
      .finally(() => setLoadingModels(false));
  };

  const handleModelAdded = (newModel: { id: string; model_name: string }) => {
    setPhoneModelsState(prev => [newModel, ...prev]);
    setForm(prev => ({ ...prev, phone_model_id: newModel.id }));
    setShowModelModal(false);
  };

  return (
    <>
      <div className={styles.modalBackdrop}>
        <div className={styles.modalContent}>
          <button className={styles.closeBtn} onClick={onClose} aria-label="ปิด">×</button>
          <h2 className={styles.title}>สร้างสินค้าใหม่</h2>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div>
              <label>รหัสรุ่น <span className={styles.required}>*</span></label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <select name="phone_model_id" value={form.phone_model_id} onChange={handleChange} required className={styles.inputBox} style={{ flex: 1 }} disabled={loadingModels}>
                  <option value="">-- เลือกรุ่น --</option>
                  {phoneModelsState.map(m => <option key={m.id} value={m.id}>{m.model_name}</option>)}
                </select>
                <button type="button" onClick={handleAddModel} className={styles.addModelBtn} title="เพิ่มรุ่นใหม่">+
                </button>
              </div>
            </div>
            <div>
              <label>IMEI</label>
              <input name="imei" value={form.imei} onChange={handleChange} maxLength={15} className={styles.inputBox} />
            </div>
            <div>
              <label>ราคาขาย (บาท) <span className={styles.required}>*</span></label>
              <input name="price" type="number" value={form.price} onChange={handleChange} required min={0} className={styles.inputBox} />
            </div>
            <div>
              <label>ราคาทุน (บาท)</label>
              <input name="cost_price" type="number" value={form.cost_price} onChange={handleChange} min={0} className={styles.inputBox} />
            </div>
            <div>
              <label>จำนวนคงเหลือ</label>
              <input name="available_stock" type="number" value={form.available_stock} onChange={handleChange} min={1} className={styles.inputBox} />
            </div>
            <div>
              <label>สถานะ</label>
              <select name="status" value={form.status} onChange={handleChange} className={styles.inputBox}>
                {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
            <div>
              <label>สถานะ iCloud <span className={styles.required}>*</span></label>
              <select name="icloud_status" value={form.icloud_status} onChange={handleChange} required className={styles.inputBox}>
                <option value="">-- เลือกสถานะ --</option>
                {icloudOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
            <div>
              <label>เจ้าของ</label>
              <input name="owner_id" value={form.owner_id} className={styles.inputBox} disabled style={{ background: '#f1f5f9', color: '#64748b' }} />
            </div>
            <div>
              <label>หมายเหตุ</label>
              <textarea name="remark" value={form.remark} onChange={handleChange} rows={2} className={styles.inputBox} />
            </div>
            <div>
              <label>อัปโหลดรูปสินค้า <span className={styles.required}>*</span></label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className={styles.inputBox}
                ref={fileInputRef}
              />
              <div className={styles.imagePreview}>
                {previewUrls.map((url, idx) => (
                  <div key={idx} className={styles.imageBox}>
                    <img src={url} alt={`preview-${idx}`} className={styles.image} />
                    <button type="button" onClick={() => handleRemoveImage(idx)} className={styles.removeBtn}>×</button>
                  </div>
                ))}
              </div>
            </div>
            {error && <div className={styles.error}>{error}</div>}
            {success && <div className={styles.success}>{success}</div>}
            <div className={styles.buttonRow}>
              <button type="submit" className={styles.submitBtn}>บันทึก</button>
              <button type="button" className={styles.cancelBtn} onClick={onClose}>ยกเลิก</button>
            </div>
          </form>
        </div>
      </div>
      <PhoneModelModal open={showModelModal} onClose={handleModelModalClose} onAdd={handleModelAdded} />
      {showConfirm && (
        <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'rgba(30,41,59,0.32)',zIndex:10000,display:'flex',alignItems:'center',justifyContent:'center',padding:24,backdropFilter:'blur(2px)'}}>
          <div style={{background:'#fff',borderRadius:18,boxShadow:'0 8px 32px #bae6fd',padding:'32px 24px',maxWidth:380,width:'100%',textAlign:'center',position:'relative'}}>
            <div style={{fontSize:38,color:'#0ea5e9',marginBottom:12}}>📦</div>
            <div style={{fontWeight:700,fontSize:'1.13rem',color:'#0ea5e9',marginBottom:10}}>ยืนยันการสร้างสินค้าใหม่</div>
            <div style={{color:'#334155',fontSize:'1.01rem',marginBottom:18,lineHeight:1.6}}>
              กรุณาตรวจสอบข้อมูลสินค้าให้ถูกต้องก่อนบันทึก<br/>
              <span style={{color:'#64748b'}}>คุณต้องการบันทึกสินค้านี้ใช่หรือไม่?</span>
            </div>
            <div style={{display:'flex',gap:16,justifyContent:'center',marginTop:8}}>
              <button style={{background:'#22c55e',color:'#fff',border:'none',borderRadius:18,padding:'7px 28px',fontWeight:600,fontSize:15,cursor:'pointer'}} onClick={handleConfirmSubmit} disabled={isSubmitting}>{isSubmitting ? 'กำลังบันทึก...' : 'ยืนยัน'}</button>
              <button style={{background:'#e0e7ef',color:'#64748b',border:'none',borderRadius:18,padding:'7px 28px',fontWeight:500,fontSize:15,cursor:'pointer'}} onClick={()=>setShowConfirm(false)} disabled={isSubmitting}>ยกเลิก</button>
            </div>
            {isSubmitting && (
              <div style={{position:'absolute',top:0,left:0,right:0,bottom:0,background:'rgba(255,255,255,0.7)',borderRadius:18,display:'flex',alignItems:'center',justifyContent:'center',zIndex:10}}>
                <div style={{color:'#0ea5e9',fontWeight:700,fontSize:22}}>กำลังอัปโหลดสินค้า...</div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ProductCreateModal; 