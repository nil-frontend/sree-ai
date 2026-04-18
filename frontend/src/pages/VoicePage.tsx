import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Square, Loader2, Volume2, Copy, CheckCircle2 } from 'lucide-react';
import { DashboardLayout } from '../features/dashboard/DashboardLayout';
import { useChatStore } from '../store/chat.store';
import { useAuthStore } from '../store/auth.store';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { VoiceVisualizer } from '../components/voice/VoiceVisualizer';
import { aiService } from '../lib/api';

const VoicePage: React.FC = () => {
  const { user } = useAuthStore();
  const { createConversation, addMessage } = useChatStore();
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<'idle' | 'transcribing' | 'thinking' | 'speaking'>('idle');
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const startRecording = async () => {
    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setStream(audioStream);
      const recorder = new MediaRecorder(audioStream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        if (chunksRef.current.length === 0) {
          console.warn('No audio data captured');
          setIsProcessing(false);
          setStatus('idle');
          return;
        }

        try {
          setIsProcessing(true);
          setStatus('transcribing');

          const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
          const formData = new FormData();
          formData.append('file', audioBlob, 'voice.webm');

          const data = await aiService.transcribeAudio(formData);
          
          if (data.success) {
            const userText = data.data.text;
            setTranscript(userText);
            setStatus('thinking');

            const { data: { session } } = await supabase.auth.getSession();
            const chatResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/ai/chat`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session?.access_token}`,
              },
              body: JSON.stringify({
                messages: [{ role: 'user', content: userText }],
                model: 'meta/llama-3.1-70b-instruct',
              }),
            });

            const reader = chatResponse.body?.getReader();
            const decoder = new TextDecoder();
            let fullAiText = '';
            
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
                    const parsed = JSON.parse(dataStr);
                    if (parsed.content) fullAiText += parsed.content;
                  } catch (e) {}
                }
              }
            }
            
            setAiResponse(fullAiText);

            if (user?.id) {
              const conv = await createConversation(user.id, userText.slice(0, 30) + '...', 'voice');
              if (conv) {
                await addMessage(conv.id, 'user', userText);
                await addMessage(conv.id, 'assistant', fullAiText);
                
                setStatus('speaking');
                const audioBlob = await aiService.generateSpeech(fullAiText);
                const url = URL.createObjectURL(audioBlob);
                
                if (audioRef.current) {
                  audioRef.current.src = url;
                  audioRef.current.onended = () => setStatus('idle');
                  audioRef.current.play();
                }
                
                setTimeout(() => {
                   setIsProcessing(false);
                   navigate(`/voice/chat/${conv.id}`);
                }, 6000);
              }
            }
          } else {
            throw new Error(data.message);
          }
        } catch (err: any) {
          console.error('Transcription Error:', err);
          alert(err.message || 'Failed to process voice interaction.');
        } finally {
          setIsProcessing(false);
          if (status !== 'speaking') setStatus('idle');
        }
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Recording Start Error:', err);
      alert('Could not access microphone.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      stream?.getTracks().forEach(track => track.stop());
      setStream(null);
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
            <VoiceVisualizer stream={stream} isRecording={isRecording} />

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
            <h3 style={{ marginBottom: '8px', textTransform: 'capitalize' }}>
              {isRecording ? 'Listening...' : status !== 'idle' ? `${status}...` : 'Tap to Start'}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              {isRecording ? 'Sree AI is capturing your thoughts' : 
               status === 'transcribing' ? 'Converting speech to text' :
               status === 'thinking' ? 'Crafting the perfect response' :
               status === 'speaking' ? 'Assistant is talking back' :
               'Pro whisper-large-v3 model ready'}
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
      <audio ref={audioRef} style={{ display: 'none' }} />
    </DashboardLayout>
  );
};

export default VoicePage;
