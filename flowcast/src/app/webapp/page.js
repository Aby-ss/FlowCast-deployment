"use client"

import { useState, useEffect } from 'react';
import { Upload } from 'lucide-react';
import Image from "next/image";

const PLATFORM_OPTIONS = [
  { label: 'Twitter', value: 'Twitter' },
  { label: 'Instagram', value: 'Instagram' },
  { label: 'LinkedIn', value: 'LinkedIn' },
];

export default function WebAppPage() {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [instructions, setInstructions] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [platforms, setPlatforms] = useState(['Twitter']);
  const [numCopies, setNumCopies] = useState(1);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [copiedStates, setCopiedStates] = useState({});
  const [hasGenerated, setHasGenerated] = useState(false);

  useEffect(() => {
    if (error) {
      setShowErrorPopup(true);
      const timer = setTimeout(() => setShowErrorPopup(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Prevent scrolling until form is submitted
  useEffect(() => {
    if (!hasGenerated) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [hasGenerated]);

  const handlePlatformChange = (platform) => {
    setPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  };

  const handleNumCopiesChange = (e) => {
    let val = parseInt(e.target.value, 10);
    if (isNaN(val) || val < 1) val = 1;
    if (val > 10) val = 10;
    setNumCopies(val);
  };

  const handleCopyToClipboard = async (text, postId) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStates(prev => ({ ...prev, [postId]: true }));
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [postId]: false }));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const getPlatformColors = (platform) => {
    switch (platform) {
      case 'Twitter':
        return { bg: 'linear-gradient(90deg, #6A6A6A 0%, #111111 100%)', text: 'white' };
      case 'Instagram':
        return { bg: 'linear-gradient(90deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', text: 'white' };
      case 'LinkedIn':
        return { bg: 'linear-gradient(90deg, #49B3FA 0%, #42A4E6 100%)', text: 'white' };
      default:
        return { bg: 'linear-gradient(90deg, #8CC63E 0%, #6F9C33 100%)', text: 'white' };
    }
  };

  const formatPostContent = (text) => {
    // Convert asterisks to bold/italic styling
    let formattedText = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold: **text**
      .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic: *text*
      .replace(/__(.*?)__/g, '<strong>$1</strong>') // Bold: __text__
      .replace(/_(.*?)_/g, '<em>$1</em>'); // Italic: _text_
    
    // Convert URLs to blue links
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    formattedText = formattedText.replace(urlRegex, '<span style="color: #3B82F6;">$1</span>');
    
    return formattedText;
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setYoutubeUrl('');
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setYoutubeUrl('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError('');
    setHasGenerated(true);
    try {
      let payload;
      let headers = { 'Content-Type': 'application/json' };
      if (file) {
        payload = JSON.stringify({ mp4FileName: file.name, instructions, platforms, numCopies });
      } else {
        payload = JSON.stringify({ youtubeUrl, instructions, platforms, numCopies });
      }
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers,
        body: payload,
      });
      const data = await res.json();
      if (data.success) {
        setResult(data.posts);
      } else {
        setError(data.error || 'Failed to generate post.');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  // Remove animation/stacking logic for result cards

  return (
    <div className="min-h-screen w-full bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="flex flex-col lg:flex-row w-full max-w-full h-[95vh] gap-4">
        {/* Left Side - Form Box */}
        <div className="flex-1 bg-[#FDFDFD] border border-[#DDDDDD] rounded-3xl shadow-lg flex flex-col justify-center p-4 lg:p-5 max-w-full lg:max-w-[55%] min-w-0 h-full">
          <form className="w-full max-w-lg mx-auto space-y-[6px]" onSubmit={handleSubmit}>
            {/* YouTube URL Input */}
            <div>
              <label className="block text-lg font-medium text-gray-900 mb-3 tracking-[-0.5px]">
                Paste your YouTube Video Link Below <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                value={youtubeUrl}
                onChange={(e) => { setYoutubeUrl(e.target.value); setFile(null); }}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all tracking-[-0.5px]"
                disabled={!!file}
              />
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-lg font-medium text-gray-900 mb-3 tracking-[-0.5px]">
                Upload your video as an .mp4 file below <span className="text-red-500">*</span>
              </label>
              <div
                className={`relative border-2 border-dashed rounded-lg py-2 px-4 text-center transition-all cursor-pointer ${
                  isDragOver
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-300 hover:border-green-400 hover:bg-gray-50'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-1">
                    <img src="/upload.svg" alt="Upload" className="w-8 h-8" />
                  </div>
                  <p className="text-gray-600 font-medium tracking-[-0.5px]">Upload your video in this box</p>
                  {file && <span className="text-green-600 text-sm mt-2">Selected: {file.name}</span>}
                </div>
                <input
                  type="file"
                  accept="video/mp4"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleFileChange}
                  disabled={!!youtubeUrl}
                />
              </div>
            </div>

            {/* Platform Selection */}
            <div>
              <label className="block text-lg font-medium text-gray-900 mb-3 tracking-[-0.5px]">
                Select Platforms <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-4">
                {PLATFORM_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handlePlatformChange(opt.value)}
                    className={`relative w-full aspect-square rounded-xl border-2 transition-all ${
                      platforms.includes(opt.value) 
                        ? 'bg-green-100 border-green-400 shadow-lg' 
                        : 'bg-white border-gray-300 hover:border-green-400 hover:bg-gray-50'
                    }`}
                  >
                    <div className="absolute bottom-3 left-3 text-left">
                      <div className="w-8 h-8 mb-1">
                        {opt.value === 'Twitter' && (
                          <img src="/twitter.svg" alt="Twitter" className="w-full h-full" />
                        )}
                        {opt.value === 'Instagram' && (
                          <img src="/Insta.svg" alt="Instagram" className="w-full h-full" />
                        )}
                        {opt.value === 'LinkedIn' && (
                          <img src="/Linkedin.svg" alt="LinkedIn" className="w-full h-full" />
                        )}
                      </div>
                      <div className="text-md tracking-[-0.2px] font-[500]">{opt.label}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Number of Copies */}
            <div className="mt-5">
              <div className="flex items-center gap-4">
                <label className="text-lg font-medium text-gray-900 tracking-[-0.5px]">
                  Number of Copies per Platform <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={numCopies}
                  onChange={handleNumCopiesChange}
                  className="w-20 px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all tracking-[-0.5px]"
                />
              </div>
            </div>

            {/* Additional Instructions */}
            <div>
              <label className="block text-lg font-medium text-gray-900 mb-3 tracking-[-0.5px]">
                Additional Instructions for Posts <span className="text-red-500">*</span>
              </label>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Enter any specific instructions for your posts..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none tracking-[-0.5px]"
              />
            </div>

            {/* Generate Button */}
            <button
              type="submit"
              className="w-full inner-glow-green bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-200 text-lg tracking-[-0.5px]"
              disabled={loading}
            >
              {loading ? 'Generating...' : 'Generate Now'}
            </button>
            {error && <div className="text-red-600 text-center mt-2">{error}</div>}
          </form>
        </div>

        {/* Right Side - Brand Box */}
        <div className="flex-1 rounded-3xl shadow-2xl inner-glow-green flex flex-col justify-center items-center text-center p-8 lg:p-12 max-w-full lg:max-w-[50%] min-w-0 h-full" style={{ background: '#8CC63E' }}>
          {/* Logo */}
          <div className="mb-6">
            <Image src="/Logo1.svg" alt="Logo" width={160} height={160} className="w-32 md:w-40 h-auto" />
          </div>

          {/* Main Heading */}
          <h1 className="text-2xl lg:text-3xl text-balance font-bold text-black mb-6 leading-tight tracking-[-0.5px]">
            Turn One Video Into Dozens
            <br />
            of Scroll-Stopping Posts
          </h1>

          {/* Subheading */}
          <p className="text-lg lg:text-xl text-balance text-black max-w-lg leading-relaxed tracking-[-0.5px]">
            Paste your YouTube link and let FlowCast instantly generate high-performing post content tailored for every platform — post captions, hooks, and more
          </p>
        </div>
      </div>
      {/* Generated Ad Copy Results */}
      <div className="w-full flex flex-col items-center justify-center mt-8 relative" style={{ minHeight: 200 }}>
        {loading && <div className="text-lg text-gray-700">Generating your post...</div>}
        {result && (
          <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6" style={{ minHeight: 200 }}>
            {Object.keys(result).map((platform, pIdx) =>
              (result[platform] || []).map((copy, cIdx) => {
                const postId = `${platform}-${cIdx}`;
                const colors = getPlatformColors(platform);
                return (
                  <div key={postId} className="w-full relative">
                    {/* Platform Header - 20px above main box */}
                    <div 
                      className="w-full h-12 rounded-t-xl flex items-center justify-center text-white font-semibold text-lg mb-5"
                      style={{ 
                        background: colors.bg,
                        marginTop: '40px'
                      }}
                    >
                      {platform} Post {result[platform].length > 1 ? cIdx + 1 : ''}
                    </div>
                    
                    {/* Main Content Box */}
                    <div className="bg-white rounded-xl shadow-lg p-6 relative">
                      {/* Content Box */}
                      <div className="bg-[#F4F4F4] border-2 border-dashed border-[#CFCFCF] rounded-lg p-4 mb-8">
                        <h1 className="text-xl font-bold mb-3 text-gray-900">Video Title</h1>
                        <h3 
                          className="text-lg font-medium text-gray-800 whitespace-pre-line leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: formatPostContent(copy) }}
                        />
                      </div>
                      
                      {/* Copy Button - bottom right */}
                      <button
                        onClick={() => handleCopyToClipboard(copy, postId)}
                        className={`absolute bottom-4 right-4 px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
                          copiedStates[postId]
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {copiedStates[postId] ? 'Copied' : 'Copy to clipboard'}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
      {/* Animated Error Popup */}
      {showErrorPopup && error && (
        <div
          className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50 px-6 py-4 bg-red-500 text-white rounded-xl shadow-lg animate-bounce cursor-pointer transition-all duration-500"
          onClick={() => setShowErrorPopup(false)}
          style={{ minWidth: 280, textAlign: 'center' }}
        >
          <span className="font-bold">Error:</span> {error}
        </div>
      )}
    </div>
  );
}