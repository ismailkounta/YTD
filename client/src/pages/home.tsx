import { useState } from "react";
import UrlInput from "@/components/url-input";
import VideoMetadata from "@/components/video-metadata";
import DownloadPanel from "@/components/download-panel";
import { Download } from "lucide-react";

export default function Home() {
  const [videoInfo, setVideoInfo] = useState<any>(null);
  const [selectedQuality, setSelectedQuality] = useState<string>("");
  const [selectedFormat, setSelectedFormat] = useState<any>(null);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Download className="text-white text-lg" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">YouTube Downloader</h1>
                <p className="text-sm text-gray-500">Download videos quickly and safely</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <span className="text-sm text-gray-500">Safe & Secure</span>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* URL Input */}
        <UrlInput onVideoInfo={setVideoInfo} />

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Video Metadata */}
          <div className="lg:col-span-2">
            <VideoMetadata 
              videoInfo={videoInfo} 
              selectedQuality={selectedQuality}
              onQualityChange={setSelectedQuality}
              onFormatChange={setSelectedFormat}
            />
          </div>

          {/* Download Panel */}
          <div className="space-y-6">
            <DownloadPanel 
              videoInfo={videoInfo}
              selectedQuality={selectedQuality}
              selectedFormat={selectedFormat}
            />
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-12 bg-white rounded-xl shadow-sm border p-6">
          <div className="text-center mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">How to Use YouTube Downloader</h3>
            <p className="text-gray-600">Follow these simple steps to download your favorite videos</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary text-xl">🔗</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">1. Paste URL</h4>
              <p className="text-gray-600 text-sm">Copy and paste the YouTube video URL into the input field above</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-primary bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary text-xl">⚙️</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">2. Choose Quality</h4>
              <p className="text-gray-600 text-sm">Select your preferred video quality or audio-only format</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-primary bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary text-xl">⬇️</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">3. Download</h4>
              <p className="text-gray-600 text-sm">Click download and wait for the file to be saved to your device</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-gray-600 text-sm">© 2024 YouTube Downloader. Built with React & Node.js</p>
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <span className="flex items-center space-x-2">
                <span>🛡️</span>
                <span>Secure & Private</span>
              </span>
              <span className="flex items-center space-x-2">
                <span>⚡</span>
                <span>Fast Downloads</span>
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
