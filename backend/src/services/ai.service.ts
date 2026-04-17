import OpenAI from 'openai';
import { decrypt } from '../utils/encryption';

class AiService {
  private getNvidiaClient(apiKey: string) {
    return new OpenAI({
      apiKey: decrypt(apiKey),
      baseURL: 'https://integrate.api.nvidia.com/v1',
    });
  }

  async streamChat(apiKey: string, messages: any[], model: string = 'meta/llama3-70b-instruct') {
    const openai = this.getNvidiaClient(apiKey);

    return openai.chat.completions.create({
      model,
      messages,
      stream: true,
      max_tokens: 1024,
    });
  }

  async generateImage(apiKey: string, prompt: string, model: string = 'stabilityai/stable-diffusion-xl-base-1.0') {
    const openai = this.getNvidiaClient(apiKey);
    
    // NVIDIA NIM uses the same completions endpoint for some image models or specific endpoints
    // For now, let's assume a standard image generation call if supported, 
    // or placeholder for the specific NVIDIA NIM Image API.
    // NOTE: SDXL on NVIDIA NIM often uses the 'images/generations' endpoint if compatible.
    
    return openai.images.generate({
      model,
      prompt,
      n: 1,
      size: '1024x1024',
    });
  }

  async transcribeAudio(apiKey: string, file: any, model: string = 'openai/whisper-large-v3') {
    const openai = this.getNvidiaClient(apiKey);
    
    return openai.audio.transcriptions.create({
      file,
      model,
    });
  }
}

export const aiService = new AiService();
