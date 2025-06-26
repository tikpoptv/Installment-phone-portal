import React, { useState, useEffect } from 'react';
import { FaPencilAlt } from 'react-icons/fa';
import { getPhoneModels, createPhoneModel, updatePhoneModel } from '../../../services/phone-model.service';
import type { PhoneModel } from '../../../services/phone-model.service';

interface PhoneModelModalProps {
  open: boolean;
  onClose: () => void;
  onAdd?: (model: PhoneModel) => void;
}

const PhoneModelModal: React.FC<PhoneModelModalProps> = ({ open, onClose, onAdd }) => {
  const [models, setModels] = useState<PhoneModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [newModel, setNewModel] = useState('');
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editing, setEditing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingEditModel, setPendingEditModel] = useState<PhoneModel | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError(null);
    getPhoneModels()
      .then(data => setModels(data))
      .catch(() => setError('เกิดข้อผิดพลาดในการโหลดรายการรุ่นมือถือ'))
      .finally(() => setLoading(false));
  }, [open]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!newModel.trim()) {
      setError('กรุณากรอกชื่อรุ่นมือถือ');
      return;
    }
    if (models.some(m => m.model_name.trim() === newModel.trim())) {
      setError('มีชื่อรุ่นนี้อยู่แล้ว');
      return;
    }
    setAdding(true);
    try {
      const newItem = await createPhoneModel(newModel.trim());
      setModels([newItem, ...models]);
      setSuccess('เพิ่มรุ่นใหม่สำเร็จ');
      setNewModel('');
      if (onAdd) onAdd(newItem);
    } catch (err: unknown) {
      setError((err as Error)?.message || 'เกิดข้อผิดพลาดในการเพิ่มรุ่น');
    } finally {
      setAdding(false);
    }
  };

  const handleEditClick = (model: PhoneModel) => {
    setEditId(model.id);
    setEditValue(model.model_name);
    setError(null);
    setSuccess(null);
  };

  const handleEditCancel = () => {
    setEditId(null);
    setEditValue('');
  };

  const handleEditSave = async (model: PhoneModel) => {
    if (!editValue.trim()) {
      setError('กรุณากรอกชื่อรุ่นมือถือ');
      return;
    }
    if (models.some(m => m.model_name.trim() === editValue.trim() && m.id !== model.id)) {
      setError('มีชื่อรุ่นนี้อยู่แล้ว');
      return;
    }
    setPendingEditModel(model);
    setShowConfirm(true);
  };

  const handleConfirmEdit = async () => {
    if (!pendingEditModel) return;
    setEditing(true);
    setError(null);
    setSuccess(null);
    setShowConfirm(false);
    try {
      const updated = await updatePhoneModel(pendingEditModel.id, editValue.trim());
      setModels(prev => prev.map(m => m.id === pendingEditModel.id ? { ...m, model_name: updated.model_name } : m));
      setSuccess('แก้ไขชื่อรุ่นสำเร็จ');
      setEditId(null);
      setEditValue('');
    } catch (err: unknown) {
      setError((err as Error)?.message || 'เกิดข้อผิดพลาดในการแก้ไขชื่อรุ่น');
    } finally {
      setEditing(false);
      setPendingEditModel(null);
    }
  };

  const handleCancelConfirm = () => {
    setShowConfirm(false);
    setPendingEditModel(null);
  };

  if (!open) return null;
  return (
    <>
      <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'rgba(30,41,59,0.22)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center',padding:24,backdropFilter:'blur(1.5px)'}}>
        <div
          style={{
            background: '#fff',
            borderRadius: 24,
            boxShadow: '0 12px 48px rgba(14,165,233,0.16), 0 1.5px 8px #e0e7ef',
            border: '1.5px solid #e0e7ef',
            minWidth: 340,
            maxWidth: 520,
            width: '100%',
            padding: '38px 32px 30px 32px',
            position: 'relative',
            maxHeight: '90vh',
            overflowY: 'auto',
            ...(window.innerWidth <= 600 ? {
              minWidth: 'unset',
              maxWidth: '99vw',
              padding: '18px 6vw',
              borderRadius: 14,
            } : {}),
            ...(window.innerWidth <= 420 ? {
              minWidth: 'unset',
              maxWidth: '99vw',
              padding: '8px 2vw',
              borderRadius: 8,
            } : {}),
          }}
        >
          <button onClick={onClose} style={{position:'absolute',top:14,right:14,background:'none',border:'none',fontSize:26,color:'#64748b',cursor:'pointer',borderRadius:'50%',width:32,height:32,display:'flex',alignItems:'center',justifyContent:'center',transition:'background 0.18s'}} aria-label="ปิด">×</button>
          <h2 style={{color:'#0ea5e9',fontSize:'1.3rem',fontWeight:800,textAlign:'center',marginBottom:18,letterSpacing:0.2}}>จัดการรุ่นมือถือ</h2>
          <form onSubmit={handleAdd} style={{display:'flex',gap:8,marginBottom:18}}>
            <input value={newModel} onChange={e=>setNewModel(e.target.value)} placeholder="เพิ่มชื่อรุ่นใหม่..." style={{flex:1,padding:'10px 12px',border:'1.5px solid #e5e7eb',borderRadius:8,fontSize:'1.05rem',background:'#f8fafc'}} disabled={adding} />
            <button type="submit" style={{background:'#0ea5e9',color:'#fff',border:'none',borderRadius:8,padding:'0 18px',fontWeight:700,fontSize:'1.1rem',cursor:'pointer',transition:'background 0.18s',boxShadow:'0 1px 4px #bae6fd',height:40}} disabled={adding}>{adding ? '...' : 'เพิ่ม'}</button>
          </form>
          {error && <div style={{color:'#ef4444',marginBottom:8,fontWeight:600}}>{error}</div>}
          {success && <div style={{color:'#22c55e',marginBottom:8,fontWeight:600}}>{success}</div>}
          <div style={{maxHeight:260,overflowY:'auto',border:'1.2px solid #e5e7eb',borderRadius:10,padding:8,background:'#f8fafc'}}>
            {loading ? (
              <div style={{textAlign:'center',color:'#0ea5e9',padding:'18px 0'}}>กำลังโหลด...</div>
            ) : models.length === 0 ? (
              <div style={{textAlign:'center',color:'#64748b',padding:'18px 0'}}>ยังไม่มีรุ่นมือถือ</div>
            ) : (
              <ul style={{listStyle:'none',margin:0,padding:0}}>
                {models.map(m => (
                  <li key={m.id} style={{padding:'7px 0',borderBottom:'1px solid #e5e7eb',display:'flex',alignItems:'center',gap:8}}>
                    <span style={{fontWeight:600,color:'#0ea5e9',minWidth:60,display:'inline-block'}}>{m.id}</span>
                    {editId === m.id ? (
                      <>
                        <input value={editValue} onChange={e=>setEditValue(e.target.value)} disabled={editing} style={{flex:1,padding:'6px 8px',border:'1.2px solid #e5e7eb',borderRadius:6,fontSize:'1rem',background:'#fff'}} />
                        <button onClick={()=>handleEditSave(m)} disabled={editing} style={{background:'#0ea5e9',color:'#fff',border:'none',borderRadius:6,padding:'0 10px',fontWeight:700,fontSize:'1rem',cursor:'pointer',marginLeft:2}}>{editing ? '...' : 'บันทึก'}</button>
                        <button onClick={handleEditCancel} disabled={editing} style={{background:'#e0e7ef',color:'#64748b',border:'none',borderRadius:6,padding:'0 10px',fontWeight:700,fontSize:'1rem',cursor:'pointer',marginLeft:2}}>ยกเลิก</button>
                      </>
                    ) : (
                      <>
                        <span style={{flex:1}}>{m.model_name}</span>
                        <span style={{color:'#64748b',fontSize:'0.93em'}}>{new Date(m.created_at).toLocaleDateString('th-TH')}</span>
                        <button onClick={()=>handleEditClick(m)} style={{background:'#f1f5f9',color:'#0ea5e9',border:'none',borderRadius:6,padding:'0 10px',fontWeight:700,fontSize:'1rem',cursor:'pointer',marginLeft:2}}><FaPencilAlt style={{marginRight:4}} /> แก้ไข</button>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button onClick={onClose} style={{marginTop:18,background:'#e0e7ef',color:'#0ea5e9',border:'none',borderRadius:8,padding:'10px 0',fontWeight:700,fontSize:'1.08rem',cursor:'pointer',width:'100%',transition:'background 0.18s'}}>ปิด</button>
        </div>
      </div>
      {showConfirm && (
        <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'rgba(30,41,59,0.32)',zIndex:10000,display:'flex',alignItems:'center',justifyContent:'center',padding:24,backdropFilter:'blur(2px)'}}>
          <div style={{background:'#fff',borderRadius:18,boxShadow:'0 8px 32px #bae6fd',padding:'32px 24px',maxWidth:340,width:'100%',textAlign:'center',position:'relative'}}>
            <div style={{fontSize:38,color:'#f59e42',marginBottom:12}}>⚠️</div>
            <div style={{fontWeight:700,fontSize:'1.13rem',color:'#0ea5e9',marginBottom:10}}>ยืนยันการแก้ไขชื่อรุ่นมือถือ</div>
            <div style={{color:'#334155',fontSize:'1.01rem',marginBottom:18,lineHeight:1.6}}>
              คุณแน่ใจหรือไม่ว่าต้องการแก้ไขชื่อรุ่นมือถือ?<br/>
              <span style={{color:'#f59e42',fontWeight:600}}>การเปลี่ยนชื่อรุ่นอาจส่งผลกระทบกับข้อมูลสินค้าที่ใช้รุ่นนี้อยู่</span><br/>
              <span style={{color:'#64748b'}}>โปรดตรวจสอบให้แน่ใจก่อนดำเนินการต่อ</span>
            </div>
            <div style={{display:'flex',gap:14,justifyContent:'center',marginTop:10}}>
              <button onClick={handleConfirmEdit} style={{background:'#0ea5e9',color:'#fff',border:'none',borderRadius:8,padding:'10px 28px',fontWeight:700,fontSize:'1.08rem',cursor:'pointer',boxShadow:'0 1px 8px #bae6fd',transition:'background 0.18s'}}>ยืนยัน</button>
              <button onClick={handleCancelConfirm} style={{background:'#e0e7ef',color:'#64748b',border:'none',borderRadius:8,padding:'10px 28px',fontWeight:700,fontSize:'1.08rem',cursor:'pointer',transition:'background 0.18s'}}>ยกเลิก</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PhoneModelModal; 