import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { checkCreateToken, activateAdmin } from '../../../services/admin.service';
import type { CheckCreateTokenResponse } from '../../../services/admin.service';

const CreateAdminSuccessPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!token) return;
    setChecking(true);
    (async () => {
      try {
        const data: CheckCreateTokenResponse = await checkCreateToken(token);
        if (!data.valid) {
          setError('Token ไม่ถูกต้องหรือหมดอายุ');
        } else {
          setUsername(data.username || '');
          setRole(data.role || '');
        }
      } catch {
        setError('Token ไม่ถูกต้องหรือหมดอายุ');
      } finally {
        setChecking(false);
      }
    })();
  }, [token]);

  // เพิ่ม validation ทันทีเมื่อกรอก password หรือ confirm
  useEffect(() => {
    if (confirm && password !== confirm) {
      setError('รหัสผ่านไม่ตรงกัน');
    } else {
      setError('');
    }
  }, [password, confirm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password.length < 6) {
      setError('กรุณากรอกรหัสผ่านอย่างน้อย 6 ตัวอักษร');
      return;
    }
    if (password !== confirm) {
      setError('รหัสผ่านไม่ตรงกัน');
      return;
    }
    setLoading(true);
    setError('');
    try {
      if (!token) throw new Error('ไม่พบ Token');
      await activateAdmin(token, password);
      setSuccess('สร้างรหัสผ่านสำเร็จ! กรุณาเข้าสู่ระบบ');
      setTimeout(() => navigate('/admin/login'), 1200);
    } catch (err: unknown) {
      let msg = 'เกิดข้อผิดพลาด';
      if (
        typeof err === 'object' &&
        err !== null &&
        'response' in err &&
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        typeof (err as any).response === 'object' &&
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (err as any).response !== null &&
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        'data' in (err as any).response &&
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        typeof (err as any).response.data === 'object' &&
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (err as any).response.data !== null &&
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        'message' in (err as any).response.data &&
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        typeof (err as any).response.data.message === 'string'
      ) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        msg = (err as any).response.data.message;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!token) return <div style={{ textAlign: 'center', marginTop: 60, color: '#ef4444' }}>ไม่พบ Token สำหรับสร้างแอดมิน</div>;
  if (checking) return <div style={{ textAlign: 'center', marginTop: 60, color: '#0ea5e9' }}>กำลังตรวจสอบสิทธิ์...</div>;
  // เฉพาะ error ที่เกี่ยวกับ token เท่านั้น
  if (error === 'Token ไม่ถูกต้องหรือหมดอายุ') return <div style={{ textAlign: 'center', marginTop: 60, color: '#ef4444' }}>{error}</div>;
  if (success) return <div style={{ textAlign: 'center', marginTop: 60, color: '#22c55e' }}>{success}</div>;

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <form onSubmit={handleSubmit} style={{ background: '#fff', borderRadius: 18, boxShadow: '0 8px 40px 0 rgba(14,165,233,0.10)', border: '1.5px solid #e0e7ef', padding: '38px 32px 30px 32px', maxWidth: 420, width: '100%', textAlign: 'center' }}>
        <h2 style={{ color: '#0ea5e9', fontWeight: 800, fontSize: '1.45rem', marginBottom: 22 }}>สร้างบัญชีแอดมินใหม่</h2>
        <div style={{ marginBottom: 18, color: '#0ea5e9', fontWeight: 600, fontSize: '1.08rem' }}>
          Username: <b>{username}</b>
        </div>
        <div style={{ marginBottom: 18, color: '#64748b', fontSize: '0.98rem' }}>
          Role: {role}
        </div>
        <input
          type="password"
          placeholder="รหัสผ่านใหม่"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          minLength={6}
          style={{ width: '100%', marginBottom: 12, padding: 10, borderRadius: 8, border: '1.5px solid #e5e7eb', fontSize: '1.08rem' }}
        />
        <input
          type="password"
          placeholder="ยืนยันรหัสผ่าน"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          required
          minLength={6}
          style={{ width: '100%', marginBottom: 8, padding: 10, borderRadius: 8, border: '1.5px solid #e5e7eb', fontSize: '1.08rem' }}
        />
        {/* แสดง error/success message ใต้ input ยืนยันรหัสผ่าน */}
        {(error && error !== 'Token ไม่ถูกต้องหรือหมดอายุ') && (
          <div style={{ color: '#ef4444', marginBottom: 12, fontWeight: 500 }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{ color: '#22c55e', marginBottom: 12, fontWeight: 500 }}>
            {success}
          </div>
        )}
        <button
          type="submit"
          disabled={loading || !!error || !password || !confirm}
          style={{ background: '#0ea5e9', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 22px', fontWeight: 600, fontSize: '1.08rem', cursor: 'pointer', width: '100%' }}
        >{loading ? 'กำลังบันทึก...' : 'ยืนยัน'}</button>
      </form>
    </div>
  );
};

export default CreateAdminSuccessPage; 