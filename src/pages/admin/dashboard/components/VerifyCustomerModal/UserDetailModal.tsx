import React, { useEffect, useState } from 'react';
import styles from './VerifyCustomerModal.module.css';
import { getUserDetail, getCitizenIdImage } from '../../../../../services/dashboard/user/user-detail.service';
import type { ReferenceContact } from '../../../../../services/dashboard/user/user-detail.service';

export interface UserDetail {
  ID: string;
  FirstName: string;
  LastName: string;
  Nickname: string;
  Gender: string;
  BirthDate: string;
  CitizenID: string;
  CitizenIDImageURL: string;
  citizen_id_image_filename?: string;
  IDCardIssuedDate: string;
  IDCardExpiredDate: string;
  Address: string;
  AddressProvince: string;
  AddressDistrict: string;
  AddressSubdistrict: string;
  AddressPostalCode: string;
  AddressPinLocation: string;
  PhoneNumber: string;
  Email: string;
  FacebookURL: string;
  LineID: string;
  Occupation: string;
  WorkPosition: string;
  WorkplaceName: string;
  WorkPhone: string;
  MonthlyIncome: number;
  WorkAddress: string;
  WorkProvince: string;
  WorkDistrict: string;
  WorkSubdistrict: string;
  WorkPostalCode: string;
  WorkPinLocation: string;
  CreatedAt: string;
  UpdatedAt: string;
}

interface UserDetailModalProps {
  open: boolean;
  onClose: () => void;
  userId?: string;
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({ open, onClose, userId }) => {
  const [user, setUser] = useState<UserDetail | null>(null);
  const [contacts, setContacts] = useState<ReferenceContact[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [citizenIdImageUrl, setCitizenIdImageUrl] = useState<string>('');
  const [citizenIdImageLoading, setCitizenIdImageLoading] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  useEffect(() => {
    if (open && userId) {
      setLoading(true);
      setError(null);
      getUserDetail(userId)
        .then((res) => {
          console.log('API response', res);
          setUser(mapUserDetail(res.user));
          setContacts(Array.isArray(res.reference_contacts) ? res.reference_contacts.map(mapReferenceContact) : []);
          console.log('setUser:', res.user);
        })
        .catch((err: unknown) => {
          const error = err as { status?: number };
          if (error.status === 401 || error.status === 403) {
            setError('คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้');
          } else if (error.status === 404) {
            setError('ไม่พบข้อมูลผู้ใช้');
          } else {
            setError('เกิดข้อผิดพลาดในการดึงข้อมูล');
          }
        })
        .finally(() => setLoading(false));
    } else {
      setUser(null);
      setContacts([]);
      setError(null);
      setCitizenIdImageUrl('');
    }
  }, [open, userId]);

  // โหลดรูปบัตรประชาชนผ่าน service (proxy)
  useEffect(() => {
    setCitizenIdImageLoading(false);
    let url: string | undefined;
    async function fetchImage() {
      if (user && user.citizen_id_image_filename) {
        setCitizenIdImageLoading(true);
        try {
          const blob = await getCitizenIdImage(user.ID, user.citizen_id_image_filename);
          url = URL.createObjectURL(blob);
          setCitizenIdImageUrl(url);
          setCitizenIdImageLoading(false);
        } catch {
          setCitizenIdImageUrl('');
          setCitizenIdImageLoading(false);
        }
      } else {
        setCitizenIdImageUrl('');
        setCitizenIdImageLoading(false);
      }
    }
    fetchImage();
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [user]);

  // รองรับทั้ง url และ lat,long
  function getMapUrl(pin: string | undefined): string | null {
    if (!pin || typeof pin !== 'string') return null;
    // ถ้าเป็น url
    if (/^https?:\/\//.test(pin)) return pin;
    // ถ้าเป็น lat,long
    if (/^-?\d{1,3}\.?\d*,\s*-?\d{1,3}\.?\d*$/.test(pin.trim())) {
      return `https://www.google.com/maps?q=${encodeURIComponent(pin.trim())}`;
    }
    return null;
  }
  const addressMapUrl = getMapUrl(user?.AddressPinLocation);
  const workMapUrl = getMapUrl(user?.WorkPinLocation);

  // ฟังก์ชันช่วย map field ให้ตรงกับ UserDetail
  function mapUserDetail(data: unknown): UserDetail {
    const d = data as Record<string, unknown>;
    return {
      ID: (d.ID ?? d.id ?? '') as string,
      FirstName: (d.FirstName ?? d.first_name ?? '') as string,
      LastName: (d.LastName ?? d.last_name ?? '') as string,
      Nickname: (d.Nickname ?? d.nickname ?? '') as string,
      Gender: (d.Gender ?? d.gender ?? '') as string,
      BirthDate: (d.BirthDate ?? d.birth_date ?? '') as string,
      CitizenID: (d.CitizenID ?? d.citizen_id ?? '') as string,
      CitizenIDImageURL: (d.CitizenIDImageURL ?? d.citizen_id_image_url ?? '') as string,
      citizen_id_image_filename: (d.citizen_id_image_filename ?? '') as string,
      IDCardIssuedDate: (d.IDCardIssuedDate ?? d.id_card_issued_date ?? '') as string,
      IDCardExpiredDate: (d.IDCardExpiredDate ?? d.id_card_expired_date ?? '') as string,
      Address: (d.Address ?? d.address ?? '') as string,
      AddressProvince: (d.AddressProvince ?? d.address_province ?? '') as string,
      AddressDistrict: (d.AddressDistrict ?? d.address_district ?? '') as string,
      AddressSubdistrict: (d.AddressSubdistrict ?? d.address_subdistrict ?? '') as string,
      AddressPostalCode: (d.AddressPostalCode ?? d.address_postal_code ?? '') as string,
      AddressPinLocation: (d.AddressPinLocation ?? d.address_pin_location ?? '') as string,
      PhoneNumber: (d.PhoneNumber ?? d.phone_number ?? '') as string,
      Email: (d.Email ?? d.email ?? '') as string,
      FacebookURL: (d.FacebookURL ?? d.facebook_url ?? '') as string,
      LineID: (d.LineID ?? d.line_id ?? '') as string,
      Occupation: (d.Occupation ?? d.occupation ?? '') as string,
      WorkPosition: (d.WorkPosition ?? d.work_position ?? '') as string,
      WorkplaceName: (d.WorkplaceName ?? d.workplace_name ?? '') as string,
      WorkPhone: (d.WorkPhone ?? d.work_phone ?? '') as string,
      MonthlyIncome: typeof d.MonthlyIncome === 'number' ? (d.MonthlyIncome as number) : ((d.monthly_income ?? 0) as number),
      WorkAddress: (d.WorkAddress ?? d.work_address ?? '') as string,
      WorkProvince: (d.WorkProvince ?? d.work_province ?? '') as string,
      WorkDistrict: (d.WorkDistrict ?? d.work_district ?? '') as string,
      WorkSubdistrict: (d.WorkSubdistrict ?? d.work_subdistrict ?? '') as string,
      WorkPostalCode: (d.WorkPostalCode ?? d.work_postal_code ?? '') as string,
      WorkPinLocation: (d.WorkPinLocation ?? d.work_pin_location ?? '') as string,
      CreatedAt: (d.CreatedAt ?? d.created_at ?? '') as string,
      UpdatedAt: (d.UpdatedAt ?? d.updated_at ?? '') as string,
    };
  }

  // ฟังก์ชันช่วย map field ให้ตรงกับ ReferenceContact
  function mapReferenceContact(data: unknown): ReferenceContact {
    const d = data as Partial<ReferenceContact> & {
      ID?: number; UserID?: string; FullName?: string; Nickname?: string; PhoneNumber?: string; Relationship?: string; CreatedAt?: string;
    };
    return {
      id: d.ID ?? d.id ?? 0,
      user_id: d.UserID ?? d.user_id ?? '',
      full_name: d.FullName ?? d.full_name ?? '',
      nickname: d.Nickname ?? d.nickname ?? '',
      phone_number: d.PhoneNumber ?? d.phone_number ?? '',
      relationship: d.Relationship ?? d.relationship ?? '',
      created_at: d.CreatedAt ?? d.created_at ?? '',
    };
  }

  // ฟังก์ชันตัด T00:00:00Z ออกจากวันที่
  function formatDate(dateStr: string): string {
    if (!dateStr) return '-';
    return dateStr.replace(/T00:00:00Z$/, '');
  }

  if (!open) return null;
  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modalContent} style={{maxWidth: 700, minWidth: 320}}>
        <h2 className={styles.modalTitle}>ข้อมูลผู้ใช้</h2>
        {loading ? (
          <div style={{textAlign: 'center', color: '#0ea5e9', padding: '32px 0'}}>กำลังโหลดข้อมูล...</div>
        ) : error ? (
          <div style={{textAlign: 'center', color: '#ef4444', padding: '32px 0'}}>{error}</div>
        ) : user ? (
          <>
            <div style={{display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 18}}>
              <div style={{flex: '0 0 120px'}}>
                {citizenIdImageLoading ? (
                  <div style={{width: 120, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', borderRadius: 8, border: '1px solid #e5e7eb', color: '#0ea5e9', fontSize: 15}}>
                    กำลังโหลดรูป...
                  </div>
                ) : citizenIdImageUrl ? (
                  <img
                    src={citizenIdImageUrl}
                    alt="รูปบัตรประชาชน"
                    style={{width: 120, height: 80, borderRadius: 8, objectFit: 'cover', border: '1px solid #e5e7eb', cursor: 'zoom-in'}}
                    onClick={() => setShowImageModal(true)}
                  />
                ) : null}
                <div style={{fontSize: '0.92em', color: '#64748b', marginTop: 4, textAlign: 'center'}}>บัตรประชาชน</div>
              </div>
              <div style={{flex: '1 1 260px', minWidth: 0}}>
                <div className={styles.userDetailSection}>
                  <div className={styles.userDetailSectionTitle}>ข้อมูลส่วนตัว</div>
                  <div className={styles.userDetailRow}>
                    <span className={styles.userDetailLabel}>ชื่อ-นามสกุล:</span>
                    {user.FirstName} {user.LastName} <span style={{color:'#64748b'}}>({user.Nickname})</span>
                  </div>
                  <div className={styles.userDetailRow}>
                    <span className={styles.userDetailLabel}>เพศ:</span>{user.Gender}
                    <span className={styles.userDetailLabel} style={{marginLeft: 12}}>วันเกิด:</span>{formatDate(user.BirthDate)}
                  </div>
                  <div className={styles.userDetailRow}>
                    <span className={styles.userDetailLabel}>เลขบัตร:</span><b>{user.CitizenID}</b>
                  </div>
                  <div className={styles.userDetailRow}>
                    <span className={styles.userDetailLabel}>เบอร์:</span><b>{user.PhoneNumber}</b>
                  </div>
                  <div className={styles.userDetailRow}>
                    <span className={styles.userDetailLabel}>อีเมล:</span><b>{user.Email}</b>
                  </div>
                  <div className={styles.userDetailRow}>
                    <span className={styles.userDetailLabel}>Facebook:</span>
                    {user.FacebookURL ? (
                      <a
                        href={user.FacebookURL}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#0ea5e9', textDecoration: 'underline', wordBreak: 'break-all' }}
                      >
                        {user.FacebookURL}
                      </a>
                    ) : (
                      <b>-</b>
                    )}
                  </div>
                  <div className={styles.userDetailRow}>
                    <span className={styles.userDetailLabel}>Line ID:</span>
                    {user.LineID ? (
                      <a
                        href={`https://line.me/ti/p/~${encodeURIComponent(user.LineID)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#0ea5e9', textDecoration: 'underline', wordBreak: 'break-all' }}
                      >
                        {user.LineID}
                      </a>
                    ) : (
                      <b>-</b>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.userDetailSection}>
              <div className={styles.userDetailSectionTitle}>ที่อยู่</div>
              <div className={styles.userDetailRow}>
                <span className={styles.userDetailLabel}>ที่อยู่:</span> {user.Address} แขวง/ตำบล {user.AddressSubdistrict} เขต/อำเภอ {user.AddressDistrict} จังหวัด {user.AddressProvince} {user.AddressPostalCode}
              </div>
              <div className={styles.userDetailRow}>
                {addressMapUrl ? (
                  <a href={addressMapUrl} target="_blank" rel="noopener noreferrer" style={{color: '#0ea5e9', fontSize: '0.97em'}}>ดูแผนที่บ้าน</a>
                ) : (
                  <span style={{color: '#64748b', fontSize: '0.97em'}}>-</span>
                )}
              </div>
            </div>
            <div className={styles.userDetailSection}>
              <div className={styles.userDetailSectionTitle}>ที่อยู่ที่ทำงาน</div>
              <div className={styles.userDetailRow}>
                <span className={styles.userDetailLabel}>ที่อยู่:</span> {user.WorkAddress} แขวง/ตำบล {user.WorkSubdistrict} เขต/อำเภอ {user.WorkDistrict} จังหวัด {user.WorkProvince} {user.WorkPostalCode}
              </div>
              <div className={styles.userDetailRow}>
                {workMapUrl ? (
                  <a href={workMapUrl} target="_blank" rel="noopener noreferrer" style={{color: '#0ea5e9', fontSize: '0.97em'}}>ดูแผนที่ที่ทำงาน</a>
                ) : (
                  <span style={{color: '#64748b', fontSize: '0.97em'}}>-</span>
                )}
              </div>
            </div>
            <div className={styles.userDetailSection}>
              <div className={styles.userDetailSectionTitle}>ข้อมูลการทำงาน</div>
              <div className={styles.userDetailRow}>
                <span className={styles.userDetailLabel}>อาชีพ:</span> {user.Occupation}
                <span className={styles.userDetailLabel} style={{marginLeft: 12}}>ตำแหน่ง:</span> {user.WorkPosition}
              </div>
              <div className={styles.userDetailRow}>
                <span className={styles.userDetailLabel}>สถานที่ทำงาน:</span> {user.WorkplaceName}
                <span className={styles.userDetailLabel} style={{marginLeft: 12}}>เบอร์ที่ทำงาน:</span> {user.WorkPhone}
              </div>
              <div className={styles.userDetailRow}>
                <span className={styles.userDetailLabel}>รายได้:</span> {typeof user.MonthlyIncome === 'number' ? user.MonthlyIncome.toLocaleString() : '-'} บาท
              </div>
            </div>
            <div className={styles.userDetailSection}>
              <div className={styles.userDetailSectionTitle}>ข้อมูลบัตรประชาชน</div>
              <div className={styles.userDetailRow}>
                <span className={styles.userDetailLabel}>วันที่ออกบัตร:</span> {formatDate(user.IDCardIssuedDate)}
                <span className={styles.userDetailLabel} style={{marginLeft: 12}}>บัตรหมดอายุ:</span> {formatDate(user.IDCardExpiredDate)}
              </div>
            </div>
            <div className={styles.userDetailSection}>
              <div className={styles.userDetailSectionTitle}>วันสมัครและอัปเดต</div>
              <div className={styles.userDetailRow}>
                <span className={styles.userDetailLabel}>วันที่สมัคร:</span> {user.CreatedAt ? new Date(user.CreatedAt).toLocaleString('th-TH') : '-'}
                <span className={styles.userDetailLabel} style={{marginLeft: 12}}>อัปเดตล่าสุด:</span> {user.UpdatedAt ? new Date(user.UpdatedAt).toLocaleString('th-TH') : '-'}
              </div>
            </div>
            <div className={styles.userDetailSection}>
              <div className={styles.userDetailSectionTitle}>บุคคลอ้างอิง</div>
              <ul style={{margin: '6px 0 0 18px', padding: 0, fontSize: '0.98em'}}>
                {contacts.map((c) => (
                  <li key={c.id}>
                    {c.full_name} ({c.nickname}) - {c.relationship} - {c.phone_number}
                  </li>
                ))}
              </ul>
            </div>
          </>
        ) : null}
        <button className={styles.closeButton} onClick={onClose}>ปิด</button>
      </div>
      {/* Modal แสดงรูปขยาย */}
      {showImageModal && citizenIdImageUrl && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(30,41,59,0.65)',
            zIndex: 3000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={() => setShowImageModal(false)}
        >
          <img
            src={citizenIdImageUrl}
            alt="รูปบัตรประชาชนขยาย"
            style={{
              maxWidth: '90vw',
              maxHeight: '80vh',
              borderRadius: 12,
              boxShadow: '0 4px 32px rgba(30,41,59,0.18)',
              background: '#fff',
              border: '2px solid #e0e7ef',
            }}
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default UserDetailModal; 