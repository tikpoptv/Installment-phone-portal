import type { FC } from 'react';
import styles from './QuickActions.module.css';

interface QuickAction {
  id: number;
  label: string;
  icon: string;
}

const quickActions: QuickAction[] = [
  { id: 1, label: 'เพิ่มลูกค้า', icon: '👤' },
  { id: 2, label: 'เพิ่มสินค้า', icon: '📱' },
  { id: 3, label: 'สร้างคำสั่งซื้อ', icon: '🛒' },
  { id: 4, label: 'รายงาน', icon: '📊' },
];

const QuickActions: FC = () => {
  return (
    <div className={styles.quickActions}>
      {quickActions.map((action) => (
        <button key={action.id} className={styles.quickActionButton}>
          <span className={styles.quickActionIcon}>{action.icon}</span>
          <span className={styles.quickActionLabel}>{action.label}</span>
        </button>
      ))}
    </div>
  );
};

export default QuickActions; 