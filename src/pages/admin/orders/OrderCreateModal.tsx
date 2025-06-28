import React, { useState, useRef, useEffect } from 'react';
import styles from './OrderCreateModal.module.css';
import { getCustomers } from '../../../services/customer/customer.service';
import type { Customer } from '../../../services/customer/customer.service';
import { getProducts } from '../../../services/products.service';
import type { Product } from '../../../services/products.service';

interface OrderCreateModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const categoryOptions = [
  { value: 'rent', label: 'เช่า' },
  { value: 'cash_purchase', label: 'ซื้อขาด' },
];
const statusOptions = [
  { value: 'active', label: 'ใช้งานอยู่' },
  { value: 'closed', label: 'ปิดสัญญา' },
  { value: 'default', label: 'รอดำเนินการ' },
  { value: 'repossessed', label: 'ยึดคืน' },
  { value: 'returned', label: 'คืนสินค้า' },
];

const OrderCreateModal: React.FC<OrderCreateModalProps> = ({ open, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    user_id: '',
    product_id: '',
    category: 'rent',
    total_price: '',
    total_with_interest: '',
    installment_months: '',
    monthly_payment: '',
    status: 'active',
    start_date: '',
    end_date: '',
    pdpa_consent_file: null as File | null,
    user_name: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [userQuery, setUserQuery] = useState('');
  const [showUserList, setShowUserList] = useState(false);
  const userInputRef = useRef<HTMLInputElement | null>(null);
  const [customerList, setCustomerList] = useState<Customer[]>([]);
  const [customerLoading, setCustomerLoading] = useState(false);
  const [productList, setProductList] = useState<Product[]>([]);
  const [productLoading, setProductLoading] = useState(false);
  const [productQuery, setProductQuery] = useState('');
  const [showProductList, setShowProductList] = useState(false);
  const productInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) return;
    setCustomerLoading(true);
    getCustomers()
      .then(data => setCustomerList(data ?? []))
      .catch(() => setCustomerList([]))
      .finally(() => setCustomerLoading(false));
    setProductLoading(true);
    getProducts()
      .then(data => setProductList((data ?? []).filter(p => p.status === 'available')))
      .catch(() => setProductList([]))
      .finally(() => setProductLoading(false));
  }, [open]);

  if (!open) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'category' && value === 'cash_purchase') {
      setForm(prev => ({
        ...prev,
        [name]: value,
        status: 'closed',
        total_with_interest: '',
        installment_months: '',
        monthly_payment: '',
        start_date: '',
        end_date: '',
        pdpa_consent_file: null
      }));
    } else if (name === 'category') {
      setForm(prev => ({ ...prev, [name]: value, status: 'active' }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setForm(prev => ({ ...prev, pdpa_consent_file: e.target.files![0] }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    // validate
    if (!form.user_id || !form.product_id || !form.category || !form.total_price || !form.total_with_interest || !form.installment_months || !form.monthly_payment || !form.status || !form.start_date || !form.end_date || !form.pdpa_consent_file) {
      setError('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
    setSuccess('สร้างคำสั่งซื้อ (mock) สำเร็จ!');
    if (onSuccess) onSuccess();
    setTimeout(() => {
      setSuccess(null);
      onClose();
    }, 1200);
  };

  const filteredUsers = customerList
    .filter(u => u.is_verified)
    .filter(u =>
      (u.first_name + ' ' + u.last_name + ' ' + u.phone_number).toLowerCase().includes(userQuery.toLowerCase())
    );

  const handleUserSelect = (user: Customer) => {
    setForm(prev => ({ ...prev, user_id: user.id, user_name: user.first_name + ' ' + user.last_name }));
    setUserQuery(user.first_name + ' ' + user.last_name + ' (' + user.phone_number + ')');
    setShowUserList(false);
  };

  const filteredProducts = productList.filter(p =>
    (p.id + ' ' + p.model_name).toLowerCase().includes(productQuery.toLowerCase())
  );
  const handleProductSelect = (product: Product) => {
    setForm(prev => ({ ...prev, product_id: product.id }));
    setProductQuery(product.id + ' - ' + product.model_name);
    setShowProductList(false);
  };

  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modalContent}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="ปิด">×</button>
        <h2 className={styles.title}>สร้างคำสั่งซื้อใหม่</h2>
        <form onSubmit={handleSubmit} className={styles.form} autoComplete="off">
          <div style={{ position: 'relative' }}>
            <label>ลูกค้า <span className={styles.required}>*</span></label>
            <input
              type="text"
              name="user_name"
              value={userQuery}
              onChange={e => {
                setUserQuery(e.target.value);
                setShowUserList(true);
                setForm(prev => ({ ...prev, user_id: '', user_name: e.target.value }));
              }}
              onFocus={() => setShowUserList(true)}
              onBlur={() => setShowUserList(false)}
              ref={userInputRef}
              className={styles.inputBox}
              placeholder="พิมพ์ชื่อลูกค้า..."
              autoComplete="off"
              required
            />
            {showUserList && filteredUsers.length > 0 && (
              <div style={{
                position: 'absolute',
                top: '100%', left: 0, right: 0, zIndex: 20,
                background: '#fff', border: '1.5px solid #bae6fd', borderRadius: 8,
                boxShadow: '0 2px 12px #bae6fd22',
                maxHeight: 180, overflowY: 'auto', marginTop: 2
              }}>
                {customerLoading ? (
                  <div style={{ padding: '10px 14px', color: '#64748b' }}>กำลังโหลด...</div>
                ) : filteredUsers.map(u => (
                  <div
                    key={u.id}
                    style={{ padding: '10px 14px', cursor: 'pointer', color: '#0ea5e9', fontWeight: 500 }}
                    onMouseDown={() => handleUserSelect(u)}
                  >{u.first_name} {u.last_name} <span style={{color:'#64748b',fontWeight:400}}>({u.phone_number})</span></div>
                ))}
              </div>
            )}
            {form.user_id && (
              <a
                href={`/admin/customers/${form.user_id}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-block',
                  marginTop: 8,
                  color: '#0ea5e9',
                  fontWeight: 600,
                  fontSize: 15,
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  background: 'none',
                  border: 'none',
                  padding: 0
                }}
              >ดูรายละเอียดลูกค้า</a>
            )}
          </div>
          <div style={{ position: 'relative' }}>
            <label>สินค้า <span className={styles.required}>*</span></label>
            <input
              type="text"
              name="product_name"
              value={productQuery}
              onChange={e => {
                setProductQuery(e.target.value);
                setShowProductList(true);
                setForm(prev => ({ ...prev, product_id: '' }));
              }}
              onFocus={() => setShowProductList(true)}
              onBlur={() => setShowProductList(false)}
              ref={productInputRef}
              className={styles.inputBox}
              placeholder="พิมพ์รหัสหรือชื่อสินค้า..."
              autoComplete="off"
              required
            />
            {showProductList && filteredProducts.length > 0 && (
              <div style={{
                position: 'absolute',
                top: '100%', left: 0, right: 0, zIndex: 20,
                background: '#fff', border: '1.5px solid #bae6fd', borderRadius: 8,
                boxShadow: '0 2px 12px #bae6fd22',
                maxHeight: 180, overflowY: 'auto', marginTop: 2
              }}>
                {productLoading ? (
                  <div style={{ padding: '10px 14px', color: '#64748b' }}>กำลังโหลด...</div>
                ) : filteredProducts.map(p => (
                  <div
                    key={p.id}
                    style={{ padding: '10px 14px', cursor: 'pointer', color: '#0ea5e9', fontWeight: 500 }}
                    onMouseDown={() => handleProductSelect(p)}
                  >{p.id} - {p.model_name}</div>
                ))}
              </div>
            )}
            {form.product_id && (
              <a
                href={`/admin/products/${form.product_id}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-block',
                  marginTop: 8,
                  color: '#0ea5e9',
                  fontWeight: 600,
                  fontSize: 15,
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  background: 'none',
                  border: 'none',
                  padding: 0
                }}
              >ดูรายละเอียดสินค้า</a>
            )}
          </div>
          <div>
            <label>ประเภท <span className={styles.required}>*</span></label>
            <select name="category" value={form.category} onChange={handleChange} required className={styles.inputBox}>
              {categoryOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
          <div>
            <label style={form.category === 'cash_purchase' ? { color: '#94a3b8' } : {}}>ราคาสินค้า <span className={styles.required}>*</span></label>
            <input name="total_price" type="number" value={form.total_price} onChange={handleChange} 
              required={form.category !== 'cash_purchase'} min={0} className={styles.inputBox} 
              disabled={form.category === 'cash_purchase'}
              style={form.category === 'cash_purchase' ? { background: '#f1f5f9', color: '#94a3b8', borderColor: '#e2e8f0', cursor: 'not-allowed' } : {}}
            />
          </div>
          <div>
            <label style={form.category === 'cash_purchase' ? { color: '#94a3b8' } : {}}>ราคารวมดอกเบี้ย <span className={styles.required}>*</span></label>
            <input name="total_with_interest" type="number" value={form.total_with_interest} onChange={handleChange} 
              required={form.category !== 'cash_purchase'} min={0} className={styles.inputBox} 
              disabled={form.category === 'cash_purchase'}
              style={form.category === 'cash_purchase' ? { background: '#f1f5f9', color: '#94a3b8', borderColor: '#e2e8f0', cursor: 'not-allowed' } : {}}
            />
          </div>
          <div>
            <label style={form.category === 'cash_purchase' ? { color: '#94a3b8' } : {}}>จำนวนงวดผ่อน <span className={styles.required}>*</span></label>
            <input name="installment_months" type="number" value={form.installment_months} onChange={handleChange} 
              required={form.category !== 'cash_purchase'} min={1} className={styles.inputBox} 
              disabled={form.category === 'cash_purchase'}
              style={form.category === 'cash_purchase' ? { background: '#f1f5f9', color: '#94a3b8', borderColor: '#e2e8f0', cursor: 'not-allowed' } : {}}
            />
          </div>
          <div>
            <label style={form.category === 'cash_purchase' ? { color: '#94a3b8' } : {}}>ยอดผ่อนต่อเดือน <span className={styles.required}>*</span></label>
            <input name="monthly_payment" type="number" value={form.monthly_payment} onChange={handleChange} 
              required={form.category !== 'cash_purchase'} min={0} className={styles.inputBox} 
              disabled={form.category === 'cash_purchase'}
              style={form.category === 'cash_purchase' ? { background: '#f1f5f9', color: '#94a3b8', borderColor: '#e2e8f0', cursor: 'not-allowed' } : {}}
            />
          </div>
          <div>
            <label>สถานะ <span className={styles.required}>*</span></label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              required
              className={styles.inputBox}
              disabled={form.category === 'cash_purchase'}
              style={form.category === 'cash_purchase' ? { background: '#f1f5f9', color: '#94a3b8', borderColor: '#e2e8f0', cursor: 'not-allowed' } : {}}
            >
              {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
          <div>
            <label style={form.category === 'cash_purchase' ? { color: '#94a3b8' } : {}}>วันที่เริ่ม <span className={styles.required}>*</span></label>
            <input name="start_date" type="date" value={form.start_date} onChange={handleChange} 
              required={form.category !== 'cash_purchase'} className={styles.inputBox} 
              disabled={form.category === 'cash_purchase'}
              style={form.category === 'cash_purchase' ? { background: '#f1f5f9', color: '#94a3b8', borderColor: '#e2e8f0', cursor: 'not-allowed' } : {}}
            />
          </div>
          <div>
            <label style={form.category === 'cash_purchase' ? { color: '#94a3b8' } : {}}>วันที่สิ้นสุด <span className={styles.required}>*</span></label>
            <input name="end_date" type="date" value={form.end_date} onChange={handleChange} 
              required={form.category !== 'cash_purchase'} className={styles.inputBox} 
              disabled={form.category === 'cash_purchase'}
              style={form.category === 'cash_purchase' ? { background: '#f1f5f9', color: '#94a3b8', borderColor: '#e2e8f0', cursor: 'not-allowed' } : {}}
            />
          </div>
          <div>
            <label style={form.category === 'cash_purchase' ? { color: '#94a3b8' } : {}}>ไฟล์ใบยินยอม PDPA (PDF) <span className={styles.required}>*</span></label>
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className={styles.inputBox}
              ref={fileInputRef}
              required={form.category !== 'cash_purchase'}
              disabled={form.category === 'cash_purchase'}
              style={form.category === 'cash_purchase' ? { background: '#f1f5f9', color: '#94a3b8', borderColor: '#e2e8f0', cursor: 'not-allowed' } : {}}
            />
            {form.pdpa_consent_file && (
              <div style={{ marginTop: 6, color: '#0ea5e9', fontSize: 14 }}>
                ไฟล์: {form.pdpa_consent_file.name}
              </div>
            )}
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
  );
};

export default OrderCreateModal; 