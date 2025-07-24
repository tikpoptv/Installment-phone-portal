import type { FC } from 'react';
import styles from './Notifications.module.css';
import { useEffect, useState, useRef } from 'react';
import { getAdminNotifications } from '../../../../../services/notification.service';
import type { AdminNotification } from '../../../../../services/notification.service';

const Notifications: FC = () => {
  const [allNotifications, setAllNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const [blinkingIds, setBlinkingIds] = useState<number[]>([]);
  // blink CSS
  const blinkStyle = {
    animation: 'blink-highlight 1.2s linear 0s 2', // 1.2s ต่อรอบ 2 รอบ
    background: 'linear-gradient(90deg,#fef9c3 60%,#e0f2fe 100%)',
    boxShadow: '0 0 0 2px #fde68a',
    transition: 'background 0.5s',
  };
  const blinkKeyframes = `@keyframes blink-highlight { 0%{background:#fef9c3;} 50%{background:#fef08a;} 100%{background:#fff;} }`;

  useEffect(() => {
    // fetch แรก (mount) ให้แสดง loading
    setLoading(true);
    getAdminNotifications()
      .then(data => {
        // หา id ใหม่ที่ยังไม่เคยมี
        setAllNotifications(prev => {
          const prevIds = prev.map(n => n.id);
          const newFetched = data.notifications.filter(n => !prevIds.includes(n.id)).map(n => n.id);
          if (newFetched.length > 0) {
            setBlinkingIds(ids => [...ids, ...newFetched]);
          }
          return data.notifications;
        });
      })
      .catch(() => setError('ไม่สามารถโหลดการแจ้งเตือนได้'))
      .finally(() => setLoading(false));

    // auto-fetch ทุก 10 วิ (ไม่ setLoading)
    intervalRef.current = window.setInterval(() => {
      getAdminNotifications()
        .then(data => {
          setAllNotifications(prev => {
            const prevIds = prev.map(n => n.id);
            const newFetched = data.notifications.filter(n => !prevIds.includes(n.id)).map(n => n.id);
            if (newFetched.length > 0) {
              setBlinkingIds(ids => [...ids, ...newFetched]);
            }
            return data.notifications;
          });
        })
        .catch(() => {});
    }, 10000);
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, []);

  function formatTime(iso: string) {
    if (!iso) return '';
    const date = new Date(iso);
    const now = new Date();
    const diff = (now.getTime() - date.getTime()) / 1000;
    if (diff < 60) return `${Math.floor(diff)} วินาทีที่แล้ว`;
    if (diff < 3600) return `${Math.floor(diff/60)} นาทีที่แล้ว`;
    if (diff < 86400) return `${Math.floor(diff/3600)} ชั่วโมงที่แล้ว`;
    return date.toLocaleString('th-TH');
  }

  const handleOpenModal = () => {
    setModalOpen(true);
    setModalLoading(false);
  };

  // auto-fetch ใน modal รายละเอียดการแจ้งเตือน
  useEffect(() => {
    if (!modalOpen) return;
    // fetch รอบแรกทันที
    let isUnmounted = false;
    const fetchModal = () => {
      getAdminNotifications()
        .then(data => {
          if (!isUnmounted) {
            setAllNotifications(prev => {
              const prevIds = prev.map(n => n.id);
              const newFetched = data.notifications.filter(n => !prevIds.includes(n.id)).map(n => n.id);
              if (newFetched.length > 0) {
                setBlinkingIds(ids => [...ids, ...newFetched]);
                setTimeout(() => {
                  setBlinkingIds(ids => ids.filter(id => !newFetched.includes(id)));
                }, 1200);
              }
              return data.notifications;
            });
          }
        })
        .catch(() => {});
    };
    const interval = window.setInterval(fetchModal, 10000);
    // cleanup
    return () => {
      isUnmounted = true;
      window.clearInterval(interval);
    };
  }, [modalOpen]);

  return (
    <div className={styles.notificationsContainer}>
      <div className={styles.notificationsHeader}>
        <h2 className={styles.notificationsTitle}>การแจ้งเตือน</h2>
        <button className={styles.viewAllButton} onClick={handleOpenModal}>ดูทั้งหมด</button>
      </div>
      <div className={styles.notificationsList}>
        {loading ? (
          <div style={{textAlign:'center',padding:'32px 0'}}>
            <span style={{display:'inline-block'}}>
              <span style={{
                display: 'inline-block',
                width: 32,
                height: 32,
                border: '4px solid',
                borderColor: '#bae6fd #0ea5e9 #0ea5e9 #bae6fd',
                borderRadius: '50%',
                borderTopColor: '#0ea5e9',
                borderBottomColor: '#bae6fd',
                animation: 'spin-gradient 0.8s linear infinite',
                background: 'conic-gradient(from 90deg at 50% 50%, #0ea5e9 0deg, #bae6fd 120deg, #fff 360deg)',
              }} />
            </span>
            <style>{`@keyframes spin-gradient { 100% { transform: rotate(360deg); } }`}</style>
          </div>
        ) : error ? (
          <div style={{textAlign:'center',color:'#ef4444',padding:'32px 0'}}>{error}</div>
        ) : allNotifications.length === 0 ? (
          <div style={{textAlign:'center',color:'#64748b',padding:'32px 0'}}>ไม่มีการแจ้งเตือน</div>
        ) : allNotifications.slice(0, 3).map((notification) => {
            const type = notification.level === 'ERROR' ? 'error' : notification.level === 'WARN' ? 'warning' : 'info';
            const isBlink = blinkingIds.includes(notification.id);
            return (
              <div
                key={notification.id}
                className={`${styles.notificationItem} ${styles[type]}`}
                style={isBlink ? blinkStyle : { background: '#fff' }}
                onAnimationEnd={isBlink ? () => setBlinkingIds(ids => ids.filter(id => id !== notification.id)) : undefined}
              >
                <div className={styles.notificationIcon}>
                  {type === 'error' && (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z" clipRule="evenodd" />
                    </svg>
                  )}
                  {type === 'warning' && (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                    </svg>
                  )}
                  {type === 'info' && (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className={styles.notificationContent}>
                  <h3 className={styles.notificationTitle}>{notification.title}</h3>
                  <p className={styles.notificationMessage}>{notification.description}</p>
                  <span className={styles.notificationTime}>{formatTime(notification.created_at)}</span>
                </div>
              </div>
            );
          })}
      </div>
      {/* Spinner + ข้อความอัปเดตอัตโนมัติด้านล่าง */}
      <div style={{fontSize:'0.98em',color:'#64748b',marginTop:12,display:'flex',alignItems:'center',gap:8,justifyContent:'center'}}>
        <span style={{display:'inline-block',verticalAlign:'middle'}}>
          <span style={{
            display: 'inline-block',
            width: 18,
            height: 18,
            border: '3px solid',
            borderColor: '#bae6fd #0ea5e9 #0ea5e9 #bae6fd',
            borderRadius: '50%',
            borderTopColor: '#0ea5e9',
            borderBottomColor: '#bae6fd',
            animation: 'spin-gradient 0.8s linear infinite',
            background: 'conic-gradient(from 90deg at 50% 50%, #0ea5e9 0deg, #bae6fd 120deg, #fff 360deg)',
            boxShadow: '0 0 6px #bae6fd88',
          }} />
        </span>
        <span>อัปเดตอัตโนมัติทุก 10 วินาที</span>
        <style>{`@keyframes spin-gradient { 100% { transform: rotate(360deg); } }`}</style>
      </div>
      <style>{blinkKeyframes}</style>
      {/* Modal รายละเอียดการแจ้งเตือน */}
      {modalOpen && (
        <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(30,41,59,0.18)',zIndex:2000,display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
          <div style={{background:'#fff',borderRadius:14,boxShadow:'0 12px 48px rgba(14,165,233,0.18)',padding:'40px 56px 32px 56px',minWidth:420,maxWidth:700,width:'100%',maxHeight:'80vh',overflowY:'auto',position:'relative'}}>
            <h3 style={{fontSize:'1.15rem',fontWeight:700,color:'#0ea5e9',marginBottom:18,textAlign:'center'}}>รายละเอียดการแจ้งเตือน</h3>
            {modalLoading ? (
              <div style={{textAlign:'center',color:'#64748b',padding:'32px 0'}}>กำลังโหลด...</div>
            ) : allNotifications.length === 0 ? (
              <div style={{textAlign:'center',color:'#64748b',padding:'32px 0'}}>ไม่มีการแจ้งเตือน</div>
            ) : (
              <div>
                {allNotifications.map((notification) => {
                  const type = notification.level === 'ERROR' ? 'error' : notification.level === 'WARN' ? 'warning' : 'info';
                  const isBlink = blinkingIds.includes(notification.id);
                  return (
                    <div
                      key={notification.id}
                      className={`${styles.notificationItem} ${styles[type]}`}
                      style={isBlink ? { ...blinkStyle, marginBottom: 18 } : { background: '#fff', marginBottom: 18 }}
                      onAnimationEnd={isBlink ? () => setBlinkingIds(ids => ids.filter(id => id !== notification.id)) : undefined}
                    >
                      <div className={styles.notificationIcon}>
                        {type === 'error' && (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z" clipRule="evenodd" />
                          </svg>
                        )}
                        {type === 'warning' && (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                          </svg>
                        )}
                        {type === 'info' && (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <div className={styles.notificationContent}>
                        <h3 className={styles.notificationTitle}>{notification.title}</h3>
                        <p className={styles.notificationMessage}>{notification.description}</p>
                        <span className={styles.notificationTime}>{formatTime(notification.created_at)}</span>
                        {notification.source_file && (
                          <div style={{fontSize:'0.93em',color:'#64748b',marginTop:2,wordBreak:'break-all',overflowWrap:'break-word',maxWidth:'100%',display:'block'}}>
                            <b>ไฟล์:</b> {notification.source_file} <b>บรรทัด:</b> {notification.line_number}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <button style={{background:'#e0f2fe',color:'#0ea5e9',fontWeight:600,border:'none',borderRadius:20,padding:'6px 0',fontSize:'0.93rem',marginTop:18,cursor:'pointer',width:'60%',minWidth:80,maxWidth:120,display:'block',marginLeft:'auto',marginRight:'auto'}} onClick={() => setModalOpen(false)}>ปิด</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications; 