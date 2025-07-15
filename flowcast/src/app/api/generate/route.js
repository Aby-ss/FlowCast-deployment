import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { GoogleGenAI } from '@google/genai';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Helper to extract video ID from YouTube URL
function extractVideoId(url) {
  const match = url.match(/(?:v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/);
  return match ? match[1] : null;
}

// Get video info using yt-dlp
async function getVideoInfo(videoId) {
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
  try {
    const { stdout } = await execAsync(`yt-dlp "${videoUrl}" --dump-json --no-warnings --no-check-certificates`);
    const info = JSON.parse(stdout);
    return {
      title: info.title || '',
    };
  } catch (error) {
    return { title: '' };
  }
}

// Simple transcript generation from video description
async function generateTranscriptFromVideo(videoUrl) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not set in .env');
  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{
        text: `Based on this YouTube video URL: ${videoUrl}, generate a detailed transcript of what the video content would likely be about. Include key points, main topics discussed, and important insights. Make it sound like an actual transcript of the video content.`
      }],
    });
    return response.text;
  } catch (err) {
    console.error('Transcript generation failed:', err.message);
    return '[Transcript generation failed]';
  }
}

// Platform-specific prompt templates
const PLATFORM_PROMPTS = {
  Twitter: (transcript, videoLink) => {
    const prompt = fs.readFileSync(path.join(process.cwd(), 'src/app/api/generate/prompts', 'twitter.md'), 'utf8');
    return prompt.replace('${transcript}', transcript).replace('${videoLink}', videoLink);
  },
  Instagram: (transcript, videoLink) => {
    const prompt = fs.readFileSync(path.join(process.cwd(), 'src/app/api/generate/prompts', 'instagram.md'), 'utf8');
    return prompt.replace('${transcript}', transcript).replace('${videoLink}', videoLink);
  },
  LinkedIn: (transcript, videoLink) => {
    const prompt = fs.readFileSync(path.join(process.cwd(), 'src/app/api/generate/prompts', 'linkedin.md'), 'utf8');
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
    const { youtubeUrl, instructions, platforms, numCopies } = body;

    if (!youtubeUrl) {
      return NextResponse.json({ success: false, error: 'YouTube URL is required' });
    }
    if (!platforms || platforms.length === 0) {
      return NextResponse.json({ success: false, error: 'At least one platform must be selected' });
    }

    // Get video title using yt-dlp
    let videoTitle = '';
    const videoId = extractVideoId(youtubeUrl);
    if (videoId) {
      const info = await getVideoInfo(videoId);
      videoTitle = info.title || '';
    }

    // Generate transcript from video URL
    const transcript = await generateTranscriptFromVideo(youtubeUrl);
    if (!transcript || transcript === '[Transcript generation failed]') {
      return NextResponse.json({ success: false, error: 'Failed to generate transcript' });
    }
    const videoLink = youtubeUrl;

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

    return NextResponse.json({ success: true, posts, videoTitle: videoTitle || 'Video Title' });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' });
  }
} 