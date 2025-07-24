import type { FC } from 'react';
import styles from './TodoList.module.css';
import { useEffect, useState } from 'react';
import { getAdminTasks } from '../../../../../services/admin.service';
import type { AdminTasksResponse, AdminTaskItem, AdminTaskSummary } from '../../../../../services/admin.service';
// เพิ่ม import PaymentDetailModal
import PaymentDetailModal from '../../../payments/PaymentDetailModal';

// CSS สำหรับแจ้งเตือนกระพริบ
const blinkStyle = {
  animation: 'blink 1.2s linear infinite',
  background: '#fef08a',
  border: '2px solid #facc15',
  color: '#b45309',
  borderRadius: 10,
  padding: '14px 18px',
  marginBottom: 16,
  fontWeight: 600,
  fontSize: '1.02rem',
  boxShadow: '0 2px 12px #fde68a88',
  display: 'flex',
  alignItems: 'center',
  gap: 12,
};

const blinkKeyframes = `@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.45; } }`;

const TASK_TYPE_MAP: Record<string, { title: string; description: string; style: string }> = {
  approve_payment: {
    title: 'รออนุมัติการชำระเงิน',
    description: 'รายการที่รออนุมัติการชำระเงิน',
    style: 'warning',
  },
  verify_identity: {
    title: 'รอยืนยันตัวตนลูกค้า',
    description: 'ลูกค้าที่รอยืนยันตัวตน',
    style: 'info',
  },
  processing_orders: {
    title: 'คำสั่งซื้อผ่อนครบแล้ว',
    description: 'คำสั่งซื้อที่ผ่อนครบ รอดำเนินการต่อ',
    style: 'error',
  },
};

// ฟังก์ชันสร้างลิงก์ detail ตาม type
function getTaskLink(task: AdminTaskItem): string | null {
  switch (task.type) {
    case 'approve_payment':
      return `/admin/payments/${task.link}`;
    case 'verify_identity':
      return `/admin/customers/${task.link}`;
    case 'processing_orders':
      return `/admin/orders/${task.link}`;
    default:
      return null;
  }
}

const TodoList: FC = () => {
  const [summary, setSummary] = useState<AdminTasksResponse['summary']>({} as AdminTaskSummary);
  const [tasks, setTasks] = useState<AdminTaskItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  // เพิ่ม state สำหรับ PaymentDetailModal
  const [showPaymentDetailModal, setShowPaymentDetailModal] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getAdminTasks()
      .then(res => { setSummary(res.summary); setTasks(res.tasks); })
      .catch(() => setError('ไม่สามารถโหลดข้อมูลงานที่ต้องทำได้'))
      .finally(() => setLoading(false));
  }, []);

  const taskTypes = Object.keys(TASK_TYPE_MAP);

  // Group tasks by type
  const groupedTasks: Record<string, AdminTaskItem[]> = {};
  tasks.forEach(task => {
    if (!groupedTasks[task.type]) groupedTasks[task.type] = [];
    groupedTasks[task.type].push(task);
  });

  // เพิ่มแยก remark tasks
  const remarkTasks = tasks.filter(t => t.type === 'remark');

  return (
    <div className={styles.todoContainer}>
      {/* Inject keyframes สำหรับ blink */}
      <style>{blinkKeyframes}</style>
      <div className={styles.todoHeader}>
        <h2 className={styles.todoTitle}>งานที่ต้องทำ</h2>
        <button className={styles.viewAllButton} onClick={() => setModalOpen(true)}>ดูทั้งหมด</button>
      </div>
      <div className={styles.todoList}>
        {loading ? (
          <div style={{textAlign:'center',color:'#64748b',padding:'32px 0'}}>กำลังโหลด...</div>
        ) : error ? (
          <div style={{textAlign:'center',color:'#ef4444',padding:'32px 0'}}>{error}</div>
        ) : (
          taskTypes.map((type) => (
            <div key={type} className={`${styles.todoItem} ${styles[TASK_TYPE_MAP[type].style]}`}>
              <div className={styles.todoInfo}>
                <h3 className={styles.todoItemTitle}>{TASK_TYPE_MAP[type].title}</h3>
                <p className={styles.todoDescription}>{TASK_TYPE_MAP[type].description}</p>
              </div>
              <div className={styles.todoCount}>
                <span className={styles.countBadge}>{summary[type] ?? 0}</span>
              </div>
            </div>
          ))
        )}
      </div>
      {modalOpen && (
        <div className={styles.todoModalOverlay}>
          <div className={styles.todoModalContent}>
            <h3 className={styles.todoModalTitle}>รายละเอียดงานที่ต้องทำ</h3>
            <div>
              {taskTypes.map(type => (
                groupedTasks[type] && groupedTasks[type].length > 0 && (
                  <div key={type} style={{ marginBottom: 32 }}>
                    <div className={styles.todoModalSectionTitle}>
                      {TASK_TYPE_MAP[type]?.title || type}
                    </div>
                    {/* แสดง remark เฉพาะของหมวดนี้ */}
                    {remarkTasks
                      .filter(r => r.id.includes(type.replace('_', '-')))
                      .map(task => (
                        <div key={task.id} style={blinkStyle}>
                          <span style={{ fontSize: '1.25em', marginRight: 8 }}>⚠️</span>
                          <span>
                            <b>{task.title}</b>
                            <span
                              style={{
                                display: 'block',
                                fontWeight: 400,
                                fontSize: '0.98em',
                                color: '#b45309',
                                marginTop: 2,
                              }}
                            >
                              {task.description}
                            </span>
                          </span>
                        </div>
                      ))}
                    <div className={styles.todoModalTableWrapper}>
                      <table className={styles.todoModalTable}>
                        <thead>
                          <tr style={{ background: '#f1f5f9' }}>
                            <th className={styles.todoModalTh}>หัวข้อ</th>
                            <th className={styles.todoModalTh}>รายละเอียด</th>
                            <th className={styles.todoModalTh}>วันที่สร้าง</th>
                            <th className={styles.todoModalTh}>ลิงก์</th>
                          </tr>
                        </thead>
                        <tbody>
                          {groupedTasks[type].map(task => (
                            <tr key={task.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                              <td className={`${styles.todoModalTd} ${styles.todoModalTdTitle}`}>{task.title}</td>
                              <td className={`${styles.todoModalTd} ${styles.todoModalTdDesc}`}>{task.description}</td>
                              <td className={`${styles.todoModalTd} ${styles.todoModalTdDate}`}>{new Date(task.created_at).toLocaleString('th-TH')}</td>
                              <td className={styles.todoModalTd}>
                                {task.type === 'approve_payment' ? (
                                  <button
                                    className={styles.todoModalLinkBtn}
                                    onClick={() => {
                                      setSelectedPaymentId(task.link ?? null);
                                      setShowPaymentDetailModal(true);
                                    }}
                                  >
                                    รายละเอียด
                                  </button>
                                ) : getTaskLink(task) ? (
                                  <a
                                    href={getTaskLink(task)!}
                                    className={styles.todoModalLinkA}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    รายละเอียด
                                  </a>
                                ) : (
                                  '-'
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )
              ))}
              {tasks.length === 0 && (
                <div style={{ textAlign: 'center', color: '#64748b', padding: '24px 0' }}>
                  ไม่มีงานที่ต้องทำ
                </div>
              )}
            </div>
            <button
              className={styles.todoModalCloseBtn}
              onClick={() => setModalOpen(false)}
            >
              ปิด
            </button>
          </div>
        </div>
      )}
      {/* Modal สำหรับรายละเอียดการชำระเงิน */}
      <PaymentDetailModal
        open={showPaymentDetailModal}
        paymentId={selectedPaymentId}
        onClose={() => setShowPaymentDetailModal(false)}
      />
    </div>
  );
};

export default TodoList; 