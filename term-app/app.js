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
import axios from 'axios';

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

// 3. Prompt for number of posts per platform
async function getNumPosts() {
  const { numPosts } = await prompt({
    type: 'input',
    name: 'numPosts',
    message: 'How many posts do you want to generate per platform?',
    initial: '1',
    validate: (input) => {
      const n = parseInt(input, 10);
      return n > 0 && n <= 10 ? true : 'Please enter a number between 1 and 10.';
    },
  });
  return parseInt(numPosts, 10);
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

// Fetch last 3 tweets for a username (using scraping as fallback)
async function getLastTweets(username) {
  try {
    // Try Twitter API v2 (if bearer token is set)
    const bearer = process.env.TWITTER_BEARER_TOKEN;
    if (bearer) {
      const url = `https://api.twitter.com/2/tweets/search/recent?query=from:${username}&tweet.fields=created_at&max_results=3`;
      const res = await axios.get(url, { headers: { Authorization: `Bearer ${bearer}` } });
      return res.data.data.map(t => t.text);
    }
  } catch (err) {
    // Fallback to scraping
  }
  // Fallback: scrape using nitter.net
  try {
    const res = await axios.get(`https://nitter.net/${username}`);
    const matches = [...res.data.matchAll(/<div class="tweet-content media-body">([\s\S]*?)<\/div>/g)];
    return matches.slice(0, 3).map(m => m[1].replace(/<[^>]+>/g, '').trim());
  } catch (err) {
    return ['Could not fetch tweets.'];
  }
}

// Fetch last 3 LinkedIn posts for a username (scraping public profile)
async function getLastLinkedInPosts(username) {
  // LinkedIn API is not public, so we scrape the public profile posts
  try {
    const res = await axios.get(`https://www.linkedin.com/in/${username}/detail/recent-activity/shares/`);
    const matches = [...res.data.matchAll(/<span class="break-words">([\s\S]*?)<\/span>/g)];
    return matches.slice(0, 3).map(m => m[1].replace(/<[^>]+>/g, '').trim());
  } catch (err) {
    return ['Could not fetch LinkedIn posts.'];
  }
}

// Main flow
(async () => {
  try {
    // Move mode selection to the very top
    const { mode } = await prompt({
      type: 'select',
      name: 'mode',
      message: 'What do you want to do?',
      choices: [
        { name: 'Generate social posts from video', value: 'generate' },
        { name: 'Fetch user post history', value: 'history' },
      ],
    });
    console.log('DEBUG: mode selected:', mode);
    if (mode === 'history' || mode === 'Fetch user post history') {
      await printUserHistory();
      return;
    }
    // Only runs if mode is 'generate'
    const videoSource = await getVideoInput();
    const platforms = await getPlatforms();
    if (!platforms || platforms.length === 0) {
      console.log(chalk.red('No platforms selected. Exiting.'));
      process.exit(1);
    }
    const numPosts = await getNumPosts();
    const transcript = await transcribeVideo(videoSource);
    if (!transcript || transcript.trim() === '' || transcript.startsWith('[Transcription failed]')) {
      console.log(chalk.red('No transcript available. Exiting.'));
      process.exit(1);
    }
    for (const platform of platforms) {
      const basePrompt = `${PLATFORM_PROMPTS[platform](transcript)}\n\n${PLATFORM_ADDON_PROMPTS[platform] || ''}`;
      for (let i = 1; i <= numPosts; i++) {
        let promptText = basePrompt;
        if (numPosts > 1) {
          promptText += `\n\nVary the style, structure, or focus for post #${i}.`;
        }
        const content = await generatePostContent(transcript, platform, promptText);
        displayPost(`${platform} (Post ${i} of ${numPosts})`, content);
      }
    }
    console.log(chalk.green('All posts generated!'));
  } catch (err) {
    console.error(chalk.red('An error occurred:'), err.message);
    process.exit(1);
  }
})();

// Prompt for username and platform, then print last 3 posts
async function printUserHistory() {
  const { platform } = await prompt({
    type: 'select',
    name: 'platform',
    message: 'Which platform do you want to fetch history from?',
    choices: ['Twitter', 'LinkedIn'],
  });
  const { username } = await prompt({
    type: 'input',
    name: 'username',
    message: `Enter the ${platform} username:`,
  });
  let posts = [];
  if (platform === 'Twitter') {
    posts = await getLastTweets(username);
  } else {
    posts = await getLastLinkedInPosts(username);
  }
  console.log(`\nLast 3 posts for ${username} on ${platform}:\n`);
  posts.forEach((post, i) => {
    console.log(`${i + 1}. ${post}\n`);
  });
}


// Exportable functions for website usage
export async function generatePostFromYouTube(videoUrl, platform, customInstructions = '') {
  const transcript = await transcribeVideo(videoUrl);
  if (!transcript || transcript.trim() === '' || transcript.startsWith('[Transcription failed]')) {
    throw new Error('No transcript available.');
  }
  let basePrompt = PLATFORM_PROMPTS[platform](transcript);
  if (customInstructions) {
    basePrompt += `\n\n${customInstructions}`;
  }
  const addon = PLATFORM_ADDON_PROMPTS[platform] || '';
  const promptText = `${basePrompt}\n\n${addon}`;
  return await generatePostContent(transcript, platform, promptText);
}

export async function generatePostFromMp4(mp4Path, platform, customInstructions = '') {
  const transcript = await transcribeVideo(mp4Path);
  if (!transcript || transcript.trim() === '' || transcript.startsWith('[Transcription failed]')) {
    throw new Error('No transcript available.');
  }
  let basePrompt = PLATFORM_PROMPTS[platform](transcript);
  if (customInstructions) {
    basePrompt += `\n\n${customInstructions}`;
  }
  const addon = PLATFORM_ADDON_PROMPTS[platform] || '';
  const promptText = `${basePrompt}\n\n${addon}`;
  return await generatePostContent(transcript, platform, promptText);
}

// Platform-specific helpers for website usage
export async function generateTwitterPostFromYouTube(videoUrl, customInstructions = '') {
  return generatePostFromYouTube(videoUrl, 'Twitter', customInstructions);
}
export async function generateInstagramPostFromYouTube(videoUrl, customInstructions = '') {
  return generatePostFromYouTube(videoUrl, 'Instagram', customInstructions);
}
export async function generateLinkedInPostFromYouTube(videoUrl, customInstructions = '') {
  return generatePostFromYouTube(videoUrl, 'LinkedIn', customInstructions);
}
export async function generateTwitterPostFromMp4(mp4Path, customInstructions = '') {
  return generatePostFromMp4(mp4Path, 'Twitter', customInstructions);
}
export async function generateInstagramPostFromMp4(mp4Path, customInstructions = '') {
  return generatePostFromMp4(mp4Path, 'Instagram', customInstructions);
}
export async function generateLinkedInPostFromMp4(mp4Path, customInstructions = '') {
  return generatePostFromMp4(mp4Path, 'LinkedIn', customInstructions);
}
