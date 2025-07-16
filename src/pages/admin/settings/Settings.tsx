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
import { createStoreBankAccount, getStoreBankAccounts, updateStoreBankAccount } from '../../../services/store-bank-account.service';
import type { StoreBankAccountResponse } from '../../../services/store-bank-account.service';
import { authService } from '../../../services/auth/auth.service';

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
  // ลบ bankInfo, setBankInfo, bankDraft, setBankDraft ที่ไม่ได้ใช้แล้ว

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

  const [showCreateBank, setShowCreateBank] = useState(false);
  const [createBankLoading, setCreateBankLoading] = useState(false);
  const [createBankForm, setCreateBankForm] = useState({
    bank_name: '',
    account_number: '',
    promptpay_id: '',
    account_name: '',
    is_default: false,
    remark: '',
  });

  const handleCreateBank = async () => {
    setCreateBankLoading(true);
    try {
      const user = authService.getUser();
      const res = await createStoreBankAccount({
        bank_name: createBankForm.bank_name,
        account_number: createBankForm.account_number,
        promptpay_id: createBankForm.promptpay_id || undefined,
        account_name: createBankForm.account_name,
        is_default: createBankForm.is_default,
        remark: createBankForm.remark || undefined,
        owner_id: user?.id,
      });
      toast.success('สร้างบัญชีธนาคารสำเร็จ (id: ' + res.id + ')');
      setShowCreateBank(false);
      setCreateBankForm({
        bank_name: '',
        account_number: '',
        promptpay_id: '',
        account_name: '',
        is_default: false,
        remark: '',
      });
    } catch (err: unknown) {
      let msg = 'เกิดข้อผิดพลาด';
      if (err && typeof err === 'object') {
        if ('message' in err && typeof (err as { message?: unknown }).message === 'string') {
          msg = (err as { message: string }).message;
        } else if ('error' in err && typeof (err as { error?: unknown }).error === 'string') {
          msg = (err as { error: string }).error;
        } else {
          msg = JSON.stringify(err);
        }
      }
      toast.error(msg);
    } finally {
      setCreateBankLoading(false);
    }
  };

  const [storeBankAccounts, setStoreBankAccounts] = useState<StoreBankAccountResponse[]>([]);
  const [storeBankLoading, setStoreBankLoading] = useState(false);
  const [editingBankId, setEditingBankId] = useState<number|null>(null);
  const [editBankDraft, setEditBankDraft] = useState<Partial<StoreBankAccountResponse>>({});

  useEffect(() => {
    setStoreBankLoading(true);
    getStoreBankAccounts()
      .then(setStoreBankAccounts)
      .catch(err => {
        let msg = 'เกิดข้อผิดพลาด';
        if (err && typeof err === 'object') {
          if ('message' in err && typeof (err as { message?: unknown }).message === 'string') {
            msg = (err as { message: string }).message;
          } else if ('error' in err && typeof (err as { error?: unknown }).error === 'string') {
            msg = (err as { error: string }).error;
          } else {
            msg = JSON.stringify(err);
          }
        }
        toast.error(msg);
      })
      .finally(() => setStoreBankLoading(false));
  }, []);

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

  const handleEditBank = (id: number) => {
    if (currentUser.role !== 'superadmin') {
      window.dispatchEvent(new CustomEvent('no-permission', {
        detail: {
          title: 'ไม่มีสิทธิ์เข้าถึง',
          message: 'คุณไม่มีสิทธิ์แก้ไขบัญชีธนาคารนี้ เฉพาะผู้ใช้ที่มีสิทธิ์ Super Admin เท่านั้น'
        }
      }));
      return;
    }
    const bank = storeBankAccounts.find(b => b.id === id);
    if (bank) {
      setEditingBankId(id);
      setEditBankDraft({ ...bank });
    }
  };
const handleCancelEdit = () => {
  setEditingBankId(null);
  setEditBankDraft({});
};
const handleEditBankField = (field: keyof StoreBankAccountResponse, value: unknown) => {
  // แคสต์ type ตาม field
  let v = value;
  if (field === 'is_default') v = Boolean(value);
  setEditBankDraft(draft => ({ ...draft, [field]: v }));
};
const handleSaveEditBank = async () => {
  if (!editingBankId) return;
  try {
    await updateStoreBankAccount(editingBankId, {
      bank_name: editBankDraft.bank_name!,
      account_number: editBankDraft.account_number!,
      promptpay_id: editBankDraft.promptpay_id,
      account_name: editBankDraft.account_name!,
      owner_id: editBankDraft.owner_id ?? undefined,
      is_default: !!editBankDraft.is_default,
      remark: editBankDraft.remark,
    });
    toast.success('บันทึกข้อมูลบัญชีสำเร็จ');
    setEditingBankId(null);
    setEditBankDraft({});
    // รีเฟรชข้อมูลบัญชีธนาคาร
    getStoreBankAccounts().then(setStoreBankAccounts);
  } catch {
    toast.error('บันทึกข้อมูลบัญชีไม่สำเร็จ');
  }
};

  const currentUser = authService.getUser() as { id?: string; role?: string } || {};

  return (
    <div className={styles.settingsContainer}>
      <Navbar />
      <div className={styles.content}>
        <h1 className={styles.title}>ตั้งค่าแอดมิน</h1>
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
        {/* แทนที่ section ข้อมูลธนาคารเดิมด้วยบัญชีธนาคารร้านค้าทั้งหมด */}
        <section className={styles.bankSection}>
          <h2>บัญชีธนาคารร้านค้า</h2>
          {storeBankLoading ? (
            <div style={{color:'#0ea5e9',fontWeight:600}}>กำลังโหลด...</div>
          ) : storeBankAccounts.length === 0 ? (
            <div style={{color:'#64748b'}}>ไม่พบบัญชีธนาคารร้านค้า</div>
          ) : (
            <div className={styles.bankGrid}>
              {storeBankAccounts.map(acc => (
                <div key={acc.id} className={styles.bankCard + (acc.is_default ? ' ' + styles.default : '')}>
                  {editingBankId === acc.id ? (
                    <>
                      <button
                        type="button"
                        className={styles.editCloseBtn}
                        onClick={handleCancelEdit}
                        aria-label="ยกเลิก"
                        style={{ position: 'absolute', top: 18, right: 18, background: 'none', border: 'none', fontSize: 28, color: '#94a3b8', cursor: 'pointer', zIndex: 2 }}
                      >
                        &#10005;
                      </button>
                      <div style={{ marginBottom: 8 }}>
                        <span className={styles.bankLabel}>ธนาคาร:</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <input
                            type="text"
                            className={styles.bankInput}
                            value={editBankDraft.bank_name || ''}
                            onChange={e => handleEditBankField('bank_name', e.target.value)}
                            disabled={currentUser.role !== 'superadmin'}
                          />
                        </div>
                      </div>
                      <div style={{marginBottom:8}}><span className={styles.bankLabel}>เลขบัญชี:</span> <input type="text" className={styles.bankInput} value={editBankDraft.account_number||''} onChange={e=>handleEditBankField('account_number',e.target.value)} disabled={currentUser.role !== 'superadmin'} /></div>
                      <div style={{marginBottom:8}}><span className={styles.bankLabel}>เลขพร้อมเพย์:</span> <input type="text" className={styles.bankInput} value={editBankDraft.promptpay_id||''} onChange={e=>handleEditBankField('promptpay_id',e.target.value)} disabled={currentUser.role !== 'superadmin'} /></div>
                      <div style={{marginBottom:8}}><span className={styles.bankLabel}>ชื่อบัญชี:</span> <input type="text" className={styles.bankInput} value={editBankDraft.account_name||''} onChange={e=>handleEditBankField('account_name',e.target.value)} disabled={currentUser.role !== 'superadmin'} /></div>
                      <div style={{marginBottom:8}}>
                        <span className={styles.bankLabel}>owner_id:</span>
                        <input
                          type="text"
                          className={styles.bankInput}
                          value={editBankDraft.owner_id||''}
                          readOnly
                          style={{ background: '#f1f5f9', color: '#64748b', cursor: 'not-allowed' }}
                        />
                      </div>
                      <div style={{marginBottom:8}}><span className={styles.bankLabel}>หมายเหตุ:</span> <input type="text" className={styles.bankInput} value={editBankDraft.remark||''} onChange={e=>handleEditBankField('remark',e.target.value)} disabled={currentUser.role !== 'superadmin'} /></div>
                      <div style={{marginBottom:8,display:'flex',alignItems:'center',gap:8}}>
                        <input type="checkbox" checked={!!editBankDraft.is_default} onChange={e=>handleEditBankField('is_default',e.target.checked)} disabled={currentUser.role !== 'superadmin'} />
                        <span className={styles.bankLabel}>บัญชีหลัก</span>
                        {!!editBankDraft.is_default && <span className={styles.bankBadgeInline}>บัญชีหลัก</span>}
                      </div>
                      {currentUser.role === 'superadmin' && (
                        <div className={styles.editActions}>
                          <button type="button" className={styles.editSaveBtn} onClick={handleSaveEditBank}>บันทึก</button>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div style={{marginBottom:8, display:'flex', alignItems:'center', justifyContent:'space-between'}}>
                        <div>
                          <span className={styles.bankLabel}>ธนาคาร:</span>
                          <span className={styles.bankValue}>{acc.bank_name}</span>
                        </div>
                        <div style={{display:'flex',alignItems:'center',gap:8}}>
                          {acc.is_default && <span className={styles.bankBadge}>บัญชีหลัก</span>}
                          {currentUser.role === 'superadmin' && (
                            editingBankId === acc.id ? (
                              <button type="button" className={styles.editCancelBtn} onClick={handleCancelEdit}>ยกเลิก</button>
                            ) : (
                              <button type="button" className={styles.bankEditBtn} onClick={()=>handleEditBank(acc.id)}>
                                แก้ไข
                              </button>
                            )
                          )}
                        </div>
                      </div>
                      <div style={{marginBottom:8}}><span className={styles.bankLabel}>เลขบัญชี:</span> <span className={styles.bankValue}>{acc.account_number}</span></div>
                      <div style={{marginBottom:8}}><span className={styles.bankLabel}>เลขพร้อมเพย์:</span> <span className={styles.bankValue}>{acc.promptpay_id || '-'}</span></div>
                      <div style={{marginBottom:8}}><span className={styles.bankLabel}>ชื่อบัญชี:</span> <span className={styles.bankValue}>{acc.account_name}</span></div>
                      <div style={{marginBottom:8}}><span className={styles.bankLabel}>owner_id:</span> <span className={styles.bankValue}>{acc.owner_id || '-'}</span></div>
                      <div style={{marginBottom:8}}><span className={styles.bankLabel}>หมายเหตุ:</span> <span className={styles.bankValue}>{acc.remark || '-'}</span></div>
                      <div style={{fontSize:'0.92rem',color:'#64748b'}}>สร้างเมื่อ: {new Date(acc.created_at).toLocaleString('th-TH')}</div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
        {/* ปุ่มชั่วคราวสำหรับสร้างบัญชีธนาคารร้านค้า (Superadmin) */}
        <section className={styles.section}>
          <h2>Dev: สร้างบัญชีธนาคารร้านค้า (Superadmin)</h2>
          {!showCreateBank ? (
            <button
              type="button"
              style={{background:'#0ea5e9',color:'#fff',borderRadius:8,padding:'8px 24px',fontWeight:700,boxShadow:'0 1px 8px #bae6fd33',marginBottom:8}}
              onClick={() => {
                if (currentUser.role !== 'superadmin') {
                  window.dispatchEvent(new CustomEvent('no-permission', {
                    detail: {
                      title: 'ไม่มีสิทธิ์เข้าถึง',
                      message: 'คุณไม่มีสิทธิ์สร้างบัญชีธนาคารนี้ เฉพาะผู้ใช้ที่มีสิทธิ์ Super Admin เท่านั้น'
                    }
                  }));
                  return;
                }
                setShowCreateBank(true);
              }}
            >
              + สร้างบัญชีธนาคารร้านค้า
            </button>
          ) : (
            <div style={{background:'#f8fafc',borderRadius:10,padding:18,maxWidth:420,boxShadow:'0 1px 8px #bae6fd33',marginBottom:8}}>
              <div className={`${styles.flexCol} ${styles.gap10}`}>
                <input type="text" placeholder="ชื่อธนาคาร" value={createBankForm.bank_name} onChange={e=>setCreateBankForm(f=>({...f,bank_name:e.target.value}))} className={styles.bankCreateInput} />
                <input type="text" placeholder="เลขที่บัญชี" value={createBankForm.account_number} onChange={e=>setCreateBankForm(f=>({...f,account_number:e.target.value}))} className={styles.bankCreateInput} />
                <input type="text" placeholder="เลขพร้อมเพย์ (ถ้ามี)" value={createBankForm.promptpay_id} onChange={e=>setCreateBankForm(f=>({...f,promptpay_id:e.target.value}))} className={styles.bankCreateInput} />
                <input type="text" placeholder="ชื่อบัญชี" value={createBankForm.account_name} onChange={e=>setCreateBankForm(f=>({...f,account_name:e.target.value}))} className={styles.bankCreateInput} />
                <label className={styles.bankCreateLabel}>
                  <input type="checkbox" checked={createBankForm.is_default} onChange={e=>setCreateBankForm(f=>({...f,is_default:e.target.checked}))} />
                  เป็นบัญชีหลัก (is_default)
                </label>
                <input type="text" placeholder="หมายเหตุ (ถ้ามี)" value={createBankForm.remark} onChange={e=>setCreateBankForm(f=>({...f,remark:e.target.value}))} className={styles.bankCreateInput} />
                <div className={`${styles.bankCreateActions}`}>
                  <button
                    type="button"
                    onClick={() => {
                      if (currentUser.role !== 'superadmin') {
                        window.dispatchEvent(new CustomEvent('no-permission', {
                          detail: {
                            title: 'ไม่มีสิทธิ์เข้าถึง',
                            message: 'คุณไม่มีสิทธิ์สร้างบัญชีธนาคารนี้ เฉพาะผู้ใช้ที่มีสิทธิ์ Super Admin เท่านั้น'
                          }
                        }));
                        return;
                      }
                      handleCreateBank();
                    }}
                    disabled={createBankLoading || !createBankForm.bank_name || !createBankForm.account_number || !createBankForm.account_name}
                    className={styles.bankCreateBtn}
                  >
                    {createBankLoading ? 'กำลังสร้าง...' : 'สร้าง'}
                  </button>
                  <button type="button" onClick={()=>setShowCreateBank(false)} className={styles.bankCreateCancelBtn}>
                    ยกเลิก
                  </button>
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