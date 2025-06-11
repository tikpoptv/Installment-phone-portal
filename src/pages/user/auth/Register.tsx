import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Register.module.css';

function UserRegister() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // ข้อมูลส่วนตัว
    first_name: '',
    last_name: '',
    nickname: '',
    gender: '',
    birth_date: '',
    citizen_id: '',
    id_card_issued_date: '',
    id_card_expired_date: '',
    
    // ที่อยู่
    address: '',
    address_province: '',
    address_district: '',
    address_subdistrict: '',
    address_postal_code: '',
    
    // ติดต่อ
    phone_number: '',
    email: '',
    facebook_url: '',
    line_id: '',
    
    // อาชีพ
    occupation: '',
    work_position: '',
    workplace_name: '',
    work_phone: '',
    monthly_income: '',
    
    // ที่ทำงาน
    work_address: '',
    work_province: '',
    work_district: '',
    work_subdistrict: '',
    work_postal_code: '',
    
    // รหัสผ่าน
    password: '',
    confirm_password: ''
  });

  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // TODO: เรียก API register
    console.log('Form Data:', formData);
    
    // Redirect ไปยังหน้า login หลังจากสมัครสมาชิกสำเร็จ
    navigate('/user/login');
  };

  const nextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  return (
    <div className={styles.container}>
      <div className={styles.registerBox}>
        <h1 className={styles.title}>สมัครสมาชิก</h1>
        
        {/* Progress Bar */}
        <div className={styles.progressBar} style={{ '--current-step': currentStep } as React.CSSProperties}>
          <div className={styles.step} data-active={currentStep >= 1} data-label="ข้อมูลส่วนตัว"></div>
          <div className={styles.step} data-active={currentStep >= 2} data-label="ที่อยู่"></div>
          <div className={styles.step} data-active={currentStep >= 3} data-label="อาชีพ"></div>
          <div className={styles.step} data-active={currentStep >= 4} data-label="รหัสผ่าน"></div>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Step 1: ข้อมูลส่วนตัว */}
          {currentStep === 1 && (
            <div className={styles.stepContent}>
              <h2 className={styles.stepTitle}>ข้อมูลส่วนตัว</h2>
              
              <div className={styles.inputGroup}>
                <label htmlFor="first_name" data-required>ชื่อ</label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="last_name" data-required>นามสกุล</label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="nickname">ชื่อเล่น</label>
                <input
                  type="text"
                  id="nickname"
                  name="nickname"
                  value={formData.nickname}
                  onChange={handleChange}
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="gender" data-required>เพศ</label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                >
                  <option value="">เลือกเพศ</option>
                  <option value="male">ชาย</option>
                  <option value="female">หญิง</option>
                  <option value="other">อื่นๆ</option>
                </select>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="birth_date" data-required>วันเกิด</label>
                <input
                  type="date"
                  id="birth_date"
                  name="birth_date"
                  value={formData.birth_date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="citizen_id" data-required>เลขบัตรประชาชน</label>
                <input
                  type="text"
                  id="citizen_id"
                  name="citizen_id"
                  value={formData.citizen_id}
                  onChange={handleChange}
                  pattern="[0-9]{13}"
                  maxLength={13}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="id_card_issued_date" data-required>วันออกบัตร</label>
                <input
                  type="date"
                  id="id_card_issued_date"
                  name="id_card_issued_date"
                  value={formData.id_card_issued_date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="id_card_expired_date" data-required>วันหมดอายุบัตร</label>
                <input
                  type="date"
                  id="id_card_expired_date"
                  name="id_card_expired_date"
                  value={formData.id_card_expired_date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles.buttonGroup}>
                <button type="button" className={styles.nextButton} onClick={nextStep}>
                  ถัดไป
                </button>
              </div>
            </div>
          )}

          {/* Step 2: ที่อยู่ */}
          {currentStep === 2 && (
            <div className={styles.stepContent}>
              <h2 className={styles.stepTitle}>ที่อยู่</h2>
              
              <div className={styles.inputGroup}>
                <label htmlFor="address" data-required>ที่อยู่</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="address_province" data-required>จังหวัด</label>
                <select
                  id="address_province"
                  name="address_province"
                  value={formData.address_province}
                  onChange={handleChange}
                  required
                >
                  <option value="">เลือกจังหวัด</option>
                  {/* TODO: เพิ่มรายการจังหวัด */}
                </select>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="address_district" data-required>อำเภอ/เขต</label>
                <select
                  id="address_district"
                  name="address_district"
                  value={formData.address_district}
                  onChange={handleChange}
                  required
                >
                  <option value="">เลือกอำเภอ/เขต</option>
                  {/* TODO: เพิ่มรายการอำเภอ/เขต */}
                </select>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="address_subdistrict" data-required>ตำบล/แขวง</label>
                <select
                  id="address_subdistrict"
                  name="address_subdistrict"
                  value={formData.address_subdistrict}
                  onChange={handleChange}
                  required
                >
                  <option value="">เลือกตำบล/แขวง</option>
                  {/* TODO: เพิ่มรายการตำบล/แขวง */}
                </select>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="address_postal_code" data-required>รหัสไปรษณีย์</label>
                <input
                  type="text"
                  id="address_postal_code"
                  name="address_postal_code"
                  value={formData.address_postal_code}
                  onChange={handleChange}
                  pattern="[0-9]{5}"
                  maxLength={5}
                  required
                />
              </div>

              <div className={styles.buttonGroup}>
                <button type="button" className={styles.prevButton} onClick={prevStep}>
                  ย้อนกลับ
                </button>
                <button type="button" className={styles.nextButton} onClick={nextStep}>
                  ถัดไป
                </button>
              </div>
            </div>
          )}

          {/* Step 3: อาชีพ */}
          {currentStep === 3 && (
            <div className={styles.stepContent}>
              <h2 className={styles.stepTitle}>อาชีพ</h2>
              
              <div className={styles.inputGroup}>
                <label htmlFor="occupation" data-required>อาชีพ</label>
                <input
                  type="text"
                  id="occupation"
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="work_position" data-required>ตำแหน่ง</label>
                <input
                  type="text"
                  id="work_position"
                  name="work_position"
                  value={formData.work_position}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="workplace_name" data-required>ชื่อสถานที่ทำงาน</label>
                <input
                  type="text"
                  id="workplace_name"
                  name="workplace_name"
                  value={formData.workplace_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="work_phone" data-required>เบอร์โทรศัพท์ที่ทำงาน</label>
                <input
                  type="tel"
                  id="work_phone"
                  name="work_phone"
                  value={formData.work_phone}
                  onChange={handleChange}
                  pattern="[0-9]{10}"
                  maxLength={10}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="monthly_income" data-required>รายได้ต่อเดือน</label>
                <input
                  type="number"
                  id="monthly_income"
                  name="monthly_income"
                  value={formData.monthly_income}
                  onChange={handleChange}
                  min="0"
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="work_address" data-required>ที่อยู่ที่ทำงาน</label>
                <input
                  type="text"
                  id="work_address"
                  name="work_address"
                  value={formData.work_address}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles.buttonGroup}>
                <button type="button" className={styles.prevButton} onClick={prevStep}>
                  ย้อนกลับ
                </button>
                <button type="button" className={styles.nextButton} onClick={nextStep}>
                  ถัดไป
                </button>
              </div>
            </div>
          )}

          {/* Step 4: รหัสผ่าน */}
          {currentStep === 4 && (
            <div className={styles.stepContent}>
              <h2 className={styles.stepTitle}>รหัสผ่าน</h2>
              
              <div className={styles.inputGroup}>
                <label htmlFor="phone_number" data-required>เบอร์โทรศัพท์</label>
                <input
                  type="tel"
                  id="phone_number"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  pattern="[0-9]{10}"
                  maxLength={10}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="email" data-required>อีเมล</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="facebook_url">Facebook</label>
                <input
                  type="url"
                  id="facebook_url"
                  name="facebook_url"
                  value={formData.facebook_url}
                  onChange={handleChange}
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="line_id">Line ID</label>
                <input
                  type="text"
                  id="line_id"
                  name="line_id"
                  value={formData.line_id}
                  onChange={handleChange}
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="password" data-required>รหัสผ่าน</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="confirm_password" data-required>ยืนยันรหัสผ่าน</label>
                <input
                  type="password"
                  id="confirm_password"
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles.buttonGroup}>
                <button type="button" className={styles.prevButton} onClick={prevStep}>
                  ย้อนกลับ
                </button>
                <button type="submit" className={styles.submitButton}>
                  สมัครสมาชิก
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default UserRegister; 