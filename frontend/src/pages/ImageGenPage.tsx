import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, Wand2, Download, Trash2, Loader2, Sparkles } from 'lucide-react';
import { DashboardLayout } from '../features/dashboard/DashboardLayout';
import api from '../lib/api';

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
}

const ImageGenPage: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [images, setImages] = useState<GeneratedImage[]>([]);

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    try {
      const response = await api.post('/ai/image', {
        prompt,
        model: 'stabilityai/stable-diffusion-xl-base-1.0'
      });

      if (response.data.success) {
        const newImage: GeneratedImage = {
          id: Date.now().toString(),
          url: response.data.data.data[0].url, // Assuming OpenAI format
          prompt
        };
        setImages(prev => [newImage, ...prev]);
        setPrompt('');
      }
    } catch (error: any) {
      console.error('Image Generation Error:', error);
      alert(error.response?.data?.message || 'Failed to generate image. Ensure your NVIDIA API key is valid.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '32px' }}>
          <h2 className="text-gradient" style={{ fontSize: '2rem', marginBottom: '8px' }}>Vision Engine</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Transform your thoughts into high-fidelity visual art.</p>
        </div>

        <div className="glass" style={{ padding: '24px', borderRadius: '24px', marginBottom: '40px' }}>
          <div style={{ display: 'flex', gap: '16px' }}>
            <div className="chat-input-wrapper" style={{ margin: 0, flex: 1 }}>
              <ImageIcon size={20} color="var(--text-muted)" style={{ marginLeft: '8px' }} />
              <input
                className="chat-input"
                placeholder="Describe the image you want to create..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              />
            </div>
            <button 
              className="send-btn" 
              style={{ width: 'auto', padding: '0 24px', display: 'flex', gap: '8px' }}
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
            >
              {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Wand2 size={20} />}
              Generate
            </button>
          </div>
        </div>

        {images.length === 0 && !isGenerating && (
          <div style={{ textAlign: 'center', marginTop: '60px', opacity: 0.5 }}>
            <Sparkles size={48} color="var(--primary)" style={{ marginBottom: '16px' }} />
            <h3>Your gallery is empty</h3>
            <p>Try prompting something like "A cyberpunk city at night with neon rain"</p>
          </div>
        )}

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
          gap: '24px' 
        }}>
          <AnimatePresence>
            {isGenerating && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass"
                style={{ 
                  aspectRatio: '1/1', 
                  borderRadius: '20px', 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center', 
                  justifyContent: 'center',
                  gap: '16px',
                  border: '1px dashed var(--primary)'
                }}
              >
                <div className="animate-spin">
                  <Loader2 size={40} color="var(--primary)" />
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--primary)' }}>Synthesizing Vision...</p>
              </motion.div>
            )}

            {images.map(img => (
              <motion.div
                key={img.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="glass glow-border"
                style={{ position: 'relative', borderRadius: '20px', overflow: 'hidden', cursor: 'pointer' }}
              >
                <img 
                  src={img.url} 
                  alt={img.prompt}
                  style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover' }}
                />
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                  opacity: 0,
                  transition: 'opacity 0.3s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  padding: '16px'
                }} 
                className="gallery-overlay"
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
                >
                  <p style={{ fontSize: '0.8rem', marginBottom: '12px', lineClamp: 2, overflow: 'hidden' }}>
                    {img.prompt}
                  </p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button style={{ 
                      flex: 1, 
                      background: 'var(--bg-surface-light)', 
                      border: 'none', 
                      color: 'white', 
                      padding: '8px', 
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      fontSize: '0.75rem'
                    }} onClick={() => window.open(img.url, '_blank')}>
                      <Download size={14} />
                      Download
                    </button>
                    <button style={{ 
                       background: 'rgba(239, 68, 68, 0.2)', 
                       border: 'none', 
                       color: '#EF4444', 
                       width: '32px',
                       height: '32px',
                       borderRadius: '8px',
                       display: 'flex',
                       alignItems: 'center',
                       justifyContent: 'center'
                    }} onClick={() => setImages(prev => prev.filter(i => i.id !== img.id))}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ImageGenPage;
