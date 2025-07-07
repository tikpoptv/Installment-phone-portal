import React, { useState } from 'react';
import styles from './IcloudLockModal.module.css';
import type { IcloudCredential } from '../../../services/icloud.service';
import IcloudCreateModal from '../icloud/IcloudCreateModal';
import { getIcloudCredentials } from '../../../services/icloud.service';
import { bindIcloudCredentialToProduct } from '../../../services/products.service';
import { toast } from 'react-toastify';

interface Props {
  open: boolean;
  productId: string;
  productImei: string;
  icloudList: IcloudCredential[];
  onClose: () => void;
  onConfirm: (icloudId: string) => void;
  onReloadIcloudList?: () => void;
}

const IcloudLockModal: React.FC<Props> = ({ open, productId, productImei, icloudList, onClose, onConfirm, onReloadIcloudList }) => {
  const customerIclouds = icloudList.filter(i => i.owner_type === 'customer');
  const storeIclouds = icloudList.filter(i => i.owner_type === 'store');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [customerQuery, setCustomerQuery] = useState('');
  const [showCustomerList, setShowCustomerList] = useState(false);
  const customerInputRef = React.useRef<HTMLInputElement | null>(null);
  const filteredCustomers = customerIclouds.filter(i =>
    (i.icloud_username + ' ' + i.id).toLowerCase().includes(customerQuery.toLowerCase())
  );
  const [storeQuery, setStoreQuery] = useState('');
  const [showStoreList, setShowStoreList] = useState(false);
  const storeInputRef = React.useRef<HTMLInputElement | null>(null);
  const filteredStores = storeIclouds.filter(i =>
    (i.icloud_username + ' ' + i.id).toLowerCase().includes(storeQuery.toLowerCase())
  );

  function extractId(str: string) {
    const match = str.match(/\(ID: ([^)]+)\)$/);
    return match ? match[1] : '';
  }
  const customerId = extractId(customerQuery);
  const storeId = extractId(storeQuery);
  const isValidCustomer = customerIclouds.some(i => i.id === customerId);
  const isValidStore = storeIclouds.some(i => i.id === storeId);

  if (!open) return null;
  return (
    <div className={styles.overlay}>
      <div className={styles.modalBox} style={{ width: 520 }}>
        <div className={styles.title}>เชื่อมโยงกับบัญชี iCloud</div>
        <div className={styles.msg}>
          กรุณาเลือกบัญชี iCloud ที่ต้องการเชื่อมโยงกับสินค้านี้ (IMEI: <b>{productImei}</b>)
        </div>
        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>บัญชีลูกค้า</div>
            <input
              type="search"
              value={customerQuery}
              onChange={e => {
                setCustomerQuery(e.target.value);
                setShowCustomerList(true);
              }}
              onFocus={() => setShowCustomerList(true)}
              onBlur={() => setTimeout(() => setShowCustomerList(false), 120)}
              ref={customerInputRef}
              className={styles.select}
              placeholder="ค้นหาอีเมล/ID ลูกค้า..."
              style={{ width: '100%', marginBottom: 0 }}
            />
            {showCustomerList && (
              <div style={{
                position: 'absolute',
                top: '100%', left: 0, right: 0, zIndex: 20,
                background: '#fff', border: '1.5px solid #bae6fd', borderRadius: 8,
                boxShadow: '0 2px 12px #bae6fd22',
                maxHeight: 220, overflowY: 'auto', marginTop: 2
              }}>
                {filteredCustomers.length > 0 ? filteredCustomers.map(i => (
                  <div
                    key={i.id}
                    style={{ padding: '10px 14px', cursor: 'pointer', color: '#0ea5e9', fontWeight: 500 }}
                    onMouseDown={() => {
                      setCustomerQuery(`${i.icloud_username} (ID: ${i.id})`);
                      setShowCustomerList(false);
                    }}
                  >ID: {i.id} | ผู้ใช้: {i.icloud_username}</div>
                )) : (
                  <div style={{ padding: '10px 14px', color: '#64748b' }}>ไม่พบบัญชีลูกค้า</div>
                )}
              </div>
            )}
          </div>
          <div style={{ flex: 1, position: 'relative' }}>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>บัญชีร้านค้า</div>
            <input
              type="search"
              value={storeQuery}
              onChange={e => {
                setStoreQuery(e.target.value);
                setShowStoreList(true);
              }}
              onFocus={() => setShowStoreList(true)}
              onBlur={() => setTimeout(() => setShowStoreList(false), 120)}
              ref={storeInputRef}
              className={styles.select}
              placeholder="ค้นหาอีเมล/ID ร้านค้า..."
              style={{ width: '100%', marginBottom: 0 }}
            />
            {showStoreList && (
              <div style={{
                position: 'absolute',
                top: '100%', left: 0, right: 0, zIndex: 20,
                background: '#fff', border: '1.5px solid #bae6fd', borderRadius: 8,
                boxShadow: '0 2px 12px #bae6fd22',
                maxHeight: 220, overflowY: 'auto', marginTop: 2
              }}>
                {filteredStores.length > 0 ? filteredStores.map(i => (
                  <div
                    key={i.id}
                    style={{ padding: '10px 14px', cursor: 'pointer', color: '#0ea5e9', fontWeight: 500 }}
                    onMouseDown={() => {
                      setStoreQuery(`${i.icloud_username} (ID: ${i.id})`);
                      setShowStoreList(false);
                    }}
                  >ID: {i.id} | ผู้ใช้: {i.icloud_username}</div>
                )) : (
                  <div style={{ padding: '10px 14px', color: '#64748b' }}>ไม่พบบัญชีร้านค้า</div>
                )}
              </div>
            )}
          </div>
        </div>
        {icloudList.length === 0 && (
          <div className={styles.emptyMsg}>ไม่พบบัญชี iCloud ในระบบ</div>
        )}
        <button className={styles.createBtn} onClick={() => setShowCreateModal(true)} type="button">สร้าง iCloud ใหม่</button>
        <div className={styles.btnRow}>
          <button className={styles.btnCancel} onClick={onClose}>ยกเลิก</button>
          <button
            className={styles.btnConfirm}
            onClick={async () => {
              if (isValidCustomer && isValidStore) {
                try {
                  const payload = {
                    mode: 'both' as const,
                    store_icloud_credential_id: storeId,
                    store_icloud_status: 'lock' as const,
                    customer_icloud_credential_id: customerId,
                    customer_icloud_status: 'lock' as const,
                  };
                  console.log('bindIcloudCredentialToProduct', productId, payload);
                  await bindIcloudCredentialToProduct(productId, payload);
                  if (onConfirm) onConfirm(customerId);
                } catch (err) {
                  let msg = 'เกิดข้อผิดพลาดในการเชื่อมโยงบัญชี iCloud';
                  if (typeof err === 'object' && err !== null) {
                    if ('message' in err && typeof (err as Record<string, unknown>).message === 'string') {
                      msg = (err as Record<string, unknown>).message as string;
                    } else if ('error' in err && typeof (err as Record<string, unknown>).error === 'string') {
                      msg = (err as Record<string, unknown>).error as string;
                    }
                  }
                  toast.error(msg);
                }
              }
            }}
            disabled={!(isValidCustomer && isValidStore)}
          >ยืนยัน</button>
        </div>
        {showCreateModal && (
          <IcloudCreateModal
            open={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onSuccess={async (data: Partial<IcloudCredential> & { icloud_username: string; owner_type: 'customer' | 'store'; }) => {
              setShowCreateModal(false);
              if (typeof onReloadIcloudList === 'function') {
                await onReloadIcloudList();
              }
              try {
                const freshList = await getIcloudCredentials();
                const prevCustomerId = extractId(customerQuery);
                const prevStoreId = extractId(storeQuery);
                const newCustomer = freshList.find(i => i.id === prevCustomerId && i.owner_type === 'customer');
                const newStore = freshList.find(i => i.id === prevStoreId && i.owner_type === 'store');
                if (data.owner_type === 'customer') {
                  setCustomerQuery(`${data.icloud_username} (ID: ${data.id ?? data.icloud_username})`);
                  setStoreQuery(newStore ? `${newStore.icloud_username} (ID: ${newStore.id})` : '');
                } else if (data.owner_type === 'store') {
                  setStoreQuery(`${data.icloud_username} (ID: ${data.id ?? data.icloud_username})`);
                  setCustomerQuery(newCustomer ? `${newCustomer.icloud_username} (ID: ${newCustomer.id})` : '');
                }
              } catch {
                if (data.owner_type === 'customer') {
                  setCustomerQuery((data.icloud_username || '') + ' (ID: ' + (data.id ?? data.icloud_username) + ')');
                } else if (data.owner_type === 'store') {
                  setStoreQuery((data.icloud_username || '') + ' (ID: ' + (data.id ?? data.icloud_username) + ')');
                }
              }
            }}
          />
        )}
      </div>
    </div>
  );
};

export default IcloudLockModal; 