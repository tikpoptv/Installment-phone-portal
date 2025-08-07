import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import NoPermissionModal from '../NoPermissionModal';

// Mock window.addEventListener และ window.removeEventListener
const originalAddEventListener = window.addEventListener;
const originalRemoveEventListener = window.removeEventListener;

describe('NoPermissionModal', () => {
  const mockAddEventListener = vi.fn();
  const mockRemoveEventListener = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    window.addEventListener = mockAddEventListener;
    window.removeEventListener = mockRemoveEventListener;
  });

  afterEach(() => {
    window.addEventListener = originalAddEventListener;
    window.removeEventListener = originalRemoveEventListener;
  });

  it('ไม่ควรแสดงเมื่อยังไม่ได้รับ event', () => {
    render(<NoPermissionModal />);
    expect(screen.queryByText('ไม่มีสิทธิ์เข้าถึง')).not.toBeInTheDocument();
  });

  it('ควรแสดงเมื่อได้รับ no-permission event', async () => {
    render(<NoPermissionModal />);
    
    // เรียก event handler โดยตรง
    const eventHandler = mockAddEventListener.mock.calls.find(
      call => call[0] === 'no-permission'
    )?.[1];
    
    if (eventHandler) {
      act(() => {
        eventHandler(new CustomEvent('no-permission', {
          detail: {
            message: 'คุณไม่มีสิทธิ์เข้าถึงหน้านี้',
            title: 'ไม่มีสิทธิ์เข้าถึง',
          },
        }));
      });
    }

    await waitFor(() => {
      expect(screen.getByText('ไม่มีสิทธิ์เข้าถึง')).toBeInTheDocument();
    });
    expect(screen.getByText('คุณไม่มีสิทธิ์เข้าถึงหน้านี้')).toBeInTheDocument();
  });

  it('ควรใช้ข้อความเริ่มต้นเมื่อไม่ได้รับ detail', async () => {
    render(<NoPermissionModal />);
    
    const eventHandler = mockAddEventListener.mock.calls.find(
      call => call[0] === 'no-permission'
    )?.[1];
    
    if (eventHandler) {
      act(() => {
        eventHandler(new CustomEvent('no-permission'));
      });
    }

    await waitFor(() => {
      expect(screen.getByText('ไม่มีสิทธิ์เข้าถึง')).toBeInTheDocument();
    });
    expect(screen.getByText('คุณไม่มีสิทธิ์เข้าถึงหน้านี้ เฉพาะผู้ใช้ที่มีสิทธิ์ Super Admin เท่านั้น')).toBeInTheDocument();
  });

  it('ควรแสดงไอคอน warning emoji', async () => {
    render(<NoPermissionModal />);
    
    const eventHandler = mockAddEventListener.mock.calls.find(
      call => call[0] === 'no-permission'
    )?.[1];
    
    if (eventHandler) {
      act(() => {
        eventHandler(new CustomEvent('no-permission'));
      });
    }

    await waitFor(() => {
      expect(screen.getByRole('img', { name: 'warning' })).toBeInTheDocument();
    });
  });

  it('ควรมีปุ่มปิดสองปุ่ม', async () => {
    render(<NoPermissionModal />);
    
    const eventHandler = mockAddEventListener.mock.calls.find(
      call => call[0] === 'no-permission'
    )?.[1];
    
    if (eventHandler) {
      act(() => {
        eventHandler(new CustomEvent('no-permission'));
      });
    }

    await waitFor(() => {
      const closeButtons = screen.getAllByRole('button');
      const closeButtonTexts = closeButtons.filter(button => 
        button.textContent === 'ปิด' || button.getAttribute('aria-label') === 'ปิด'
      );
      expect(closeButtonTexts).toHaveLength(2);
    });
  });

  it('ควรปิด modal เมื่อคลิกปุ่มปิดหลัก', async () => {
    render(<NoPermissionModal />);
    
    const eventHandler = mockAddEventListener.mock.calls.find(
      call => call[0] === 'no-permission'
    )?.[1];
    
    if (eventHandler) {
      act(() => {
        eventHandler(new CustomEvent('no-permission'));
      });
    }

    await waitFor(() => {
      const closeButtons = screen.getAllByRole('button');
      const mainCloseButton = closeButtons.find(button => button.textContent === 'ปิด');
      
      if (mainCloseButton) {
        fireEvent.click(mainCloseButton);
        expect(screen.queryByText('ไม่มีสิทธิ์เข้าถึง')).not.toBeInTheDocument();
      }
    });
  });

  it('ควรปิด modal เมื่อคลิกปุ่มปิดด้านบน', async () => {
    render(<NoPermissionModal />);
    
    const eventHandler = mockAddEventListener.mock.calls.find(
      call => call[0] === 'no-permission'
    )?.[1];
    
    if (eventHandler) {
      act(() => {
        eventHandler(new CustomEvent('no-permission'));
      });
    }

    await waitFor(() => {
      const closeButton = screen.getByLabelText('ปิด');
      fireEvent.click(closeButton);
      expect(screen.queryByText('ไม่มีสิทธิ์เข้าถึง')).not.toBeInTheDocument();
    });
  });

  it('ควรมีโครงสร้าง DOM ที่ถูกต้อง', async () => {
    render(<NoPermissionModal />);
    
    const eventHandler = mockAddEventListener.mock.calls.find(
      call => call[0] === 'no-permission'
    )?.[1];
    
    if (eventHandler) {
      act(() => {
        eventHandler(new CustomEvent('no-permission'));
      });
    }

    await waitFor(() => {
      // ตรวจสอบว่ามี modal overlay
      const modal = screen.getByText('ไม่มีสิทธิ์เข้าถึง').closest('div');
      expect(modal).toBeInTheDocument();
      
      // ตรวจสอบว่ามี modal content
      const modalContent = modal?.parentElement;
      expect(modalContent).toBeInTheDocument();
    });
  });

  it('ควรมี accessibility attributes', async () => {
    render(<NoPermissionModal />);
    
    const eventHandler = mockAddEventListener.mock.calls.find(
      call => call[0] === 'no-permission'
    )?.[1];
    
    if (eventHandler) {
      act(() => {
        eventHandler(new CustomEvent('no-permission'));
      });
    }

    await waitFor(() => {
      const closeButton = screen.getByLabelText('ปิด');
      expect(closeButton).toHaveAttribute('aria-label', 'ปิด');
      
      const emoji = screen.getByRole('img', { name: 'warning' });
      expect(emoji).toHaveAttribute('role', 'img');
      expect(emoji).toHaveAttribute('aria-label', 'warning');
    });
  });

  it('ควรจัดการ custom message และ title', async () => {
    render(<NoPermissionModal />);
    
    const customMessage = 'คุณไม่มีสิทธิ์เข้าถึงฟีเจอร์นี้';
    const customTitle = 'สิทธิ์ไม่เพียงพอ';
    
    const eventHandler = mockAddEventListener.mock.calls.find(
      call => call[0] === 'no-permission'
    )?.[1];
    
    if (eventHandler) {
      act(() => {
        eventHandler(new CustomEvent('no-permission', {
          detail: {
            message: customMessage,
            title: customTitle,
          },
        }));
      });
    }

    await waitFor(() => {
      expect(screen.getByText(customTitle)).toBeInTheDocument();
      expect(screen.getByText(customMessage)).toBeInTheDocument();
    });
  });
}); 