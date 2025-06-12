import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Register.module.css';
import { getProvinceAll, getDistrictByProvince, getSubDistrictByDistrict, getPostalCodeBySubDistrict } from 'thai-address-universal';

function UserRegister() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [provinces, setProvinces] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [subDistricts, setSubDistricts] = useState<string[]>([]);
  const [postalCodes, setPostalCodes] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    // ข้อมูลส่วนตัว
    first_name: '',
    last_name: '',
    nickname: '',
    gender: '',
    birth_date: '',
    citizen_id: '',
    citizen_id_image_url: '',
    id_card_issued_date: '',
    id_card_expired_date: '',
    
    // ที่อยู่
    address: '',
    address_province: '',
    address_district: '',
    address_subdistrict: '',
    address_postal_code: '',
    address_pin_location: '',
    
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
    work_pin_location: '',
    
    // บุคคลอ้างอิง
    reference_contacts: [
      {
        full_name: '',
        nickname: '',
        phone_number: '',
        relationship: ''
      },
      {
        full_name: '',
        nickname: '',
        phone_number: '',
        relationship: ''
      }
    ],
    
    // รหัสผ่าน
    password: '',
    confirm_password: ''
  });

  const [error, setError] = useState<string>('');

  // โหลดข้อมูลจังหวัดเมื่อ component mount
  useEffect(() => {
    const loadProvinces = async () => {
      try {
        const provincesData = await getProvinceAll();
        setProvinces(provincesData);
      } catch (error) {
        console.error('Error loading provinces:', error);
      }
    };
    loadProvinces();
  }, []);

  // โหลดข้อมูลอำเภอเมื่อเลือกจังหวัด
  useEffect(() => {
    const loadDistricts = async () => {
      if (formData.address_province) {
        try {
          const districtsData = await getDistrictByProvince(formData.address_province);
          setDistricts(districtsData);
        } catch (error) {
          console.error('Error loading districts:', error);
        }
      } else {
        setDistricts([]);
      }
    };
    loadDistricts();
  }, [formData.address_province]);

  // โหลดข้อมูลตำบลเมื่อเลือกอำเภอ
  useEffect(() => {
    const loadSubDistricts = async () => {
      if (formData.address_district) {
        try {
          const subDistrictsData = await getSubDistrictByDistrict(formData.address_district);
          setSubDistricts(subDistrictsData);
        } catch (error) {
          console.error('Error loading sub-districts:', error);
        }
      } else {
        setSubDistricts([]);
      }
    };
    loadSubDistricts();
  }, [formData.address_district]);

  // โหลดรหัสไปรษณีย์เมื่อเลือกตำบล/แขวง
  useEffect(() => {
    const loadPostalCode = async () => {
      if (formData.address_subdistrict) {
        try {
          const postalCodesData = await getPostalCodeBySubDistrict(formData.address_subdistrict);
          setPostalCodes(postalCodesData);
          
          // ถ้ามีรหัสไปรษณีย์ ให้เลือกอันแรกเป็นค่าเริ่มต้น
          if (postalCodesData.length > 0) {
            setFormData(prev => ({
              ...prev,
              address_postal_code: postalCodesData[0]
            }));
          }
        } catch (error) {
          console.error('Error loading postal code:', error);
          setPostalCodes([]);
        }
      } else {
        setPostalCodes([]);
      }
    };
    loadPostalCode();
  }, [formData.address_subdistrict]);

  const formatCitizenId = (value: string) => {
    // ลบทุกอย่างที่ไม่ใช่ตัวเลข
    const numbers = value.replace(/\D/g, '');
    
    // แบ่งเป็นกลุ่มและคั่นด้วย -
    if (numbers.length <= 1) return numbers;
    if (numbers.length <= 5) return `${numbers.slice(0, 1)}-${numbers.slice(1)}`;
    if (numbers.length <= 10) return `${numbers.slice(0, 1)}-${numbers.slice(1, 5)}-${numbers.slice(5)}`;
    if (numbers.length <= 12) return `${numbers.slice(0, 1)}-${numbers.slice(1, 5)}-${numbers.slice(5, 10)}-${numbers.slice(10)}`;
    return `${numbers.slice(0, 1)}-${numbers.slice(1, 5)}-${numbers.slice(5, 10)}-${numbers.slice(10, 12)}-${numbers.slice(12, 13)}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // จัดการ format พิเศษสำหรับเลขบัตรประชาชน
    if (name === 'citizen_id') {
      const formattedValue = formatCitizenId(value);
      setFormData(prev => ({
        ...prev,
        [name]: formattedValue
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleReferenceChange = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      reference_contacts: prev.reference_contacts.map((contact, i) => 
        i === index ? { ...contact, [field]: value } : contact
      )
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // TODO: อัพโหลดไฟล์และรับ URL
    // const formData = new FormData();
    // formData.append('file', file);
    // const response = await fetch('/api/upload', {
    //   method: 'POST',
    //   body: formData
    // });
    // const { url } = await response.json();
    
    setFormData(prev => ({
      ...prev,
      citizen_id_image_url: 'URL_FROM_API' // แทนที่ด้วย URL จริง
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      // TODO: เรียก API register
      const response = await fetch('/api/user/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          monthly_income: Number(formData.monthly_income)
        }),
      });

      if (!response.ok) {
        throw new Error('การสมัครสมาชิกไม่สำเร็จ');
      }

      const data = await response.json();
      console.log('Registration successful:', data);
      navigate('/user/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการสมัครสมาชิก');
    }
  };

  const nextStep = () => {
    // Bypass all step validations
    setError('');
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
          <div className={styles.step} data-active={currentStep >= 4} data-label="บุคคลอ้างอิง"></div>
          <div className={styles.step} data-active={currentStep >= 5} data-label="รหัสผ่าน"></div>
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
                  maxLength={17} // 1-5-5-2-1 + 4 เครื่องหมาย -
                  placeholder="X-XXXX-XXXXX-XX-X"
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="citizen_id_image" data-required>รูปบัตรประชาชน</label>
                <input
                  type="file"
                  id="citizen_id_image"
                  accept="image/*"
                  onChange={handleFileUpload}
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
                  placeholder="บ้านเลขที่, หมู่, ถนน"
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
                  {provinces.map((province) => (
                    <option key={province} value={province}>
                      {province}
                    </option>
                  ))}
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
                  disabled={!formData.address_province}
                >
                  <option value="">เลือกอำเภอ/เขต</option>
                  {districts.map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
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
                  disabled={!formData.address_district}
                >
                  <option value="">เลือกตำบล/แขวง</option>
                  {subDistricts.map((subDistrict) => (
                    <option key={subDistrict} value={subDistrict}>
                      {subDistrict}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="address_postal_code" data-required>รหัสไปรษณีย์</label>
                {postalCodes.length > 1 ? (
                  <select
                    id="address_postal_code"
                    name="address_postal_code"
                    value={formData.address_postal_code}
                    onChange={handleChange}
                    required
                  >
                    <option value="">เลือกรหัสไปรษณีย์</option>
                    {postalCodes.map((postalCode) => (
                      <option key={postalCode} value={postalCode}>
                        {postalCode}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    id="address_postal_code"
                    name="address_postal_code"
                    value={formData.address_postal_code}
                    onChange={handleChange}
                    placeholder="รหัสไปรษณีย์ 5 หลัก"
                    pattern="[0-9]{5}"
                    maxLength={5}
                    required
                    readOnly={postalCodes.length === 1}
                  />
                )}
                {postalCodes.length > 1 && (
                  <small className={styles.helperText}>
                    พื้นที่นี้มีหลายรหัสไปรษณีย์ กรุณาเลือกรหัสที่ถูกต้อง
                  </small>
                )}
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="address_pin_location" data-required>พิกัดที่อยู่</label>
                <input
                  type="url"
                  id="address_pin_location"
                  name="address_pin_location"
                  value={formData.address_pin_location}
                  onChange={handleChange}
                  placeholder="https://maps.google.com/..."
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
                <label htmlFor="work_position">ตำแหน่ง</label>
                <input
                  type="text"
                  id="work_position"
                  name="work_position"
                  value={formData.work_position}
                  onChange={handleChange}
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="workplace_name">ชื่อสถานที่ทำงาน</label>
                <input
                  type="text"
                  id="workplace_name"
                  name="workplace_name"
                  value={formData.workplace_name}
                  onChange={handleChange}
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="work_phone">เบอร์โทรศัพท์ที่ทำงาน</label>
                <input
                  type="tel"
                  id="work_phone"
                  name="work_phone"
                  value={formData.work_phone}
                  onChange={handleChange}
                  pattern="[0-9]{10}"
                  maxLength={10}
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

              <div className={styles.inputGroup}>
                <label htmlFor="work_province" data-required>จังหวัดที่ทำงาน</label>
                <select
                  id="work_province"
                  name="work_province"
                  value={formData.work_province}
                  onChange={handleChange}
                  required
                >
                  <option value="">เลือกจังหวัด</option>
                  {/* TODO: เพิ่มรายการจังหวัด */}
                </select>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="work_district" data-required>อำเภอ/เขตที่ทำงาน</label>
                <select
                  id="work_district"
                  name="work_district"
                  value={formData.work_district}
                  onChange={handleChange}
                  required
                >
                  <option value="">เลือกอำเภอ/เขต</option>
                  {/* TODO: เพิ่มรายการอำเภอ/เขต */}
                </select>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="work_subdistrict" data-required>ตำบล/แขวงที่ทำงาน</label>
                <select
                  id="work_subdistrict"
                  name="work_subdistrict"
                  value={formData.work_subdistrict}
                  onChange={handleChange}
                  required
                >
                  <option value="">เลือกตำบล/แขวง</option>
                  {/* TODO: เพิ่มรายการตำบล/แขวง */}
                </select>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="work_postal_code" data-required>รหัสไปรษณีย์ที่ทำงาน</label>
                <input
                  type="text"
                  id="work_postal_code"
                  name="work_postal_code"
                  value={formData.work_postal_code}
                  onChange={handleChange}
                  pattern="[0-9]{5}"
                  maxLength={5}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="work_pin_location" data-required>พิกัดที่ทำงาน</label>
                <input
                  type="url"
                  id="work_pin_location"
                  name="work_pin_location"
                  value={formData.work_pin_location}
                  onChange={handleChange}
                  placeholder="https://maps.google.com/..."
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

          {/* Step 4: บุคคลอ้างอิง */}
          {currentStep === 4 && (
            <div className={styles.stepContent}>
              <h2 className={styles.stepTitle}>บุคคลอ้างอิง</h2>
              
              {formData.reference_contacts.map((contact, index) => (
                <div key={index} className={styles.referenceContact}>
                  <h3 className={styles.referenceTitle}>บุคคลอ้างอิงที่ {index + 1}</h3>
                  
                  <div className={styles.inputGroup}>
                    <label htmlFor={`reference_full_name_${index}`} data-required>ชื่อ-นามสกุล</label>
                    <input
                      type="text"
                      id={`reference_full_name_${index}`}
                      value={contact.full_name}
                      onChange={(e) => handleReferenceChange(index, 'full_name', e.target.value)}
                      required
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label htmlFor={`reference_nickname_${index}`}>ชื่อเล่น</label>
                    <input
                      type="text"
                      id={`reference_nickname_${index}`}
                      value={contact.nickname}
                      onChange={(e) => handleReferenceChange(index, 'nickname', e.target.value)}
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label htmlFor={`reference_phone_${index}`} data-required>เบอร์โทรศัพท์</label>
                    <input
                      type="tel"
                      id={`reference_phone_${index}`}
                      value={contact.phone_number}
                      onChange={(e) => handleReferenceChange(index, 'phone_number', e.target.value)}
                      pattern="[0-9]{10}"
                      maxLength={10}
                      required
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label htmlFor={`reference_relationship_${index}`} data-required>ความสัมพันธ์</label>
                    <input
                      type="text"
                      id={`reference_relationship_${index}`}
                      value={contact.relationship}
                      onChange={(e) => handleReferenceChange(index, 'relationship', e.target.value)}
                      required
                    />
                  </div>
                </div>
              ))}

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

          {/* Step 5: รหัสผ่าน */}
          {currentStep === 5 && (
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
                  minLength={6}
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
                  minLength={6}
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