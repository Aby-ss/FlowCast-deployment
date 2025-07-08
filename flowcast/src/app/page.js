import Image from "next/image";

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
    <div className="relative min-h-screen bg-white">
      <nav
        className="fixed top-4 left-1/2 -translate-x-1/2 w-[99vw] max-w-7xl flex items-center justify-between px-8 py-2 bg-[#8CC63E] rounded-full shadow-lg z-50"
        style={{ borderRadius: '9999px' }}
      >
        {/* Left: Logo/Image */}
        <div className="flex items-center">
          <Image src="/logo3.svg" alt="FlowCast Logo" width={120} height={120} />
        </div>
        {/* Center: Links */}
        <div className="flex gap-10">
          <a href="#" className="text-white font-grand-local text-lg hover:underline">Home</a>
          <a href="#" className="text-white font-grand-local text-lg hover:underline">How it Works</a>
          <a href="#" className="text-white font-grand-local text-lg hover:underline">Pricing</a>
          <a href="#" className="text-white font-grand-local text-lg hover:underline">Contact</a>
        </div>
        {/* Right: Button Image */}
        <button className="flex items-center justify-center rounded-full p-2 transition">
          <Image src="/button.svg" alt="User" width={90} height={90} />
        </button>
      </nav>

      <main className="flex flex-col items-center justify-center pt-24 w-full min-h-[60vh] relative">
        {/* Background image for the section, larger than the section */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-230 z-0" style={{ width: '130%', maxWidth: '44rem', height: '120%', maxHeight: '32rem' }}>
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
            className="absolute left-0 top-1/2 translate-y-3 -translate-x-45 z-10"
            style={{ pointerEvents: 'none' }}
          />
          <Image
            src="/Post Card 2.svg"
            alt="Right"
            width={328}
            height={328}
            className="absolute right-0 top-1/2 translate-y-3 translate-x-45 z-10"
            style={{ pointerEvents: 'none' }}
          />
          <Image
            src="/Post Card 3.svg"
            alt="Below"
            width={328}
            height={328}
            className="absolute left-1/2 bottom-0 translate-x-[-50%] translate-y-80 z-10"
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

        {/* Features function */}
        <Section className="relative font-semibold max-w-5xl rounded-xl py-70 z-10 mt-20 w-full px-4">
          <h1 className="text-5xl font-semibold tracking-[-1.5px] text-black mb-8 text-left w-full">Just the tip of the iceberg</h1>
          <div className="flex flex-col md:flex-row w-full gap-4 items-stretch">
            {/* Left: Tall bento box */}
            <div className="flex flex-col w-full md:w-1/2 justify-end">
              <div className="flex-1 bg-[#FCFCFC] rounded-2xl shadow-sm flex flex-col justify-end border border-[#DFDFDF] p-8 pt-32 min-h-[340px] relative overflow-hidden">
                {/* Background image */}
                <Image src="/Content.png" alt="Feature 1" width={420} height={420} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-70 opacity-100 z-0" />
                <div className="mt-auto flex flex-col items-center relative z-10">
                  <h2 className="text-xl font-bold tracking-[-0.7px] text-balance text-black mb-1 text-left w-full">Upload Any Video and Let FlowCast Handle the Heavy Lifting</h2>
                  <h3 className="text-md font-medium tracking-[-0.4px] text-balance text-black leading-5 text-left w-full">No more copy-pasting from editors or wasting hours slicing up content. With one upload, you get structured, reusable content components ready for your next campaign</h3>
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
                  <h3 className="text-md font-medium tracking-[-0.4px] text-balance text-black leading-5 text-left w-full">From LinkedIn carousels to Instagram captions and tweet threads, FlowCast writes in platform-native styles using AI trained on high-conversion formats.</h3>
                </div>
              </div>
              <div className="flex-1 bg-[#FCFCFC] rounded-2xl shadow-sm flex flex-col justify-end border border-[#DFDFDF] p-8 pt-32 min-h-[160px] relative overflow-hidden">
                {/* Background image */}
                <Image src="/Button_Img.svg" alt="Feature 3" width={180} height={180} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-20 opacity-100 z-0" />
                <div className="mt-16 flex flex-col items-center relative z-10">
                  <h2 className="text-xl font-bold tracking-[-0.7px] text-balance text-black mb-1 text-left w-full">One-Click Export & Workflow</h2>
                  <h3 className="text-md font-medium tracking-[-0.4px] text-balance text-black leading-5 text-left w-full">Export organized folders, copy platform-ready captions, or send posts directly into your scheduler (like Notion or Buffer).</h3>
                </div>
              </div>
            </div>
          </div>
        </Section>
      </main>
    </div>
  );
}
