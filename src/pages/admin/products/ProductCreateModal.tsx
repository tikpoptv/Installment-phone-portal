import React, { useState, useRef, useEffect } from 'react';
import styles from './ProductCreateModal.module.css';
import PhoneModelModal from './PhoneModelModal';
import { getPhoneModels } from '../../../services/phone-model.service';
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

  useEffect(() => {
    if (!open) return;
    setLoadingModels(true);
    getPhoneModels()
      .then(data => setPhoneModelsState(data))
      .catch(() => setPhoneModelsState([]))
      .finally(() => setLoadingModels(false));
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
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!form.phone_model_id || !form.price || !form.icloud_status || form.images.length === 0) {
      setError('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน');
      return;
    }
    // mock submit
    setSuccess('ส่งข้อมูลสำเร็จ (mock)');
    if (onSuccess) onSuccess();
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
              <input name="owner_id" value={form.owner_id} onChange={handleChange} className={styles.inputBox} />
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
    </>
  );
};

export default ProductCreateModal; 