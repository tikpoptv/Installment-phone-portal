import { describe, it, expect } from 'vitest';
import { formatDateThai, formatDateShort, formatDateISO } from '../date';

describe('Date Utils', () => {
  describe('formatDateThai', () => {
    it('ควรแปลงวันที่ ISO string เป็นรูปแบบ dd/MM/yyyy HH:mm', () => {
      // ใช้วันที่ที่ไม่มี timezone offset
      const testDate = '2024-01-15T10:30:00';
      const result = formatDateThai(testDate);
      expect(result).toBe('15/01/2024 10:30');
    });

    it('ควรคืนค่า "-" เมื่อได้รับ null', () => {
      const result = formatDateThai(null);
      expect(result).toBe('-');
    });

    it('ควรคืนค่า "-" เมื่อได้รับ undefined', () => {
      const result = formatDateThai(undefined);
      expect(result).toBe('-');
    });

    it('ควรคืนค่า "-" เมื่อได้รับ empty string', () => {
      const result = formatDateThai('');
      expect(result).toBe('-');
    });

    it('ควรจัดการกับวันที่ที่มีเวลาเที่ยงคืน', () => {
      const testDate = '2024-12-31T00:00:00';
      const result = formatDateThai(testDate);
      expect(result).toBe('31/12/2024 00:00');
    });

    it('ควรจัดการกับวันที่ที่มีเวลาสุดท้ายของวัน', () => {
      const testDate = '2024-06-15T23:59:59';
      const result = formatDateThai(testDate);
      expect(result).toBe('15/06/2024 23:59');
    });
  });

  describe('formatDateShort', () => {
    it('ควรแปลงวันที่ ISO string เป็นรูปแบบ dd/MM/yyyy', () => {
      const testDate = '2024-01-15T10:30:00';
      const result = formatDateShort(testDate);
      expect(result).toBe('15/01/2024');
    });

    it('ควรคืนค่า "-" เมื่อได้รับ null', () => {
      const result = formatDateShort(null);
      expect(result).toBe('-');
    });

    it('ควรคืนค่า "-" เมื่อได้รับ undefined', () => {
      const result = formatDateShort(undefined);
      expect(result).toBe('-');
    });

    it('ควรคืนค่า "-" เมื่อได้รับ empty string', () => {
      const result = formatDateShort('');
      expect(result).toBe('-');
    });

    it('ควรจัดการกับวันที่ที่มีเดือนเดียวหลัก', () => {
      const testDate = '2024-02-05T10:30:00';
      const result = formatDateShort(testDate);
      expect(result).toBe('05/02/2024');
    });

    it('ควรจัดการกับวันที่ที่มีวันเดียวหลัก', () => {
      const testDate = '2024-12-05T10:30:00';
      const result = formatDateShort(testDate);
      expect(result).toBe('05/12/2024');
    });
  });

  describe('formatDateISO', () => {
    it('ควรแปลงวันที่ ISO string เป็นรูปแบบ yyyy-MM-dd', () => {
      const testDate = '2024-01-15T10:30:00';
      const result = formatDateISO(testDate);
      expect(result).toBe('2024-01-15');
    });

    it('ควรคืนค่า empty string เมื่อได้รับ null', () => {
      const result = formatDateISO(null);
      expect(result).toBe('');
    });

    it('ควรคืนค่า empty string เมื่อได้รับ undefined', () => {
      const result = formatDateISO(undefined);
      expect(result).toBe('');
    });

    it('ควรคืนค่า empty string เมื่อได้รับ empty string', () => {
      const result = formatDateISO('');
      expect(result).toBe('');
    });

    it('ควรจัดการกับวันที่ที่มีเดือนเดียวหลัก', () => {
      const testDate = '2024-02-05T10:30:00';
      const result = formatDateISO(testDate);
      expect(result).toBe('2024-02-05');
    });

    it('ควรจัดการกับวันที่ที่มีวันเดียวหลัก', () => {
      const testDate = '2024-12-05T10:30:00';
      const result = formatDateISO(testDate);
      expect(result).toBe('2024-12-05');
    });

    it('ควรจัดการกับวันที่ที่มีปีที่แตกต่าง', () => {
      const testDate = '2023-06-20T10:30:00';
      const result = formatDateISO(testDate);
      expect(result).toBe('2023-06-20');
    });
  });
}); 