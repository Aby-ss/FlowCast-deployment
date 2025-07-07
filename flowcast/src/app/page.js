import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
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
    </div>
  );
}
