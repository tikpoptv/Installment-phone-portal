// ฟังก์ชันวันที่ global สำหรับโปรเจคนี้ (เวลาประเทศไทย)

/**
 * แปลงวันที่ ISO string เป็น dd/MM/yyyy HH:mm (เวลาท้องถิ่น)
 * ไม่ต้องบวก 7 ชั่วโมง ไม่ต้องสนใจ Z หรือไม่ Z ใดๆ ทั้งสิ้น
 */
export function formatDateThai(dateStr: string | null | undefined): string {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const hour = date.getHours().toString().padStart(2, '0');
  const min = date.getMinutes().toString().padStart(2, '0');
  return `${day}/${month}/${year} ${hour}:${min}`;
}

/**
 * แปลงวันที่ ISO string เป็น dd/MM/yyyy (เวลาท้องถิ่น)
 * ไม่ต้องบวก 7 ชั่วโมง ไม่ต้องสนใจ Z หรือไม่ Z ใดๆ ทั้งสิ้น
 */
export function formatDateShort(dateStr: string | null | undefined): string {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * แปลงวันที่เป็น yyyy-MM-dd (เวลาท้องถิ่น)
 * ไม่ต้องบวก 7 ชั่วโมง ไม่ต้องสนใจ Z หรือไม่ Z ใดๆ ทั้งสิ้น
 */
export function formatDateISO(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${year}-${month}-${day}`;
} 