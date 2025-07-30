import type { FC } from 'react';
import styles from './InventoryStatus.module.css';
import { useEffect, useState } from 'react';
import { getStockSummary } from '../../../../../services/products.service';
import type { ProductStockSummaryItem } from '../../../../../services/products.service';

const sortPriority = { error: 0, warning: 1, normal: 2 };

const InventoryStatus: FC = () => {
  const [items, setItems] = useState<ProductStockSummaryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    getStockSummary()
      .then((response) => {
        setItems(response);
        if (response.length === 0) {
          setError('ไม่พบข้อมูลสินค้า');
        }
      })
      .catch((error) => {
        console.error('Error fetching stock summary:', error);
        setError('ไม่สามารถโหลดข้อมูลสถานะสินค้าได้');
        setItems([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // เรียงตาม error > warning > normal
  const sortedItems = [...items].sort((a, b) => sortPriority[a.status] - sortPriority[b.status]);
  const top4 = sortedItems.slice(0, 4);
  const rest = sortedItems.slice(4);
  const alertCount = sortedItems.filter(i => i.status === 'error' || i.status === 'warning').length;

  return (
    <div className={styles.inventoryContainer}>
      <div className={styles.inventoryHeader}>
        <h2 className={styles.inventoryTitle}>สถานะสินค้า</h2>
        <button className={styles.viewAllButton} onClick={() => setModalOpen(true)}>ดูทั้งหมด</button>
      </div>
      {alertCount > 4 && (
        <div className={styles.blinkRed}>
          ⚠️ พบสินค้าหมดหรือใกล้หมดจำนวนมาก! กรุณาเติมสต๊อกโดยด่วน!
        </div>
      )}
      <div className={styles.inventoryList}>
        {loading ? (
          <div style={{textAlign:'center',color:'#64748b',padding:'32px 0'}}>กำลังโหลด...</div>
        ) : error ? (
          <div style={{textAlign:'center',color:'#ef4444',padding:'32px 0'}}>{error}</div>
        ) : items.length === 0 ? (
          <div style={{textAlign:'center',color:'#64748b',padding:'32px 0'}}>ไม่พบข้อมูลสินค้า</div>
        ) : (
          top4.map((item) => (
            <div key={item.id} className={`${styles.inventoryItem} ${styles[item.status]}`}>
              <div className={styles.itemInfo}>
                <h3 className={styles.itemName}>{item.name}</h3>
                <span className={styles.itemStock}>คงเหลือ: {item.stock} ชิ้น</span>
              </div>
              <div className={styles.itemStatus}>
                {item.status === 'warning' && (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={styles.statusIcon}>
                    <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                  </svg>
                )}
                {item.status === 'error' && (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={styles.statusIcon}>
                    <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z" clipRule="evenodd" />
                  </svg>
                )}
                {item.status === 'normal' && (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={styles.statusIcon}>
                    <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      {modalOpen && (
        <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(30,41,59,0.18)',zIndex:2000,display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
          <div style={{background:'#fff',borderRadius:14,boxShadow:'0 12px 48px rgba(14,165,233,0.18)',padding:'40px 40px 32px 40px',minWidth:420,maxWidth:700,width:'100%',maxHeight:'80vh',overflowY:'auto',position:'relative'}}>
            <h3 style={{fontSize:'1.15rem',fontWeight:700,color:'#0ea5e9',marginBottom:18,textAlign:'center'}}>สินค้าทั้งหมด</h3>
            <div>
              {rest.length === 0 ? <div style={{textAlign:'center',color:'#64748b',padding:'24px 0'}}>ไม่มีข้อมูลเพิ่มเติม</div> : rest.map((item) => (
                <div key={item.id} className={`${styles.inventoryItem} ${styles[item.status]}`} style={{marginBottom:8}}>
                  <div className={styles.itemInfo}>
                    <h3 className={styles.itemName}>{item.name}</h3>
                    <span className={styles.itemStock}>คงเหลือ: {item.stock} ชิ้น</span>
                  </div>
                  <div className={styles.itemStatus}>
                    {item.status === 'warning' && (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={styles.statusIcon}>
                        <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                      </svg>
                    )}
                    {item.status === 'error' && (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={styles.statusIcon}>
                        <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z" clipRule="evenodd" />
                      </svg>
                    )}
                    {item.status === 'normal' && (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={styles.statusIcon}>
                        <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <button style={{background:'#e0f2fe',color:'#0ea5e9',fontWeight:600,border:'none',borderRadius:20,padding:'6px 0',fontSize:'0.93rem',marginTop:18,cursor:'pointer',width:'60%',minWidth:80,maxWidth:120,display:'block',marginLeft:'auto',marginRight:'auto'}} onClick={() => setModalOpen(false)}>ปิด</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryStatus; 