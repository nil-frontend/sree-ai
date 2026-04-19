import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mic, Square, Loader2, Volume2 } from 'lucide-react';
import { useChatStore } from '../../store/chat.store';
import { useAuthStore } from '../../store/auth.store';
import { supabase } from '../../lib/supabase';
import { useNavigate, useLocation } from 'react-router-dom';
import { VoiceVisualizer } from './VoiceVisualizer';
import { aiService } from '../../lib/api';
import styles from './VoiceOverlay.module.css';

interface VoiceOverlayProps {
  onClose: () => void;
  initialConversationId?: string | null;
}

export const VoiceOverlay: React.FC<VoiceOverlayProps> = ({ onClose, initialConversationId }) => {
  const { user } = useAuthStore();
  const { messages, createConversation, addMessage, setActiveConversation } = useChatStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Session State
  const [isSessionActive, setIsSessionActive] = useState(true);
  const [conversationId, setConversationId] = useState<string | null>(initialConversationId || null);
  const conversationIdRef = useRef<string | null>(initialConversationId || null);

  // Update ref whenever state changes
  useEffect(() => {
    conversationIdRef.current = conversationId;
  }, [conversationId]);

  // Sync state with props (important for "New Chat" navigation)
  useEffect(() => {
    setConversationId(initialConversationId || null);
  }, [initialConversationId]);

  // Store refs to avoid stale closures in VAD/Recorder logic
  const messagesRef = useRef(messages);
  useEffect(() => { messagesRef.current = messages; }, [messages]);

  // Audio State
  const [isRecording, setIsRecording] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [status, setStatus] = useState<'idle' | 'listening' | 'transcribing' | 'thinking' | 'speaking'>('idle');

  // Content State
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [displayedAiResponse, setDisplayedAiResponse] = useState('');
  const [showFlyingTranscript, setShowFlyingTranscript] = useState(false);

  // Refs for VAD and Audio
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const SILENCE_THRESHOLD = 20; // Increased from 5 to ignore more background noise
  const SILENCE_DURATION = 3000; // 3 seconds as requested

  const recordingStartTimeRef = useRef<number>(0);

  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = useCallback(async () => {
    if (!isSessionActive || !isMounted.current) return;

    try {
      setTranscript('');
      setAiResponse('');
      setDisplayedAiResponse('');

      const audioStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      // If we unmounted while waiting for the mic, stop it immediately
      if (!isMounted.current) {
        audioStream.getTracks().forEach(t => t.stop());
        return;
      }

      setStream(audioStream);
      streamRef.current = audioStream;

      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(audioStream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 512; // Higher resolution
      analyser.smoothingTimeConstant = 0.4; // Smoother data
      source.connect(analyser);
      analyserRef.current = analyser;

      const recorder = new MediaRecorder(audioStream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        processVoice();
      };

      recorder.start();
      recordingStartTimeRef.current = Date.now();
      setIsRecording(true);
      setStatus('listening');

      // VAD Implementation with Frequency Filtering
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      let lastSpeakTime = Date.now();
      let hasSpoken = false;

      const checkSilence = () => {
        if (!isMounted.current || !analyserRef.current || !mediaRecorderRef.current || mediaRecorderRef.current.state !== 'recording') return;

        analyserRef.current.getByteFrequencyData(dataArray);


        // Human speech is typically between 85Hz and 3000Hz
        // With 512 FFT and 44.1kHz, each bin is ~86Hz. 
        // We check bins 1 to 35 (approx 85Hz to 3000Hz)
        let speechEnergy = 0;
        let count = 0;
        for (let i = 1; i < 35; i++) {
          speechEnergy += dataArray[i];
          count++;
        }
        const avgSpeechEnergy = speechEnergy / count;

        if (avgSpeechEnergy > SILENCE_THRESHOLD + 90) {
          lastSpeakTime = Date.now();
          hasSpoken = true;


        } else {
          // Only stop if we've actually detected some speech first, 
          // or if it's been silent for a long time at the start.
          const silenceThreshold = hasSpoken ? SILENCE_DURATION : SILENCE_DURATION * 3;
          if (Date.now() - lastSpeakTime > silenceThreshold) {
            stopRecording();
            // console.log("stop recording")
            return;
          }
        }
        animationFrameRef.current = requestAnimationFrame(checkSilence);
        // console.log(avgSpeechEnergy)
      };

      checkSilence();
    } catch (err) {
      if (isMounted.current) {
        console.error('Microphone Access Error:', err);
        setStatus('idle');
      }
    }
  }, [isSessionActive]);

  const stopRecording = () => {
    // 1. Stop the media recorder if it's currently active
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }

    // 2. Clean up UI states and animation loops
    setIsRecording(false);
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);

    // 3. CRITICAL: Explicitly stop all stream tracks to release the hardware mic
    const activeStream = streamRef.current || stream;
    if (activeStream) {
      activeStream.getTracks().forEach(track => {
        track.stop();
        track.enabled = false;
      });
      setStream(null);
      streamRef.current = null;
    }
  };

  const processVoice = async () => {
    const recordingDuration = Date.now() - recordingStartTimeRef.current;

    if (chunksRef.current.length === 0) {
      setStatus('idle');
      return;
    }

    // Discard if less than 4 seconds
    if (recordingDuration <= 4000) {
      console.log('Audio chunk too short (<= 4s), discarding...');
      setStatus('idle');
      setTimeout(startRecording, 500);
      return;
    }

    try {
      setStatus('transcribing');
      const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
      const formData = new FormData();
      formData.append('file', audioBlob, 'voice.webm');

      const data = await aiService.transcribeAudio(formData);

      if (data.success) {
        const userText = data.data.text;
        setTranscript(userText);
        setShowFlyingTranscript(true);
        setTimeout(() => setShowFlyingTranscript(false), 1000);

        setStatus('thinking');

        const { data: { session } } = await supabase.auth.getSession();
        const chatResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/ai/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({
            messages: [...messagesRef.current.map(m => ({ role: m.role, content: m.content })), { role: 'user', content: userText }],
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
                if (parsed.content) {
                  fullAiText += parsed.content;
                  setDisplayedAiResponse(prev => prev + parsed.content);
                }
              } catch (e) { }
            }
          }
        }

        setAiResponse(fullAiText);

        if (user?.id) {
          let currentConvId = conversationIdRef.current;
          if (!currentConvId) {
            const conv = await createConversation(user.id, userText.slice(0, 30), 'voice');
            if (conv) {
              currentConvId = conv.id;
              setConversationId(conv.id);
            }
          }

          if (currentConvId) {
            await addMessage(currentConvId, 'user', userText, { mode: 'voice' });
            await addMessage(currentConvId, 'assistant', fullAiText, { mode: 'voice' });

            // Navigate if it's the first message of a new conversation
            if (!initialConversationId && currentConvId) {
              navigate(`/voice/chat/${currentConvId}`, { replace: true });
            }

            setStatus('speaking');
            const audioBlob = await aiService.generateSpeech(fullAiText);
            const url = URL.createObjectURL(audioBlob);

            if (audioRef.current) {
              audioRef.current.src = url;
              audioRef.current.onended = () => {
                setStatus('listening');
                setTimeout(startRecording, 500);
              };
              audioRef.current.play();
            }
          }
        }
      }
    } catch (err: any) {
      console.error('Voice Processing Error:', err);
      setStatus('idle');
      setTimeout(startRecording, 2000);
    }
  };

  const handleManualClose = () => {
    setIsSessionActive(false);
    stopRecording();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    onClose();
  };

  useEffect(() => {
    const timer = setTimeout(startRecording, 1000);
    return () => {
      clearTimeout(timer);
      stopRecording(); // CRITICAL: Stop recording and release mic on unmount
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [startRecording]);
  const repeat = () => {
    if (audioRef.current) {

      audioRef.current.play();
    }
  }
  return (
    <div className={styles.overlayContainer}>
      <div className={styles.visualizerWrapper}>
        <VoiceVisualizer
          stream={stream}
          audioElement={audioRef.current}
          isActive={true}
          isGray={status === 'idle' || status === 'transcribing' || status === 'thinking'}
        />
      </div>

      <div className={styles.topBar}>
        <button onClick={handleManualClose} className={styles.closeButton}>
          <X size={24} />
        </button>
      </div>

      <div onClick={repeat} className={styles.statusIndicator}>
        <div className={`${styles.statusDot} ${styles[status]}`} />
        <span>
          {status === 'listening' ? 'AI is Listening' :
            status === 'speaking' ? 'AI is Speaking' :
              status === 'thinking' ? 'AI is Thinking' : 'Ready'}
        </span>
      </div>

      <div className={styles.contentOverlay}>
        <AnimatePresence>
          {transcript && !showFlyingTranscript && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={styles.transcriptArea}
            >
              <p className={styles.userText}>{transcript}</p>
            </motion.div>
          )}

          {showFlyingTranscript && (
            <motion.div
              initial={{ opacity: 1, x: '-50%', y: '300px', scale: 1 }}
              animate={{ opacity: 0, x: '-50%', y: '0px', scale: 0.2 }}
              transition={{ duration: 0.8, ease: 'backIn' }}
              className={styles.animatedTranscript}
              style={{ left: '50%' }}
            >
              {transcript}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {displayedAiResponse && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={styles.aiResponseArea}
            >
              <div className={styles.aiText}>
                {displayedAiResponse}
                {status === 'thinking' && <span className={styles.streamingCursor}>|</span>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <audio ref={audioRef} style={{ display: 'none' }} />
    </div>
  );
};
