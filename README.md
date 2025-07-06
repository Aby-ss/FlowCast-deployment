# FlowCast
FlowCast turns YouTube videos into platform-ready posts—threads, carousels, captions—so creators can grow faster with zero manual repurposing

## How it Works
The applications has a very straightforward user progression path where it all starts from the user providing a video link or video upload which is transcribed and processed for further LLM prompting, user selects platforms and number of posts per platform, background LLM requests and some post-processing later a suite of copies are printed on the screen

## Features and Questions
- Implementing images with the AI generated post copies
- Implementing carousel post logic for the posts and images for each post
- Preset Selector for each post and changing style of the post
- One-click rewrite for each post on the UI layout

## Post Layouts and UI
Each processed copy is shown as a post with matching social media platform and the text inside which can be copied, with each copy being made over a reusable UI components in the library. The UI would comprise of only two windows, first for data input and next for data output and showcase

## Prompting Outline
1. Instagram Posts : From having a strong hook to the actual post content, the prompt should include the main principles and examples to provide the LLm to ensure quality
   - Strong Hook
   - Content linked to the video content
   - CTA
   - Types of posts and carousel post ideas with caption generation
2. Twitter Posts : Twiiter posts attract users based on the trendy topics and the amount of information the user is provided with, so the posts must have a certain type of copy that the examples provide an outline for
   - Hook and Attention Grabbing Clause
   - Content structure and carousel post structure
   - CTA and links
3. LinkedIn Posts : LinkedIn posts could range from non-professional memes to very professional showcases of your personal projects and videos you post so a very specific structure should be followed to maximise that specifically