import React from 'react';
import styles from '../Dashboard.module.css';
import { useNavigate } from 'react-router-dom';

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
}

const InstallmentList = ({ installments }: InstallmentListProps) => {
  const navigate = useNavigate();

  const handleViewDetail = (id: string) => {
    navigate(`/user/contract/${id}`);
  };

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
                  onClick={() => handleViewDetail(item.id)}
                >ดูรายละเอียด</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InstallmentList; 