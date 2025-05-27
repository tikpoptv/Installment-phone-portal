import type { FC } from 'react';
import styles from './TodoList.module.css';

interface TodoItem {
  id: number;
  title: string;
  description: string;
  type: 'warning' | 'error' | 'info';
  count: number;
}

const todoItems: TodoItem[] = [
  {
    id: 1,
    title: 'รอปลดล็อค iCloud',
    description: 'อุปกรณ์ที่รอการปลดล็อค',
    type: 'warning',
    count: 3,
  },
  {
    id: 2,
    title: 'สินค้ายังไม่ได้ตั้งราคา',
    description: 'สินค้าที่ยังไม่ได้กำหนดราคาขาย',
    type: 'error',
    count: 5,
  },
  {
    id: 3,
    title: 'ลูกค้าพลาดนัด',
    description: 'ลูกค้าที่ไม่ได้มาตามนัด',
    type: 'info',
    count: 2,
  },
];

const TodoList: FC = () => {
  return (
    <div className={styles.todoContainer}>
      <div className={styles.todoHeader}>
        <h2 className={styles.todoTitle}>งานที่ต้องทำ</h2>
        <button className={styles.viewAllButton}>ดูทั้งหมด</button>
      </div>
      <div className={styles.todoList}>
        {todoItems.map((item) => (
          <div key={item.id} className={`${styles.todoItem} ${styles[item.type]}`}>
            <div className={styles.todoInfo}>
              <h3 className={styles.todoItemTitle}>{item.title}</h3>
              <p className={styles.todoDescription}>{item.description}</p>
            </div>
            <div className={styles.todoCount}>
              <span className={styles.countBadge}>{item.count}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TodoList; 