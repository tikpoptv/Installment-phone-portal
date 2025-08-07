import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ContractFileTypeSelector from '../ContractFileTypeSelector';

describe('ContractFileTypeSelector', () => {
  const mockOnTypeChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('ควรแสดงข้อความหัวข้อและหมายเหตุ', () => {
    render(
      <ContractFileTypeSelector 
        selectedType="upload" 
        onTypeChange={mockOnTypeChange} 
      />
    );

    expect(screen.getByText('ประเภทไฟล์สัญญา')).toBeInTheDocument();
    expect(screen.getByText('⚠️ หมายเหตุ:')).toBeInTheDocument();
    expect(screen.getByText(/การเปลี่ยนหมวดหมู่จะรีเซ็ตไฟล์ของหมวดหมู่เดิม/)).toBeInTheDocument();
    expect(screen.getByText(/กรุณาเลือกหมวดหมู่ที่ต้องการใช้ก่อนดำเนินการ/)).toBeInTheDocument();
  });

  it('ควรแสดงตัวเลือกทั้งสองแบบ', () => {
    render(
      <ContractFileTypeSelector 
        selectedType="upload" 
        onTypeChange={mockOnTypeChange} 
      />
    );

    expect(screen.getByText('อัปโหลดไฟล์เอง')).toBeInTheDocument();
    expect(screen.getByText('สร้างไฟล์อัตโนมัติ')).toBeInTheDocument();
  });

  it('ควรเลือก "upload" เป็นค่าเริ่มต้นเมื่อ selectedType เป็น "upload"', () => {
    render(
      <ContractFileTypeSelector 
        selectedType="upload" 
        onTypeChange={mockOnTypeChange} 
      />
    );

    const uploadRadio = screen.getByDisplayValue('upload') as HTMLInputElement;
    const autoRadio = screen.getByDisplayValue('auto') as HTMLInputElement;

    expect(uploadRadio.checked).toBe(true);
    expect(autoRadio.checked).toBe(false);
  });

  it('ควรเลือก "auto" เมื่อ selectedType เป็น "auto"', () => {
    render(
      <ContractFileTypeSelector 
        selectedType="auto" 
        onTypeChange={mockOnTypeChange} 
      />
    );

    const uploadRadio = screen.getByDisplayValue('upload') as HTMLInputElement;
    const autoRadio = screen.getByDisplayValue('auto') as HTMLInputElement;

    expect(uploadRadio.checked).toBe(false);
    expect(autoRadio.checked).toBe(true);
  });

  it('ควรเรียก onTypeChange เมื่อคลิกที่ตัวเลือก "auto"', () => {
    render(
      <ContractFileTypeSelector 
        selectedType="upload" 
        onTypeChange={mockOnTypeChange} 
      />
    );

    const autoRadio = screen.getByDisplayValue('auto');
    fireEvent.click(autoRadio);

    expect(mockOnTypeChange).toHaveBeenCalledWith('auto');
  });

  it('ควรเรียก onTypeChange เมื่อคลิกที่ตัวเลือก "upload"', () => {
    render(
      <ContractFileTypeSelector 
        selectedType="auto" 
        onTypeChange={mockOnTypeChange} 
      />
    );

    const uploadRadio = screen.getByDisplayValue('upload');
    fireEvent.click(uploadRadio);

    expect(mockOnTypeChange).toHaveBeenCalledWith('upload');
  });

  it('ควรมี radio buttons ที่มี name เดียวกัน', () => {
    render(
      <ContractFileTypeSelector 
        selectedType="upload" 
        onTypeChange={mockOnTypeChange} 
      />
    );

    const uploadRadio = screen.getByDisplayValue('upload') as HTMLInputElement;
    const autoRadio = screen.getByDisplayValue('auto') as HTMLInputElement;

    expect(uploadRadio.name).toBe('contractFileType');
    expect(autoRadio.name).toBe('contractFileType');
  });

  it('ควรมีโครงสร้าง DOM ที่ถูกต้อง', () => {
    render(
      <ContractFileTypeSelector 
        selectedType="upload" 
        onTypeChange={mockOnTypeChange} 
      />
    );

    // ตรวจสอบว่ามี label หลัก
    const mainLabel = screen.getByText('ประเภทไฟล์สัญญา');
    expect(mainLabel).toBeInTheDocument();

    // ตรวจสอบว่ามี warning box
    const warningBox = screen.getByText('⚠️ หมายเหตุ:').closest('div');
    expect(warningBox).toBeInTheDocument();

    // ตรวจสอบว่ามี radio button container
    const radioContainer = screen.getByDisplayValue('upload').closest('div');
    expect(radioContainer).toBeInTheDocument();
  });

  it('ควรมี required indicator', () => {
    render(
      <ContractFileTypeSelector 
        selectedType="upload" 
        onTypeChange={mockOnTypeChange} 
      />
    );

    const requiredSpan = screen.getByText('*');
    expect(requiredSpan).toBeInTheDocument();
  });
}); 