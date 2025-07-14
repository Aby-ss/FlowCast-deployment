import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import ytdlp from 'yt-dlp-exec';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

ffmpeg.setFfmpegPath(ffmpegPath);

// Helper: Download YouTube audio as MP3 using yt-dlp
async function downloadYouTubeAudio(url, outputPath) {
  try {
    await ytdlp.exec(url, {
      extractAudio: true,
      audioFormat: 'mp3',
      output: outputPath,
      format: 'bestaudio'
    });
    return outputPath;
  } catch (err) {
    throw new Error('yt-dlp failed: ' + err.message);
  }
}

// Helper: Extract audio from MP4 as MP3
async function extractAudioFromMp4(mp4Path, outputPath) {
  return new Promise((resolve, reject) => {
    ffmpeg(mp4Path)
      .noVideo()
      .audioCodec('libmp3lame')
      .format('mp3')
      .save(outputPath)
      .on('end', () => resolve(outputPath))
      .on('error', reject);
  });
}

// Helper: Detect if input is YouTube URL
function isYouTubeUrl(input) {
  return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//.test(input);
}

// Helper: Detect if input is MP4 file
function isMp4File(input) {
  return input.toLowerCase().endsWith('.mp4');
}

// Gemini transcription
async function transcribeWithGemini(audioPath) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not set in .env');
  const ai = new GoogleGenAI({ apiKey });

  // Upload audio file
  const myfile = await ai.files.upload({
    file: audioPath,
    config: { mimeType: 'audio/mp3' },
  });

  // Request transcript
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      { text: 'Generate a transcript of the speech.' },
      { fileData: { mimeType: 'audio/mp3', fileUri: myfile.uri } },
    ],
  });
  return response.text;
}

// Transcribe video function
async function transcribeVideo(videoSource) {
  const tempDir = path.join(__dirname, 'tmp');
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
  const audioPath = path.join(tempDir, `audio_${Date.now()}.mp3`);

  try {
    if (isYouTubeUrl(videoSource)) {
      await downloadYouTubeAudio(videoSource, audioPath);
    } else if (isMp4File(videoSource)) {
      await extractAudioFromMp4(videoSource, audioPath);
    } else {
      throw new Error('Input must be a YouTube link or an MP4 file path.');
    }
    const transcript = await transcribeWithGemini(audioPath);
    return transcript;
  } catch (err) {
    console.error('Transcription failed:', err.message);
    return '[Transcription failed]';
  } finally {
    if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
  }
}

// Platform-specific prompt templates
const PLATFORM_PROMPTS = {
  Twitter: (transcript, videoLink) => {
    const prompt = fs.readFileSync(path.join(process.cwd(), 'term-app', 'prompts', 'twitter.md'), 'utf8');
    return prompt.replace('${transcript}', transcript).replace('${videoLink}', videoLink);
  },
  Instagram: (transcript, videoLink) => {
    const prompt = fs.readFileSync(path.join(process.cwd(), 'term-app', 'prompts', 'instagram.md'), 'utf8');
    return prompt.replace('${transcript}', transcript).replace('${videoLink}', videoLink);
  },
  LinkedIn: (transcript, videoLink) => {
    const prompt = fs.readFileSync(path.join(process.cwd(), 'term-app', 'prompts', 'linkedin.md'), 'utf8');
    return prompt.replace('${transcript}', transcript).replace('${videoLink}', videoLink);
  },
};

// Generate post content
async function generatePostContent(transcript, platform, promptText) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not set in .env');
  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ text: promptText }],
    });
    return response.text;
  } catch (err) {
    console.error(`Gemini content generation failed for ${platform}:`, err.message);
    return `[Content generation failed for ${platform}]`;
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { youtubeUrl, mp4FileName, instructions, platforms, numCopies } = body;

    if (!youtubeUrl && !mp4FileName) {
      return NextResponse.json({ success: false, error: 'YouTube URL or MP4 file is required' });
    }

    if (!platforms || platforms.length === 0) {
      return NextResponse.json({ success: false, error: 'At least one platform must be selected' });
    }

    // Determine video source
    const videoSource = youtubeUrl || mp4FileName;
    const videoLink = youtubeUrl || `[Video: ${mp4FileName}]`;

    // Transcribe video once
    const transcript = await transcribeVideo(videoSource);
    if (transcript === '[Transcription failed]') {
      return NextResponse.json({ success: false, error: 'Failed to transcribe video' });
    }

    // Generate posts for each platform
    const posts = {};
    
    for (const platform of platforms) {
      posts[platform] = [];
      
      for (let i = 0; i < numCopies; i++) {
        const basePrompt = PLATFORM_PROMPTS[platform](transcript, videoLink);
        const fullPrompt = instructions ? `${basePrompt}\n\nAdditional Instructions: ${instructions}` : basePrompt;
        
        const postContent = await generatePostContent(transcript, platform, fullPrompt);
        posts[platform].push(postContent);
      }
    }

    return NextResponse.json({ success: true, posts });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' });
  }
} 