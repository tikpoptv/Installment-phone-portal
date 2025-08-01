import { useNavigate } from 'react-router-dom';
import styles from './Dashboard.module.css';
import { useState, useEffect } from 'react';
import ContractDetailModal from './ContractDetailModal';
import { getUserContracts, getUserContractDetail, type UserContract, type ContractDetailType } from '../../../services/user/contract.service';
import PaymentModal from './PaymentModal';
import LoadingSpinner from '../../../components/LoadingSpinner';

type UserInfo = {
  id: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  email?: string;
};

function formatDate(dateStr: string) {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('th-TH', { year: '2-digit', month: 'short', day: 'numeric' });
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState<UserContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDetail, setOpenDetail] = useState<ContractDetailType | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [openPayment, setOpenPayment] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);
  const [selectedContractHasEarlyClosure, setSelectedContractHasEarlyClosure] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      setError('กรุณาเข้าสู่ระบบใหม่');
      setLoading(false);
      return;
    }
    const user = JSON.parse(userStr);
    setUserInfo(user);
    const userId = user.id;
    if (!userId) {
      setError('ไม่พบข้อมูลผู้ใช้');
      setLoading(false);
      return;
    }
    getUserContracts(userId)
      .then((data: UserContract[]) => {
        setContracts(data);
        setLoading(false);
      })
      .catch(() => {
        setError('เกิดข้อผิดพลาดในการโหลดข้อมูลสัญญา');
        setLoading(false);
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('expires_in');
    navigate('/user/login');
  };

  const handleShowDetail = async (contractId: string) => {
    try {
      setLoading(true);
      const detail = await getUserContractDetail(contractId);
      setOpenDetail(detail);
      setLoading(false);
    } catch {
      setError('เกิดข้อผิดพลาดในการโหลดรายละเอียดสัญญา');
      setLoading(false);
    }
  };

  return (
    <div className={styles.dashboardContainer}>
      <header className={styles.header}>
        <div className={styles.logo}>Installment Portal</div>
        <button className={styles.logoutBtn} title="ออกจากระบบ" onClick={handleLogout}>ออกจากระบบ</button>
      </header>
      <section className={styles.userCard}>
        <div className={styles.avatar}>{userInfo ? userInfo.first_name[0] : '?'}</div>
        <div className={styles.userInfo}>
          {userInfo && (
            <>
              <div className={styles.userName}>{userInfo.first_name} {userInfo.last_name}</div>
              <div className={styles.userDetail}><b>เบอร์โทร:</b> {userInfo.phone_number}</div>
              <div className={styles.userDetail}><b>อีเมล:</b> {userInfo.email || '-'}</div>
            </>
          )}
        </div>
      </section>
      <section className={styles.installmentList}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '32px 0' }}><LoadingSpinner text="กำลังโหลดข้อมูล..." /></div>
        ) : error ? (
          <div style={{ textAlign: 'center', color: '#ef4444', padding: '32px 0' }}>{error}</div>
        ) : contracts.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#64748b', padding: '32px 0' }}>ไม่พบข้อมูลสัญญา</div>
        ) : contracts.map(contract => {
          // ตรวจสอบว่ามี early_closure discount หรือไม่
          const hasEarlyClosureDiscount = contract.discounts?.some(discount => discount.discount_type === 'early_closure');
          
          return (
            <div className={styles.installmentCard} key={contract.id}>
              <div className={styles.installmentProduct}>📱 {contract.product_name}</div>
              <div className={styles.installmentInfoRow}>
                <span>งวดที่: {contract.current_installment}</span>
                <span className={
                  contract.month_status === 'pending' ? styles.badgeDue :
                  contract.month_status === 'paid' ? styles.badgePaid :
                  contract.month_status === 'overdue' ? styles.badgeOverdue :
                  styles.badgeDue
                }>
                  {contract.month_status === 'pending' ? 'รอชำระ' :
                   contract.month_status === 'paid' ? 'ชำระแล้ว' :
                   contract.month_status === 'overdue' ? 'ค้างชำระ' :
                   'รอชำระ'}
                </span>
              </div>
              {(contract.status === 'processing' || contract.status === 'closed') && (
                <div className={styles.installmentInfoRow}>
                  <span>สถานะสัญญา:</span>
                  <span className={
                    contract.status === 'processing' ? styles.badgeDue :
                    contract.status === 'closed' ? styles.badgeOverdue :
                    styles.badgeDue
                  }>
                    {contract.status === 'processing' ? 'กำลังดำเนินการ' :
                     contract.status === 'closed' ? 'ปิดสัญญา' :
                     contract.status}
                  </span>
                </div>
              )}
              <div className={styles.installmentInfoRow}>
                <span>ครบกำหนด: {formatDate(contract.due_date)}</span>
              </div>
              <div className={styles.installmentInfoRow}>
                <span>วันชำระล่าสุด: {formatDate(contract.last_payment_date)}</span>
              </div>
              <button className={styles.detailBtn} onClick={() => handleShowDetail(contract.id)}>ดูรายละเอียด</button>
              {contract.status !== 'processing' && contract.status !== 'closed' && (
                <button
                  className={styles.detailBtn}
                  style={{ 
                    marginTop: 8, 
                    background: hasEarlyClosureDiscount ? '#f59e0b' : '#22c55e', 
                    color: '#fff' 
                  }}
                  onClick={() => {
                    setSelectedContractId(contract.id);
                    setSelectedContractHasEarlyClosure(hasEarlyClosureDiscount);
                    setOpenPayment(true);
                  }}
                >
                  {hasEarlyClosureDiscount ? 'แจ้งชำระเงิน (ปิดยอด)' : 'แจ้งชำระเงิน'}
                </button>
              )}
            </div>
          );
        })
      }
      </section>
      {openDetail && (
        <ContractDetailModal 
          openDetail={openDetail} 
          onClose={() => setOpenDetail(null)} 
          formatDate={formatDate}
        />
      )}
      <PaymentModal
        contractId={selectedContractId || ''}
        open={openPayment}
        onClose={() => setOpenPayment(false)}
        hasEarlyClosureDiscount={selectedContractHasEarlyClosure}
      />
    </div>
  );
}
 