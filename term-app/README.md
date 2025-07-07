# FlowCast Terminal App

Turn YouTube or MP4 videos into social media posts for Twitter, Instagram, and LinkedIn using Gemini 3.5/2.5.

## Setup

1. Clone the repo and navigate to the `flowcast` directory:
   ```sh
   cd flowcast
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Copy `.env.example` to `.env` and add your Gemini API key:
   ```sh
   cp .env.example .env
   # Edit .env and set GEMINI_API_KEY=your-key-here
   ```

## Usage

Run the app:
```sh
npm start
```

- Enter a YouTube video link or a path to an MP4 file when prompted.
- Select which platforms you want posts for (Twitter, Instagram, LinkedIn).
- The app will extract audio, transcribe it using Gemini, and generate a post for each platform using custom prompts.
- Each post will be displayed in a styled terminal box.

## Requirements
- Node.js 18+
- ffmpeg (bundled via ffmpeg-static)
- Gemini API key (get from Google AI Studio)

## Notes
- Audio and video files are processed locally; only the audio is sent to Gemini for transcription and content generation.
- Prompts for each platform can be customized in `app.js`. 