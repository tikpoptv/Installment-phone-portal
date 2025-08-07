import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ErrorPage from '../ErrorPage';

describe('ErrorPage', () => {
  it('ควรแสดงข้อความหัวข้อหลัก', () => {
    render(<ErrorPage />);
    expect(screen.getByText('เกิดข้อผิดพลาดในการดึงข้อมูล')).toBeInTheDocument();
  });

  it('ควรแสดงข้อความอธิบายปัญหา', () => {
    render(<ErrorPage />);
    expect(screen.getByText(/ขณะนี้ระบบไม่สามารถดึงข้อมูลที่คุณร้องขอได้/)).toBeInTheDocument();
  });

  it('ควรแสดงรายการคำแนะนำ', () => {
    render(<ErrorPage />);
    
    expect(screen.getByText(/ตรวจสอบการเชื่อมต่ออินเทอร์เน็ตของคุณ/)).toBeInTheDocument();
    expect(screen.getByText(/ลองรีเฟรชหน้าเว็บใหม่อีกครั้ง/)).toBeInTheDocument();
    expect(screen.getByText(/หากยังพบปัญหา กรุณาติดต่อผู้ดูแลระบบ/)).toBeInTheDocument();
  });

  it('ควรแสดงข้อความขออภัย', () => {
    render(<ErrorPage />);
    expect(screen.getByText(/ขออภัยในความไม่สะดวก/)).toBeInTheDocument();
  });

  it('ควรมีปุ่มกลับหน้าแรก', () => {
    render(<ErrorPage />);
    const backButton = screen.getByText('กลับหน้าแรก');
    expect(backButton).toBeInTheDocument();
    expect(backButton).toHaveAttribute('href', '/');
  });

  it('ควรมีไอคอน error emoji', () => {
    render(<ErrorPage />);
    expect(screen.getByText('⛔')).toBeInTheDocument();
  });

  it('ควรมีโครงสร้าง DOM ที่ถูกต้อง', () => {
    render(<ErrorPage />);
    
    // ตรวจสอบว่ามี main container
    const mainContainer = screen.getByText('เกิดข้อผิดพลาดในการดึงข้อมูล').closest('div');
    expect(mainContainer).toBeInTheDocument();
    
    // ตรวจสอบว่ามี card container
    const cardContainer = mainContainer?.parentElement;
    expect(cardContainer).toBeInTheDocument();
    
    // ตรวจสอบว่ามี outer container
    const outerContainer = cardContainer?.parentElement;
    expect(outerContainer).toBeInTheDocument();
  });

  it('ควรมี style ที่ถูกต้องสำหรับปุ่มกลับหน้าแรก', () => {
    render(<ErrorPage />);
    const backButton = screen.getByText('กลับหน้าแรก');
    
    expect(backButton).toHaveStyle({
      display: 'inline-block',
      background: 'linear-gradient(90deg, #0ea5e9 0%, #38bdf8 100%)',
      color: '#fff',
      fontWeight: '600',
      borderRadius: '22px',
      padding: '8px 28px',
      fontSize: '1em',
      textDecoration: 'none',
    });
  });
}); 