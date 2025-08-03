import type { FC } from 'react';
import styles from './QuickActions.module.css';

interface QuickAction {
  id: number;
  label: string;
  icon: string;
}

const quickActions: QuickAction[] = [
  { id: 1, label: 'ยืนยันตัวตนลูกค้า', icon: '👤' },
  { id: 2, label: 'เพิ่มสินค้า', icon: '📱' },
  { id: 3, label: 'สร้างคำสั่งซื้อ', icon: '🛒' },
  { id: 4, label: 'รายงาน', icon: '📊' },
];

const QuickActions: FC<{
  onVerifyClick?: () => void;
  onAddProductClick?: () => void;
  onCreateOrderClick?: () => void;
  onReportClick?: () => void;
}> = ({ onVerifyClick, onAddProductClick, onCreateOrderClick, onReportClick }) => {
  return (
    <div className={styles.quickActions}>
      {quickActions.map((action) => {
        let onClick;
        if (action.label === 'ยืนยันตัวตนลูกค้า' && onVerifyClick) onClick = onVerifyClick;
        else if (action.label === 'เพิ่มสินค้า' && onAddProductClick) onClick = onAddProductClick;
        else if (action.label === 'สร้างคำสั่งซื้อ' && onCreateOrderClick) onClick = onCreateOrderClick;
        else if (action.label === 'รายงาน' && onReportClick) onClick = onReportClick;
        return (
          <button
            key={action.id}
            className={styles.quickActionButton}
            onClick={onClick}
          >
            <span className={styles.quickActionIcon}>{action.icon}</span>
            <span className={styles.quickActionLabel}>{action.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default QuickActions; 