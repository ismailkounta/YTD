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
      url: videoInfo.url,
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

  // Add polling for active downloads
  const { data: pollingData } = useQuery({
    queryKey: ["/api/download", currentDownloadId, "polling"],
    enabled: !!currentDownloadId && currentDownload?.status === "downloading",
    refetchInterval: 1000,
  });

  // Use polling data if available, otherwise use current download data
  const downloadData = pollingData || currentDownload;
  
  const isDownloading = downloadData?.status === "downloading";
  const isCompleted = downloadData?.status === "completed";
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
          {isDownloading && downloadData && (
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Downloading...</span>
                <span className="font-medium">{downloadData.progress}%</span>
              </div>
              <Progress value={downloadData.progress} className="w-full" />
              <div className="flex justify-between text-xs text-gray-500">
                <span>{downloadData.downloadSpeed || "Calculating..."}</span>
                <span>{downloadData.timeRemaining || "Calculating..."}</span>
              </div>
            </div>
          )}
          
          {/* Success State */}
          {isCompleted && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-600">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">Download Complete!</span>
                    <br />
                    Ready to download to your device
                  </div>
                  <Button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = `/api/download/${currentDownloadId}/file`;
                      link.download = '';
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    size="sm"
                    className="ml-4 bg-green-600 hover:bg-green-700"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download File
                  </Button>
                </div>
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
