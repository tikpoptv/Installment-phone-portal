import React from 'react';
import styles from './VerifyCustomerModal.module.css';

interface ReferenceContact {
  id: number;
  user_id: string;
  full_name: string;
  nickname: string;
  phone_number: string;
  relationship: string;
  created_at: string;
}

interface UserDetail {
  id: string;
  first_name: string;
  last_name: string;
  nickname: string;
  gender: string;
  birth_date: string;
  citizen_id: string;
  citizen_id_image_url: string;
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
  facebook_url: string;
  line_id: string;
  occupation: string;
  work_position: string;
  workplace_name: string;
  work_phone: string;
  monthly_income: number;
  work_address: string;
  work_province: string;
  work_district: string;
  work_subdistrict: string;
  work_postal_code: string;
  work_pin_location: string;
  created_at: string;
  updated_at: string;
}

interface UserDetailModalProps {
  open: boolean;
  onClose: () => void;
}

// mock data
const mockUser: UserDetail = {
  id: 'b7e23ec2-05c8-4c2e-8e7a-1b2e3c4d5f6a',
  first_name: 'สมชาย',
  last_name: 'ใจดี',
  nickname: 'ชาย',
  gender: 'ชาย',
  birth_date: '1990-01-01',
  citizen_id: '1234567890123',
  citizen_id_image_url: 'https://via.placeholder.com/120x80?text=ID+Card',
  id_card_issued_date: '2010-01-01',
  id_card_expired_date: '2030-01-01',
  address: '123 หมู่ 4 ถนนสุขใจ',
  address_province: 'กรุงเทพมหานคร',
  address_district: 'บางรัก',
  address_subdistrict: 'สีลม',
  address_postal_code: '10500',
  address_pin_location: '13.728,100.529',
  phone_number: '0812345678',
  email: 'somchai@email.com',
  facebook_url: 'facebook.com/somchai',
  line_id: 'somchai.line',
  occupation: 'พนักงานบริษัท',
  work_position: 'เจ้าหน้าที่',
  workplace_name: 'บริษัทสุขใจ',
  work_phone: '021234567',
  monthly_income: 25000,
  work_address: '456 ถนนร่มเย็น',
  work_province: 'กรุงเทพมหานคร',
  work_district: 'บางรัก',
  work_subdistrict: 'สีลม',
  work_postal_code: '10500',
  work_pin_location: '13.728,100.529',
  created_at: '2024-06-01T10:00:00Z',
  updated_at: '2024-06-10T12:00:00Z',
};
const mockContacts: ReferenceContact[] = [
  {
    id: 1,
    user_id: 'b7e23ec2-05c8-4c2e-8e7a-1b2e3c4d5f6a',
    full_name: 'วิชัย ใจดี',
    nickname: 'ชัย',
    phone_number: '0899999999',
    relationship: 'เพื่อน',
    created_at: '2024-06-01T10:00:00Z',
  },
  {
    id: 2,
    user_id: 'b7e23ec2-05c8-4c2e-8e7a-1b2e3c4d5f6a',
    full_name: 'สายฝน สดใส',
    nickname: 'ฝน',
    phone_number: '0888888888',
    relationship: 'ญาติ',
    created_at: '2024-06-01T10:00:00Z',
  },
];

const UserDetailModal: React.FC<UserDetailModalProps> = ({ open, onClose }) => {
  if (!open) return null;
  // ในอนาคตจะ fetch ตาม userId ตอนนี้ mock user เดียว
  // รองรับทั้ง url และ lat,long
  function getMapUrl(pin: string | undefined): string {
    if (!pin) return '';
    if (pin.startsWith('http')) return pin;
    return `https://www.google.com/maps?q=${pin}`;
  }
  const addressMapUrl = getMapUrl(mockUser.address_pin_location);
  const workMapUrl = getMapUrl(mockUser.work_pin_location);
  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modalContent} style={{maxWidth: 700, minWidth: 320}}>
        <h2 className={styles.modalTitle}>ข้อมูลผู้ใช้</h2>
        <div style={{display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 18}}>
          <div style={{flex: '0 0 120px'}}>
            <img src={mockUser.citizen_id_image_url} alt="รูปบัตรประชาชน" style={{width: 120, height: 80, borderRadius: 8, objectFit: 'cover', border: '1px solid #e5e7eb'}} />
            <div style={{fontSize: '0.92em', color: '#64748b', marginTop: 4, textAlign: 'center'}}>บัตรประชาชน</div>
          </div>
          <div style={{flex: '1 1 260px', minWidth: 0}}>
            <div style={{fontWeight: 600, fontSize: '1.12em', marginBottom: 2}}>{mockUser.first_name} {mockUser.last_name} <span style={{fontWeight: 400, color: '#64748b', fontSize: '0.98em'}}>({mockUser.nickname})</span></div>
            <div style={{color: '#64748b', fontSize: '0.98em', marginBottom: 6}}>{mockUser.gender} | เกิด {mockUser.birth_date}</div>
            <div style={{fontSize: '0.97em', marginBottom: 2}}>เลขบัตร: <b>{mockUser.citizen_id}</b></div>
            <div style={{fontSize: '0.97em', marginBottom: 2}}>เบอร์: <b>{mockUser.phone_number}</b></div>
            <div style={{fontSize: '0.97em', marginBottom: 2}}>อีเมล: <b>{mockUser.email}</b></div>
            <div style={{fontSize: '0.97em', marginBottom: 2}}>Facebook: <b>{mockUser.facebook_url}</b></div>
            <div style={{fontSize: '0.97em', marginBottom: 2}}>Line ID: <b>{mockUser.line_id}</b></div>
          </div>
        </div>
        <div style={{marginBottom: 10, fontSize: '1.01em'}}>
          <b>ที่อยู่:</b> {mockUser.address} แขวง/ตำบล {mockUser.address_subdistrict} เขต/อำเภอ {mockUser.address_district} จังหวัด {mockUser.address_province} {mockUser.address_postal_code}
          {addressMapUrl && (
            <>
              <br /><a href={addressMapUrl} target="_blank" rel="noopener noreferrer" style={{color: '#0ea5e9', fontSize: '0.97em'}}>ดูแผนที่บ้าน</a>
            </>
          )}
        </div>
        <div style={{marginBottom: 10, fontSize: '1.01em'}}>
          <b>ที่อยู่ที่ทำงาน:</b> {mockUser.work_address} แขวง/ตำบล {mockUser.work_subdistrict} เขต/อำเภอ {mockUser.work_district} จังหวัด {mockUser.work_province} {mockUser.work_postal_code}
          {workMapUrl && (
            <>
              <br /><a href={workMapUrl} target="_blank" rel="noopener noreferrer" style={{color: '#0ea5e9', fontSize: '0.97em'}}>ดูแผนที่ที่ทำงาน</a>
            </>
          )}
        </div>
        <div style={{marginBottom: 10, fontSize: '1.01em'}}>
          <b>อาชีพ:</b> {mockUser.occupation} | <b>ตำแหน่ง:</b> {mockUser.work_position} | <b>สถานที่ทำงาน:</b> {mockUser.workplace_name} | <b>เบอร์ที่ทำงาน:</b> {mockUser.work_phone} | <b>รายได้:</b> {mockUser.monthly_income.toLocaleString()} บาท
        </div>
        <div style={{marginBottom: 10, fontSize: '1.01em'}}>
          <b>วันที่ออกบัตร:</b> {mockUser.id_card_issued_date} | <b>บัตรหมดอายุ:</b> {mockUser.id_card_expired_date}
        </div>
        <div style={{marginBottom: 10, fontSize: '1.01em'}}>
          <b>วันที่สมัคร:</b> {new Date(mockUser.created_at).toLocaleString('th-TH')} | <b>อัปเดตล่าสุด:</b> {new Date(mockUser.updated_at).toLocaleString('th-TH')}
        </div>
        <div style={{marginBottom: 10, fontSize: '1.01em'}}>
          <b>บุคคลอ้างอิง:</b>
          <ul style={{margin: '6px 0 0 18px', padding: 0, fontSize: '0.98em'}}>
            {mockContacts.map((c) => (
              <li key={c.id}>
                {c.full_name} ({c.nickname}) - {c.relationship} - {c.phone_number}
              </li>
            ))}
          </ul>
        </div>
        <button className={styles.closeButton} onClick={onClose}>ปิด</button>
      </div>
    </div>
  );
};

export default UserDetailModal; 