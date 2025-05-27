import type { FC } from 'react';
import styles from './LoadingPage.module.css';

interface LoadingPageProps {
  text?: string;
}

const LoadingPage: FC<LoadingPageProps> = ({ text = 'กำลังโหลด...' }) => {
  return (
    <div className={styles.loadingPage}>
      <div className={styles.loadingContainer}>
        <div className={styles.logoContainer}>
          <span className={styles.logoIcon}>📱</span>
          <span className={styles.logoText}>Admin Portal</span>
        </div>
        <div className={styles.loadingSpinner} />
        <span className={styles.loadingText}>{text}</span>
      </div>
    </div>
  );
};

export default LoadingPage; 