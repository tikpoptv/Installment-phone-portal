import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './CustomerDetailPage.module.css';
import { FaPhone, FaEnvelope, FaLine, FaCopy, FaIdCard, FaFacebook, FaTrash } from 'react-icons/fa';
import { ReadOnlyMap } from '../../../components/ReadOnlyMap';
import { getUserDetail, getCitizenIdImage } from '../../../services/dashboard/user/user-detail.service';
import type { UserDetail, ReferenceContact } from '../../../services/dashboard/user/user-detail.service';
import { deleteUser } from '../../../services/user-management.service';
import UserDetailModal from '../dashboard/components/VerifyCustomerModal/UserDetailModal';
import { formatDateThai, formatDateShort } from '../../../utils/date';
import { toast } from 'react-toastify';

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

  // State สำหรับ modal ยืนยันการลบ
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  // ฟังก์ชันจัดการการลบผู้ใช้
  const handleDeleteUser = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDeleteUser = async () => {
    if (!user) return;
    
    setDeleting(true);
    try {
      await deleteUser(user.id);
      toast.success('ลบผู้ใช้สำเร็จ');
      navigate('/admin/customers');
    } catch (error: unknown) {
      console.error('Error deleting user:', error);
      const errorMessage = error && typeof error === 'object' && 'error' in error 
        ? String(error.error) 
        : 'เกิดข้อผิดพลาดในการลบผู้ใช้';
      toast.error(errorMessage);
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

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
      {user.is_verified && (
        <button
          onClick={handleDeleteUser}
          style={{
            position: 'absolute',
            top: 24,
            right: 135,
            zIndex: 2,
            marginBottom: 0,
            background: '#fee2e2',
            color: '#dc2626',
            border: 'none',
            borderRadius: '7px',
            padding: '7px 18px',
            fontWeight: '600',
            fontSize: '1rem',
            cursor: 'pointer',
            transition: 'background 0.18s, color 0.18s',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 1px 4px #bae6fd33'
          }}
          onMouseOver={e => (e.currentTarget.style.background = '#fecaca')}
          onMouseOut={e => (e.currentTarget.style.background = '#fee2e2')}
        >
          <FaTrash size={16} />
          ลบผู้ใช้
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
      
      {/* Modal ยืนยันการลบผู้ใช้ */}
      {showDeleteConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.3)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 12,
            padding: 32,
            minWidth: 400,
            boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: 18,
              fontWeight: 600,
              marginBottom: 16,
              color: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8
            }}>
              <FaTrash size={24} />
              ยืนยันการลบผู้ใช้
            </div>
            <div style={{ marginBottom: 24, color: '#374151', lineHeight: 1.5 }}>
              คุณต้องการลบผู้ใช้ <strong>{user.first_name} {user.last_name}</strong> ออกจากระบบหรือไม่?
              <br />
              <span style={{ color: '#dc2626', fontSize: 14 }}>
                การดำเนินการนี้ไม่สามารถยกเลิกได้
              </span>
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                style={{
                  background: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 0.18s',
                  fontSize: 14
                }}
                onMouseOver={e => !deleting && (e.currentTarget.style.background = '#e5e7eb')}
                onMouseOut={e => !deleting && (e.currentTarget.style.background = '#f3f4f6')}
              >
                ยกเลิก
              </button>
              <button
                onClick={confirmDeleteUser}
                disabled={deleting}
                style={{
                  background: '#dc2626',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  fontWeight: 600,
                  cursor: deleting ? 'not-allowed' : 'pointer',
                  transition: 'background 0.18s',
                  fontSize: 14,
                  opacity: deleting ? 0.6 : 1
                }}
                onMouseOver={e => !deleting && (e.currentTarget.style.background = '#b91c1c')}
                onMouseOut={e => !deleting && (e.currentTarget.style.background = '#dc2626')}
              >
                {deleting ? 'กำลังลบ...' : 'ลบผู้ใช้'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 