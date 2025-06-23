import React from 'react';
import styles from '../Dashboard.module.css';

interface Installment {
  id: string;
  product: string;
  period: string;
  status: string;
  dueDate: string;
  amount: number;
}

interface InstallmentListProps {
  installments: Installment[];
  onViewDetail: (order: Installment) => void;
}

const InstallmentList: React.FC<InstallmentListProps> = ({ installments, onViewDetail }) => {
  return (
    <div className={styles.card}>
      <div className={styles.installmentHeader}>รายการผ่อนของฉัน</div>
      <table className={styles.installmentTable}>
        <thead>
          <tr>
            <th>สินค้า</th>
            <th>งวดที่</th>
            <th>สถานะ</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {installments.map((item) => (
            <tr key={item.id}>
              <td>{item.product}</td>
              <td>{item.period}</td>
              <td>
                <span className={item.status === 'รอชำระ' ? styles.badgeDue : styles.badgePaid}>
                  {item.status}
                </span>
              </td>
              <td className={styles.detailButtonCell}>
                <button
                  className={styles.detailButton}
                  onClick={() => onViewDetail(item)}
                  aria-label="รายละเอียด"
                  type="button"
                >
                  รายละเอียด
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InstallmentList; 