import { NextResponse } from 'next/server';
import path from 'path';
import { generatePostContent, transcribeVideo } from '../../../../../term-app/app.js';
import fs from 'fs';

const PLATFORM_PROMPTS = {
  Twitter: (transcript) => {
    const prompt = fs.readFileSync(path.resolve(process.cwd(), '../term-app/prompts/twitter.md'), 'utf8');
    return prompt.replace('${transcript}', transcript);
  },
  Instagram: (transcript) => {
    const prompt = fs.readFileSync(path.resolve(process.cwd(), '../term-app/prompts/instagram.md'), 'utf8');
    return prompt.replace('${transcript}', transcript);
  },
  LinkedIn: (transcript) => {
    const prompt = fs.readFileSync(path.resolve(process.cwd(), '../term-app/prompts/linkedin.md'), 'utf8');
    return prompt.replace('${transcript}', transcript);
  },
};

const PLATFORM_ADDON_PROMPTS = {
  Twitter: "Make sure the post is very short and not so long. Make sure to use a conversational tone and a very informative structure which is still very non-formal.",
  Instagram: "Make sure the post is short and not so long that reading it takes a lot of time. Add a question at the end to encourage comments and make sure it connects with people in the very beginning to stop people from scrolling away",
  LinkedIn: "Highlight a key professional takeaway in the conclusion and ask the users to drop in their advice or ask them a question to get them typing in the comments",
};

export async function POST(req) {
  try {
    const body = await req.json();
    const { youtubeUrl, instructions, platforms, numCopies } = body;
    if (!youtubeUrl) {
      return NextResponse.json({ success: false, error: 'YouTube URL is required.' }, { status: 400 });
    }
    if (!platforms || !Array.isArray(platforms) || platforms.length === 0) {
      return NextResponse.json({ success: false, error: 'At least one platform must be selected.' }, { status: 400 });
    }
    const copies = Math.max(1, Math.min(Number(numCopies) || 1, 10));

    // Transcribe once
    let transcript;
    try {
      transcript = await transcribeVideo(youtubeUrl);
    } catch (err) {
      return NextResponse.json({ success: false, error: 'Transcription failed: ' + (err.message || err) }, { status: 500 });
    }
    if (!transcript || transcript.trim() === '' || transcript.startsWith('[Transcription failed]')) {
      return NextResponse.json({ success: false, error: 'No transcript available.' }, { status: 500 });
    }

    // Generate posts for each platform/copy in parallel
    const posts = {};
    await Promise.all(platforms.map(async (platform) => {
      const copyPromises = [];
      for (let i = 1; i <= copies; i++) {
        let basePrompt = PLATFORM_PROMPTS[platform](transcript);
        const videoLinkLine = `\n\nVideo link: ${youtubeUrl}`;
        basePrompt += videoLinkLine;
        basePrompt += `\n\n${PLATFORM_ADDON_PROMPTS[platform] || ''}`;
        let promptText = basePrompt;
        if (copies > 1) {
          promptText += `\n\nVary the style, structure, or focus for post #${i}.`;
        }
        copyPromises.push(
          generatePostContent(transcript, platform, promptText)
            .catch(err => `[Failed to generate post: ${err.message}]`)
        );
      }
      posts[platform] = await Promise.all(copyPromises);
    }));
    return NextResponse.json({ success: true, posts });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
} 