"use client"

import { useState } from 'react';
import { Upload } from 'lucide-react';
import Image from "next/image";

export default function WebAppPage() {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [instructions, setInstructions] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

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
    // Handle file drop logic here
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center p-4">
      <div className="flex flex-col lg:flex-row w-full max-w-full h-[95vh] gap-4">
        {/* Left Side - Form Box */}
        <div className="flex-1 bg-[#FDFDFD] border border-[#DDDDDD] rounded-3xl shadow-lg flex flex-col justify-center p-8 lg:p-12 max-w-full lg:max-w-[50%] min-w-0 h-full">
          <div className="max-w-md mx-auto w-full space-y-6">
            {/* YouTube URL Input */}
            <div>
              <label className="block text-lg font-medium text-gray-900 mb-3 tracking-[-0.5px]">
                Paste your YouTube Video Link Below <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all tracking-[-0.5px]"
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
                </div>
                <input
                  type="file"
                  accept="video/mp4"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
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
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-200 text-lg tracking-[-0.5px]"
            >
              Generate Now
            </button>
          </div>
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
    </div>
  );
}