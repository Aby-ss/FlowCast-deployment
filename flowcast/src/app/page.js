import Image from "next/image";
import Link from "next/link";

// Section wrapper for modular section logic
function Section({ className = '', children, ...props }) {
  return (
    <section
      className={`w-full flex flex-col items-center justify-center ${className}`.trim()}
      {...props}
    >
      {children}
    </section>
  );
}

export default function Home() {
  return (
    <div className="relative min-h-screen bg-white" style={{ scrollBehavior: 'smooth' }}>
      <nav
        className="fixed top-4 left-1/2 -translate-x-1/2 w-[99vw] max-w-7xl flex items-center justify-between px-8 py-2 bg-[#8CC63E] rounded-full shadow-lg z-50 transition-all duration-700 ease-out opacity-0 animate-navbar-fadein"
        style={{ borderRadius: '9999px' }}
      >
        {/* Left: Logo/Image */}
        <div className="flex items-center">
          <Image src="/logo3.svg" alt="FlowCast Logo" width={120} height={120} />
        </div>
        {/* Center: Links */}
        <div className="flex gap-10">
          <a href="#home" className="text-white font-grand-local text-lg hover:underline">Home</a>
          <a href="#how-it-works" className="text-white font-grand-local text-lg hover:underline">How it Works</a>
          <a href="#features" className="text-white font-grand-local text-lg hover:underline">Features</a>
          <a href="#about" className="text-white font-grand-local text-lg hover:underline">About</a>
        </div>
        {/* Right: Button Image */}
        <Link href="/webapp" passHref legacyBehavior>
          <a className="flex items-center cursor-pointer justify-center rounded-full p-2 transition group">
            <Image src="/button.svg" alt="User" width={90} height={90} className="transition-transform duration-300 group-hover:scale-110 group-hover:rotate-2" />
          </a>
        </Link>
      </nav>

      <main id="home" className="flex flex-col items-center justify-center pt-24 w-full min-h-[60vh] relative">
        {/* Background image for the section, larger than the section */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-350 z-0" style={{ width: '150%', maxWidth: '55rem', height: '140%', maxHeight: '42rem' }}>
          <Image
            src="/Background.png"
            alt="Background"
            fill
            className="object-cover translate-y-40 rounded-2xl w-full h-full"
            style={{ objectFit: 'cover' }}
            priority
          />
        </div>
        
        {/* Landing Page section */}
        <Section className="relative font-semibold max-w-2xl rounded-xl p-10 z-10" style={{ background: 'transparent' }}>
          {/* Floating images around the heading */}
          <Image
            src="/Post Card 1.svg"
            alt="Left"
            width={328}
            height={328}
            className="absolute left-0 top-1/2 translate-y-3 -translate-x-45 z-10 animate-float-slow"
            style={{ pointerEvents: 'none' }}
          />
          <Image
            src="/Post Card 2.svg"
            alt="Right"
            width={328}
            height={328}
            className="absolute right-0 top-1/2 translate-y-3 translate-x-45 z-10 animate-float-slow-delayed"
            style={{ pointerEvents: 'none' }}
          />
          <Image
            src="/Post Card 3.svg"
            alt="Below"
            width={328}
            height={328}
            className="absolute left-1/2 bottom-0 translate-x-[-50%] translate-y-80 z-10 animate-float-slow-reverse"
            style={{ pointerEvents: 'none' }}
          />
          <div
            className="flex items-center gap-2 border-2 tracking-[-0.2px] rounded-full px-5 py-2 font-[550] text-md bg-white bg-opacity-90 cursor-pointer"
            style={{ borderColor: '#8CC63E', color: '#8CC63E' }}
          >
            <Image src="/Bell_pin.svg" alt="Icon" width={24} height={24} />
            AI Powered Social Media Engine
          </div>

          <h1
            className="mt-10 text-7xl font-semibold tracking-[-1px] text-black text-center max-w-[600px]"
          >
            AI Social<br/>Media Posts In<br/><span className="bg-[#8CC63E] px-1 -rotate-1 inline-block"><span className="text-white rotate-1 inline-block">MINUTES</span></span>
          </h1>
        </Section>

        {/* Features section */}
        <Section id="features" className="relative font-semibold max-w-5xl rounded-xl py-70 z-10 mt-20 w-full px-4 mb-2">
          <h1 className="text-5xl font-semibold tracking-[-1.5px] text-black mb-2 text-left w-full">Just the tip of the iceberg</h1>
          <div className="flex flex-col md:flex-row w-full gap-4 items-stretch">
            {/* Left: Tall bento box */}
            <div className="flex flex-col w-full md:w-1/2 justify-end">
              <div className="flex-1 bg-[#FCFCFC] rounded-2xl shadow-sm flex flex-col justify-end border border-[#DFDFDF] p-8 pt-32 min-h-[340px] relative overflow-hidden">
                {/* Background image */}
                <Image src="/Content.png" alt="Feature 1" width={420} height={420} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-70 opacity-100 z-0" />
                <div className="mt-auto flex flex-col items-center relative z-10">
                  <h2 className="text-xl font-bold tracking-[-0.7px] text-balance text-black mb-1 text-left w-full">Upload Any Video and Let FlowCast Handle the Heavy Lifting</h2>
                  <h3 className="text-md font-medium tracking-[-0.4px] text-balance text-black leading-5 text-left w-full">No more jumping between tools or rewriting content manually. With one upload, you get ready-to-copy ad text like captions, tweets, and LinkedIn posts — instantly.</h3>
                </div>
              </div>
            </div>
            {/* Right: 2 half bento boxes stacked */}
            <div className="flex flex-col w-full md:w-1/2 gap-4">
              <div className="flex-1 bg-[#FCFCFC] rounded-2xl shadow-sm flex flex-col justify-end border border-[#DFDFDF] p-8 pt-32 min-h-[160px] relative overflow-hidden">
                {/* Background image */}
                <Image src="/Paper.png" alt="Feature 2" width={480} height={480} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-30 opacity-100 z-0" />
                <div className="mt-auto flex flex-col items-center relative z-10">
                  <h2 className="text-xl font-bold tracking-[-0.7px] text-balance text-black mb-1 text-left w-full">Multi-Platform AI Writing</h2>
                  <h3 className="text-md font-medium tracking-[-0.4px] text-black leading-5 text-left w-full">From LinkedIn carousels to Instagram captions and tweet threads, FlowCast writes in platform-native styles using AI prompts.</h3>
                </div>
              </div>
              <div className="flex-1 bg-[#FCFCFC] rounded-2xl shadow-sm flex flex-col justify-end border border-[#DFDFDF] p-8 pt-32 min-h-[160px] relative overflow-hidden">
                {/* Background image */}
                <Image src="/Button_Img.svg" alt="Feature 3" width={180} height={180} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-20 opacity-100 z-0" />
                <div className="mt-16 flex flex-col items-center relative z-10">
                  <h2 className="text-xl font-bold tracking-[-0.7px] text-balance text-black mb-1 text-left w-full">One-Click Export & Workflow</h2>
                  <h3 className="text-md font-medium tracking-[-0.4px] text-black leading-5 text-left w-full">Copy platform-ready captions directly to your clipboard — formatted for each channel and ready to paste wherever you publish.</h3>
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* How it works section */}
        <section id="how-it-works" className="relative font-semibold max-w-6xl rounded-xl -py-30 z-10 mt-0 mx-auto w-full px-4 -translate-y-40">
          <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 place-items-center items-center">
            <div className="rounded-xl overflow-hidden shadow-lg w-full h-[300px] md:h-[500px]">
              <video
                className="w-full h-full object-cover"
                controls
                controlsList="nodownload nofullscreen noremoteplayback"
                disablePictureInPicture
                autoPlay
                loop
                playsInline
              >
                <source src="/demo.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>

            <div className="text-left w-full">
              <h1 className="text-3xl md:text-5xl font-semibold tracking-tighter text-[#1A1A1A] mb-4 break-words w-full">
              From Record to <br/>  <span className="bg-[#8CC63E] py-[1.5] px-2 -rotate-1 inline-block"><span className="text-white">Revenue</span></span> in Minutes
              </h1>
              <h3 className="text-lg md:text-lg font-medium tracking-tight text-[#555] mt-15">
                <span className="text-black font-[550] text-xl text-balance">1. Upload or Link a YouTube Video</span> <br/> <span className="leading-1 text-balance">Drop in your video link or file — FlowCast instantly pulls the transcript, title, description, and key timestamps so you can skip the manual prep</span> <br/> <br/>
                <span className="text-black font-[550] text-xl text-balance">2. Auto-Generate Platform-Ready Posts</span> <br/> <span className="leading-1 text-balance">From one video, FlowCast creates 4–6 tailored posts — including captions, hashtags, headlines, and hooks — for your selected platforms (Instagram, LinkedIn, X, Threads, TikTok, etc.)</span> <br/> <br/>
                <span className="text-black font-[550] text-xl text-balance">3. Choose Post Styles for Each Platform</span> <br/> <span className="leading-1 text-balance">Whether you want punchy carousel hooks for Instagram, clean quote posts for LinkedIn, or tweet-sized summaries — FlowCast adapts your content tone and format per channel</span> <br/>
              </h3>
            </div>
          </div>
        </section>

        {/* Footer Section */}
        <footer id="about" className="bg-[#8CC63E] py-12 px-6 w-full">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-start gap-10">
            {/* Left Side: Image + Text */}
            <div className="flex flex-col gap-2 max-w-sm">
              <Image src="/Logo1.svg" width={410} height={410} alt="Blnk Logo" className="w-28 h-auto mb-2 rotate-8 cursor-pointer" />
              <h3 className="text-lg w-[320px] md:w-[520px] font-medium text-white tracking-tight leading-6 font-sans">FlowCast is an AI-powered repurposing engine for content creators and educators — drop in a YouTube link and get scroll-stopping posts, carousels, and tweets tailored for every platform, so you can grow your audience without rewriting a single word</h3>
              <h2 className="text-2xl tracking-tight w-max font-semibold text-white mt-1 font-sans">Create once. Grow everywhere. Powered by one — You + FlowCast</h2>
              <h2 className="text-md w-max font-medium tracking-tight text-white mt-3 font-sans">Hey there 👋 I'm Rao, the maker of FlowCast. Feel free to check out my work over on Twitter</h2>
            </div>
            {/* Right Side: Two Columns */}
            <div className="grid grid-cols-2 gap-2 w-full max-w-2xl">
              {/* Column 1 */}
              <div>
                <h1 className="text-lg font-semibold text-white mb-2 font-sans">Links</h1>
                <ul className="space-y-1">
                  <li><a href="#home" className="text-white font-medium hover:text-[#6F9C33] transition-colors cursor-pointer font-sans">Home</a></li>
                  <li><a href="#features" className="text-white font-medium hover:text-[#6F9C33] transition-colors cursor-pointer font-sans">Features</a></li>
                  <li><a href="#how-it-works" className="text-white font-medium hover:text-[#6F9C33] transition-colors cursor-pointer font-sans">How it Works</a></li>
                  <li><a href="#about" className="text-white font-medium hover:text-[#6F9C33] transition-colors cursor-pointer font-sans">About</a></li>
                </ul>
              </div>
              {/* Column 2 */}
              <div>
                <h1 className="text-lg font-semibold text-white mb-2 font-sans">More</h1>
                <ul className="space-y-1">
                  <li><a href="https://twitter.com/getrepliq" target="_blank" rel="noopener noreferrer" className="text-white font-medium hover:text-[#6F9C33] transition-colors cursor-pointer font-sans">Follow on Twitter</a></li>
                  <li><a href="https://instagram.com/getrepliq" target="_blank" rel="noopener noreferrer" className="text-white font-medium hover:text-[#6F9C33] transition-colors cursor-pointer font-sans">Follow on Instagram</a></li>
                  <li><a href="https://twitter.com/heyspecterr" target="_blank" rel="noopener noreferrer" className="text-white font-medium hover:text-[#6F9C33] transition-colors cursor-pointer font-sans">Creator</a></li>
                </ul>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
