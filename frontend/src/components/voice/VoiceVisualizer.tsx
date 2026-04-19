import React, { useEffect, useRef } from 'react';
import { audioGraph } from '../../lib/audio';

interface VoiceVisualizerProps {
  stream?: MediaStream | null;
  audioElement?: HTMLAudioElement | null;
  isActive: boolean;
  isGray?: boolean;
}

export const VoiceVisualizer: React.FC<VoiceVisualizerProps> = ({
  stream,
  audioElement,
  isActive,
  isGray = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);
  const particlesRef = useRef<any[]>([]);

  // Audio state smoothing
  const smoothedLevelRef = useRef(0);

  useEffect(() => {
    // Initialize particles once for the 3D sphere
    const particleCount = 600; // Optimal density vs performance
    const particles = [];
    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);
      particles.push({
        theta,
        phi,
        speedTheta: (Math.random() - 0.5) * 0.013,
        speedPhi: (Math.random() - 0.5) * 0.008,
        baseHue: 200 + Math.random() * 60, // Blues and Purples
        size: Math.random() * 1.5 + 0.5,
      });
    }
    particlesRef.current = particles;
  }, []);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;
    const canvas = canvasRef.current;
    const container = containerRef.current;

    const handleResize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.scale(dpr, dpr);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);
    handleResize();

    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    let active = true;

    const initAudio = async () => {
      try {
        let analyzer: AnalyserNode | null = null;

        if (stream || audioElement) {
          await audioGraph.resume();
          const ctx = audioGraph.getContext();
          const key = stream || audioElement!;
          const sourceNode = audioGraph.getSource(key);

          if (sourceNode) {
            analyzer = ctx.createAnalyser();
            analyzer.fftSize = 128;
            analyzer.smoothingTimeConstant = 0.8;
            analyzerRef.current = analyzer;
            sourceNode.connect(analyzer);
          }
        }

        const dataArray = analyzer ? new Uint8Array(analyzer.frequencyBinCount) : null;
        let rotation = 0;

        const draw = () => {
          if (!active || !canvasRef.current || !isActive) return;

          const canvas = canvasRef.current;
          const ctxCanvas = canvas.getContext('2d');
          if (!ctxCanvas) return;

          const dpr = window.devicePixelRatio || 1;
          const width = canvas.width / dpr;
          const height = canvas.height / dpr;

          let currentLevel = 0;
          if (analyzer && dataArray) {
            analyzer.getByteFrequencyData(dataArray);
            const sum = dataArray.reduce((acc, val) => acc + val, 0);
            currentLevel = sum / dataArray.length / 255;
          } else {
            // Subtle breathing effect when idle
            currentLevel = (Math.sin(Date.now() / 1000) + 1) * 0.02;
          }

          smoothedLevelRef.current += (currentLevel - smoothedLevelRef.current) * 0.15;
          const level = smoothedLevelRef.current;

          ctxCanvas.clearRect(0, 0, width, height);
          ctxCanvas.save();
          ctxCanvas.translate(width / 2, height / 2);

          rotation += 0.002 + level * 0.012;
          const baseRadius = Math.min(width, height) * 0.20;
          const dynamicRadius = baseRadius * (1 + level * 3.8);

          // Inner Glow
          const glowGrade = ctxCanvas.createRadialGradient(0, 0, 0, 0, 0, dynamicRadius);
          const glowHue = isGray ? 0 : 215;
          const glowSat = isGray ? '0%' : '100%';
          glowGrade.addColorStop(0, `hsla(${glowHue}, ${glowSat}, 65%, ${0.03 + level * 0.15})`);
          glowGrade.addColorStop(1, 'transparent');
          ctxCanvas.fillStyle = glowGrade;
          ctxCanvas.beginPath();
          ctxCanvas.arc(0, 0, dynamicRadius * 2, 0, Math.PI * 2);
          ctxCanvas.fill();

          // 3D Particles
          particlesRef.current.forEach(p => {
            p.theta += p.speedTheta;
            p.phi += p.speedPhi;

            const x = dynamicRadius * Math.sin(p.phi) * Math.cos(p.theta + rotation);
            const y = dynamicRadius * Math.sin(p.phi) * Math.sin(p.theta + rotation);
            const z = dynamicRadius * Math.cos(p.phi);

            const perspective = 500;
            const scale = perspective / (perspective + z);
            const px = x * scale;
            const py = y * scale;

            const isFront = z < 0;
            const zFactor = (z + dynamicRadius) / (dynamicRadius * 2);
            const opacity = 0.25 + zFactor * 0.75;
            const size = p.size * scale * (1 + level * 1.4);

            const hue = isGray ? 0 : (p.baseHue + level * 30);
            const sat = isGray ? '0%' : '85%';
            ctxCanvas.fillStyle = `hsla(${hue}, ${sat}, 75%, ${opacity})`;

            if (isFront && level > 0.05 && !isGray) {
              ctxCanvas.shadowBlur = size * 3;
              ctxCanvas.shadowColor = `hsla(${hue}, 85%, 75%, 0.4)`;
            } else {
              ctxCanvas.shadowBlur = 0;
            }

            ctxCanvas.beginPath();
            ctxCanvas.arc(px, py, size, 0, Math.PI * 2);
            ctxCanvas.fill();
          });

          ctxCanvas.restore();
          animationRef.current = requestAnimationFrame(draw);
        };

        draw();
      } catch (err) {
        console.error('Audio Visualizer error:', err);
      }
    };

    initAudio();

    return () => {
      active = false;
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (analyzerRef.current) {
        try {
          const key = stream || audioElement!;
          const sourceNode = audioGraph.getSource(key);
          if (sourceNode) sourceNode.disconnect(analyzerRef.current);
        } catch (e) { }
      }
      analyzerRef.current = null;
    };
  }, [isActive, stream, audioElement, isGray]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        inset: 0,
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
          opacity: isActive ? (isGray ? 0.4 : 1) : 0,
          transition: 'opacity 0.8s ease-in-out',
        }}
      />
    </div>
  );
};
