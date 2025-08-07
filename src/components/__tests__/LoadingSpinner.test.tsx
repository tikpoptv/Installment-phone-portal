import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LoadingSpinner from '../LoadingSpinner';

describe('LoadingSpinner', () => {
  it('ควรแสดงข้อความ "กำลังโหลดข้อมูล..." เป็นค่าเริ่มต้น', () => {
    render(<LoadingSpinner />);
    expect(screen.getByText('กำลังโหลดข้อมูล...')).toBeInTheDocument();
  });

  it('ควรแสดงข้อความที่กำหนดเอง', () => {
    const customText = 'กำลังประมวลผล...';
    render(<LoadingSpinner text={customText} />);
    expect(screen.getByText(customText)).toBeInTheDocument();
  });

  it('ควรใช้ขนาดเริ่มต้น 48px', () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByText('กำลังโหลดข้อมูล...').previousElementSibling;
    expect(spinner).toHaveStyle({ fontSize: '48px' });
  });

  it('ควรใช้ขนาดที่กำหนดเอง', () => {
    const customSize = 32;
    render(<LoadingSpinner size={customSize} />);
    const spinner = screen.getByText('กำลังโหลดข้อมูล...').previousElementSibling;
    expect(spinner).toHaveStyle({ fontSize: `${customSize}px` });
  });

  it('ควรใช้สีเริ่มต้น #0ea5e9', () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByText('กำลังโหลดข้อมูล...').previousElementSibling;
    expect(spinner).toHaveStyle({ color: '#0ea5e9' });
  });

  it('ควรใช้สีที่กำหนดเอง', () => {
    const customColor = '#ff0000';
    render(<LoadingSpinner color={customColor} />);
    const spinner = screen.getByText('กำลังโหลดข้อมูล...').previousElementSibling;
    expect(spinner).toHaveStyle({ color: customColor });
  });

  it('ควรมีโครงสร้าง DOM ที่ถูกต้อง', () => {
    render(<LoadingSpinner />);
    
    // ตรวจสอบว่ามี wrapper div
    const wrapper = screen.getByText('กำลังโหลดข้อมูล...').parentElement;
    expect(wrapper).toBeInTheDocument();
    
    // ตรวจสอบว่ามี spinner icon
    const spinner = screen.getByText('กำลังโหลดข้อมูล...').previousElementSibling;
    expect(spinner).toBeInTheDocument();
    
    // ตรวจสอบว่ามีข้อความ
    const text = screen.getByText('กำลังโหลดข้อมูล...');
    expect(text).toBeInTheDocument();
  });

  it('ควรรวม style ที่กำหนดเองเข้ากับ style เริ่มต้น', () => {
    const customStyle = { marginTop: '10px' };
    render(<LoadingSpinner style={customStyle} />);
    const wrapper = screen.getByText('กำลังโหลดข้อมูล...').parentElement;
    
    // ตรวจสอบว่า style เริ่มต้นยังคงอยู่
    expect(wrapper).toHaveStyle({ 
      textAlign: 'center', 
      padding: '32px',
      color: '#64748b',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '16px'
    });
    
    // ตรวจสอบว่า style ที่กำหนดเองถูกเพิ่มเข้าไป
    expect(wrapper).toHaveStyle({ marginTop: '10px' });
  });
}); 