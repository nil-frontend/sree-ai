import React from 'react';
import { motion } from 'framer-motion';
import {
  Zap,
  MessageSquare,
  ImageIcon,
  Mic,
  Activity,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Cpu,
  Globe
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../features/dashboard/DashboardLayout';
import { useAuthStore } from '../store/auth.store.ts';
import styles from './Dashboard.module.css';

const StatCard: React.FC<{
  title: string;
  value: string;
  icon: React.ReactElement;
  trend: string;
  color: string;
}> = ({ title, value, icon, trend, color }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={styles.statCard}
  >
    <div className={styles.statIcon} style={{ color }}>
      {React.cloneElement(icon as React.ReactElement<{ size: number }>, { size: 48 })}
    </div>
    <div className={styles.statLabel}>{title}</div>
    <div className={styles.statValue}>{value}</div>
    <div className={styles.statTrend}>
      <TrendingUp size={14} /> {trend}
    </div>
  </motion.div>
);

const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const activities = [
    { title: 'Chat query processed', time: '2m ago', icon: <MessageSquare size={18} /> },
    { title: 'Neural image synthesized', time: '15m ago', icon: <ImageIcon size={18} /> },
    { title: 'Voice engine initialized', time: '1h ago', icon: <Mic size={18} /> },
    { title: 'Model weights updated', time: '3h ago', icon: <Cpu size={18} /> },
  ];

  return (
    <DashboardLayout>
      <div className={styles.container}>
        <section className={styles.welcomeSection}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className={styles.title}>
              Welcome, <span className={styles.titleHighlight}>{user?.email?.split('@')[0]}</span>
            </h1>
            <p className={styles.subtitle}>Your AI infrastructure is operating at peak efficiency.</p>
          </motion.div>
        </section>

        <section className={styles.statsGrid}>
          <StatCard
            title="Processing Power"
            value="2.4 TFLOPS"
            icon={<Zap />}
            trend="+14% vs last week"
            color="var(--primary)"
          />
          <StatCard
            title="Inference Speed"
            value="42ms"
            icon={<Cpu />}
            trend="Ultra-low latency"
            color="var(--success)"
          />
          <StatCard
            title="Global Reach"
            value="18 Nodes"
            icon={<Globe />}
            trend="Active in 6 regions"
            color="var(--accent)"
          />
        </section>

        <div className={styles.mainGrid}>
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Quick Access</h3>
              <Sparkles className="text-primary" size={20} />
            </div>
            <div className={styles.actionGrid}>
              {[
                { title: 'AI Chat', icon: <MessageSquare />, path: '/dashboard/chat', color: '#3B82F6' },
                { title: 'Image Gen', icon: <ImageIcon />, path: '/dashboard/images', color: '#8B5CF6' },
                { title: 'Voice AI', icon: <Mic />, path: '/dashboard/voice', color: '#F59E0B' },
              ].map((action) => (
                <button 
                  key={action.path}
                  className={styles.actionCard}
                  onClick={() => navigate(action.path)}
                >
                  <div className={styles.actionIcon} style={{ background: `${action.color}15`, color: action.color }}>
                    {React.cloneElement(action.icon as React.ReactElement<{ size: number }>, { size: 24 })}
                  </div>
                  <div className={styles.actionTitle}>{action.title}</div>
                  <ArrowRight size={16} className="text-muted" />
                </button>
              ))}
            </div>
          </section>

          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Recent Activity</h3>
              <Activity className="text-muted" size={20} />
            </div>
            <div className={styles.activityList}>
              {activities.map((item, i) => (
                <div key={i} className={styles.activityItem}>
                  <div className={styles.activityIcon}>{item.icon}</div>
                  <div className={styles.activityContent}>
                    <div className={styles.activityTitle}>{item.title}</div>
                    <div className={styles.activityTime}>{item.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
