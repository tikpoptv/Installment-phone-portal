import React, { useState, useEffect } from 'react';
import styles from './ProductEditModal.module.css';
import { updateProduct } from '../../../services/products.service';
import { toast } from 'react-toastify';

interface ProductEditModalProps {
  open: boolean;
  onClose: () => void;
  product: {
    id: string;
    status: string;
    imei?: string;
    price?: number;
    cost_price?: number;
    remark?: string;
  } | null;
  onSuccess: () => void;
}

interface UpdateProductPayload {
  status: string;
  imei?: string;
  price?: number;
  cost_price?: number;
  remark?: string;
}

const statusOptions = [
  { value: 'available', label: 'ว่าง' },
  { value: 'leased', label: 'ติดสัญญา' },
  { value: 'sold', label: 'ขายแล้ว' },
];

export default function ProductEditModal({ open, onClose, product, onSuccess }: ProductEditModalProps) {
  const [formData, setFormData] = useState<UpdateProductPayload>({
    status: 'available',
    price: undefined,
    remark: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (product && open) {
      setFormData({
        status: product.status,
        price: product.price,
        remark: product.remark || '',
      });
    }
  }, [product, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    setLoading(true);
    try {
      await updateProduct(product.id, formData);
      toast.success('อัปเดตข้อมูลสินค้าสำเร็จ!');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Update product error:', error);
      toast.error('เกิดข้อผิดพลาดในการอัปเดตข้อมูลสินค้า');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof UpdateProductPayload, value: string | number | undefined) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  if (!open || !product) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>แก้ไขข้อมูลสินค้า</h3>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>สถานะสินค้า *</label>
            <select
              className={styles.select}
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              required
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>ราคาขาย (บาท) *</label>
            <input
              type="number"
              className={styles.input}
              value={formData.price ?? ''}
              onChange={(e) => handleInputChange('price', e.target.value ? Number(e.target.value) : undefined)}
              placeholder="ระบุราคาขาย"
              min="0"
              step="0.01"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>หมายเหตุ</label>
            <textarea
              className={styles.textarea}
              value={formData.remark}
              onChange={(e) => handleInputChange('remark', e.target.value)}
              placeholder="ระบุหมายเหตุ (ถ้ามี)"
              rows={3}
            />
          </div>

          <div className={styles.buttonGroup}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
              disabled={loading}
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? 'กำลังบันทึก...' : 'บันทึก'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 