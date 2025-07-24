import React, { useState } from 'react';
import styles from './OrderTrackingPage.module.css';
import { FaSearch, FaSyncAlt, FaEye, FaEyeSlash } from 'react-icons/fa';

interface Installment {
  installment_number: number;
  due_date: string;
}

interface OrderTrackingItem {
  contract_id: string;
  user_id: string;
  user_name: string;
  product_name: string;
  status: string;
  total_price: number;
  outstanding: number;
  outstanding_count: number;
  next_due_date: string;
  outstanding_installments: Installment[];
}

const mockOrders: OrderTrackingItem[] = [
  {
    contract_id: 'CT00001',
    user_id: 'U001',
    user_name: 'สมชาย ใจดี',
    product_name: 'iPhone 15 Pro',
    status: 'active',
    total_price: 20000,
    outstanding: 4000,
    outstanding_count: 2,
    next_due_date: '2024-07-01',
    outstanding_installments: [
      { installment_number: 2, due_date: '2024-07-01' },
      { installment_number: 3, due_date: '2024-08-01' },
    ],
  },
  // เพิ่ม mock เพิ่มเติมได้
];

const statusMap: Record<string, { label: string; color: string }> = {
  active: { label: 'ผ่อนชำระอยู่', color: '#0ea5e9' },
  closed: { label: 'ปิดสัญญา', color: '#22c55e' },
  overdue: { label: 'ค้างชำระ', color: '#ef4444' },
};

const defaultFilter = {
  search: '',
  status: '',
  next_due_date_from: '',
  next_due_date_to: '',
  outstanding_min: '',
  outstanding_max: '',
  outstanding_count_min: '',
  outstanding_count_max: '',
  installment_number: '', // เพิ่มฟิลด์ใหม่
  limit: 10,
};

const OrderTrackingPage: React.FC = () => {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState({ ...defaultFilter });
  const [page, setPage] = useState(1);

  // ฟิลเตอร์ mockOrders ตามค่าที่กรอก
  const filtered = mockOrders.filter(order => {
    if (filter.search && !(
      order.user_name.includes(filter.search) ||
      order.product_name.includes(filter.search)
    )) return false;
    if (filter.status && order.status !== filter.status) return false;
    if (filter.next_due_date_from && order.next_due_date < filter.next_due_date_from) return false;
    if (filter.next_due_date_to && order.next_due_date > filter.next_due_date_to) return false;
    if (filter.outstanding_min && order.outstanding < Number(filter.outstanding_min)) return false;
    if (filter.outstanding_max && order.outstanding > Number(filter.outstanding_max)) return false;
    if (filter.outstanding_count_min && order.outstanding_count < Number(filter.outstanding_count_min)) return false;
    if (filter.outstanding_count_max && order.outstanding_count > Number(filter.outstanding_count_max)) return false;
    if (filter.installment_number && !order.outstanding_installments.some(ins => ins.installment_number === Number(filter.installment_number))) return false;
    return true;
  });

  // Pagination mock
  const total = filtered.length;
  const totalPages = Math.ceil(total / filter.limit);
  const paginated = filtered.slice((page - 1) * filter.limit, page * filter.limit);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilter(f => ({ ...f, [name]: value }));
  };
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };
  const handleClear = () => {
    setFilter({ ...defaultFilter });
    setPage(1);
  };

  return (
    <div className={styles.containerModern}>
      <div className={styles.headerModern}>
        <h1 className={styles.titleModern}>ติดตามคำสั่งซื้อ</h1>
      </div>
      {/* Filter Card */}
      <form onSubmit={handleSearch} className={styles.filterCard}>
        <div className={styles.filterGrid}>
          <div className={styles.filterGroupModern}>
            <label>ค้นหาชื่อ/สินค้า</label>
            <input name="search" value={filter.search} onChange={handleFilterChange} placeholder="ค้นหาชื่อ/สินค้า" />
          </div>
          <div className={styles.filterGroupModern}>
            <label>สถานะ</label>
            <select name="status" value={filter.status} onChange={handleFilterChange}>
              <option value="">ทุกสถานะ</option>
              <option value="active">ผ่อนชำระอยู่</option>
              <option value="closed">ปิดสัญญา</option>
              <option value="overdue">ค้างชำระ</option>
            </select>
          </div>
          <div className={styles.filterGroupModern}>
            <label>วันที่ครบกำหนด (จาก)</label>
            <input name="next_due_date_from" value={filter.next_due_date_from} onChange={handleFilterChange} type="date" />
          </div>
          <div className={styles.filterGroupModern}>
            <label>วันที่ครบกำหนด (ถึง)</label>
            <input name="next_due_date_to" value={filter.next_due_date_to} onChange={handleFilterChange} type="date" />
          </div>
          <div className={styles.filterGroupModern}>
            <label>งวด</label>
            <select name="installment_number" value={filter.installment_number} onChange={handleFilterChange}>
              <option value="">ทุกงวด</option>
              {Array.from({ length: 31 }, (_, i) => (
                <option key={i+1} value={i+1}>{i+1}</option>
              ))}
            </select>
          </div>
          <div className={styles.filterGroupModern}>
            <label>ยอดค้างขั้นต่ำ</label>
            <input name="outstanding_min" value={filter.outstanding_min} onChange={handleFilterChange} placeholder="0" type="number" min={0} />
          </div>
          <div className={styles.filterGroupModern}>
            <label>ยอดค้างสูงสุด</label>
            <input name="outstanding_max" value={filter.outstanding_max} onChange={handleFilterChange} placeholder="0" type="number" min={0} />
          </div>
          <div className={styles.filterGroupModern}>
            <label>งวดค้างขั้นต่ำ</label>
            <input name="outstanding_count_min" value={filter.outstanding_count_min} onChange={handleFilterChange} placeholder="0" type="number" min={0} />
          </div>
          <div className={styles.filterGroupModern}>
            <label>งวดค้างสูงสุด</label>
            <input name="outstanding_count_max" value={filter.outstanding_count_max} onChange={handleFilterChange} placeholder="0" type="number" min={0} />
          </div>
          <div className={styles.filterGroupModern}>
            <label>แสดงต่อหน้า</label>
            <select name="limit" value={filter.limit} onChange={handleFilterChange}>
              <option value={10}>10 รายการ/หน้า</option>
              <option value={20}>20 รายการ/หน้า</option>
              <option value={50}>50 รายการ/หน้า</option>
            </select>
          </div>
        </div>
        <div className={styles.filterActionBar}>
          <button type="submit" className={styles.searchBtnModern}><FaSearch style={{marginRight:6}}/>ค้นหา</button>
          <button type="button" onClick={handleClear} className={styles.clearBtnModern}><FaSyncAlt style={{marginRight:6}}/>ล้างค่า</button>
        </div>
      </form>
      {/* Table Modern */}
      <div className={styles.tableModernWrapper}>
        <table className={styles.tableModern}>
          <thead>
            <tr>
              <th>รหัสสัญญา</th>
              <th>ลูกค้า</th>
              <th>สินค้า</th>
              <th>สถานะ</th>
              <th>ยอดรวม</th>
              <th>ยอดค้าง</th>
              <th>งวดค้าง</th>
              <th>งวดถัดไป</th>
              <th>รายละเอียด</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr><td colSpan={9} style={{ textAlign: 'center', color: '#64748b', padding: 32 }}>ไม่พบข้อมูล</td></tr>
            ) : paginated.map((order) => (
              <React.Fragment key={order.contract_id}>
                <tr className={expanded === order.contract_id ? styles.rowActive : ''}>
                  <td>{order.contract_id}</td>
                  <td>{order.user_name}</td>
                  <td>{order.product_name}</td>
                  <td>
                    <span className={styles.statusBadge} style={{ background: statusMap[order.status]?.color + '22', color: statusMap[order.status]?.color }}>{statusMap[order.status]?.label || order.status}</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>{order.total_price.toLocaleString('th-TH')}</td>
                  <td style={{ textAlign: 'right', color: order.outstanding > 0 ? '#ef4444' : '#22c55e', fontWeight: 600 }}>{order.outstanding.toLocaleString('th-TH')}</td>
                  <td style={{ textAlign: 'center' }}>{order.outstanding_count}</td>
                  <td style={{ textAlign: 'center' }}>{order.next_due_date}</td>
                  <td style={{ textAlign: 'center' }}>
                    <button className={styles.detailIconBtn} onClick={() => setExpanded(expanded === order.contract_id ? null : order.contract_id)}>
                      {expanded === order.contract_id ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </td>
                </tr>
                {expanded === order.contract_id && (
                  <tr>
                    <td colSpan={9} className={styles.detailCardTd}>
                      <div className={styles.detailCardModern}>
                        <b>รายละเอียดงวดค้างชำระ:</b>
                        <ul className={styles.detailListModern}>
                          {order.outstanding_installments.map((ins) => (
                            <li key={ins.installment_number} className={styles.detailListItemModern}>
                              <span className={styles.installmentNumber}>งวดที่ {ins.installment_number}</span> <span className={styles.installmentDue}>ครบกำหนด {ins.due_date}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      {/* Pagination Modern */}
      <div className={styles.paginationBarModern}>
        <span>หน้าที่ {page} / {totalPages} ({total} รายการ)</span>
        <div className={styles.paginationControlsModern}>
          <button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))} className={styles.paginationButtonModern}>ก่อนหน้า</button>
          <button disabled={page === totalPages || totalPages === 0} onClick={() => setPage(p => Math.min(totalPages, p + 1))} className={styles.paginationButtonModern}>ถัดไป</button>
        </div>
      </div>
    </div>
  );
};

export default OrderTrackingPage; 