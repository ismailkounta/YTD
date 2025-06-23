import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Video, User, Eye, Calendar, Download } from "lucide-react";

interface VideoMetadataProps {
  videoInfo: any;
  selectedQuality: string;
  onQualityChange: (quality: string) => void;
  onFormatChange: (format: any) => void;
}

export default function VideoMetadata({ 
  videoInfo, 
  selectedQuality, 
  onQualityChange,
  onFormatChange 
}: VideoMetadataProps) {
  const handleQualityChange = (quality: string) => {
    onQualityChange(quality);
    const format = videoInfo?.formats?.find((f: any) => f.quality === quality);
    onFormatChange(format);
  };

  if (!videoInfo) {
    return (
      <Card>
        <CardHeader className="bg-gray-50">
          <CardTitle>Video Information</CardTitle>
        </CardHeader>
        <CardContent className="p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Video className="text-gray-400 text-xl" />
          </div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">No video loaded</h4>
          <p className="text-gray-500">Enter a YouTube URL above to get started</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="bg-gray-50">
        <CardTitle>Video Information</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Thumbnail */}
          <div className="relative rounded-lg overflow-hidden bg-gray-100">
            <img 
              src={videoInfo.thumbnail}
              alt="Video thumbnail" 
              className="w-full h-48 sm:h-64 object-cover"
            />
            <div className="absolute bottom-3 right-3 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm font-medium">
              {videoInfo.duration}
            </div>
          </div>
          
          {/* Video Details */}
          <div className="space-y-4">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                {videoInfo.title}
              </h4>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center space-x-1">
                  <User className="h-4 w-4" />
                  <span>{videoInfo.author}</span>
                </span>
                {videoInfo.views && (
                  <span className="flex items-center space-x-1">
                    <Eye className="h-4 w-4" />
                    <span>{parseInt(videoInfo.views).toLocaleString()} views</span>
                  </span>
                )}
                {videoInfo.uploadDate && (
                  <span className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{videoInfo.uploadDate}</span>
                  </span>
                )}
              </div>
            </div>
            
            {/* Quality Options */}
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-3">Select Download Quality</Label>
              <Select value={selectedQuality} onValueChange={handleQualityChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose video quality..." />
                </SelectTrigger>
                <SelectContent>
                  {videoInfo.formats?.map((format: any, index: number) => (
                    <SelectItem key={index} value={format.quality}>
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center space-x-2">
                          <Download className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">{format.quality}</span>
                          <span className="text-sm text-gray-500">({format.format.toUpperCase()})</span>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <span className="text-sm text-gray-500">{format.size}</span>
                          {index === 0 && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                              Best
                            </Badge>
                          )}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {selectedQuality && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Download className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">
                      Selected: {selectedQuality}
                    </span>
                    {videoInfo.formats?.find((f: any) => f.quality === selectedQuality) && (
                      <span className="text-sm text-blue-600">
                        • {videoInfo.formats.find((f: any) => f.quality === selectedQuality).size}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
