import React, { useState } from 'react';
import { createSystemSetting } from '../../../services/system-setting.service';
import type { SystemSetting } from '../../../services/system-setting.service';

const initialState: SystemSetting = {
  key: '',
  value: '',
  value_type: 'string',
  description: '',
  is_active: true,
};

const valueTypeOptions = [
  { value: 'string', label: 'String' },
  { value: 'integer', label: 'Integer' },
  { value: 'decimal', label: 'Decimal' },
  { value: 'boolean', label: 'Boolean' },
  { value: 'date', label: 'Date' },
  { value: 'json', label: 'JSON' },
];

const SystemSettingCreatePage: React.FC = () => {
  const [form, setForm] = useState<SystemSetting>(initialState);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    setError(null);
    try {
      await createSystemSetting(form);
      setSuccess('บันทึกข้อมูลสำเร็จ');
      setForm(initialState);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err && err.response && typeof err.response === 'object' && 'data' in err.response && err.response.data && typeof err.response.data === 'object' && 'message' in err.response.data) {
        setError((err.response as { data?: { message?: string } }).data?.message || 'เกิดข้อผิดพลาด');
      } else {
        setError('เกิดข้อผิดพลาด');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 480, margin: '40px auto', background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px #e0e7ef', padding: 32 }}>
      <h2 style={{ color: '#0ea5e9', textAlign: 'center', marginBottom: 24 }}>สร้าง System Setting</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontWeight: 600 }}>Key</label>
          <input name="key" value={form.key} onChange={handleChange} required style={{ width: '100%', padding: 8, borderRadius: 6, border: '1.5px solid #bae6fd' }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontWeight: 600 }}>Value</label>
          <input name="value" value={form.value} onChange={handleChange} required style={{ width: '100%', padding: 8, borderRadius: 6, border: '1.5px solid #bae6fd' }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontWeight: 600 }}>Value Type</label>
          <select name="value_type" value={form.value_type} onChange={handleChange} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1.5px solid #bae6fd' }}>
            {valueTypeOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontWeight: 600 }}>Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={2} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1.5px solid #bae6fd' }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontWeight: 600 }}>
            <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} style={{ marginRight: 8 }} />
            Active
          </label>
        </div>
        <button type="submit" disabled={loading} style={{ width: '100%', background: '#0ea5e9', color: '#fff', fontWeight: 700, border: 'none', borderRadius: 6, padding: 12, fontSize: 16, cursor: 'pointer' }}>
          {loading ? 'กำลังบันทึก...' : 'บันทึก'}
        </button>
        {success && <div style={{ color: '#10b981', marginTop: 16, textAlign: 'center' }}>{success}</div>}
        {error && <div style={{ color: '#ef4444', marginTop: 16, textAlign: 'center' }}>{error}</div>}
      </form>
    </div>
  );
};

export default SystemSettingCreatePage; 