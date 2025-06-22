import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Video, User, Eye, Calendar } from "lucide-react";

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
              <Label className="block text-sm font-medium text-gray-700 mb-3">Download Quality</Label>
              <RadioGroup value={selectedQuality} onValueChange={handleQualityChange}>
                <div className="space-y-2">
                  {videoInfo.formats?.map((format: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value={format.quality} id={`format-${index}`} />
                        <Label htmlFor={`format-${index}`} className="cursor-pointer">
                          <div>
                            <span className="font-medium text-gray-900">{format.quality} {format.format.toUpperCase()}</span>
                            <p className="text-sm text-gray-500">{format.size}</p>
                          </div>
                        </Label>
                      </div>
                      {index === 0 && (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          Recommended
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
