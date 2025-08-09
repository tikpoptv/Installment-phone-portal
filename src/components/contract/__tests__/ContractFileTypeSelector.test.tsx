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

  it('ควรแสดงตัวเลือกทั้งสามแบบ', () => {
    render(
      <ContractFileTypeSelector 
        selectedType="upload" 
        onTypeChange={mockOnTypeChange} 
      />
    );

    expect(screen.getByText('อัปโหลดไฟล์เอง')).toBeInTheDocument();
    expect(screen.getByText('สร้างไฟล์อัตโนมัติ')).toBeInTheDocument();
    expect(screen.getByText('กรอกเลขคำสั่งซื้อเอง')).toBeInTheDocument();
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
    const manualRadio = screen.getByDisplayValue('manual') as HTMLInputElement;

    expect(uploadRadio.checked).toBe(true);
    expect(autoRadio.checked).toBe(false);
    expect(manualRadio.checked).toBe(false);
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
    const manualRadio = screen.getByDisplayValue('manual') as HTMLInputElement;

    expect(uploadRadio.checked).toBe(false);
    expect(autoRadio.checked).toBe(true);
    expect(manualRadio.checked).toBe(false);
  });

  it('ควรเลือก "manual" เมื่อ selectedType เป็น "manual"', () => {
    render(
      <ContractFileTypeSelector 
        selectedType="manual" 
        onTypeChange={mockOnTypeChange} 
      />
    );

    const uploadRadio = screen.getByDisplayValue('upload') as HTMLInputElement;
    const autoRadio = screen.getByDisplayValue('auto') as HTMLInputElement;
    const manualRadio = screen.getByDisplayValue('manual') as HTMLInputElement;

    expect(uploadRadio.checked).toBe(false);
    expect(autoRadio.checked).toBe(false);
    expect(manualRadio.checked).toBe(true);
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

  it('ควรเรียก onTypeChange เมื่อคลิกที่ตัวเลือก "manual"', () => {
    render(
      <ContractFileTypeSelector 
        selectedType="upload" 
        onTypeChange={mockOnTypeChange} 
      />
    );

    const manualRadio = screen.getByDisplayValue('manual');
    fireEvent.click(manualRadio);

    expect(mockOnTypeChange).toHaveBeenCalledWith('manual');
  });

  it('ควรแสดงคำอธิบายเมื่อเลือก manual type', () => {
    render(
      <ContractFileTypeSelector 
        selectedType="manual" 
        onTypeChange={mockOnTypeChange} 
      />
    );

    expect(screen.getByText('💡 สำหรับกรณี:')).toBeInTheDocument();
    expect(screen.getByText(/ปริ้นเอกสารแล้วเผลอปิดหน้าจอ/)).toBeInTheDocument();
    expect(screen.getByText(/กรอกเลขคำสั่งซื้อที่ได้จากระบบแล้ว/)).toBeInTheDocument();
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
    const manualRadio = screen.getByDisplayValue('manual') as HTMLInputElement;

    expect(uploadRadio.name).toBe('contractFileType');
    expect(autoRadio.name).toBe('contractFileType');
    expect(manualRadio.name).toBe('contractFileType');
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