import React, { useState, useEffect } from 'react';
import { putSystemSetting } from '../services/system-setting.service';

type SettingEditValue = string | number | boolean;
interface SingleSetting {
  key: string;
  value: SettingEditValue;
  valueType: 'string' | 'integer' | 'decimal' | 'boolean' | 'date' | 'json';
  description?: string;
}

interface SettingEditModalProps {
  open: boolean;
  onClose: () => void;
  // แบบเดิม (single)
  settingKey?: string;
  value?: SettingEditValue;
  valueType?: 'string' | 'integer' | 'decimal' | 'boolean' | 'date' | 'json';
  description?: string;
  // แบบใหม่ (multi)
  settings?: SingleSetting[];
  onSave?: (newValues: Record<string, SettingEditValue>) => void;
  loading?: boolean;
  error?: string | null;
}

const SettingEditModal: React.FC<SettingEditModalProps> = ({ open, onClose, settingKey, value, valueType, description, settings, onSave, loading, error }) => {
  // ถ้า settings มีหลายค่า ให้ใช้ state เป็น object {key: value}
  const initialForm = settings
    ? settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {} as Record<string, SettingEditValue>)
    : value !== undefined && settingKey ? { [settingKey]: value } : {};
  const [form, setForm] = useState<Record<string, SettingEditValue>>(initialForm);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string|null>(null);

  useEffect(() => {
    setForm(initialForm);
    setErr(null);
    // eslint-disable-next-line
  }, [open, JSON.stringify(settings), value, settingKey]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, key: string) => {
    let v: SettingEditValue;
    if (e.target.type === 'checkbox') {
      v = (e.target as HTMLInputElement).checked;
    } else if (e.target.type === 'number') {
      v = e.target.value === '' ? '' : Number(e.target.value);
    } else {
      v = e.target.value;
    }
    setForm(f => ({ ...f, [key]: v }));
  };

  const handleSave = async () => {
    setSaving(true); setErr(null);
    try {
      if (settings && settings.length > 0) {
        // Multi
        await Promise.all(settings.map(s =>
          putSystemSetting(s.key, {
            key: s.key,
            value: String(form[s.key]),
            value_type: s.valueType,
            description: s.description,
            is_active: true
          })
        ));
        if (onSave) onSave(form);
      } else if (settingKey && valueType) {
        // Single
        await putSystemSetting(settingKey, {
          key: settingKey,
          value: String(form[settingKey]),
          value_type: valueType,
          description,
          is_active: true
        });
        if (onSave) onSave(form);
      }
      onClose();
    } catch {
      setErr('บันทึกไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  // Render input หลายอันถ้า settings มีหลายค่า
  let inputNodes: React.ReactNode = null;
  if (settings && settings.length > 0) {
    inputNodes = settings.map(s => (
      <div key={s.key} style={{marginBottom:18}}>
        <label style={{fontWeight:600}}>{s.description || s.key}</label>
        {s.valueType === 'boolean' ? (
          <input type="checkbox" checked={!!form[s.key]} onChange={e=>handleChange(e,s.key)} />
        ) : (
          <input
            type={s.valueType==='integer'||s.valueType==='decimal'?'number':'text'}
            value={form[s.key] as string|number}
            onChange={e=>handleChange(e,s.key)}
            style={{width:'100%',padding:6,borderRadius:6,border:'1.5px solid #bae6fd',marginTop:2}}
          />
        )}
      </div>
    ));
  } else if (settingKey && valueType) {
    inputNodes = (
      <div style={{marginBottom:18}}>
        <label style={{fontWeight:600}}>{description || settingKey}</label>
        {valueType === 'boolean' ? (
          <input type="checkbox" checked={!!form[settingKey]} onChange={e=>handleChange(e,settingKey)} />
        ) : (
          <input
            type={valueType==='integer'||valueType==='decimal'?'number':'text'}
            value={form[settingKey] as string|number}
            onChange={e=>handleChange(e,settingKey)}
            style={{width:'100%',padding:6,borderRadius:6,border:'1.5px solid #bae6fd',marginTop:2}}
          />
        )}
      </div>
    );
  }

  return (
    <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(30,41,59,0.18)',zIndex:3000,display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{
        background:'#fff',
        borderRadius:14,
        padding:32,
        minWidth:340,
        maxWidth:480,
        width:'100%',
        boxShadow:'0 8px 32px #bae6fd',
        maxHeight:'90vh',
        display:'flex',
        flexDirection:'column',
      }}>
        <h3 style={{color:'#0ea5e9',marginBottom:18}}>แก้ไข Setting</h3>
        <div style={{flex:1,overflowY:'auto',marginBottom:8}}>
          {inputNodes}
        </div>
        {error && <div style={{color:'#ef4444',marginBottom:12}}>{error}</div>}
        {err && <div style={{color:'#ef4444',marginBottom:12}}>{err}</div>}
        <div style={{display:'flex',justifyContent:'flex-end',gap:10,marginTop:8}}>
          <button type="button" onClick={onClose} style={{background:'#e0e7ef',color:'#64748b',border:'none',borderRadius:6,padding:'8px 18px',fontWeight:600,cursor:'pointer'}}>ยกเลิก</button>
          <button type="button" onClick={handleSave} disabled={saving||loading} style={{background:'#0ea5e9',color:'#fff',border:'none',borderRadius:6,padding:'8px 18px',fontWeight:600,cursor:'pointer'}}>{saving||loading?'กำลังบันทึก...':'บันทึก'}</button>
        </div>
      </div>
    </div>
  );
};

export default SettingEditModal; 