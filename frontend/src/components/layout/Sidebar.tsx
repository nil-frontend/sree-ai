import React from 'react';
import {
  Plus,
  Search,
  MessageSquare,
  History,
  HelpCircle,
  ChevronRight,
  Zap,
  Star
} from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import styles from './Sidebar.module.css';

export const Sidebar: React.FC = () => {
  const { user } = useAuthStore();

  const history = [
    { id: '1', title: 'Modern UI Design with Glassmorphism', date: 'Today' },
    { id: '2', title: 'React Performance Optimization', date: 'Today' },
    { id: '3', title: 'Building a SaaS from scratch', date: 'Yesterday' },
    { id: '4', title: 'Deep Learning vs Machine Learning', date: 'Jan 12' },
  ];

  return (
    <aside className={styles.sidebar}>
      {/* Top: New Chat & Search */}
      <div className={styles.topSection}>
        <button className={styles.newChatBtn}>
          <Plus size={18} />
          <span>New Chat</span>
          <div className={styles.cmd}>⌘K</div>
        </button>

        <div className={styles.searchWrapper}>
          <Search size={16} className={styles.searchIcon} />
          <input type="text" placeholder="Search history..." className={styles.searchInput} />
        </div>
      </div>

      {/* Middle: History */}
      <div className={styles.historySection}>
        <div className={styles.sectionLabel}>
          <History size={14} />
          <span>Recent Activity</span>
        </div>

        <div className={styles.historyList}>
          {history.map((item) => (
            <button key={item.id} className={styles.historyItem}>
              <MessageSquare size={14} className={styles.itemIcon} />
              <span className={styles.itemTitle}>{item.title}</span>
              <span className={styles.itemDate}>{item.date}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Bottom: Profile & Actions */}
      <div className={styles.bottomSection}>
        <button className={styles.bottomLink}>
          <HelpCircle size={18} />
          <span>Feature Request</span>
          <ChevronRight size={14} className={styles.arrow} />
        </button>

        <div className={styles.profileCard}>
          <div className={styles.profileInfo}>
            <div className={styles.avatar}>
              <div className={styles.status} />
              {user?.email?.[0].toUpperCase()}
            </div>
            <div className={styles.details}>
              <span className={styles.name}>{user?.email?.split('@')[0]}</span>
              <div className={styles.badge}>
                <Zap size={10} fill="currentColor" />
                <span>Pro Member</span>
              </div>
            </div>
          </div>
          <button className={styles.upgradeBtn}>
            <Star size={14} />
            <span>Upgrade</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
