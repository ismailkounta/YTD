import { useState } from "react";
import UrlInput from "@/components/url-input";
import VideoMetadata from "@/components/video-metadata";
import DownloadPanel from "@/components/download-panel";
import DownloadHistory from "@/components/download-history";
import { Video } from "lucide-react";

export default function Home() {
  const [videoInfo, setVideoInfo] = useState<any>(null);
  const [selectedQuality, setSelectedQuality] = useState<string>("");
  const [selectedFormat, setSelectedFormat] = useState<any>(null);

  const handleVideoInfo = (info: any) => {
    setVideoInfo(info);
    setSelectedQuality("");
    setSelectedFormat(null);
  };

  const handleQualityChange = (quality: string) => {
    setSelectedQuality(quality);
    // Find the format for the selected quality
    const format = videoInfo?.formats?.find((f: any) => f.quality === quality);
    setSelectedFormat(format);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/20 via-background to-muted/30 pointer-events-none" />
      
      <div className="relative container mx-auto py-12 px-4">
        <header className="text-center mb-12 animate-fade-in">
          <div className="flex items-center justify-center mb-6">
            <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
              <Video className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-5xl font-medium text-foreground mb-4 tracking-tight">
            YouTube Downloader
          </h1>
          <p className="text-muted-foreground text-xl max-w-2xl mx-auto leading-relaxed">
            Save your favorite YouTube videos in the highest quality available.
            Simple, fast, and reliable.
          </p>
        </header>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* URL Input */}
          <div className="animate-fade-in">
            <UrlInput onVideoInfo={handleVideoInfo} />
          </div>

          {/* Video Metadata and Quality Selection */}
          {videoInfo && (
            <div className="animate-slide-up">
              <VideoMetadata
                videoInfo={videoInfo}
                selectedQuality={selectedQuality}
                onQualityChange={handleQualityChange}
                onFormatChange={setSelectedFormat}
              />
            </div>
          )}

          {/* Download Panel */}
          {videoInfo && selectedQuality && (
            <div className="animate-slide-up">
              <DownloadPanel
                videoInfo={videoInfo}
                selectedQuality={selectedQuality}
                selectedFormat={selectedFormat}
              />
            </div>
          )}

          {/* Download History */}
          <div className="animate-fade-in">
            <DownloadHistory />
          </div>
        </div>
      </div>
    </div>
  );
}
