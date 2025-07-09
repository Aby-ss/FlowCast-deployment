// Required dependencies
import 'dotenv/config';
import enquirer from 'enquirer';
const { prompt, MultiSelect } = enquirer;
import boxen from 'boxen';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import { GoogleGenAI } from '@google/genai';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

ffmpeg.setFfmpegPath(ffmpegPath);

// 1. Prompt for YouTube link or MP4 file
async function getVideoInput() {
  const { videoSource } = await prompt({
    type: 'input',
    name: 'videoSource',
    message: 'Enter a YouTube video link or path to an MP4 file:',
  });
  return videoSource;
}

// 2. Prompt for platform selection
async function getPlatforms() {
  const promptPlatforms = new MultiSelect({
    name: 'platforms',
    message: 'Select platforms to generate posts for:',
    choices: ['Twitter', 'Instagram', 'LinkedIn'],
  });
  return await promptPlatforms.run();
}

// Helper: Download YouTube audio as MP3 using yt-dlp
async function downloadYouTubeAudio(url, outputPath) {
  try {
    // yt-dlp will save as outputPath exactly if outputPath ends with .mp3
    execSync(`yt-dlp -f bestaudio --extract-audio --audio-format mp3 --output "${outputPath}" "${url}"`, { stdio: 'inherit' });
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

// Overwrite transcribeVideo to use real logic
async function transcribeVideo(videoSource) {
  const tempDir = path.join(__dirname, 'tmp');
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
  const audioPath = path.join(tempDir, `audio_${Date.now()}.mp3`);

  try {
    if (isYouTubeUrl(videoSource)) {
      console.log(chalk.yellow('Downloading YouTube audio...'));
      await downloadYouTubeAudio(videoSource, audioPath);
    } else if (isMp4File(videoSource)) {
      console.log(chalk.yellow('Extracting audio from MP4...'));
      await extractAudioFromMp4(videoSource, audioPath);
    } else {
      throw new Error('Input must be a YouTube link or an MP4 file path.');
    }
    console.log(chalk.yellow('Transcribing audio with Gemini...'));
    const transcript = await transcribeWithGemini(audioPath);
    return transcript;
  } catch (err) {
    console.error(chalk.red('Transcription failed:'), err.message);
    return '[Transcription failed]';
  } finally {
    if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
  }
}

// Platform-specific prompt templates
const PLATFORM_PROMPTS = {
  Twitter: (transcript) => {
    const prompt = fs.readFileSync(path.join(__dirname, 'prompts', 'twitter.md'), 'utf8');
    return prompt.replace('${transcript}', transcript);
  },
  Instagram: (transcript) => {
    const prompt = fs.readFileSync(path.join(__dirname, 'prompts', 'instagram.md'), 'utf8');
    return prompt.replace('${transcript}', transcript);
  },
  LinkedIn: (transcript) => {
    const prompt = fs.readFileSync(path.join(__dirname, 'prompts', 'linkedin.md'), 'utf8');
    return prompt.replace('${transcript}', transcript);
  },
};

// Platform-specific add-on prompts
const PLATFORM_ADDON_PROMPTS = {
  Twitter: "Make sure the post is very short and not so long. Make sure to use a conversational tone and a very informative structure which is still very non-formal.",
  Instagram: "Make sure the post is short and not so long that reading it takes a lot of time. Add a question at the end to encourage comments and make sure it connects with people in the very beginning to stop people from scrolling away",
  LinkedIn: "Highlight a key professional takeaway in the conclusion and ask the users to drop in their advice or ask them a question to get them typing in the comments",
};

// Refactor generatePostContent to accept a custom prompt
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
    console.error(chalk.red(`Gemini content generation failed for ${platform}:`), err.message);
    return `[Content generation failed for ${platform}]`;
  }
}

// Add maybeRewritePost function
async function maybeRewritePost(transcript, platform, basePrompt) {
  let content = await generatePostContent(transcript, platform, basePrompt);
  displayPost(platform, content);

  while (true) {
    const { rewrite } = await prompt({
      type: 'confirm',
      name: 'rewrite',
      message: `Do you want to rewrite the ${platform} post?`,
      initial: false,
    });
    if (!rewrite) break;
    // Add rewrite instruction to the prompt
    const rewritePrompt = `${basePrompt}\n\nRewrite this post with a different style or structure, but keep the core message.`;
    content = await generatePostContent(transcript, platform, rewritePrompt);
    displayPost(platform, content);
  }
}

// 5. Display each post in a styled box
function displayPost(platform, content) {
  let borderColor = 'cyan';
  let title = chalk.bold.blue(platform);
  if (platform === 'Twitter') {
    borderColor = 'grey';
    title = chalk.bold.gray(platform);
  } else if (platform === 'Instagram') {
    borderColor = 'magentaBright'; // closest to purple/blue gradient
    title = chalk.bold.magentaBright(platform);
  } else if (platform === 'LinkedIn') {
    borderColor = 'blue';
    title = chalk.bold.blue(platform);
  }
  const box = boxen(content, {
    title,
    titleAlignment: 'center',
    padding: 1,
    margin: 1,
    borderStyle: 'round',
    borderColor,
  });
  console.log(box);
}

// Main flow
(async () => {
  try {
    const videoSource = await getVideoInput();
    const platforms = await getPlatforms();
    if (!platforms || platforms.length === 0) {
      console.log(chalk.red('No platforms selected. Exiting.'));
      process.exit(1);
    }
    const transcript = await transcribeVideo(videoSource);
    if (!transcript || transcript.trim() === '' || transcript.startsWith('[Transcription failed]')) {
      console.log(chalk.red('No transcript available. Exiting.'));
      process.exit(1);
    }
    for (const platform of platforms) {
      const basePrompt = `${PLATFORM_PROMPTS[platform](transcript)}\n\n${PLATFORM_ADDON_PROMPTS[platform] || ''}`;
      await maybeRewritePost(transcript, platform, basePrompt);
    }
    console.log(chalk.green('All posts generated!'));
  } catch (err) {
    console.error(chalk.red('An error occurred:'), err.message);
    process.exit(1);
  }
})();
