import React from 'react';
import { ImSpinner2 } from 'react-icons/im';
import styles from './LoadingSpinner.module.css';

interface LoadingSpinnerProps {
  text?: string;
  size?: number;
  color?: string;
  style?: React.CSSProperties;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ text = 'กำลังโหลดข้อมูล...', size = 48, color = '#0ea5e9', style }) => (
  <div className={styles.loadingSpinnerWrapper} style={{ textAlign: 'center', padding: 32, color: '#64748b', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, ...style }}>
    <ImSpinner2 className={styles.loadingSpinner} style={{ fontSize: size, color }} />
    <div>{text}</div>
  </div>
);

export default LoadingSpinner; 