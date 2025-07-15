import React, { useState, useEffect } from 'react';
import Navbar from '../../../components/admin/Navbar';
import styles from './Settings.module.css';
import { API_BASE_URL } from '../../../services/api';
import { getHealth } from '../../../services/health.service';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { changeAdminPassword } from '../../../services/auth/admin-password.service';
import { toast } from 'react-toastify';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const MAX_HISTORY = 20;

const Settings: React.FC = () => {
  const [pingResult, setPingResult] = useState<string>('');
  const [pingLoading, setPingLoading] = useState(true);
  const [latencyHistory, setLatencyHistory] = useState<number[]>([]);
  const [serverTime, setServerTime] = useState<string>('');
  const [bankEditMode, setBankEditMode] = useState(false);
  const [bankInfo, setBankInfo] = useState({
    name: 'กสิกรไทย',
    number: '123-4-56789-0',
    holder: 'สมชาย ใจดี',
  });
  const [bankDraft, setBankDraft] = useState(bankInfo);
  const [showBankConfirm, setShowBankConfirm] = useState(false);

  // State สำหรับฟอร์มเปลี่ยนรหัสผ่าน
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [oldPasswordError, setOldPasswordError] = useState<string|null>(null);
  const [newPasswordError, setNewPasswordError] = useState<string|null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string|null>(null);

  // Real-time validation
  useEffect(() => {
    if (newPassword && newPassword.length < 8) {
      setNewPasswordError('รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร');
    } else {
      setNewPasswordError(null);
    }
    if (confirmPassword && newPassword !== confirmPassword) {
      setConfirmPasswordError('รหัสผ่านใหม่และยืนยันรหัสผ่านไม่ตรงกัน');
    } else {
      setConfirmPasswordError(null);
    }
  }, [newPassword, confirmPassword]);

  const handleBankEdit = () => {
    setBankDraft(bankInfo);
    setBankEditMode(true);
  };
  const handleBankCancel = () => {
    setBankEditMode(false);
  };
  const handleBankSave = () => {
    setShowBankConfirm(true);
  };
  const handleBankConfirm = () => {
    setBankInfo(bankDraft);
    setBankEditMode(false);
    setShowBankConfirm(false);
  };
  const handleBankCancelConfirm = () => {
    setShowBankConfirm(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setOldPasswordError(null);
    if (!oldPassword || !newPassword || !confirmPassword) {
      if (!oldPassword) setOldPasswordError('กรุณากรอกรหัสผ่านเดิม');
      if (!newPassword) setNewPasswordError('กรุณากรอกรหัสผ่านใหม่');
      if (!confirmPassword) setConfirmPasswordError('กรุณายืนยันรหัสผ่านใหม่');
      toast.error('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
    if (newPasswordError || confirmPasswordError) {
      toast.error('กรุณาแก้ไขข้อผิดพลาดในฟอร์ม');
      return;
    }
    setPwLoading(true);
    try {
      const res = await changeAdminPassword({ old_password: oldPassword, new_password: newPassword });
      if (res.success || res.message === 'password changed successfully') {
        toast.success('เปลี่ยนรหัสผ่านสำเร็จ');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast.error(res.message || JSON.stringify(res) || 'เกิดข้อผิดพลาด');
      }
    } catch (err: unknown) {
      let msg = 'เกิดข้อผิดพลาด';
      if (err && typeof err === 'object') {
        if ('message' in err && typeof (err as { message?: unknown }).message === 'string') {
          msg = (err as { message: string }).message;
        } else if ('error' in err && typeof (err as { error?: unknown }).error === 'string') {
          msg = (err as { error: string }).error;
        } else {
          // fallback stringify
          msg = JSON.stringify(err);
        }
      }
      toast.error(msg);
    } finally {
      setPwLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const doPing = async () => {
      setPingLoading(true);
      setPingResult('');
      const start = Date.now();
      try {
        // เรียก health check ผ่าน service
        const data = await getHealth();
        const ms = Date.now() - start;
        if (data.status === 'ok') {
          if (isMounted) {
            setPingResult(`online|${ms}`);
            setServerTime(data.timestamp);
            setLatencyHistory(prev => {
              const next = [...prev, ms];
              return next.length > MAX_HISTORY ? next.slice(-MAX_HISTORY) : next;
            });
          }
        } else {
          if (isMounted) setPingResult('offline');
        }
      } catch {
        if (isMounted) setPingResult('offline');
      } finally {
        if (isMounted) setPingLoading(false);
      }
    };
    doPing();
    const interval = setInterval(doPing, 30000);
    return () => { isMounted = false; clearInterval(interval); };
  }, []);

  // Chart data
  const chartData = {
    labels: latencyHistory.map((_, i) => `${i + 1}`),
    datasets: [
      {
        label: 'Latency (ms)',
        data: latencyHistory,
        borderColor: '#0ea5e9',
        backgroundColor: 'rgba(14, 165, 233, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 5,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(255,255,255,0.95)',
        titleColor: '#1e293b',
        bodyColor: '#64748b',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
      },
      title: {
        display: true,
        text: 'Latency (ms) ล่าสุด',
        color: '#1e293b',
        font: { size: 16, weight: 'bold' as const },
        padding: { top: 8, bottom: 8 },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#64748b' },
        title: { display: false },
      },
      y: {
        grid: { color: '#f1f5f9' },
        ticks: { color: '#64748b' },
        title: { display: false },
        min: 0,
      },
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
    elements: {
      line: { tension: 0.4, borderWidth: 2 },
      point: { radius: 3, hoverRadius: 5 },
    },
  };

  return (
    <div className={styles.settingsContainer}>
      <Navbar />
      <div className={styles.content}>
        <h1>ตั้งค่าแอดมิน</h1>
        <section className={styles.section}>
          <h2>เปลี่ยนรหัสผ่าน</h2>
          <form className={styles.form} onSubmit={handleChangePassword} autoComplete="off">
            <label>
              รหัสผ่านเดิม
              <input type="password" placeholder="รหัสผ่านเดิม" value={oldPassword} onChange={e=>{setOldPassword(e.target.value); setOldPasswordError(null);}} autoComplete="current-password" />
              <span className={`${styles.inputError} ${!oldPasswordError ? styles.invisible : ''}`}>{oldPasswordError || ' '}</span>
            </label>
            <label>
              รหัสผ่านใหม่
              <input type="password" placeholder="รหัสผ่านใหม่ (อย่างน้อย 8 ตัวอักษร)" value={newPassword} onChange={e=>{setNewPassword(e.target.value); setNewPasswordError(null);}} autoComplete="new-password" />
              <span className={`${styles.inputError} ${!newPasswordError ? styles.invisible : ''}`}>{newPasswordError || ' '}</span>
            </label>
            <label>
              ยืนยันรหัสผ่านใหม่
              <input type="password" placeholder="ยืนยันรหัสผ่านใหม่" value={confirmPassword} onChange={e=>{setConfirmPassword(e.target.value); setConfirmPasswordError(null);}} autoComplete="new-password" />
              <span className={`${styles.inputError} ${!confirmPasswordError ? styles.invisible : ''}`}>{confirmPasswordError || ' '}</span>
            </label>
            <button type="submit" disabled={pwLoading || !oldPassword || !newPassword || !confirmPassword || !!newPasswordError || !!confirmPasswordError}>
              {pwLoading ? 'กำลังเปลี่ยน...' : 'เปลี่ยนรหัสผ่าน'}
            </button>
          </form>
        </section>
        <section className={styles.section}>
          <h2>การสื่อสารกับ Server</h2>
          <div style={{marginBottom:12, color:'#64748b', fontSize:'1rem'}}>
            Backend URL: <span style={{color:'#0ea5e9', fontWeight:600}}>{API_BASE_URL}</span>
          </div>
          <div style={{marginTop:6, fontWeight:600, color: pingResult.startsWith('online') ? '#22c55e' : '#ef4444'}}>
            {pingLoading ? 'กำลัง Ping...' : (
              pingResult.startsWith('online') ? (
                <span style={{display:'inline-flex',alignItems:'center',gap:6}}>
                  <svg width="18" height="18" style={{verticalAlign:'middle'}}><circle cx="9" cy="9" r="8" fill="#22c55e"/></svg>
                  ออนไลน์ ({pingResult.split('|')[1]} ms)
                </span>
              ) : (
                <span style={{display:'inline-flex',alignItems:'center',gap:6}}>
                  <svg width="18" height="18" style={{verticalAlign:'middle'}}><circle cx="9" cy="9" r="8" fill="#ef4444"/></svg>
                  ออฟไลน์
                </span>
              )
            )}
            {serverTime && (
              <div style={{fontSize:'0.95rem', color:'#64748b', marginTop:4}}>
                เวลาบนเซิร์ฟเวอร์: {serverTime}
              </div>
            )}
          </div>
          <div className={styles.latencyChartBox}>
            <Line options={chartOptions} data={chartData} height={220} />
          </div>
        </section>
        <section className={styles.bankSection}>
          <h2>ข้อมูลธนาคาร</h2>
          <div className={styles.bankInfoBox}>
            {!bankEditMode ? (
              <>
                <div style={{marginBottom:8}}><b>ธนาคาร:</b> {bankInfo.name}</div>
                <div style={{marginBottom:8}}><b>เลขบัญชี:</b> {bankInfo.number}</div>
                <div><b>ชื่อบัญชี:</b> {bankInfo.holder}</div>
                <button type="button" className={styles.bankEditBtn} onClick={handleBankEdit}>แก้ไข</button>
              </>
            ) : (
              <>
                <div style={{marginBottom:8}}>
                  <b>ธนาคาร:</b> <input type="text" value={bankDraft.name} onChange={e=>setBankDraft(d=>({...d,name:e.target.value}))} className={styles.bankInput} />
                </div>
                <div style={{marginBottom:8}}>
                  <b>เลขบัญชี:</b> <input type="text" value={bankDraft.number} onChange={e=>setBankDraft(d=>({...d,number:e.target.value}))} className={styles.bankInput} />
                </div>
                <div style={{marginBottom:16}}>
                  <b>ชื่อบัญชี:</b> <input type="text" value={bankDraft.holder} onChange={e=>setBankDraft(d=>({...d,holder:e.target.value}))} className={styles.bankInput} />
                </div>
                <div style={{display:'flex',gap:8}}>
                  <button type="button" className={styles.bankSaveBtn} onClick={handleBankSave}>บันทึก</button>
                  <button type="button" className={styles.bankCancelBtn} onClick={handleBankCancel}>ยกเลิก</button>
                </div>
              </>
            )}
          </div>
          {showBankConfirm && (
            <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'rgba(0,0,0,0.18)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}}>
              <div style={{background:'#fff',borderRadius:12,padding:'32px 28px',boxShadow:'0 2px 24px #0ea5e955',minWidth:280,maxWidth:360}}>
                <div style={{fontSize:'1.1rem',fontWeight:600,marginBottom:18,color:'#0ea5e9'}}>ยืนยันการบันทึกข้อมูลธนาคาร</div>
                <div style={{marginBottom:24,color:'#334155'}}>คุณต้องการบันทึกข้อมูลธนาคารนี้ใช่หรือไม่?</div>
                <div style={{display:'flex',gap:12,justifyContent:'flex-end'}}>
                  <button type="button" className={styles.bankSaveBtn} onClick={handleBankConfirm}>ตกลง</button>
                  <button type="button" className={styles.bankCancelBtn} onClick={handleBankCancelConfirm}>ยกเลิก</button>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Settings; 