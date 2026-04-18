import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles, Loader2, Paperclip, Mic, Image as ImageIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { DashboardLayout } from '../features/dashboard/DashboardLayout';
import { supabase } from '../lib/supabase';
import { useChatStore } from '../store/chat.store';
import { useAuthStore } from '../store/auth.store';
import styles from './ChatPage.module.css';

const ChatPage: React.FC = () => {
  const { user } = useAuthStore();
  const { 
    activeConversation, 
    messages, 
    addMessage, 
    loading: chatLoading,
    createConversation 
  } = useChatStore();
  
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isGenerating, streamingMessage]);

  const suggestions = [
    { title: 'Write a technical blog', desc: 'About React 19 features' },
    { title: 'Explain Quantum computing', desc: 'To a 10 year old kid' },
    { title: 'Write an email', desc: 'To request a budget increase' },
    { title: 'Debug my code', desc: 'Help find the memory leak' },
  ];

  const handleSend = async (text?: string) => {
    const messageContent = text || input;
    if (!messageContent.trim() || isGenerating || !user?.id) return;

    let currentConvId = activeConversation?.id;

    // 1. Create conversation if none active
    if (!currentConvId) {
      const newConv = await createConversation(user.id, messageContent.slice(0, 40) + '...');
      if (!newConv) return;
      currentConvId = newConv.id;
    }

    // 2. Add user message locally and to DB
    await addMessage(currentConvId, 'user', messageContent);
    setInput('');
    setIsGenerating(true);
    setStreamingMessage('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          messages: [...messages.map(m => ({ role: m.role, content: m.content })), { role: 'user', content: messageContent }],
          model: 'meta/llama-3.1-70b-instruct',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to connect to AI engine');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.replace('data: ', '');
            if (dataStr === '[DONE]') break;
            
            try {
              const { content, error } = JSON.parse(dataStr);
              if (error) throw new Error(error);
              if (content) {
                assistantMessage += content;
                setStreamingMessage(assistantMessage);
              }
            } catch (e) {
              console.error('Error parsing stream chunk:', e);
            }
          }
        }
      }

      // 3. Save assistant message to DB
      await addMessage(currentConvId, 'assistant', assistantMessage);

    } catch (error: any) {
      console.error('Chat Error:', error);
      await addMessage(currentConvId, 'assistant', `⚠️ Error: ${error.message}. Please check your NVIDIA API key in settings.`);
    } finally {
      setIsGenerating(false);
      setStreamingMessage('');
    }
  };

  return (
    <DashboardLayout>
      <div className={styles.container}>
        <div className={styles.messagesList}>
          {messages.length === 0 && !chatLoading ? (
            <div className={styles.emptyState}>
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={styles.emptyIconBox}
              >
                <Sparkles size={40} />
              </motion.div>
              <h1 className={styles.title}>How can Sree AI help?</h1>
              <p className={styles.subtitle}>Our most powerful model is ready to assist you with writing, debugging, and brainstorming.</p>
              
              <div className={styles.suggestionGrid}>
                {suggestions.map((s) => (
                  <button 
                    key={s.title} 
                    className={styles.suggestionCard}
                    onClick={() => handleSend(s.title)}
                  >
                    <span className={styles.suggestionTitle}>{s.title}</span>
                    <span className={styles.suggestionDesc}>{s.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {messages.map((m, i) => (
                <motion.div
                  key={m.id || i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`${styles.messageRow} ${m.role === 'user' ? styles.user : ''}`}
                >
                  <div className={`${styles.avatar} ${m.role === 'assistant' ? styles.ai : ''}`}>
                    {m.role === 'assistant' ? <Bot size={20} /> : <User size={20} />}
                  </div>
                  <div className={`${styles.bubble} ${m.role === 'assistant' ? styles.ai : styles.user}`}>
                    <div className={styles.markdown}>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {m.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                </motion.div>
              ))}
              {isGenerating && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={styles.messageRow}
                >
                  <div className={`${styles.avatar} ${styles.ai}`}>
                    <Bot size={20} />
                  </div>
                  <div className={`${styles.bubble} ${styles.ai}`}>
                    <div className={styles.markdown}>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {streamingMessage || 'Thinking...'}
                      </ReactMarkdown>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className={styles.inputWrapper}>
          <div className={styles.inputContainer}>
            <button className={styles.iconBtn}>
              <Paperclip size={20} />
            </button>
            <input
              className={styles.input}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask me anything..."
              disabled={isGenerating}
            />
            <div className={styles.inputActions}>
              <button className={styles.iconBtn}>
                <Mic size={20} />
              </button>
              <button className={styles.iconBtn}>
                <ImageIcon size={20} />
              </button>
              <button 
                className={styles.sendBtn}
                onClick={() => handleSend()}
                disabled={isGenerating || !input.trim()}
              >
                {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ChatPage;
