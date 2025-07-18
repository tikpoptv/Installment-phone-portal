import React, { useState, useRef, useEffect } from 'react';
import styles from './OrderCreateModal.module.css';
import { getUserListBrief, type UserBrief } from '../../../services/dashboard/user/user-detail.service';
import { getAvailableProducts } from '../../../services/products.service';
import type { Product } from '../../../services/products.service';
import { createContract } from '../../../services/contract.service';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

interface OrderCreateModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const categoryOptions = [
  { value: 'rent', label: 'ผ่อน' },
  { value: 'cash_purchase', label: 'ซื้อเงินสด' },
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
    down_payment_amount: '',
    rental_cost: '',
  });
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [userQuery, setUserQuery] = useState('');
  const [showUserList, setShowUserList] = useState(false);
  const userInputRef = useRef<HTMLInputElement | null>(null);
  const [userList, setUserList] = useState<UserBrief[]>([]);
  const [userLoading, setUserLoading] = useState(false);
  const [productList, setProductList] = useState<Product[]>([]);
  const [productLoading, setProductLoading] = useState(false);
  const [productQuery, setProductQuery] = useState('');
  const [showProductList, setShowProductList] = useState(false);
  const productInputRef = useRef<HTMLInputElement | null>(null);
  const [showPdpaPreview, setShowPdpaPreview] = useState(false);
  const [pdpaPreviewUrl, setPdpaPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    setUserLoading(true);
    getUserListBrief()
      .then(data => setUserList(data ?? []))
      .catch(() => setUserList([]))
      .finally(() => setUserLoading(false));
    setProductLoading(true);
    getAvailableProducts()
      .then(data => setProductList(data ?? []))
      .catch(() => setProductList([]))
      .finally(() => setProductLoading(false));

    // รีเซ็ตค่าทุก field เมื่อเปิด modal
    const todayStr = new Date().toISOString().slice(0, 10);
    setForm({
      user_id: '',
      product_id: '',
      category: 'rent',
      total_price: '',
      total_with_interest: '',
      installment_months: '',
      monthly_payment: '',
      status: 'active',
      start_date: todayStr,
      end_date: '',
      pdpa_consent_file: null,
      user_name: '',
      down_payment_amount: '',
      rental_cost: '',
    });
    setUserQuery('');
    setProductQuery('');
    setShowUserList(false);
    setShowProductList(false);
  }, [open]);

  useEffect(() => {
    if (form.category === 'cash_purchase') {
      setForm(prev => ({ ...prev, user_id: '', user_name: '' }));
      setUserQuery('');
    }
  }, [form.category]);

  // ให้ end_date auto update ทุกครั้งที่ start_date หรือ installment_months เปลี่ยน
  useEffect(() => {
    if (!open) return;
    if (form.start_date && form.installment_months) {
      setForm(prev => ({
        ...prev,
        end_date: calcEndDate(form.start_date, form.installment_months)
      }));
    }
  }, [form.start_date, form.installment_months, open]);

  if (!open) return null;

  // ฟังก์ชันช่วยคำนวณวันที่สิ้นสุด
  function calcEndDate(start: string, months: string) {
    if (!start || !months) return '';
    const d = new Date(start);
    const m = parseInt(months, 10);
    if (isNaN(m)) return '';
    d.setMonth(d.getMonth() + m);
    // คืนค่า yyyy-MM-dd
    return d.toISOString().slice(0, 10);
  }

  // ฟังก์ชันคำนวณยอดผ่อนต่อเดือน
  function calculateMonthlyPayment(rentalCost: number, installmentMonths: number): string {
    if (isNaN(rentalCost) || isNaN(installmentMonths) || installmentMonths <= 0) {
      return '';
    }
    
    // ยอดผ่อนต่อเดือน = ค่าเช่า/ผ่อน ÷ จำนวนงวด
    // เดือนแรกจ่ายดาวน์แล้วเอาเครื่องไปใช้ เดือนหน้าจึงเริ่มจ่ายผ่อน
    return (rentalCost / installmentMonths).toFixed(2);
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'down_payment_amount') {
      setForm(prev => {
        const newForm = { ...prev, [name]: value.replace(/[^\d.]/g, '') };
        // auto-calc rental_cost ถ้าข้อมูลครบ
        const totalWithInterest = parseFloat(newForm.total_with_interest);
        const downPayment = parseFloat(newForm.down_payment_amount);
        if (!isNaN(totalWithInterest) && !isNaN(downPayment)) {
          newForm.rental_cost = (totalWithInterest - downPayment).toFixed(2);
          // คำนวณยอดผ่อนต่อเดือนใหม่
          const rentalCost = parseFloat(newForm.rental_cost);
          const installmentMonths = parseInt(newForm.installment_months, 10);
          newForm.monthly_payment = calculateMonthlyPayment(rentalCost, installmentMonths);
        } else {
          newForm.rental_cost = '';
          newForm.monthly_payment = '';
        }
        return newForm;
      });
      return;
    }
    if (name === 'total_with_interest') {
      setForm(prev => {
        const newForm = { ...prev, [name]: value };
        // auto-calc rental_cost ถ้าข้อมูลครบ
        const totalWithInterest = parseFloat(value);
        const downPayment = parseFloat(newForm.down_payment_amount);
        if (!isNaN(totalWithInterest) && !isNaN(downPayment)) {
          newForm.rental_cost = (totalWithInterest - downPayment).toFixed(2);
          // คำนวณยอดผ่อนต่อเดือนใหม่
          const rentalCost = parseFloat(newForm.rental_cost);
          const installmentMonths = parseInt(newForm.installment_months, 10);
          newForm.monthly_payment = calculateMonthlyPayment(rentalCost, installmentMonths);
        } else {
          newForm.rental_cost = '';
          newForm.monthly_payment = '';
        }
        return newForm;
      });
      return;
    }
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
    } else if (name === 'installment_months') {
      if (parseInt(value, 10) > 24) {
        setForm(prev => ({ ...prev, [name]: '' }));
        toast.error('จำนวนงวดผ่อนสูงสุด 24 งวด');
        return;
      }
      setForm(prev => {
        const newForm = { ...prev, [name]: value };
        const rentalCost = parseFloat(newForm.rental_cost);
        const installmentMonths = parseInt(value, 10);
        newForm.monthly_payment = calculateMonthlyPayment(rentalCost, installmentMonths);
        // auto คำนวณ end_date
        newForm.end_date = calcEndDate(newForm.start_date || new Date().toISOString().slice(0, 10), value);
        return newForm;
      });
    } else if (name === 'start_date') {
      setForm(prev => {
        const newForm = { ...prev, [name]: value };
        newForm.end_date = calcEndDate(value, newForm.installment_months);
        return newForm;
      });
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setForm(prev => ({ ...prev, pdpa_consent_file: e.target.files![0] }));
      // เตรียม url สำหรับ preview
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setPdpaPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    // validate
    const isCashPurchase = form.category === 'cash_purchase';
    const isRent = form.category === 'rent';
    // validate
    let requiredFields: (string | File | null)[] = [];
    if (isRent) {
      requiredFields = [
        form.user_id,
        form.product_id,
        form.category,
        form.total_price,
        form.total_with_interest,
        form.installment_months,
        form.monthly_payment,
        form.status,
        form.start_date,
        form.end_date,
        form.pdpa_consent_file
      ];
    } else if (isCashPurchase) {
      requiredFields = [
        form.product_id,
        form.category,
        form.total_price
      ];
    }
    if (requiredFields.some(field => !field)) {
      toast.error('กรุณากรอกข้อมูลให้ครบถ้วน');
      setIsSubmitting(false);
      return;
    }
    // เตรียม payload
    const payload: Record<string, unknown> = { ...form };
    if (isCashPurchase) {
      // กรอกค่าปลอดภัยให้ช่องที่เหลือ (workaround: ใช้ 1 แทน 0)
      payload.total_with_interest = form.total_price;
      payload.installment_months = 1;
      payload.monthly_payment = 0;
      payload.status = 'active';
      // วันที่เริ่ม/สิ้นสุด ใส่วันปัจจุบันเสมอ
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      const todayStr = `${yyyy}-${mm}-${dd}`;
      payload.start_date = todayStr;
      payload.end_date = todayStr;
      // ไม่ต้องแนบไฟล์ pdpa_consent_file
      delete payload.pdpa_consent_file;
      // ถ้า user_id เป็น string ว่าง ให้ลบ property ออก (ไม่ต้องส่งไป backend)
      if (payload.user_id === '' || payload.user_id === null) delete payload.user_id;
      // ถ้าเป็นซื้อสด ให้ user_name เป็น 'system'
      payload.user_name = 'system';
    } else if (isRent) {
      // ช่องอื่นๆ ไม่ต้อง validate/แนบไฟล์/กรอก
      // ลบออกจาก payload ถ้าไม่กรอก
      const optionalFields: (keyof typeof form)[] = [
        'total_with_interest',
        'installment_months',
        'monthly_payment',
        'status',
        'start_date',
        'end_date',
        'pdpa_consent_file'
      ];
      optionalFields.forEach(field => {
        if (!form[field]) delete payload[field];
      });
    }
    // แปลงค่าเป็น number ถ้ามี
    if (form.down_payment_amount !== '') payload.down_payment_amount = Number(form.down_payment_amount);
    if (form.rental_cost !== '') payload.rental_cost = Number(form.rental_cost);
    try {
      const res = await createContract(payload);
      // ปลอดภัย ไม่ใช้ any
      let id: string | undefined;
      if (res && typeof res.data === 'object' && res.data !== null && 'id' in res.data && typeof (res.data as Record<string, unknown>).id === 'string') {
        id = (res.data as Record<string, unknown>).id as string;
      }
      toast.success('สร้างคำสั่งซื้อสำเร็จ!');
      setTimeout(() => {
        if (id) {
          navigate(`/admin/orders/${id}`);
        } else {
          onClose();
        }
        setIsSubmitting(false);
      }, 800);
      if (onSuccess) onSuccess();
    } catch {
      toast.error('เกิดข้อผิดพลาดในการสร้างคำสั่งซื้อ');
      setIsSubmitting(false);
    }
  };

  const filteredUsers = userList.filter(u =>
    (u.first_name + ' ' + u.phone_number).toLowerCase().includes(userQuery.toLowerCase())
  );

  const handleUserSelect = (user: UserBrief) => {
    setForm(prev => ({ ...prev, user_id: user.id, user_name: user.first_name }));
    setUserQuery(user.first_name + ' (' + user.phone_number + ')');
    setShowUserList(false);
  };

  const filteredProducts = productList.filter(p =>
    (p.id + ' ' + p.model_name).toLowerCase().includes(productQuery.toLowerCase())
  );
  const handleProductSelect = (product: Product) => {
    const todayStr = new Date().toISOString().slice(0, 10);
    setForm(prev => {
      const newStart = todayStr;
      const newEnd = calcEndDate(newStart, prev.installment_months || '');
      return {
        ...prev,
        product_id: product.id,
        total_price: product.price.toString(),
        total_with_interest: product.price.toString(),
        start_date: newStart,
        end_date: newEnd
      };
    });
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
              disabled={form.category === 'cash_purchase'}
              style={form.category === 'cash_purchase' ? { background: '#e5e7eb', color: '#64748b', cursor: 'not-allowed' } : {}}
            />
            {showUserList && filteredUsers.length > 0 && (
              <div style={{
                position: 'absolute',
                top: '100%', left: 0, right: 0, zIndex: 20,
                background: '#fff', border: '1.5px solid #bae6fd', borderRadius: 8,
                boxShadow: '0 2px 12px #bae6fd22',
                maxHeight: 180, overflowY: 'auto', marginTop: 2
              }}>
                {userLoading ? (
                  <div style={{ padding: '10px 14px', color: '#64748b' }}>กำลังโหลด...</div>
                ) : filteredUsers.map(u => (
                  <div
                    key={u.id}
                    style={{ padding: '10px 14px', cursor: 'pointer', color: '#0ea5e9', fontWeight: 500 }}
                    onMouseDown={() => handleUserSelect(u)}
                  >{u.first_name} <span style={{color:'#64748b',fontWeight:400}}>({u.phone_number})</span></div>
                ))}
              </div>
            )}
            {!userLoading && userList.length === 0 && (
              <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(30,41,59,0.72)',
                color: '#fff',
                zIndex: 30,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
                fontWeight: 600,
                borderRadius: 8
              }}>
                ไม่พบข้อมูลในระบบ
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
            {!productLoading && productList.length === 0 && (
              <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(30,41,59,0.72)',
                color: '#fff',
                zIndex: 30,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
                fontWeight: 600,
                borderRadius: 8
              }}>
                ไม่พบข้อมูลในระบบ
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
            <label>ราคาสินค้า <span className={styles.required}>*</span></label>
            <input name="total_price" type="number" value={form.total_price} onChange={handleChange} 
              required min={0} className={styles.inputBox} 
            />
          </div>
          {form.category === 'rent' && <>
          <div>
            <label>ราคารวมดอกเบี้ย <span className={styles.required}>*</span></label>
            <input name="total_with_interest" type="number" value={form.total_with_interest} onChange={handleChange} 
              required min={0} className={styles.inputBox} 
            />
          </div>
          <div>
            <label>เงินดาวน์ <span className={styles.required}>*</span></label>
            <input name="down_payment_amount" type="number" value={form.down_payment_amount} onChange={handleChange}
              min={0} className={styles.inputBox}
              required />
          </div>
          <div>
            <label>ค่าเช่า/ผ่อน (คำนวณอัตโนมัติ)</label>
            <input name="rental_cost" type="number" value={form.rental_cost} readOnly disabled
              min={0} className={styles.inputBox}
              placeholder="ระบบคำนวณอัตโนมัติ" />
          </div>
          <div>
            <label>จำนวนงวดผ่อน <span className={styles.required}>*</span></label>
            <input name="installment_months" type="number" value={form.installment_months} onChange={handleChange}
              required min={1} max={24} className={styles.inputBox}
            />
          </div>
          <div>
            <label>ยอดผ่อนต่อเดือน <span className={styles.required}>*</span></label>
            <input name="monthly_payment" type="number" value={form.monthly_payment} onChange={handleChange} 
              required min={0} step="0.01" className={styles.inputBox} 
            />
            <div style={{ 
              fontSize: '12px', 
              color: '#64748b', 
              marginTop: '4px',
              fontStyle: 'italic'
            }}>
              💡 คำนวณจาก: ค่าเช่า/ผ่อน ÷ จำนวนงวด
            </div>
          </div>
          <div>
            <label>สถานะ <span className={styles.required}>*</span></label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              required
              className={styles.inputBox}
            >
              {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
          <div>
            <label>วันที่เริ่ม <span className={styles.required}>*</span></label>
            <input name="start_date" type="date" value={form.start_date} onChange={handleChange} 
              required className={styles.inputBox} 
            />
          </div>
          <div>
            <label>วันที่สิ้นสุด <span className={styles.required}>*</span></label>
            <input name="end_date" type="date" value={form.end_date} onChange={handleChange} 
              required className={styles.inputBox} 
            />
          </div>
          <div>
            <label>ไฟล์สัญญาคำสั่งซื้อ (PDF) <span className={styles.required}>*</span></label>
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className={styles.inputBox}
              ref={fileInputRef}
              required
            />
            {form.pdpa_consent_file && (
              <div style={{ marginTop: 6, color: '#0ea5e9', fontSize: 14 }}>
                ไฟล์: {form.pdpa_consent_file.name}
                <button
                  type="button"
                  onClick={() => setShowPdpaPreview(true)}
                  style={{
                    marginLeft: 10,
                    background: '#0ea5e9',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    padding: '2px 10px',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 1px 4px #bae6fd',
                    verticalAlign: 'middle',
                    lineHeight: 1.5
                  }}
                >ดูไฟล์สัญญา</button>
              </div>
            )}
          </div>
          </>}
          <div className={styles.buttonRow}>
            <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
              {isSubmitting ? 'กำลังบันทึก...' : 'บันทึก'}
            </button>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>ยกเลิก</button>
          </div>
        </form>
      </div>
      {showPdpaPreview && pdpaPreviewUrl && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(30,41,59,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{ background: '#fff', borderRadius: 12, maxWidth: 600, width: '95vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid #e5e7eb', fontWeight: 'bold', background: '#f1f5f9' }}>
              <span>แสดงไฟล์สัญญาคำสั่งซื้อ</span>
              <button onClick={() => { setShowPdpaPreview(false); if (pdpaPreviewUrl) { URL.revokeObjectURL(pdpaPreviewUrl); setPdpaPreviewUrl(null); } }} style={{ background: 'none', border: 'none', fontSize: '1.5rem', color: '#64748b', cursor: 'pointer', padding: '4px 8px' }}>&times;</button>
            </div>
            <div style={{ padding: 0, flex: 1, overflow: 'auto', background: '#f9fafb', minHeight: 400 }}>
              <iframe
                src={pdpaPreviewUrl}
                title="Order Contract File Preview"
                width="100%"
                height="500px"
                style={{ border: 'none', display: 'block' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderCreateModal; 