import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './CustomerDetailPage.module.css';
import { FaPhone, FaEnvelope, FaLine, FaCopy, FaIdCard, FaFacebook } from 'react-icons/fa';
import { ReadOnlyMap } from '../../../components/ReadOnlyMap';
import { getUserDetail, getCitizenIdImage } from '../../../services/dashboard/user/user-detail.service';
import type { UserDetail, ReferenceContact } from '../../../services/dashboard/user/user-detail.service';
import UserDetailModal from '../dashboard/components/VerifyCustomerModal/UserDetailModal';

function formatDateShort(dateStr: string) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  const day = d.getUTCDate().toString().padStart(2, '0');
  const month = (d.getUTCMonth() + 1).toString().padStart(2, '0');
  const year = d.getUTCFullYear();
  return `${day}/${month}/${year}`;
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text);
}

// ฟังก์ชันดึง lat/lng จากลิงก์ Google Maps
function extractLatLngFromGoogleMapsUrl(url: string): [number, number] | null {
  const match = url.match(/maps\?q=([\d.-]+),([\d.]+)/);
  if (match) {
    return [parseFloat(match[1]), parseFloat(match[2])];
  }
  return null;
}

function formatDateThai(dateStr: string) {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  let hour = date.getUTCHours() + 7;
  let day = date.getUTCDate();
  let month = date.getUTCMonth() + 1;
  let year = date.getUTCFullYear();
  if (hour >= 24) {
    hour -= 24;
    day += 1;
    // handle ข้ามเดือน/ปี (กรณีข้ามวัน)
    const daysInMonth = new Date(year, month, 0).getDate();
    if (day > daysInMonth) {
      day = 1;
      month += 1;
      if (month > 12) {
        month = 1;
        year += 1;
      }
    }
  }
  const hourStr = hour.toString().padStart(2, '0');
  const minStr = date.getUTCMinutes().toString().padStart(2, '0');
  const dayStr = day.toString().padStart(2, '0');
  const monthStr = month.toString().padStart(2, '0');
  return `${dayStr}/${monthStr}/${year} ${hourStr}:${minStr}`;
}

export default function CustomerDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [referenceContacts, setReferenceContacts] = useState<ReferenceContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [citizenIdImageUrl, setCitizenIdImageUrl] = useState<string>('');
  const [citizenIdImageLoading, setCitizenIdImageLoading] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [openUserModal, setOpenUserModal] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getUserDetail(id)
      .then(res => {
        setUser(res.user);
        const contacts = (res.reference_contacts || []).map((c: unknown) => {
          const contact = c as Record<string, unknown>;
          return {
            id: Number(contact.ID),
            user_id: String(contact.UserID),
            full_name: String(contact.FullName),
            nickname: String(contact.Nickname),
            phone_number: String(contact.PhoneNumber),
            relationship: String(contact.Relationship),
            created_at: String(contact.CreatedAt),
          };
        });
        setReferenceContacts(contacts);
        setError(null);
      })
      .catch(() => {
        setError('ไม่พบข้อมูลลูกค้า');
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    setCitizenIdImageUrl('');
    setCitizenIdImageLoading(false);
    let url: string | undefined;
    async function fetchImage() {
      if (user && user.citizen_id_image_filename) {
        setCitizenIdImageLoading(true);
        try {
          const blob = await getCitizenIdImage(user.id, user.citizen_id_image_filename);
          url = URL.createObjectURL(blob);
          setCitizenIdImageUrl(url);
        } catch {
          setCitizenIdImageUrl('');
        }
        setCitizenIdImageLoading(false);
      }
    }
    fetchImage();
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [user]);

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#64748b', fontSize: 18 }}>กำลังโหลดข้อมูล...</div>;
  if (error || !user) return <div style={{ padding: 40, textAlign: 'center', color: '#f87171', fontSize: 18 }}>{error || 'ไม่พบข้อมูล'}</div>;

  // address pin
  let addressLat = undefined, addressLng = undefined;
  let addressIsGoogleUrl = false;
  if (user.address_pin_location) {
    const pin = user.address_pin_location;
    if (pin.startsWith('http')) {
      if (/maps\?q=/.test(pin)) {
        const latlng = extractLatLngFromGoogleMapsUrl(pin);
        if (latlng) {
          addressLat = latlng[0];
          addressLng = latlng[1];
        }
      } else {
        addressIsGoogleUrl = true;
      }
    } else {
      const [lat, lng] = pin.split(',').map(Number);
      addressLat = lat;
      addressLng = lng;
    }
  }
  // work pin
  let workLat = undefined, workLng = undefined;
  let workIsGoogleUrl = false;
  if (user.work_pin_location) {
    const pin = user.work_pin_location;
    if (pin.startsWith('http')) {
      if (/maps\?q=/.test(pin)) {
        const latlng = extractLatLngFromGoogleMapsUrl(pin);
        if (latlng) {
          workLat = latlng[0];
          workLng = latlng[1];
        }
      } else {
        workIsGoogleUrl = true;
      }
    } else {
      const [lat, lng] = pin.split(',').map(Number);
      workLat = lat;
      workLng = lng;
    }
  }

  return (
    <div className={styles.container}>
      <button onClick={() => navigate(-1)} className={styles.backButton}>ย้อนกลับ</button>
      {!user.is_verified && (
        <button
          className={styles.verifyButton}
          onClick={() => setOpenUserModal(true)}
        >
          ยืนยันตัวตนลูกค้า
        </button>
      )}
      <h2 className={styles.header}>
        {user.first_name} {user.last_name}
        <span className={user.is_verified ? `${styles.status} ${styles.verified}` : `${styles.status} ${styles.unverified}`}>
          {user.is_verified ? 'ยืนยันแล้ว' : 'ยังไม่ยืนยัน'}
        </span>
      </h2>
      <div style={{ color: '#64748b', marginBottom: 24 }}>ID: {user.id}</div>
      <div className={styles.infoGrid} style={{ marginBottom: 24 }}>
        <div className={styles.infoCol}>
          <div className={styles.sectionTitle}>ข้อมูลส่วนตัว</div>
          <div>ชื่อเล่น: {user.nickname}</div>
          <div>เพศ: {user.gender}</div>
          <div>วันเกิด: {formatDateShort(user.birth_date)}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <FaPhone style={{ color: '#0ea5e9' }} />
            เบอร์โทร: {user.phone_number}
            <button onClick={() => copyToClipboard(user.phone_number)} title="คัดลอกเบอร์โทร" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0ea5e9' }}>
              <FaCopy />
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <FaEnvelope style={{ color: '#0ea5e9' }} />
            อีเมล: {user.email}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <FaFacebook style={{ color: '#0ea5e9' }} />
            Facebook: <a href={user.facebook_url} target="_blank" rel="noopener noreferrer">{user.facebook_url}</a>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <FaLine style={{ color: '#0ea5e9' }} />
            Line ID: {user.line_id}
          </div>
        </div>
        <div className={styles.infoCol}>
          <div className={styles.sectionTitle}>บัตรประชาชน</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <FaIdCard style={{ color: '#0ea5e9' }} />
            เลขบัตร: {user.citizen_id}
            <button onClick={() => copyToClipboard(user.citizen_id)} title="คัดลอกเลขบัตร" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0ea5e9' }}>
              <FaCopy />
            </button>
          </div>
          <div>วันออกบัตร: {formatDateShort(user.id_card_issued_date)}</div>
          <div>วันหมดอายุ: {formatDateShort(user.id_card_expired_date)}</div>
          <div>
            {citizenIdImageLoading ? (
              <span>กำลังโหลดรูป...</span>
            ) : citizenIdImageUrl ? (
              <img
                src={citizenIdImageUrl}
                alt="รูปบัตรประชาชน"
                className={styles.citizenIdImage}
                style={{ cursor: 'zoom-in' }}
                onClick={() => setShowImageModal(true)}
              />
            ) : (
              <span style={{ color: '#64748b' }}>(ไม่มีรูปบัตร)</span>
            )}
          </div>
        </div>
      </div>
      <div className={styles.section}>
        <div className={styles.sectionTitle}>ที่อยู่</div>
        <div>{user.address} แขวง/ตำบล {user.address_subdistrict} เขต/อำเภอ {user.address_district} จังหวัด {user.address_province} {user.address_postal_code}</div>
        {addressLat && addressLng && (
          <div style={{ marginTop: 16 }}>
            <ReadOnlyMap
              lat={addressLat}
              lng={addressLng}
              zoom={15}
              height={320}
            />
            <button
              style={{ marginTop: 8, background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 600, fontSize: '1rem', cursor: 'pointer' }}
              onClick={() => window.open(`https://www.google.com/maps?q=${addressLat},${addressLng}`, '_blank')}
            >
              เปิดใน Google Maps
            </button>
          </div>
        )}
        {addressIsGoogleUrl && (
          <div style={{ marginTop: 16 }}>
            <button
              style={{ background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 600, fontSize: '1rem', cursor: 'pointer' }}
              onClick={() => window.open(user.address_pin_location, '_blank')}
            >
              เปิดใน Google Maps
            </button>
          </div>
        )}
      </div>
      <div className={styles.section}>
        <div className={styles.sectionTitle}>ข้อมูลที่ทำงาน</div>
        <div>อาชีพ: {user.occupation}</div>
        <div>ตำแหน่ง: {user.work_position}</div>
        <div>ชื่อที่ทำงาน: {user.workplace_name}</div>
        <div>เบอร์ที่ทำงาน: {user.work_phone}</div>
        <div>รายได้ต่อเดือน: {user.monthly_income.toLocaleString()} บาท</div>
        <div>ที่อยู่ที่ทำงาน: {user.work_address} แขวง/ตำบล {user.work_subdistrict} เขต/อำเภอ {user.work_district} จังหวัด {user.work_province} {user.work_postal_code}</div>
        {workLat && workLng && (
          <div style={{ marginTop: 16 }}>
            <ReadOnlyMap
              lat={workLat}
              lng={workLng}
              zoom={15}
              height={320}
            />
            <button
              style={{ marginTop: 8, background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 600, fontSize: '1rem', cursor: 'pointer' }}
              onClick={() => window.open(`https://www.google.com/maps?q=${workLat},${workLng}`, '_blank')}
            >
              เปิดใน Google Maps
            </button>
          </div>
        )}
        {workIsGoogleUrl && (
          <div style={{ marginTop: 16 }}>
            <button
              style={{ background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 600, fontSize: '1rem', cursor: 'pointer' }}
              onClick={() => window.open(user.work_pin_location, '_blank')}
            >
              เปิดใน Google Maps
            </button>
          </div>
        )}
      </div>
      <div className={styles.section}>
        <div className={styles.sectionTitle}>ข้อมูลการยืนยัน</div>
        <div>สถานะ: <span className={user.is_verified ? styles.verified : styles.unverified}>{user.is_verified ? 'ยืนยันแล้ว' : 'ยังไม่ยืนยัน'}</span></div>
        <div>ผู้ยืนยัน: {user.verified_by || '-'}</div>
        <div>วันที่ยืนยัน: {user.verified_at ? formatDateThai(user.verified_at) : '-'}</div>
      </div>
      <div className={styles.section}>
        <div className={styles.sectionTitle}>ผู้ติดต่ออ้างอิง</div>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ชื่อ-นามสกุล</th>
                <th>ชื่อเล่น</th>
                <th>เบอร์โทร</th>
                <th>ความสัมพันธ์</th>
              </tr>
            </thead>
            <tbody>
              {referenceContacts.map((ref) => (
                <tr key={ref.id}>
                  <td>{ref.full_name}</td>
                  <td>{ref.nickname}</td>
                  <td>{ref.phone_number}</td>
                  <td>{ref.relationship}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Modal แสดงรูปบัตรประชาชนขยาย */}
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
          <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setShowImageModal(false)}
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                background: 'rgba(255,255,255,0.95)',
                border: 'none',
                fontSize: 22,
                color: '#64748b',
                cursor: 'pointer',
                zIndex: 10,
                padding: 8,
                lineHeight: 1,
                boxShadow: '0 2px 8px rgba(30,41,59,0.10)'
              }}
              aria-label="ปิด"
            >
              ×
            </button>
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
                display: 'block',
              }}
              onClick={e => e.stopPropagation()}
            />
          </div>
        </div>
      )}
      <UserDetailModal open={openUserModal} onClose={() => setOpenUserModal(false)} userId={user.id} />
    </div>
  );
} 