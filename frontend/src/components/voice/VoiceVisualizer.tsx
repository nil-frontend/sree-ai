import React, { useEffect, useRef } from 'react';

interface VoiceVisualizerProps {
  stream: MediaStream | null;
  isRecording: boolean;
}

export const VoiceVisualizer: React.FC<VoiceVisualizerProps> = ({ stream, isRecording }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);

  // Helper to safely get CSS variables
  const getCSSVar = (name: string, fallback: string) => {
    try {
      if (typeof window === 'undefined') return fallback;
      const val = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
      return val || fallback;
    } catch (e) {
      return fallback;
    }
  };

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    
    const handleResize = () => {
      const rect = container.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        canvas.width = rect.width;
        canvas.height = rect.height;
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);
    handleResize();

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    let isActive = true;

    if (isRecording && stream) {
      const initAudio = async () => {
        try {
          const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
          if (!AudioCtx) return;

          const ctx = new AudioCtx();
          audioContextRef.current = ctx;

          if (ctx.state === 'suspended') {
            await ctx.resume();
          }

          const source = ctx.createMediaStreamSource(stream);
          const analyzer = ctx.createAnalyser();
          analyzer.fftSize = 256; // Smaller for smoother performance
          analyzerRef.current = analyzer;
          source.connect(analyzer);

          const bufferLength = analyzer.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);
          const primaryColor = getCSSVar('--primary', '#3B82F6');

          const draw = () => {
            if (!isActive || !canvasRef.current || !analyzerRef.current || !isRecording) return;
            
            const canvas = canvasRef.current;
            const drawCtx = canvas.getContext('2d');
            if (!drawCtx) return;

            analyzerRef.current.getByteFrequencyData(dataArray);

            const width = canvas.width;
            const height = canvas.height;
            if (width === 0 || height === 0) {
              animationRef.current = requestAnimationFrame(draw);
              return;
            }

            drawCtx.clearRect(0, 0, width, height);

            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const average = sum / dataArray.length;
            const vol = Math.pow(average / 128, 1.2); 

            const time = Date.now() / 1000;

            const drawWave = (amplitude: number, frequency: number, phase: number, color: string | CanvasGradient, lineWidth: number) => {
              drawCtx.beginPath();
              drawCtx.strokeStyle = color;
              drawCtx.lineWidth = lineWidth;
              drawCtx.lineCap = 'round';
              
              for (let x = 0; x <= width; x += 5) {
                const tapering = Math.pow(Math.sin((x / width) * Math.PI), 2);
                const y = height / 2 + 
                          Math.sin(x * frequency + phase) * 
                          amplitude * vol * tapering;
                
                if (x === 0) drawCtx.moveTo(x, y);
                else drawCtx.lineTo(x, y);
              }
              drawCtx.stroke();
            };

            // Background layers
            drawWave(60, 0.012, time * 1.5, 'rgba(59, 130, 246, 0.1)', 1);
            drawWave(40, 0.018, time * -2, 'rgba(139, 92, 246, 0.15)', 1);
            
            // Primary dynamic wave
            const grad = drawCtx.createLinearGradient(0, 0, width, 0);
            grad.addColorStop(0, 'rgba(59, 130, 246, 0)');
            grad.addColorStop(0.5, primaryColor);
            grad.addColorStop(1, 'rgba(59, 130, 246, 0)');
            
            drawWave(30, 0.025, time * 4, grad, 2);

            animationRef.current = requestAnimationFrame(draw);
          };

          draw();
        } catch (err) {
          console.error('Audio Visualizer error:', err);
        }
      };

      initAudio();
    }

    return () => {
      isActive = false;
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
      analyzerRef.current = null;
    };
  }, [isRecording, stream]);

  return (
    <div 
      ref={containerRef}
      style={{ 
        position: 'absolute', 
        inset: -150, 
        zIndex: 0,
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          opacity: isRecording ? 1 : 0,
          transition: 'opacity 0.5s ease',
          filter: 'blur(1px)'
        }}
      />
      
      {/* Background Ambience */}
      <div style={{
          position: 'absolute',
          width: '100%',
          height: '100px',
          background: 'radial-gradient(ellipse at center, var(--primary-glow) 0%, transparent 70%)',
          opacity: isRecording ? 0.2 : 0,
          transition: 'opacity 0.5s ease',
          zIndex: -1,
          filter: 'blur(40px)'
      }} />
    </div>
  );
};
