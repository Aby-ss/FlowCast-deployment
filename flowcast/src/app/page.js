import Image from "next/image";

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


      <main className="flex flex-col items-center justify-center pt-44 w-full min-h-[60vh] relative">
        {/* Background image for the section, larger than the section */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-0" style={{ width: '130%', maxWidth: '44rem', height: '120%', maxHeight: '32rem' }}>
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
        <section className="relative w-full font-semibold max-w-2xl rounded-xl p-10 flex flex-col items-center justify-center z-10" style={{ background: 'transparent' }}>
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
        </section>
      </main>
    </div>
  );
}
