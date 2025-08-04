import React, { useRef, useEffect } from 'react';

interface SignatureModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (base64: string) => void;
  title?: string;
}

const SignatureModal: React.FC<SignatureModalProps> = ({ open, onClose, onSave, title }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (open && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      }
    }
  }, [open]);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    } else {
      return {
        x: (e as React.MouseEvent).clientX - rect.left,
        y: (e as React.MouseEvent).clientY - rect.top,
      };
    }
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    drawing.current = true;
    lastPoint.current = getPos(e);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing.current || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#000000';
    const newPoint = getPos(e);
    if (lastPoint.current) {
      ctx.beginPath();
      ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
      ctx.lineTo(newPoint.x, newPoint.y);
      ctx.stroke();
    }
    lastPoint.current = newPoint;
  };

  const endDraw = () => {
    drawing.current = false;
    lastPoint.current = null;
  };

  const handleSave = () => {
    console.log('handleSave called');
    const canvas = canvasRef.current;
    if (canvas) {
      const base64 = canvas.toDataURL('image/png');
      onSave(base64);
      console.log('Signature saved');
    }
  };

  if (!open) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0,0,0,0.3)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '12px',
        padding: '24px',
        minWidth: 320,
        maxWidth: '90vw',
        boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 12 }}>{title || 'เซ็นลายเซ็น'}</div>
        <canvas
          ref={canvasRef}
          width={320}
          height={120}
          style={{
            border: '1.5px solid #cbd5e1',
            borderRadius: 8,
            background: '#f8fafc',
            touchAction: 'none',
            marginBottom: 16,
            width: 320,
            height: 120,
          }}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
        />
        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <button onClick={onClose} style={{ padding: '6px 16px', background: '#e2e8f0', border: 'none', borderRadius: 6, color: '#64748b', fontWeight: 600, cursor: 'pointer' }}>ยกเลิก</button>
          <button onClick={handleSave} style={{ padding: '6px 16px', background: 'linear-gradient(90deg,#0ea5e9,#38bdf8)', border: 'none', borderRadius: 6, color: '#fff', fontWeight: 600, cursor: 'pointer' }}>ตกลง</button>
        </div>
      </div>
    </div>
  );
};

export default SignatureModal; 