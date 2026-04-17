import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { supabaseAdmin } from '../lib/supabase';
import { aiService } from '../services/ai.service';
import multer from 'multer';
import fs from 'fs';

const router = Router();
const upload = multer({ dest: 'uploads/' });

// Streaming Chat Completion
router.post('/chat', authMiddleware, async (req: any, res) => {
  try {
    const { messages, model } = req.body;
    const userId = req.user.id;

    // 1. Get encrypted API key from DB
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('nvidia_api_key')
      .eq('id', userId)
      .single();

    if (error || !user?.nvidia_api_key) {
      return res.status(400).json({ 
        success: false, 
        message: 'NVIDIA API Key not found. Please add it in settings.' 
      });
    }

    // 2. Set headers for streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // 3. Initiate stream
    const stream = await aiService.streamChat(user.nvidia_api_key, messages, model);

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error: any) {
    console.error('AI Stream Error:', error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: error.message });
    } else {
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      res.end();
    }
  }
});

// Image Generation
router.post('/image', authMiddleware, async (req: any, res) => {
  try {
    const { prompt, model } = req.body;
    const userId = req.user.id;

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('nvidia_api_key')
      .eq('id', userId)
      .single();

    if (error || !user?.nvidia_api_key) {
      return res.status(400).json({ 
        success: false, 
        message: 'NVIDIA API Key not found. Please add it in settings.' 
      });
    }

    const result = await aiService.generateImage(user.nvidia_api_key, prompt, model);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Voice Transcription
router.post('/voice', authMiddleware, upload.single('file'), async (req: any, res) => {
  try {
    const file = req.file;
    const userId = req.user.id;

    if (!file) {
      return res.status(400).json({ success: false, message: 'Audio file is required' });
    }

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('nvidia_api_key')
      .eq('id', userId)
      .single();

    if (error || !user?.nvidia_api_key) {
      return res.status(400).json({ 
        success: false, 
        message: 'NVIDIA API Key not found. Please add it in settings.' 
      });
    }

    // Convert file to stream/buffer as expected by OpenAI SDK
    const fileStream = fs.createReadStream(file.path);
    const result = await aiService.transcribeAudio(user.nvidia_api_key, fileStream);

    // Clean up uploaded file
    fs.unlinkSync(file.path);

    res.json({ success: true, data: result });
  } catch (error: any) {
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
