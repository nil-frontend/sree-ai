import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  Mic, 
  ImageIcon, 
  Video, 
  ChevronDown, 
  User, 
  Settings, 
  LogOut, 
  Zap,
  ChevronRight,
  ShieldCheck,
  FileText,
  ImagePlus,
  Eraser
} from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import styles from './Navbar.module.css';

export const Navbar: React.FC = () => {
  const { user, signOut } = useAuthStore();
  const location = useLocation();
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const navLinks = [
    { to: '/dashboard/chat', icon: <MessageSquare size={18} />, label: 'Chat' },
    { to: '/dashboard/voice', icon: <Mic size={18} />, label: 'Voice' },
    { to: '/dashboard/images', icon: <ImageIcon size={18} />, label: 'Image' },
    { to: '/dashboard/video', icon: <Video size={18} />, label: 'Video' },
  ];

  const tools = [
    { label: 'AI Humanizer', icon: <User size={16} />, to: '/dashboard/tools/humanizer' },
    { label: 'Prompt Enhancer', icon: <Zap size={16} />, to: '/dashboard/tools/enhancer' },
    { label: 'Doc Analyzer', icon: <FileText size={16} />, to: '/dashboard/tools/analyzer' },
    { label: 'Image to PDF', icon: <ImagePlus size={16} />, to: '/dashboard/tools/image-to-pdf' },
    { label: 'BG Remover', icon: <Eraser size={16} />, to: '/dashboard/tools/bg-remover' },
  ];

  return (
    <nav className={styles.navbar}>
      {/* Left: Logo */}
      <Link to="/dashboard" className={styles.logoGroup}>
        <div className={styles.logoBox}>
          <Zap size={20} fill="currentColor" />
        </div>
        <span className={styles.logoText}>Sree AI</span>
      </Link>

      {/* Center: Nav Links */}
      <div className={styles.navGroup}>
        {navLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`${styles.navLink} ${location.pathname === link.to ? styles.active : ''}`}
          >
            {link.icon}
            <span>{link.label}</span>
          </Link>
        ))}

        {/* Tools Dropdown */}
        <div 
          className={styles.dropdownContainer}
          onMouseEnter={() => setIsToolsOpen(true)}
          onMouseLeave={() => setIsToolsOpen(false)}
        >
          <button className={styles.navLink}>
            <span>Tools</span>
            <ChevronDown size={14} className={isToolsOpen ? styles.rotate : ''} />
          </button>
          
          <AnimatePresence>
            {isToolsOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className={styles.dropdownMenu}
              >
                {tools.map((tool) => (
                  <Link key={tool.label} to={tool.to} className={styles.dropdownItem}>
                    <div className={styles.itemContent}>
                      <div className={styles.itemIcon}>{tool.icon}</div>
                      <span>{tool.label}</span>
                    </div>
                    <ChevronRight size={14} className={styles.itemArrow} />
                  </Link>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Right: User Menu */}
      <div className={styles.userSection}>
        <button
          onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
          className={styles.userButton}
        >
          <div className={styles.userLabel}>
            <span className={styles.planName}>Pro</span>
            <span className={styles.planAction}>Dashboard</span>
          </div>
          <div className={styles.userAvatar}>
            <User size={18} />
          </div>
        </button>

        <AnimatePresence>
          {isUserMenuOpen && (
            <>
              <div className={styles.overlay} onClick={() => setIsUserMenuOpen(false)} />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className={`${styles.dropdownMenu} ${styles.right}`}
              >
                <div className={styles.menuHeader}>
                  <p className={styles.userEmail}>{user?.email}</p>
                  <p className={styles.userRole}>Premium Member</p>
                </div>
                
                <Link to="/dashboard/settings" className={styles.dropdownItem}>
                  <div className={styles.itemContent}>
                    <ShieldCheck size={18} />
                    <span>Subscription</span>
                  </div>
                </Link>
                
                <Link to="/dashboard/settings" className={styles.dropdownItem}>
                  <div className={styles.itemContent}>
                    <Settings size={18} />
                    <span>Settings</span>
                  </div>
                </Link>
                
                <button 
                  onClick={() => signOut()}
                  className={`${styles.dropdownItem} ${styles.danger}`}
                >
                  <div className={styles.itemContent}>
                    <LogOut size={18} />
                    <span>Logout</span>
                  </div>
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};
