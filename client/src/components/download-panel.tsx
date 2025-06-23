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
      // Create a download link that will trigger the direct download
      const link = document.createElement('a');
      const params = new URLSearchParams();
      Object.keys(downloadData).forEach(key => {
        params.append(key, downloadData[key]);
      });
      
      link.href = `/api/download/start?${params.toString()}`;
      link.download = `${downloadData.title.replace(/[^a-zA-Z0-9\s]/g, '_').trim()}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Download started",
        description: "Your video is downloading to your device",
      });
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
          
          {/* Download Status */}
          {startDownloadMutation.isPending && (
            <Alert className="bg-blue-50 border-blue-200">
              <Download className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-600">
                <span className="font-medium">Download Started!</span>
                <br />
                Video is downloading to your device
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
