import { generatePostFromYouTube } from './app.js';

async function main() {
  const [,, youtubeUrl, instructions] = process.argv;
  if (!youtubeUrl) {
    console.error('YouTube URL required');
    process.exit(1);
  }
  try {
    const post = await generatePostFromYouTube(youtubeUrl, 'Twitter', instructions || '');
    // You can change 'Twitter' to support other platforms if needed
    process.stdout.write(JSON.stringify({ post }));
  } catch (err) {
    process.stderr.write(err.message || 'Failed to generate post.');
    process.exit(1);
  }
}

main(); 