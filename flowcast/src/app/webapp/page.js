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

  useEffect(() => {
    if (error) {
      setShowErrorPopup(true);
      const timer = setTimeout(() => setShowErrorPopup(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [error]);

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
        setResult(data.posts); // now expecting posts as an object { platform: [copies] }
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
        <div className="flex-1 bg-[#FDFDFD] border border-[#DDDDDD] rounded-3xl shadow-lg flex flex-col justify-center p-8 lg:p-12 max-w-full lg:max-w-[50%] min-w-0 h-full">
          <form className="max-w-md mx-auto w-full space-y-6" onSubmit={handleSubmit}>
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
                className={`relative border-2 border-dashed rounded-lg py-4 px-4 text-center transition-all cursor-pointer ${
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
              <div className="flex gap-4">
                {PLATFORM_OPTIONS.map(opt => (
                  <label key={opt.value} className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all ${platforms.includes(opt.value) ? 'bg-green-100 border-green-400' : 'bg-white border-gray-300'}`}>
                    <input
                      type="checkbox"
                      checked={platforms.includes(opt.value)}
                      onChange={() => handlePlatformChange(opt.value)}
                      className="accent-green-500"
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Number of Copies */}
            <div>
              <label className="block text-lg font-medium text-gray-900 mb-3 tracking-[-0.5px]">
                Number of Copies per Platform <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={numCopies}
                onChange={handleNumCopiesChange}
                className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all tracking-[-0.5px]"
              />
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
            Paste your YouTube link and let FlowCast instantly generate high-performing content tailored for every platform — carousels, captions, hooks, and more
          </p>
        </div>
      </div>
      {/* Generated Ad Copy Results */}
      <div className="w-full flex flex-col items-center justify-center mt-8 relative" style={{ minHeight: 200 }}>
        {loading && <div className="text-lg text-gray-700">Generating your post...</div>}
        {result && platforms.length > 0 && (
          <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-6" style={{ minHeight: 200 }}>
            {platforms.map((platform, pIdx) =>
              (result[platform] || []).map((copy, cIdx) => (
                <div
                  key={platform + '-' + cIdx}
                  className="w-full bg-white border border-gray-200 rounded-xl shadow-lg p-6 flex flex-col items-center"
                >
                  <h2 className="text-xl font-bold mb-2 text-center">{platform} Post {result[platform].length > 1 ? cIdx + 1 : ''}</h2>
                  <div className="whitespace-pre-line text-gray-900 text-lg text-center">{copy}</div>
                </div>
              ))
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