// Global audio graph management to prevent "already connected" errors and handle singleton AudioContext
export class AudioGraphManager {
  private ctx: AudioContext | null = null;
  private sourceNodes = new Map<HTMLMediaElement | MediaStream, AudioNode>();

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    return this.ctx;
  }

  getContext(): AudioContext {
    return this.initContext();
  }

  async resume(): Promise<void> {
    const ctx = this.initContext();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
  }

  getSource(key: HTMLMediaElement | MediaStream): AudioNode | null {
    const ctx = this.initContext();
    let sourceNode = this.sourceNodes.get(key);

    if (!sourceNode) {
      try {
        if (key instanceof MediaStream) {
          sourceNode = ctx.createMediaStreamSource(key);
        } else if (key instanceof HTMLMediaElement) {
          sourceNode = ctx.createMediaElementSource(key);
          // For media elements, we often want to still hear them
          sourceNode.connect(ctx.destination);
        }
        
        if (sourceNode) {
          this.sourceNodes.set(key, sourceNode);
        }
      } catch (err) {
        console.error('Error creating source node:', err);
        return null;
      }
    }

    return sourceNode || null;
  }
}

export const audioGraph = new AudioGraphManager();
