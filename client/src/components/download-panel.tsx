import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Download, CheckCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import DownloadHistory from "./download-history";

interface DownloadPanelProps {
  videoInfo: any;
  selectedQuality: string;
  selectedFormat: any;
}

export default function DownloadPanel({ videoInfo, selectedQuality, selectedFormat }: DownloadPanelProps) {
  const [currentDownloadId, setCurrentDownloadId] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const startDownloadMutation = useMutation({
    mutationFn: async (downloadData: any) => {
      const response = await apiRequest("POST", "/api/download/start", downloadData);
      return response.json();
    },
    onSuccess: (data) => {
      setCurrentDownloadId(data.id);
      toast({
        title: "Download started",
        description: "Your video is being downloaded",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/downloads"] });
    },
    onError: (error: any) => {
      toast({
        title: "Download failed",
        description: error.message || "Failed to start download",
        variant: "destructive",
      });
    },
  });

  const { data: currentDownload } = useQuery({
    queryKey: ["/api/download", currentDownloadId],
    enabled: !!currentDownloadId,
    refetchInterval: currentDownloadId && currentDownload?.status === "downloading" ? 1000 : false,
  });

  const handleDownload = () => {
    if (!videoInfo || !selectedQuality || !selectedFormat) {
      toast({
        title: "Missing information",
        description: "Please select a video and quality first",
        variant: "destructive",
      });
      return;
    }

    const downloadData = {
      url: videoInfo.url || "https://www.youtube.com/watch?v=example", // This would come from the original URL
      title: videoInfo.title,
      author: videoInfo.author,
      duration: videoInfo.duration,
      thumbnail: videoInfo.thumbnail,
      quality: selectedQuality,
      format: selectedFormat.format,
      fileSize: selectedFormat.size,
      status: "pending",
      progress: 0,
    };

    startDownloadMutation.mutate(downloadData);
  };

  const isDownloading = currentDownload?.status === "downloading";
  const isCompleted = currentDownload?.status === "completed";
  const canDownload = videoInfo && selectedQuality && !isDownloading;

  return (
    <div className="space-y-6">
      {/* Download Action */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Download</h3>
        
        <div className="space-y-4">
          <Button 
            onClick={handleDownload}
            disabled={!canDownload || startDownloadMutation.isPending}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            <Download className="mr-2 h-4 w-4" />
            {startDownloadMutation.isPending ? "Starting..." : "Start Download"}
          </Button>
          
          {/* Progress Bar */}
          {isDownloading && currentDownload && (
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Downloading...</span>
                <span className="font-medium">{currentDownload.progress}%</span>
              </div>
              <Progress value={currentDownload.progress} className="w-full" />
              <div className="flex justify-between text-xs text-gray-500">
                <span>{currentDownload.downloadSpeed || "Calculating..."}</span>
                <span>{currentDownload.timeRemaining || "Calculating..."}</span>
              </div>
            </div>
          )}
          
          {/* Success State */}
          {isCompleted && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-600">
                <span className="font-medium">Download Complete!</span>
                <br />
                Video saved to your downloads folder
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>

      {/* Download History */}
      <DownloadHistory />
    </div>
  );
}
