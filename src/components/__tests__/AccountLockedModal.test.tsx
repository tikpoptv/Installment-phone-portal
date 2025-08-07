import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AccountLockedModal from '../AccountLockedModal';

describe('AccountLockedModal', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('ไม่ควรแสดงเมื่อ open เป็น false', () => {
    render(<AccountLockedModal open={false} onClose={mockOnClose} />);
    expect(screen.queryByText('บัญชีนี้ถูกล็อก')).not.toBeInTheDocument();
  });

  it('ควรแสดงเมื่อ open เป็น true', () => {
    render(<AccountLockedModal open={true} onClose={mockOnClose} />);
    expect(screen.getByText('บัญชีนี้ถูกล็อก')).toBeInTheDocument();
  });

  it('ควรแสดงข้อความที่ถูกต้อง', () => {
    render(<AccountLockedModal open={true} onClose={mockOnClose} />);
    
    expect(screen.getByText('บัญชีนี้ถูกล็อก')).toBeInTheDocument();
    expect(screen.getByText('กรุณาติดต่อผู้ดูแลระบบเพื่อปลดล็อกบัญชีนี้')).toBeInTheDocument();
    expect(screen.getByText('ปิด')).toBeInTheDocument();
  });

  it('ควรแสดงไอคอน locked emoji', () => {
    render(<AccountLockedModal open={true} onClose={mockOnClose} />);
    expect(screen.getByRole('img', { name: 'locked' })).toBeInTheDocument();
  });

  it('ควรมีปุ่มปิดสองปุ่ม', () => {
    render(<AccountLockedModal open={true} onClose={mockOnClose} />);
    
    const closeButtons = screen.getAllByRole('button');
    const closeButtonTexts = closeButtons.filter(button => 
      button.textContent === 'ปิด' || button.getAttribute('aria-label') === 'ปิด'
    );
    expect(closeButtonTexts).toHaveLength(2);
  });

  it('ควรเรียก onClose เมื่อคลิกปุ่มปิดหลัก', () => {
    render(<AccountLockedModal open={true} onClose={mockOnClose} />);
    
    const closeButtons = screen.getAllByRole('button');
    const mainCloseButton = closeButtons.find(button => button.textContent === 'ปิด');
    
    if (mainCloseButton) {
      fireEvent.click(mainCloseButton);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    }
  });

  it('ควรเรียก onClose เมื่อคลิกปุ่มปิดด้านบน', () => {
    render(<AccountLockedModal open={true} onClose={mockOnClose} />);
    
    const closeButton = screen.getByLabelText('ปิด');
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('ควรมีโครงสร้าง DOM ที่ถูกต้อง', () => {
    render(<AccountLockedModal open={true} onClose={mockOnClose} />);
    
    // ตรวจสอบว่ามี modal overlay
    const modal = screen.getByText('บัญชีนี้ถูกล็อก').closest('div');
    expect(modal).toBeInTheDocument();
    
    // ตรวจสอบว่ามี modal content
    const modalContent = modal?.parentElement;
    expect(modalContent).toBeInTheDocument();
  });

  it('ควรมี accessibility attributes', () => {
    render(<AccountLockedModal open={true} onClose={mockOnClose} />);
    
    const closeButton = screen.getByLabelText('ปิด');
    expect(closeButton).toHaveAttribute('aria-label', 'ปิด');
    
    const emoji = screen.getByRole('img', { name: 'locked' });
    expect(emoji).toHaveAttribute('role', 'img');
    expect(emoji).toHaveAttribute('aria-label', 'locked');
  });
}); 