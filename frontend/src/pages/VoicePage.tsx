import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Square, Loader2, Volume2, Copy, CheckCircle2 } from 'lucide-react';
import { DashboardLayout } from '../features/dashboard/DashboardLayout';
import { useChatStore } from '../store/chat.store';
import { useAuthStore } from '../store/auth.store';
import { supabase } from '../lib/supabase';

const VoicePage: React.FC = () => {
  const { user } = useAuthStore();
  const { createConversation, addMessage } = useChatStore();
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await handleUpload(audioBlob);
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Recording Start Error:', err);
      alert('Could not access microphone.');
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const handleUpload = async (blob: Blob) => {
    setIsProcessing(true);
    const formData = new FormData();
    formData.append('file', blob, 'recording.webm');

    try {
      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/ai/voice`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        setTranscript(data.data.text);

        // Persist to Voice Library
        if (user?.id) {
          const conv = await createConversation(user.id, data.data.text.slice(0, 30) + '...', 'voice');
          if (conv) {
            await addMessage(conv.id, 'user', data.data.text);
          }
        }
      } else {
        throw new Error(data.message);
      }
    } catch (err: any) {
      console.error('Transcription Error:', err);
      alert(err.message || 'Failed to transcribe audio.');
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(transcript);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ marginBottom: '40px' }}>
          <h2 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '16px' }}>Audio Intelligence</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Speak naturally. Sree AI understands every whisper.</p>
        </div>

        <div className="glass" style={{
          padding: '60px 40px',
          borderRadius: '32px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '32px',
          marginBottom: '40px'
        }}>
          <div style={{ position: 'relative' }}>
            <AnimatePresence>
              {isRecording && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1.2 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  style={{
                    position: 'absolute',
                    inset: '-20px',
                    borderRadius: '50%',
                    border: '2px solid var(--primary)',
                    boxShadow: '0 0 20px var(--primary-glow)',
                    zIndex: 0
                  }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                />
              )}
            </AnimatePresence>

            <button
              onClick={isRecording ? stopRecording : startRecording}
              style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                background: isRecording ? 'rgba(239, 68, 68, 0.2)' : 'var(--primary)',
                border: isRecording ? '2px solid #EF4444' : 'none',
                color: isRecording ? '#EF4444' : 'var(--bg-dark)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 1,
                position: 'relative',
                transition: 'all 0.3s ease'
              }}
            >
              {isRecording ? <Square size={32} /> : <Mic size={32} />}
            </button>
          </div>

          <div>
            <h3 style={{ marginBottom: '8px' }}>
              {isRecording ? 'Listening...' : isProcessing ? 'Decoding Audio...' : 'Tap to Start'}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              {isRecording ? 'Sree AI is capturing your thoughts' : 'Pro whisper-large-v3 model ready'}
            </p>
          </div>

          {isProcessing && (
            <div className="animate-spin">
              <Loader2 size={32} color="var(--primary)" />
            </div>
          )}
        </div>

        {transcript && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass"
            style={{ padding: '32px', borderRadius: '24px', textAlign: 'left', position: 'relative' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
                <Volume2 size={18} />
                <span style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '1px' }}>TRANSCRIPTION</span>
              </div>
              <button
                onClick={copyToClipboard}
                style={{
                  background: 'none',
                  border: 'none',
                  color: isCopied ? '#10B981' : 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                {isCopied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                <span style={{ fontSize: '0.8rem' }}>{isCopied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <p style={{ lineHeight: '1.8', fontSize: '1.1rem' }}>{transcript}</p>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default VoicePage;
