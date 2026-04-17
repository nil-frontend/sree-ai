import React, { useEffect } from 'react';
import {
  Plus,
  Search,
  MessageSquare,
  History,
  HelpCircle,
  ChevronRight,
  Zap,
  Star,
  LogOut
} from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import { useChatStore } from '../../store/chat.store';
import { useNavigate } from 'react-router-dom';
import styles from './Sidebar.module.css';

export const Sidebar: React.FC = () => {
  const { user, signOut } = useAuthStore();
  const { 
    conversations, 
    activeConversation, 
    fetchConversations, 
    setActiveConversation,
    createConversation,
    loading 
  } = useChatStore();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  useEffect(() => {
    if (user?.id) {
      fetchConversations(user.id);
    }
  }, [user?.id, fetchConversations]);

  const handleNewChat = async () => {
    if (!user?.id) return;
    const newConv = await createConversation(user.id, 'New Conversation');
    if (newConv) {
      navigate('/dashboard/chat');
    }
  };

  const handleSelectConversation = (id: string) => {
    setActiveConversation(id);
    navigate('/dashboard/chat');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <aside className={styles.sidebar}>
      {/* Top: New Chat & Search */}
      <div className={styles.topSection}>
        <button className={styles.newChatBtn} onClick={handleNewChat}>
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
          {loading && conversations.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading...
            </div>
          ) : conversations.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              No history found
            </div>
          ) : conversations.map((item) => (
            <button 
              key={item.id} 
              className={`${styles.historyItem} ${activeConversation?.id === item.id ? styles.active : ''}`}
              onClick={() => handleSelectConversation(item.id)}
            >
              <MessageSquare size={14} className={styles.itemIcon} />
              <span className={styles.itemTitle}>{item.title}</span>
              <span className={styles.itemDate}>{formatDate(item.created_at)}</span>
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
                <span>{user?.plan_type === 'pro' ? 'Pro Member' : 'Free Plan'}</span>
              </div>
            </div>
          </div>
          <div className={styles.profileActions}>
            <button className={styles.signOutBtn} onClick={handleSignOut} title="Sign Out">
              <LogOut size={16} />
            </button>
            {user?.plan_type !== 'pro' && (
              <button className={styles.upgradeBtn}>
                <Star size={14} />
                <span>Upgrade</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};
