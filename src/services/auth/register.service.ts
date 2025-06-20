import { apiClient } from '../api';

export interface ReferenceContact {
  full_name: string;
  nickname?: string;
  phone_number: string;
  relationship: string;
}

export interface RegisterUserPayload {
  password: string;
  first_name: string;
  last_name: string;
  nickname?: string;
  gender: string;
  birth_date: string;
  citizen_id: string;
  citizen_id_image: File;
  id_card_issued_date: string;
  id_card_expired_date: string;
  address: string;
  address_province: string;
  address_district: string;
  address_subdistrict: string;
  address_postal_code: string;
  address_pin_location: string;
  phone_number: string;
  email: string;
  facebook_url?: string;
  line_id?: string;
  occupation: string;
  work_position?: string;
  workplace_name?: string;
  work_phone?: string;
  monthly_income: number;
  work_address: string;
  work_province: string;
  work_district: string;
  work_subdistrict: string;
  work_postal_code: string;
  work_pin_location: string;
  reference_contacts: ReferenceContact[];
}

export async function registerUser(payload: RegisterUserPayload) {
  const formData = new FormData();

  // สร้าง mapping snake_case => PascalCase
  const fieldMap = {
    password: 'Password',
    first_name: 'FirstName',
    last_name: 'LastName',
    nickname: 'Nickname',
    gender: 'Gender',
    birth_date: 'BirthDate',
    citizen_id: 'CitizenID',
    id_card_issued_date: 'IDCardIssuedDate',
    id_card_expired_date: 'IDCardExpiredDate',
    address: 'Address',
    address_province: 'AddressProvince',
    address_district: 'AddressDistrict',
    address_subdistrict: 'AddressSubdistrict',
    address_postal_code: 'AddressPostalCode',
    address_pin_location: 'AddressPinLocation',
    phone_number: 'PhoneNumber',
    email: 'Email',
    facebook_url: 'FacebookURL',
    line_id: 'LineID',
    occupation: 'Occupation',
    work_position: 'WorkPosition',
    workplace_name: 'WorkplaceName',
    work_phone: 'WorkPhone',
    monthly_income: 'MonthlyIncome',
    work_address: 'WorkAddress',
    work_province: 'WorkProvince',
    work_district: 'WorkDistrict',
    work_subdistrict: 'WorkSubdistrict',
    work_postal_code: 'WorkPostalCode',
    work_pin_location: 'WorkPinLocation',
  };

  // ฟิลด์ text (ยกเว้นไฟล์กับ array)
  Object.entries(payload).forEach(([key, value]) => {
    if (key === 'citizen_id_image' || key === 'reference_contacts') return;
    if (value !== undefined && value !== null) {
      formData.append(fieldMap[key as keyof typeof fieldMap] || key, value as string);
    }
  });

  // ฟิลด์ไฟล์
  formData.append('citizen_id_image', payload.citizen_id_image);

  // ตรวจสอบ reference_contacts ต้องมี 2 คน และ citizen_id_image ต้องไม่ว่าง
  if (!payload.reference_contacts || payload.reference_contacts.length !== 2) {
    throw new Error('reference_contacts ต้องมี 2 คน');
  }
  if (!payload.citizen_id_image) {
    throw new Error('citizen_id_image is required');
  }
  // แนบ reference_contacts เป็น JSON string ในฟิลด์เดียว
  formData.append('reference_contacts', JSON.stringify(payload.reference_contacts));

  // monthly_income: ส่งเป็น number (string)
  formData.set('MonthlyIncome', String(payload.monthly_income));

  // ใช้ apiClient (axios) แทน fetch
  const res = await apiClient.post<unknown>('/api/users/register', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
} 