import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Register.module.css';
import { getProvinceAll, getDistrictByProvince, getSubDistrictByDistrict, searchAddressBySubDistrict } from 'thai-address-universal';
import { MapPicker } from '../../../components/MapPicker';
import { registerUser } from '../../../services/auth/register.service';
import type { RegisterUserPayload, ReferenceContact } from '../../../services/auth/register.service';

interface FormData {
  // ข้อมูลส่วนตัว
  first_name: string;
  last_name: string;
  nickname: string;
  gender: string;
  birth_date: string;
  citizen_id: string;
  citizen_id_image_url: string;
  id_card_issued_date: string;
  id_card_expired_date: string;
  
  // ที่อยู่
  address: string;
  address_province: string;
  address_district: string;
  address_subdistrict: string;
  address_postal_code: string;
  address_pin_location: string;
  
  // ติดต่อ
  phone_number: string;
  email: string;
  facebook_url: string;
  line_id: string;
  
  // อาชีพ
  occupation: string;
  work_position: string;
  workplace_name: string;
  work_phone: string;
  monthly_income: string;
  
  // ที่ทำงาน
  work_address: string;
  work_province: string;
  work_district: string;
  work_subdistrict: string;
  work_postal_code: string;
  work_pin_location: string;
  
  // บุคคลอ้างอิง
  reference_contacts: Array<{
    full_name: string;
    nickname: string;
    phone_number: string;
    relationship: string;
  }>;
  
  // รหัสผ่าน
  password: string;
  confirm_password: string;
  latitude?: number;
  longitude?: number;
}

function UserRegister() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [homeProvinces, setHomeProvinces] = useState<string[]>([]);
  const [homeDistricts, setHomeDistricts] = useState<string[]>([]);
  const [homeSubDistricts, setHomeSubDistricts] = useState<string[]>([]);
  const [homePostalCodes, setHomePostalCodes] = useState<string[]>([]);
  const [homeCoordinates, setHomeCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [workProvinces, setWorkProvinces] = useState<string[]>([]);
  const [workDistricts, setWorkDistricts] = useState<string[]>([]);
  const [workSubDistricts, setWorkSubDistricts] = useState<string[]>([]);
  const [workPostalCodes, setWorkPostalCodes] = useState<string[]>([]);
  const [workCoordinates, setWorkCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [formData, setFormData] = useState<FormData>({
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
    confirm_password: '',
    latitude: undefined,
    longitude: undefined
  });

  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [citizenIdImageFile, setCitizenIdImageFile] = useState<File | null>(null);
  const stepCount = 5;
  const [stepErrors, setStepErrors] = useState<Array<{ [key: string]: string }>>(
    Array.from({ length: stepCount }, () => ({}))
  );

  // LOG: ตรวจสอบ fieldErrors ทุกครั้งที่เปลี่ยน
  useEffect(() => {
    console.log('fieldErrors:', stepErrors[currentStep - 1]);
  }, [stepErrors, currentStep]);

  // โหลดข้อมูลจังหวัดเมื่อ component mount
  useEffect(() => {
    const loadProvinces = async () => {
      try {
        const provincesData = await getProvinceAll();
        setHomeProvinces(provincesData);
      } catch (error) {
        console.error('Error loading home provinces:', error);
      }
    };
    loadProvinces();
  }, []);

  // 3. useEffect สำหรับโหลดจังหวัดบ้าน (step 2)
  useEffect(() => {
    const loadHomeProvinces = async () => {
      try {
        const provincesData = await getProvinceAll();
        setHomeProvinces(provincesData);
      } catch (error) {
        console.error('Error loading home provinces:', error);
      }
    };
    loadHomeProvinces();
  }, []);

  // 4. useEffect สำหรับโหลดอำเภอบ้าน (step 2)
  useEffect(() => {
    if (formData.address_province) {
      getDistrictByProvince(formData.address_province).then(setHomeDistricts);
    } else {
      setHomeDistricts([]);
    }
  }, [formData.address_province]);

  // 5. useEffect สำหรับโหลดตำบลบ้าน (step 2)
  useEffect(() => {
    if (formData.address_district) {
      getSubDistrictByDistrict(formData.address_district).then(setHomeSubDistricts);
    } else {
      setHomeSubDistricts([]);
    }
  }, [formData.address_district]);

  // 6. useEffect สำหรับโหลดรหัสไปรษณีย์บ้าน (step 2)
  useEffect(() => {
    if (formData.address_subdistrict && formData.address_district && formData.address_province) {
      searchAddressBySubDistrict(formData.address_subdistrict).then(results => {
        const filtered = results.filter(
          item =>
            item.province === formData.address_province &&
            item.district === formData.address_district &&
            item.sub_district === formData.address_subdistrict
        );
        const postalCodes = Array.from(
          new Set(filtered.map(item => item.postal_code).filter(code => /^\d{5}$/.test(code)))
        );
        setHomePostalCodes(postalCodes);
      });
    } else {
      setHomePostalCodes([]);
    }
  }, [formData.address_subdistrict, formData.address_district, formData.address_province]);

  // โหลดข้อมูลจังหวัดที่ทำงานเมื่อ component mount (เหมือน step 2)
  useEffect(() => {
    if (currentStep === 3) {
      const loadProvinces = async () => {
        try {
          const provincesData = await getProvinceAll();
          console.log('provincesData (work):', provincesData);
          setWorkProvinces(provincesData);
        } catch (error) {
          console.error('Error loading work provinces:', error);
          setWorkProvinces([]);
        }
      };
      loadProvinces();
    }
  }, [currentStep]);

  // useEffect สำหรับ work_xxx (step 3)
  useEffect(() => {
    console.log('work_province:', formData.work_province);
    if (formData.work_province) {
      getDistrictByProvince(formData.work_province).then((districts) => {
        console.log('districts from getDistrictByProvince:', districts);
        setWorkDistricts(districts);
      });
    } else {
      setWorkDistricts([]);
    }
  }, [formData.work_province]);

  useEffect(() => {
    console.log('work_district:', formData.work_district);
    if (formData.work_district) {
      getSubDistrictByDistrict(formData.work_district).then((subdistricts) => {
        console.log('subdistricts from getSubDistrictByDistrict:', subdistricts);
        setWorkSubDistricts(subdistricts);
      });
    } else {
      setWorkSubDistricts([]);
    }
  }, [formData.work_district]);

  useEffect(() => {
    console.log('work_subdistrict:', formData.work_subdistrict, 'work_district:', formData.work_district, 'work_province:', formData.work_province);
    if (formData.work_subdistrict && formData.work_district && formData.work_province) {
      searchAddressBySubDistrict(formData.work_subdistrict).then(results => {
        const filtered = results.filter(
          item =>
            item.province === formData.work_province &&
            item.district === formData.work_district &&
            item.sub_district === formData.work_subdistrict
        );
        const postalCodes = Array.from(
          new Set(filtered.map(item => item.postal_code).filter(code => /^\d{5}$/.test(code)))
        );
        console.log('postalCodes from searchAddressBySubDistrict:', postalCodes, 'filtered:', filtered, 'results:', results);
        setWorkPostalCodes(postalCodes);
      });
    } else {
      setWorkPostalCodes([]);
    }
  }, [formData.work_subdistrict, formData.work_district, formData.work_province]);

  // เพิ่ม log state ทุกครั้งที่ render step 3
  useEffect(() => {
    if (currentStep === 3) {
      console.log('workProvinces:', workProvinces);
      console.log('workDistricts:', workDistricts);
      console.log('workSubDistricts:', workSubDistricts);
      console.log('workPostalCodes:', workPostalCodes);
    }
  }, [currentStep, workProvinces, workDistricts, workSubDistricts, workPostalCodes]);

  useEffect(() => {
    console.log('currentStep', currentStep, 'formData', formData);
  }, [currentStep, formData]);

  // Reset address_postal_code เมื่อเปลี่ยนจังหวัด/อำเภอ/ตำบล
  useEffect(() => {
    setFormData(prev => ({ ...prev, address_postal_code: '' }));
  }, [formData.address_province, formData.address_district, formData.address_subdistrict]);

  // Auto-set address_postal_code ถ้ามีแค่ 1 ค่า
  useEffect(() => {
    if (homePostalCodes.length === 1) {
      setFormData(prev => ({ ...prev, address_postal_code: homePostalCodes[0] }));
    }
  }, [homePostalCodes]);

  // Reset work_postal_code เมื่อเปลี่ยนจังหวัด/อำเภอ/ตำบลที่ทำงาน
  useEffect(() => {
    setFormData(prev => ({ ...prev, work_postal_code: '' }));
  }, [formData.work_province, formData.work_district, formData.work_subdistrict]);

  // Auto-set work_postal_code ถ้ามีแค่ 1 ค่า
  useEffect(() => {
    if (workPostalCodes.length === 1) {
      setFormData(prev => ({ ...prev, work_postal_code: workPostalCodes[0] }));
    }
  }, [workPostalCodes]);

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

  const formatIncome = (value: string) => {
    // ลบทุกอย่างที่ไม่ใช่ตัวเลข
    const numbers = value.replace(/\D/g, '');
    // ใส่ comma คั่นหลักพัน
    return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // helper สำหรับลบ key ออกจาก object (ไม่ set undefined)
  function omitKey(obj: { [key: string]: string }, key: string): { [key: string]: string } {
    const result: { [key: string]: string } = {};
    Object.keys(obj).forEach(k => {
      if (k !== key) result[k] = obj[k];
    });
    return result;
  }

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

    // จัดการ format เฉพาะเบอร์โทรศัพท์ที่ทำงาน (10 หลัก)
    if (name === 'work_phone') {
      // รับเฉพาะตัวเลขและจำกัด 10 หลัก
      const numbers = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({
        ...prev,
        [name]: numbers
      }));
      return;
    }

    // จัดการ format เฉพาะรายได้ต่อเดือน
    if (name === 'monthly_income') {
      const formatted = formatIncome(value);
      setFormData(prev => ({
        ...prev,
        [name]: formatted
      }));
      return;
    }

    // จัดการ format เฉพาะเบอร์โทรศัพท์หลัก
    if (name === 'phone_number') {
      const numbers = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({
        ...prev,
        [name]: numbers
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setStepErrors(prev => prev.map((err, idx) => idx === currentStep - 1 ? omitKey(err, name) : err));
  };

  const referenceRelationshipOptions = [
    'บิดา',
    'มารดา',
    'ญาติ',
    'เพื่อน',
    'เพื่อนร่วมงาน',
    'อื่นๆ'
  ];

  const handleReferenceChange = (index: number, field: string, value: string) => {
    let newValue = value;
    if (field === 'phone_number') {
      newValue = value.replace(/\D/g, '').slice(0, 10);
    }
    setFormData(prev => ({
      ...prev,
      reference_contacts: prev.reference_contacts.map((contact, i) => 
        i === index ? { ...contact, [field]: newValue } : contact
      )
    }));
    if (currentStep === 4) {
      const errorKey = field === 'full_name' ? `reference_full_name_${index}` : field === 'phone_number' ? `reference_phone_${index}` : field === 'relationship' ? `reference_relationship_${index}` : '';
      if (errorKey) {
        setStepErrors(prev => prev.map((err, idx) => idx === 3 ? omitKey(err, errorKey) : err));
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCitizenIdImageFile(file);
    setFormData(prev => ({
      ...prev,
      citizen_id_image_url: file.name // สำหรับ preview ชื่อไฟล์ (optional)
    }));
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    setHomeCoordinates({ lat, lng });
    setFormData(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      address_pin_location: `https://www.google.com/maps?q=${lat},${lng}`
    }));
  };

  const handleWorkLocationSelect = (lat: number, lng: number) => {
    setWorkCoordinates({ lat, lng });
    setFormData(prev => ({
      ...prev,
      work_pin_location: `https://www.google.com/maps?q=${lat},${lng}`
    }));
  };

  // เพิ่มฟังก์ชันแปลงวันที่เป็น ISO 8601
  function toISODate(dateStr: string) {
    if (!dateStr) return '';
    return `${dateStr}T00:00:00Z`;
  }

  const validateAllFieldsInStep = () => {
    let fields: string[] = [];
    if (currentStep === 1) {
      fields = ['first_name','last_name','gender','birth_date','citizen_id','citizen_id_image','id_card_issued_date','id_card_expired_date'];
    } else if (currentStep === 2) {
      fields = ['address','address_province','address_district','address_subdistrict','address_postal_code','address_pin_location'];
    } else if (currentStep === 3) {
      fields = ['occupation','monthly_income','work_address','work_province','work_district','work_subdistrict','work_postal_code','work_pin_location'];
    } else if (currentStep === 4) {
      fields = [];
      formData.reference_contacts.forEach((_, idx) => {
        fields.push(`reference_full_name_${idx}`);
        fields.push(`reference_phone_${idx}`);
        fields.push(`reference_relationship_${idx}`);
      });
    } else if (currentStep === 5) {
      fields = ['email','phone_number','password','confirm_password'];
    }
    fields.forEach(f => validateField(f));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    const allErrors = [getStep1Errors(), getStep2Errors(), getStep3Errors(), getStep4Errors(), {}];
    setStepErrors(allErrors);
    const hasError = allErrors.some(err => Object.keys(err).length > 0);
    if (hasError) {
      setError('กรุณากรอกข้อมูลให้ครบถ้วน');
      if (currentStep >= 1 && currentStep <= 5) validateAllFieldsInStep();
      setIsLoading(false);
      return;
    }

    try {
      // เตรียม payload ให้ตรงกับ RegisterUserPayload
      const payload: RegisterUserPayload = {
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
        nickname: formData.nickname || undefined,
        gender: formData.gender,
        birth_date: toISODate(formData.birth_date),
        citizen_id: formData.citizen_id.replace(/-/g, ''),
        citizen_id_image: citizenIdImageFile!,
        id_card_issued_date: toISODate(formData.id_card_issued_date),
        id_card_expired_date: toISODate(formData.id_card_expired_date),
        address: formData.address,
        address_province: formData.address_province,
        address_district: formData.address_district,
        address_subdistrict: formData.address_subdistrict,
        address_postal_code: formData.address_postal_code,
        address_pin_location: formData.address_pin_location,
        phone_number: formData.phone_number,
        email: formData.email,
        facebook_url: formData.facebook_url || undefined,
        line_id: formData.line_id || undefined,
        occupation: formData.occupation,
        work_position: formData.work_position || undefined,
        workplace_name: formData.workplace_name || undefined,
        work_phone: formData.work_phone || undefined,
        monthly_income: Number(formData.monthly_income.replace(/,/g, '')),
        work_address: formData.work_address,
        work_province: formData.work_province,
        work_district: formData.work_district,
        work_subdistrict: formData.work_subdistrict,
        work_postal_code: formData.work_postal_code,
        work_pin_location: formData.work_pin_location,
        reference_contacts: formData.reference_contacts.map(ref => ({
          full_name: ref.full_name,
          nickname: ref.nickname || undefined,
          phone_number: ref.phone_number,
          relationship: ref.relationship
        })) as ReferenceContact[],
      };

      await registerUser(payload);
      navigate('/user/login');
    } catch (err) {
      let backendMsg = '';
      if (typeof err === 'object' && err !== null) {
        const e = err as Record<string, unknown>;
        backendMsg = (typeof e.error === 'string' && e.error) || (typeof e.message === 'string' && e.message) || JSON.stringify(err);
      }
      setError(`เกิดข้อผิดพลาดในการสมัครสมาชิก: ${backendMsg}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getStep1Errors = () => {
    const errors: { [key: string]: string } = {};
    if (!formData.first_name.trim()) errors.first_name = 'กรุณากรอกชื่อจริง';
    if (!formData.last_name.trim()) errors.last_name = 'กรุณากรอกนามสกุล';
    if (!formData.gender) errors.gender = 'กรุณาเลือกเพศ';
    if (!formData.birth_date) errors.birth_date = 'กรุณาเลือกวันเกิด';
    if (formData.citizen_id.replace(/-/g, '').length !== 13) errors.citizen_id = 'เลขบัตรประชาชนต้องมี 13 หลัก';
    if (!citizenIdImageFile) errors.citizen_id_image = 'กรุณาอัปโหลดรูปบัตรประชาชน';
    if (!formData.id_card_issued_date) errors.id_card_issued_date = 'กรุณาเลือกวันออกบัตร';
    if (!formData.id_card_expired_date) errors.id_card_expired_date = 'กรุณาเลือกวันหมดอายุบัตร';
    return errors;
  };

  const getStep2Errors = () => {
    const errors: { [key: string]: string } = {};
    if (!formData.address.trim()) errors.address = 'กรุณากรอกที่อยู่';
    if (!formData.address_province) errors.address_province = 'กรุณาเลือกจังหวัด';
    if (!formData.address_district) errors.address_district = 'กรุณาเลือกอำเภอ/เขต';
    if (!formData.address_subdistrict) errors.address_subdistrict = 'กรุณาเลือกตำบล/แขวง';
    if (!formData.address_postal_code) errors.address_postal_code = 'กรุณากรอกรหัสไปรษณีย์';
    if (!formData.address_pin_location) {
      errors.address_pin_location = 'กรุณากรอกพิกัดที่อยู่';
    } else if (!isValidUrl(formData.address_pin_location)) {
      errors.address_pin_location = 'กรุณากรอกลิงก์แผนที่ (URL) ที่ถูกต้อง';
    }
    return errors;
  };

  const getStep3Errors = () => {
    const errors: { [key: string]: string } = {};
    if (!formData.occupation.trim()) errors.occupation = 'กรุณากรอกอาชีพ';
    if (!formData.monthly_income) {
      errors.monthly_income = 'กรุณากรอกรายได้ต่อเดือน';
    } else {
      const income = Number(formData.monthly_income.replace(/,/g, ''));
      if (isNaN(income) || income <= 0) {
        errors.monthly_income = 'กรุณากรอกรายได้ต่อเดือนเป็นตัวเลข';
      } else if (income > 10000000) {
        errors.monthly_income = 'รายได้ต่อเดือนไม่ควรเกิน 10,000,000 บาท';
      }
    }
    if (!formData.work_address.trim()) errors.work_address = 'กรุณากรอกที่อยู่ที่ทำงาน';
    if (!formData.work_province) errors.work_province = 'กรุณาเลือกจังหวัดที่ทำงาน';
    if (!formData.work_district) errors.work_district = 'กรุณาเลือกอำเภอ/เขตที่ทำงาน';
    if (!formData.work_subdistrict) errors.work_subdistrict = 'กรุณาเลือกตำบล/แขวงที่ทำงาน';
    if (!formData.work_postal_code) errors.work_postal_code = 'กรุณากรอกรหัสไปรษณีย์ที่ทำงาน';
    if (!formData.work_pin_location) {
      errors.work_pin_location = 'กรุณากรอกพิกัดที่ทำงาน';
    } else if (!isValidUrl(formData.work_pin_location)) {
      errors.work_pin_location = 'กรุณากรอกลิงก์แผนที่ (URL) ที่ถูกต้อง';
    }
    return errors;
  };

  const getStep4Errors = () => {
    const errors: { [key: string]: string } = {};
    formData.reference_contacts.forEach((ref, idx) => {
      if (!ref.full_name.trim()) errors[`reference_full_name_${idx}`] = 'กรุณากรอกชื่อ-นามสกุล';
      if (!ref.phone_number) errors[`reference_phone_${idx}`] = 'กรุณากรอกเบอร์โทรศัพท์';
      if (!ref.relationship) errors[`reference_relationship_${idx}`] = 'กรุณาเลือกความสัมพันธ์';
    });
    return errors;
  };

  const nextStep = () => {
    setError('');
    let valid = true;
    let errors: { [key: string]: string } = {};
    if (currentStep === 1) {
      errors = getStep1Errors();
      valid = Object.keys(errors).length === 0;
    }
    if (currentStep === 2) {
      errors = getStep2Errors();
      valid = Object.keys(errors).length === 0;
    }
    if (currentStep === 3) {
      errors = getStep3Errors();
      valid = Object.keys(errors).length === 0;
    }
    if (currentStep === 4) {
      errors = getStep4Errors();
      valid = Object.keys(errors).length === 0;
    }
    setStepErrors(prev => prev.map((err, idx) => idx === currentStep - 1 ? errors : err));
    if (!valid) {
      validateAllFieldsInStep();
    }
    if (valid && currentStep < stepCount) {
      setStepErrors(prev => prev.map((err, idx) => idx === currentStep ? {} : err)); // clear error ของ step ถัดไป
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setStepErrors(prev => prev.map((err, idx) => idx === currentStep - 2 ? {} : err)); // clear error ของ step ก่อนหน้า
      setCurrentStep(prev => prev - 1);
    }
  };

  // ฟังก์ชันตรวจสอบความครบถ้วนในแต่ละ step
  const isStep1Valid = () => {
    return (
      formData.first_name.trim() &&
      formData.last_name.trim() &&
      formData.gender &&
      formData.birth_date &&
      formData.citizen_id.replace(/-/g, '').length === 13 &&
      citizenIdImageFile &&
      formData.id_card_issued_date &&
      formData.id_card_expired_date
    );
  };
  const isStep2Valid = () => {
    return (
      formData.address.trim() &&
      formData.address_province &&
      formData.address_district &&
      formData.address_subdistrict &&
      formData.address_postal_code &&
      formData.address_pin_location
    );
  };
  const isStep3Valid = () => {
    return (
      formData.occupation.trim() &&
      formData.monthly_income &&
      formData.work_address.trim() &&
      formData.work_province &&
      formData.work_district &&
      formData.work_subdistrict &&
      formData.work_postal_code &&
      formData.work_pin_location
    );
  };
  const isStep4Valid = () => {
    return (
      formData.reference_contacts.length === 2 &&
      formData.reference_contacts.every(ref => ref.full_name.trim() && ref.phone_number && ref.relationship)
    );
  };

  // เพิ่มฟังก์ชัน validateField สำหรับ step 1
  const validateField = (field: string) => {
    let error = '';
    if (currentStep === 1) {
      if (field === 'first_name' && !formData.first_name.trim()) error = 'กรุณากรอกชื่อจริง';
      if (field === 'last_name' && !formData.last_name.trim()) error = 'กรุณากรอกนามสกุล';
      if (field === 'gender' && !formData.gender) error = 'กรุณาเลือกเพศ';
      if (field === 'birth_date' && !formData.birth_date) error = 'กรุณาเลือกวันเกิด';
      if (field === 'citizen_id' && formData.citizen_id.replace(/-/g, '').length !== 13) error = 'เลขบัตรประชาชนต้องมี 13 หลัก';
      if (field === 'citizen_id_image' && !citizenIdImageFile) error = 'กรุณาอัปโหลดรูปบัตรประชาชน';
      if (field === 'id_card_issued_date' && !formData.id_card_issued_date) error = 'กรุณาเลือกวันออกบัตร';
      if (field === 'id_card_expired_date' && !formData.id_card_expired_date) error = 'กรุณาเลือกวันหมดอายุบัตร';
    } else if (currentStep === 2) {
      if (field === 'address' && !formData.address.trim()) error = 'กรุณากรอกที่อยู่';
      if (field === 'address_province' && !formData.address_province) error = 'กรุณาเลือกจังหวัด';
      if (field === 'address_district' && !formData.address_district) error = 'กรุณาเลือกอำเภอ/เขต';
      if (field === 'address_subdistrict' && !formData.address_subdistrict) error = 'กรุณาเลือกตำบล/แขวง';
      if (field === 'address_postal_code' && !formData.address_postal_code) error = 'กรุณากรอกรหัสไปรษณีย์';
      if (field === 'address_pin_location') {
        if (!formData.address_pin_location) {
          error = 'กรุณากรอกพิกัดที่อยู่';
        } else if (!isValidUrl(formData.address_pin_location)) {
          error = 'กรุณากรอกลิงก์แผนที่ (URL) ที่ถูกต้อง';
        }
      }
    } else if (currentStep === 3) {
      if (field === 'occupation' && !formData.occupation.trim()) error = 'กรุณากรอกอาชีพ';
      if (field === 'monthly_income') {
        if (!formData.monthly_income) {
          error = 'กรุณากรอกรายได้ต่อเดือน';
        } else {
          const income = Number(formData.monthly_income.replace(/,/g, ''));
          if (isNaN(income) || income <= 0) {
            error = 'กรุณากรอกรายได้ต่อเดือนเป็นตัวเลข';
          } else if (income > 10000000) {
            error = 'รายได้ต่อเดือนไม่ควรเกิน 10,000,000 บาท';
          }
        }
      }
      if (field === 'work_address' && !formData.work_address.trim()) error = 'กรุณากรอกที่อยู่ที่ทำงาน';
      if (field === 'work_province' && !formData.work_province) error = 'กรุณาเลือกจังหวัดที่ทำงาน';
      if (field === 'work_district' && !formData.work_district) error = 'กรุณาเลือกอำเภอ/เขตที่ทำงาน';
      if (field === 'work_subdistrict' && !formData.work_subdistrict) error = 'กรุณาเลือกตำบล/แขวงที่ทำงาน';
      if (field === 'work_postal_code' && !formData.work_postal_code) error = 'กรุณากรอกรหัสไปรษณีย์ที่ทำงาน';
      if (field === 'work_pin_location') {
        if (!formData.work_pin_location) {
          error = 'กรุณากรอกพิกัดที่ทำงาน';
        } else if (!isValidUrl(formData.work_pin_location)) {
          error = 'กรุณากรอกลิงก์แผนที่ (URL) ที่ถูกต้อง';
        }
      }
    } else if (currentStep === 4) {
      if (field.startsWith('reference_full_name_')) {
        const idx = parseInt(field.replace('reference_full_name_', ''));
        if (!formData.reference_contacts[idx]?.full_name.trim()) error = 'กรุณากรอกชื่อ-นามสกุล';
      }
      if (field.startsWith('reference_phone_')) {
        const idx = parseInt(field.replace('reference_phone_', ''));
        if (!formData.reference_contacts[idx]?.phone_number) error = 'กรุณากรอกเบอร์โทรศัพท์';
      }
      if (field.startsWith('reference_relationship_')) {
        const idx = parseInt(field.replace('reference_relationship_', ''));
        if (!formData.reference_contacts[idx]?.relationship) error = 'กรุณาเลือกความสัมพันธ์';
      }
    } else if (currentStep === 5) {
      if (field === 'email' && !formData.email) error = 'กรุณากรอกอีเมล';
      if (field === 'phone_number' && !formData.phone_number) error = 'กรุณากรอกเบอร์โทรศัพท์';
      if (field === 'password') {
        if (!formData.password) {
          error = 'กรุณากรอกรหัสผ่าน';
        } else if (formData.password.length < 8) {
          error = 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร';
        }
      }
      if (field === 'confirm_password') {
        if (!formData.confirm_password) {
          error = 'กรุณายืนยันรหัสผ่าน';
        } else if (formData.password !== formData.confirm_password) {
          error = 'รหัสผ่านไม่ตรงกัน';
        }
      }
    }
    setStepErrors(prev => prev.map((err, idx) => idx === currentStep - 1 ? { ...err, [field]: error } : err));
  };

  const isValidUrl = (value: string) => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  };

  // Memoize dropdown options สำหรับบ้าน
  const homeProvinceOptions = useMemo(() => (
    homeProvinces.map((province) => (
      <option key={province} value={province}>{province}</option>
    ))
  ), [homeProvinces]);
  const homeDistrictOptions = useMemo(() => (
    homeDistricts.map((district) => (
      <option key={district} value={district}>{district}</option>
    ))
  ), [homeDistricts]);
  const homeSubDistrictOptions = useMemo(() => (
    homeSubDistricts.map((subDistrict) => (
      <option key={subDistrict} value={subDistrict}>{subDistrict}</option>
    ))
  ), [homeSubDistricts]);
  const homePostalCodeOptions = useMemo(() => (
    homePostalCodes.map((postalCode) => (
      <option key={postalCode} value={postalCode}>{postalCode}</option>
    ))
  ), [homePostalCodes]);
  // Memoize dropdown options สำหรับที่ทำงาน
  const workProvinceOptions = useMemo(() => (
    workProvinces.map((province) => (
      <option key={province} value={province}>{province}</option>
    ))
  ), [workProvinces]);
  const workDistrictOptions = useMemo(() => (
    workDistricts.map((district) => (
      <option key={district} value={district}>{district}</option>
    ))
  ), [workDistricts]);
  const workSubDistrictOptions = useMemo(() => (
    workSubDistricts.map((subDistrict) => (
      <option key={subDistrict} value={subDistrict}>{subDistrict}</option>
    ))
  ), [workSubDistricts]);
  const workPostalCodeOptions = useMemo(() => (
    workPostalCodes.map((postalCode) => (
      <option key={postalCode} value={postalCode}>{postalCode}</option>
    ))
  ), [workPostalCodes]);

  // ใช้ error ของ step ปัจจุบัน (ป้องกัน undefined)
  const fieldErrors = stepErrors[currentStep - 1] || {};

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
                {fieldErrors.first_name && <div className={styles.inputError}>{fieldErrors.first_name}</div>}
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  onBlur={() => validateField('first_name')}
                  required
                  className={fieldErrors.first_name ? `${styles.inputErrorBorder}` : ''}
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="last_name" data-required>นามสกุล</label>
                {fieldErrors.last_name && <div className={styles.inputError}>{fieldErrors.last_name}</div>}
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  onBlur={() => validateField('last_name')}
                  required
                  className={fieldErrors.last_name ? `${styles.inputErrorBorder}` : ''}
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
                {fieldErrors.gender && <div className={styles.inputError}>{fieldErrors.gender}</div>}
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  onBlur={() => validateField('gender')}
                  required
                  className={fieldErrors.gender ? `${styles.inputErrorBorder}` : ''}
                >
                  <option value="">เลือกเพศ</option>
                  <option value="male">ชาย</option>
                  <option value="female">หญิง</option>
                  <option value="other">อื่นๆ</option>
                </select>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="birth_date" data-required>วันเกิด</label>
                {fieldErrors.birth_date && <div className={styles.inputError}>{fieldErrors.birth_date}</div>}
                <input
                  type="date"
                  id="birth_date"
                  name="birth_date"
                  value={formData.birth_date}
                  onChange={handleChange}
                  onBlur={() => validateField('birth_date')}
                  required
                  className={fieldErrors.birth_date ? `${styles.inputErrorBorder}` : ''}
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="citizen_id" data-required>เลขบัตรประชาชน</label>
                {fieldErrors.citizen_id && <div className={styles.inputError}>{fieldErrors.citizen_id}</div>}
                <input
                  type="text"
                  id="citizen_id"
                  name="citizen_id"
                  value={formData.citizen_id}
                  onChange={handleChange}
                  onBlur={() => validateField('citizen_id')}
                  maxLength={17} // 1-5-5-2-1 + 4 เครื่องหมาย -
                  placeholder="X-XXXX-XXXXX-XX-X"
                  required
                  className={fieldErrors.citizen_id ? `${styles.inputErrorBorder}` : ''}
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="citizen_id_image" data-required>รูปบัตรประชาชน</label>
                {fieldErrors.citizen_id_image && <div className={styles.inputError}>{fieldErrors.citizen_id_image}</div>}
                <input
                  type="file"
                  id="citizen_id_image"
                  accept="image/*"
                  onChange={handleFileUpload}
                  onBlur={() => validateField('citizen_id_image')}
                  required
                  className={fieldErrors.citizen_id_image ? `${styles.inputErrorBorder}` : ''}
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="id_card_issued_date" data-required>วันออกบัตร</label>
                {fieldErrors.id_card_issued_date && <div className={styles.inputError}>{fieldErrors.id_card_issued_date}</div>}
                <input
                  type="date"
                  id="id_card_issued_date"
                  name="id_card_issued_date"
                  value={formData.id_card_issued_date}
                  onChange={handleChange}
                  onBlur={() => validateField('id_card_issued_date')}
                  required
                  className={fieldErrors.id_card_issued_date ? `${styles.inputErrorBorder}` : ''}
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="id_card_expired_date" data-required>วันหมดอายุบัตร</label>
                {fieldErrors.id_card_expired_date && <div className={styles.inputError}>{fieldErrors.id_card_expired_date}</div>}
                <input
                  type="date"
                  id="id_card_expired_date"
                  name="id_card_expired_date"
                  value={formData.id_card_expired_date}
                  onChange={handleChange}
                  onBlur={() => validateField('id_card_expired_date')}
                  required
                  className={fieldErrors.id_card_expired_date ? `${styles.inputErrorBorder}` : ''}
                />
              </div>

              <div className={styles.buttonGroup}>
                <button type="button" className={styles.nextButton} onClick={nextStep} disabled={!isStep1Valid()}>
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
                {fieldErrors.address && <div className={styles.inputError}>{fieldErrors.address}</div>}
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  onBlur={() => validateField('address')}
                  placeholder="บ้านเลขที่, หมู่, ถนน"
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="address_province" data-required>จังหวัด</label>
                {fieldErrors.address_province && <div className={styles.inputError}>{fieldErrors.address_province}</div>}
                <select
                  id="address_province"
                  name="address_province"
                  value={formData.address_province}
                  onChange={handleChange}
                  onBlur={() => validateField('address_province')}
                  required
                >
                  <option value="">เลือกจังหวัด</option>
                  {homeProvinceOptions}
                </select>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="address_district" data-required>อำเภอ/เขต</label>
                {fieldErrors.address_district && <div className={styles.inputError}>{fieldErrors.address_district}</div>}
                <select
                  id="address_district"
                  name="address_district"
                  value={formData.address_district}
                  onChange={handleChange}
                  onBlur={() => validateField('address_district')}
                  required
                  disabled={!formData.address_province}
                >
                  <option value="">เลือกอำเภอ/เขต</option>
                  {homeDistrictOptions}
                </select>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="address_subdistrict" data-required>ตำบล/แขวง</label>
                {fieldErrors.address_subdistrict && <div className={styles.inputError}>{fieldErrors.address_subdistrict}</div>}
                <select
                  id="address_subdistrict"
                  name="address_subdistrict"
                  value={formData.address_subdistrict}
                  onChange={handleChange}
                  onBlur={() => validateField('address_subdistrict')}
                  required
                  disabled={!formData.address_district}
                >
                  <option value="">เลือกตำบล/แขวง</option>
                  {homeSubDistrictOptions}
                </select>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="address_postal_code" data-required>รหัสไปรษณีย์</label>
                {fieldErrors.address_postal_code && <div className={styles.inputError}>{fieldErrors.address_postal_code}</div>}
                {homePostalCodes.length === 0 ? (
                  <input
                    type="text"
                    id="address_postal_code"
                    name="address_postal_code"
                    value={formData.address_postal_code}
                    onChange={handleChange}
                    onBlur={() => validateField('address_postal_code')}
                    placeholder="รหัสไปรษณีย์ 5 หลัก"
                    pattern="[0-9]{5}"
                    maxLength={5}
                    required
                  />
                ) : homePostalCodes.length > 1 ? (
                  <select
                    id="address_postal_code"
                    name="address_postal_code"
                    value={formData.address_postal_code}
                    onChange={handleChange}
                    onBlur={() => validateField('address_postal_code')}
                    required
                  >
                    <option value="">เลือกรหัสไปรษณีย์</option>
                    {homePostalCodeOptions}
                  </select>
                ) : (
                  <input
                    type="text"
                    id="address_postal_code"
                    name="address_postal_code"
                    value={formData.address_postal_code}
                    onChange={handleChange}
                    onBlur={() => validateField('address_postal_code')}
                    placeholder="รหัสไปรษณีย์ 5 หลัก"
                    pattern="[0-9]{5}"
                    maxLength={5}
                    required
                    readOnly={homePostalCodes.length === 1}
                  />
                )}
                {homePostalCodes.length > 1 && (
                  <small className={styles.helperText}>
                    พื้นที่นี้มีหลายรหัสไปรษณีย์ กรุณาเลือกรหัสที่ถูกต้อง
                  </small>
                )}
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="address_pin_location" data-required>พิกัดที่อยู่</label>
                {fieldErrors.address_pin_location && <div className={styles.inputError}>{fieldErrors.address_pin_location}</div>}
                <input
                  type="url"
                  id="address_pin_location"
                  name="address_pin_location"
                  value={formData.address_pin_location}
                  onChange={handleChange}
                  onBlur={() => validateField('address_pin_location')}
                  placeholder="https://maps.google.com/..."
                  required
                />
              </div>

              {formData.address && formData.address_province && formData.address_district && formData.address_subdistrict && (
                <MapPicker
                  address={formData.address}
                  province={formData.address_province}
                  district={formData.address_district}
                  subdistrict={formData.address_subdistrict}
                  onLocationSelect={handleLocationSelect}
                />
              )}

              {homeCoordinates && (
                <div className="text-sm text-gray-500">
                  ตำแหน่งที่เลือก: {homeCoordinates.lat.toFixed(6)}, {homeCoordinates.lng.toFixed(6)}
                </div>
              )}

              <div className={styles.buttonGroup}>
                <button type="button" className={styles.prevButton} onClick={prevStep}>
                  ย้อนกลับ
                </button>
                <button type="button" className={styles.nextButton} onClick={nextStep} disabled={!isStep2Valid()}>
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
                {fieldErrors.occupation && <div className={styles.inputError}>{fieldErrors.occupation}</div>}
                <input
                  type="text"
                  id="occupation"
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleChange}
                  onBlur={() => validateField('occupation')}
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
                  onBlur={() => validateField('work_phone')}
                  pattern="[0-9]{10}"
                  maxLength={10}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="monthly_income" data-required>รายได้ต่อเดือน</label>
                {fieldErrors.monthly_income && <div className={styles.inputError}>{fieldErrors.monthly_income}</div>}
                <input
                  type="text"
                  id="monthly_income"
                  name="monthly_income"
                  value={formData.monthly_income}
                  onChange={handleChange}
                  onBlur={() => validateField('monthly_income')}
                  inputMode="numeric"
                  pattern="[0-9,]*"
                  min="0"
                  required
                />
              </div>

              {/* ที่อยู่ที่ทำงาน (dynamic) */}
              <div className={styles.inputGroup}>
                <label htmlFor="work_address" data-required>ที่อยู่ที่ทำงาน</label>
                {fieldErrors.work_address && <div className={styles.inputError}>{fieldErrors.work_address}</div>}
                <input
                  type="text"
                  id="work_address"
                  name="work_address"
                  value={formData.work_address}
                  onChange={handleChange}
                  onBlur={() => validateField('work_address')}
                  required
                />
              </div>
              <div className={styles.inputGroup}>
                <label htmlFor="work_province" data-required>จังหวัดที่ทำงาน</label>
                {fieldErrors.work_province && <div className={styles.inputError}>{fieldErrors.work_province}</div>}
                <select
                  id="work_province"
                  name="work_province"
                  value={formData.work_province}
                  onChange={handleChange}
                  onBlur={() => validateField('work_province')}
                  required
                >
                  <option value="">เลือกจังหวัด</option>
                  {workProvinceOptions}
                </select>
              </div>
              <div className={styles.inputGroup}>
                <label htmlFor="work_district" data-required>อำเภอ/เขตที่ทำงาน</label>
                {fieldErrors.work_district && <div className={styles.inputError}>{fieldErrors.work_district}</div>}
                <select
                  id="work_district"
                  name="work_district"
                  value={formData.work_district}
                  onChange={handleChange}
                  onBlur={() => validateField('work_district')}
                  required
                  disabled={!formData.work_province}
                >
                  <option value="">เลือกอำเภอ/เขต</option>
                  {workDistrictOptions}
                </select>
              </div>
              <div className={styles.inputGroup}>
                <label htmlFor="work_subdistrict" data-required>ตำบล/แขวงที่ทำงาน</label>
                {fieldErrors.work_subdistrict && <div className={styles.inputError}>{fieldErrors.work_subdistrict}</div>}
                <select
                  id="work_subdistrict"
                  name="work_subdistrict"
                  value={formData.work_subdistrict}
                  onChange={handleChange}
                  onBlur={() => validateField('work_subdistrict')}
                  required
                  disabled={!formData.work_district}
                >
                  <option value="">เลือกตำบล/แขวง</option>
                  {workSubDistrictOptions}
                </select>
              </div>
              <div className={styles.inputGroup}>
                <label htmlFor="work_postal_code" data-required>รหัสไปรษณีย์ที่ทำงาน</label>
                {fieldErrors.work_postal_code && <div className={styles.inputError}>{fieldErrors.work_postal_code}</div>}
                {workPostalCodes.length === 0 ? (
                  <input
                    type="text"
                    id="work_postal_code"
                    name="work_postal_code"
                    value={formData.work_postal_code}
                    onChange={handleChange}
                    onBlur={() => validateField('work_postal_code')}
                    placeholder="รหัสไปรษณีย์ 5 หลัก"
                    pattern="[0-9]{5}"
                    maxLength={5}
                    required
                  />
                ) : workPostalCodes.length > 1 ? (
                  <select
                    id="work_postal_code"
                    name="work_postal_code"
                    value={formData.work_postal_code}
                    onChange={handleChange}
                    onBlur={() => validateField('work_postal_code')}
                    required
                  >
                    <option value="">เลือกรหัสไปรษณีย์</option>
                    {workPostalCodeOptions}
                  </select>
                ) : (
                  <input
                    type="text"
                    id="work_postal_code"
                    name="work_postal_code"
                    value={formData.work_postal_code}
                    onChange={handleChange}
                    onBlur={() => validateField('work_postal_code')}
                    placeholder="รหัสไปรษณีย์ 5 หลัก"
                    pattern="[0-9]{5}"
                    maxLength={5}
                    required
                    readOnly={workPostalCodes.length === 1}
                  />
                )}
                {workPostalCodes.length > 1 && (
                  <small className={styles.helperText}>
                    พื้นที่นี้มีหลายรหัสไปรษณีย์ กรุณาเลือกรหัสที่ถูกต้อง
                  </small>
                )}
              </div>
              <div className={styles.inputGroup}>
                <label htmlFor="work_pin_location" data-required>พิกัดที่ทำงาน</label>
                {fieldErrors.work_pin_location && <div className={styles.inputError}>{fieldErrors.work_pin_location}</div>}
                <input
                  type="url"
                  id="work_pin_location"
                  name="work_pin_location"
                  value={formData.work_pin_location}
                  onChange={handleChange}
                  onBlur={() => validateField('work_pin_location')}
                  placeholder="https://maps.google.com/..."
                  required
                />
              </div>
              {formData.work_address && formData.work_province && formData.work_district && formData.work_subdistrict && (
                <MapPicker
                  address={formData.work_address}
                  province={formData.work_province}
                  district={formData.work_district}
                  subdistrict={formData.work_subdistrict}
                  onLocationSelect={handleWorkLocationSelect}
                />
              )}
              {workCoordinates && (
                <div className="text-sm text-gray-500">
                  ตำแหน่งที่เลือก: {workCoordinates.lat.toFixed(6)}, {workCoordinates.lng.toFixed(6)}
                </div>
              )}

              <div className={styles.buttonGroup}>
                <button type="button" className={styles.prevButton} onClick={prevStep}>
                  ย้อนกลับ
                </button>
                <button type="button" className={styles.nextButton} onClick={nextStep} disabled={!isStep3Valid()}>
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
                    {fieldErrors[`reference_full_name_${index}`] && <div className={styles.inputError}>{fieldErrors[`reference_full_name_${index}`]}</div>}
                    <input
                      type="text"
                      id={`reference_full_name_${index}`}
                      value={contact.full_name}
                      onChange={(e) => handleReferenceChange(index, 'full_name', e.target.value)}
                      onBlur={() => validateField(`reference_full_name_${index}`)}
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
                    {fieldErrors[`reference_phone_${index}`] && <div className={styles.inputError}>{fieldErrors[`reference_phone_${index}`]}</div>}
                    <input
                      type="tel"
                      id={`reference_phone_${index}`}
                      value={contact.phone_number}
                      onChange={(e) => handleReferenceChange(index, 'phone_number', e.target.value)}
                      onBlur={() => validateField(`reference_phone_${index}`)}
                      pattern="[0-9]{10}"
                      maxLength={10}
                      required
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label htmlFor={`reference_relationship_${index}`} data-required>ความสัมพันธ์</label>
                    {fieldErrors[`reference_relationship_${index}`] && <div className={styles.inputError}>{fieldErrors[`reference_relationship_${index}`]}</div>}
                    <select
                      id={`reference_relationship_${index}`}
                      value={contact.relationship}
                      onChange={(e) => handleReferenceChange(index, 'relationship', e.target.value)}
                      onBlur={() => validateField(`reference_relationship_${index}`)}
                      required
                    >
                      <option value="">เลือกความสัมพันธ์</option>
                      {referenceRelationshipOptions.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}

              <div className={styles.buttonGroup}>
                <button type="button" className={styles.prevButton} onClick={prevStep}>
                  ย้อนกลับ
                </button>
                <button type="button" className={styles.nextButton} onClick={nextStep} disabled={!isStep4Valid()}>
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
                <label htmlFor="email" data-required>อีเมล</label>
                {fieldErrors.email && <div className={styles.inputError}>{fieldErrors.email}</div>}
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={() => validateField('email')}
                  required
                  className={fieldErrors.email ? `${styles.inputErrorBorder}` : ''}
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="phone_number" data-required>เบอร์โทรศัพท์</label>
                {fieldErrors.phone_number && <div className={styles.inputError}>{fieldErrors.phone_number}</div>}
                <input
                  type="tel"
                  id="phone_number"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  onBlur={() => validateField('phone_number')}
                  pattern="[0-9]{10}"
                  maxLength={10}
                  required
                  className={fieldErrors.phone_number ? `${styles.inputErrorBorder}` : ''}
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
                {fieldErrors.password && <div className={styles.inputError}>{fieldErrors.password}</div>}
                <div className={styles.passwordWrapper}>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={() => validateField('password')}
                    required
                    className={fieldErrors.password ? `${styles.inputErrorBorder}` : ''}
                  />
                  <button
                    type="button"
                    className={styles.eyeButton}
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                  >
                    {showPassword ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="confirm_password" data-required>ยืนยันรหัสผ่าน</label>
                {fieldErrors.confirm_password && <div className={styles.inputError}>{fieldErrors.confirm_password}</div>}
                <div className={styles.passwordWrapper}>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirm_password"
                    name="confirm_password"
                    value={formData.confirm_password}
                    onChange={handleChange}
                    onBlur={() => validateField('confirm_password')}
                    required
                    className={fieldErrors.confirm_password ? `${styles.inputErrorBorder}` : ''}
                  />
                  <button
                    type="button"
                    className={styles.eyeButton}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                  >
                    {showConfirmPassword ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className={styles.buttonGroup}>
                <button type="button" className={styles.prevButton} onClick={prevStep}>
                  ย้อนกลับ
                </button>
                <button type="submit" className={styles.submitButton} disabled={isLoading}>
                  {isLoading ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      <div className={styles.loadingSpinner}></div>
                      กำลังส่งข้อมูล...
                    </div>
                  ) : (
                    'สมัครสมาชิก'
                  )}
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