import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './OrderTrackingPage.module.css';
import { FaSearch, FaSyncAlt, FaEye, FaEyeSlash } from 'react-icons/fa';
import { getTrackingOrders } from '../../../services/tracking.service';
import type { TrackingOrder } from '../../../services/tracking.service';
import { formatDateShort } from '../../../utils/date';

const statusMap: Record<string, { label: string; color: string }> = {
  active: { label: 'ผ่อนชำระอยู่', color: '#0ea5e9' },
  closed: { label: 'ปิดสัญญา', color: '#22c55e' },
  overdue: { label: 'ค้างชำระ', color: '#ef4444' },
  repossessed: { label: 'ยึดสินค้า', color: '#a21caf' },
  processing: { label: 'รอดำเนินการ', color: '#f59e42' },
  default: { label: 'ค้างชำระ', color: '#ef4444' },
  returned: { label: 'คืนสินค้า', color: '#6366f1' },
};

const installmentStatusMap: Record<string, { label: string; color: string }> = {
  unpaid: { label: 'ยังไม่จ่าย', color: '#ef4444' },
  paid: { label: 'จ่ายแล้ว', color: '#22c55e' },
  partial: { label: 'จ่ายบางส่วน', color: '#f59e42' },
  skipped: { label: 'ข้ามงวด', color: '#64748b' },
  final_payment: { label: 'งวดสุดท้าย', color: '#0ea5e9' },
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
  installment_number: '',
  limit: 10,
};

const OrderTrackingPage: React.FC = () => {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filterDraft, setFilterDraft] = useState({ ...defaultFilter });
  const [filter, setFilter] = useState({ ...defaultFilter });
  const [page, setPage] = useState(1);
  const [orders, setOrders] = useState<TrackingOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ดึงข้อมูลจาก API
  useEffect(() => {
    let ignore = false;
    async function fetchOrders() {
      setLoading(true);
      setError(null);
      try {
        const params: Record<string, string | number | undefined> = {
          ...filter,
          page,
        };
        Object.keys(params).forEach((k) => {
          if (params[k] === '') params[k] = undefined;
        });
        if (params.installment_number) {
          params.day_of_month = params.installment_number;
        }
        delete params.installment_number;
        const res = await getTrackingOrders(params);
        if (!ignore) {
          setOrders(res.orders);
          setTotal(res.total);
          setTotalPages(res.total_pages);
        }
      } catch (e) {
        if (e instanceof Error) setError(e.message);
        else setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    fetchOrders();
    return () => { ignore = true; };
  }, [filter, page]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilterDraft(f => ({ ...f, [name]: value }));
  };
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilter({ ...filterDraft });
    setPage(1);
  };
  const handleClear = () => {
    setFilterDraft({ ...defaultFilter });
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
            <input name="search" value={filterDraft.search} onChange={handleFilterChange} placeholder="ค้นหาชื่อ/สินค้า" />
          </div>
          <div className={styles.filterGroupModern}>
            <label>สถานะ</label>
            <select name="status" value={filterDraft.status} onChange={handleFilterChange}>
              <option value="">ทุกสถานะ</option>
              <option value="active">ผ่อนชำระอยู่</option>
              <option value="closed">ปิดสัญญา</option>
              <option value="overdue">ค้างชำระ</option>
              <option value="repossessed">ยึดสินค้า</option>
              <option value="processing">รอดำเนินการ</option>
            </select>
          </div>
          <div className={styles.filterGroupModern}>
            <label>วันที่ครบกำหนด (จาก)</label>
            <input name="next_due_date_from" value={filterDraft.next_due_date_from} onChange={handleFilterChange} type="date" />
          </div>
          <div className={styles.filterGroupModern}>
            <label>วันที่ครบกำหนด (ถึง)</label>
            <input name="next_due_date_to" value={filterDraft.next_due_date_to} onChange={handleFilterChange} type="date" />
          </div>
          <div className={styles.filterGroupModern}>
            <label>งวด</label>
            <select name="installment_number" value={filterDraft.installment_number} onChange={handleFilterChange}>
              <option value="">ทุกงวด</option>
              {Array.from({ length: 31 }, (_, i) => (
                <option key={i+1} value={i+1}>{i+1}</option>
              ))}
            </select>
          </div>
          <div className={styles.filterGroupModern}>
            <label>ยอดค้างขั้นต่ำ</label>
            <input name="outstanding_min" value={filterDraft.outstanding_min} onChange={handleFilterChange} placeholder="0" type="number" min={0} />
          </div>
          <div className={styles.filterGroupModern}>
            <label>ยอดค้างสูงสุด</label>
            <input name="outstanding_max" value={filterDraft.outstanding_max} onChange={handleFilterChange} placeholder="0" type="number" min={0} />
          </div>
          <div className={styles.filterGroupModern}>
            <label>งวดค้างขั้นต่ำ</label>
            <input name="outstanding_count_min" value={filterDraft.outstanding_count_min} onChange={handleFilterChange} placeholder="0" type="number" min={0} />
          </div>
          <div className={styles.filterGroupModern}>
            <label>งวดค้างสูงสุด</label>
            <input name="outstanding_count_max" value={filterDraft.outstanding_count_max} onChange={handleFilterChange} placeholder="0" type="number" min={0} />
          </div>
          <div className={styles.filterGroupModern}>
            <label>แสดงต่อหน้า</label>
            <select name="limit" value={filterDraft.limit} onChange={handleFilterChange}>
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
        {loading ? (
          <div style={{ textAlign: 'center', padding: 32, color: '#64748b' }}>กำลังโหลดข้อมูล...</div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: 32, color: '#ef4444' }}>{error}</div>
        ) : (
        <table className={styles.tableModern}>
          <thead>
            <tr>
              <th>รหัสสัญญา</th>
              <th>ลูกค้า</th>
              <th>สินค้า</th>
              <th style={{ textAlign: 'center' }}>ยอดรวม</th>
              <th style={{ textAlign: 'center' }}>ยอดค้าง</th>
              <th style={{ textAlign: 'center' }}>งวดค้างเกินกำหนด</th>
              <th style={{ textAlign: 'center' }}>งวดถัดไป</th>
              <th>สถานะ</th>
              <th>รายละเอียด</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={document.querySelectorAll(`.${styles.tableModern} thead th`).length || 10}
                    style={{ textAlign: 'center', color: '#64748b', padding: 48, height: '180px', verticalAlign: 'middle' }}>
                  ไม่พบข้อมูล
                </td>
              </tr>
            ) : orders.map((order) => (
              <React.Fragment key={order.contract_id}>
                <tr className={expanded === order.contract_id ? styles.rowActive : ''}>
                  <td>
                    {order.contract_id ? (
                      <Link to={`/admin/orders/${order.contract_id}`} style={{ color: '#0ea5e9', textDecoration: 'underline', fontWeight: 700 }}>
                        {order.contract_id}
                      </Link>
                    ) : (
                      <span style={{ color: '#64748b' }}>-</span>
                    )}
                  </td>
                  <td>{order.user_name}</td>
                  <td>{order.product_name}</td>
                  <td style={{ textAlign: 'center' }}>{order.total_price.toLocaleString('th-TH')}</td>
                  <td style={{ textAlign: 'center', color: order.outstanding > 0 ? '#ef4444' : '#22c55e', fontWeight: 600 }}>{order.outstanding.toLocaleString('th-TH')}</td>
                  <td style={{ textAlign: 'center' }}>{typeof order.overdue_count === 'number' ? order.overdue_count : '-'}</td>
                  <td style={{ textAlign: 'center' }}>{formatDateShort(order.next_due_date)}</td>
                  <td>
                    {order.status ? (
                      <span className={styles.statusBadge} style={{ background: (statusMap[order.status]?.color || statusMap.default.color) + '22', color: statusMap[order.status]?.color || statusMap.default.color }}>
                        {statusMap[order.status]?.label || order.status || statusMap.default.label}
                      </span>
                    ) : (
                      <span style={{ color: '#64748b' }}>-</span>
                    )}
                  </td>
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
                          {(() => {
                            const installments = Array.isArray(order.outstanding_installments) ? order.outstanding_installments : [];
                            if (installments.length === 0) {
                              return <li className={styles.detailListItemModern} style={{ color: '#64748b' }}>ไม่มีงวดค้างชำระ</li>;
                            }
                            return installments.map((ins: {installment_number: number; due_date: string; status?: string }) => (
                              <li key={ins.installment_number} className={styles.detailListItemModern}>
                                <span className={styles.installmentNumber}>งวดที่ {ins.installment_number}</span>
                                <span className={styles.installmentDue}>ครบกำหนด {formatDateShort(ins.due_date)}</span>
                                {ins.status && (
                                  <span style={{
                                    marginLeft: 8,
                                    padding: '2px 8px',
                                    borderRadius: 8,
                                    background: (installmentStatusMap[ins.status]?.color || '#e5e7eb') + '22',
                                    color: installmentStatusMap[ins.status]?.color || '#334155',
                                    fontSize: 12,
                                    fontWeight: 500,
                                  }}>
                                    {installmentStatusMap[ins.status]?.label || ins.status}
                                  </span>
                                )}
                              </li>
                            ));
                          })()}
                        </ul>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
        )}
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