import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Video, Music, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

export default function DownloadHistory() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: downloads = [], isLoading } = useQuery({
    queryKey: ["/api/downloads"],
  });

  const clearHistoryMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", "/api/downloads");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "History cleared",
        description: "All download history has been removed",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/downloads"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to clear history",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "downloading":
        return <Clock className="h-4 w-4 text-blue-600" />;
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "downloading":
        return "bg-blue-100 text-blue-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="bg-gray-50">
          <CardTitle>Recent Downloads</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="bg-gray-50">
        <div className="flex items-center justify-between">
          <CardTitle>Recent Downloads</CardTitle>
          {downloads.length > 0 && (
            <Button 
              variant="ghost"
              size="sm"
              onClick={() => clearHistoryMutation.mutate()}
              disabled={clearHistoryMutation.isPending}
              className="text-primary hover:text-blue-700 font-medium"
            >
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {downloads.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Clock className="text-gray-400" />
            </div>
            <p className="text-gray-500 text-sm">No downloads yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {downloads.map((download: any) => (
              <div key={download.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    {download.quality?.includes('Audio') ? (
                      <Music className="text-gray-400" />
                    ) : (
                      <Video className="text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {download.title}
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span>{download.quality}</span>
                      <span>•</span>
                      <span>{download.fileSize}</span>
                      <span>•</span>
                      <span>{formatDistanceToNow(new Date(download.createdAt))} ago</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(download.status)}>
                      <span className="mr-1">{getStatusIcon(download.status)}</span>
                      {download.status === "downloading" && download.progress
                        ? `${download.progress}%`
                        : download.status.charAt(0).toUpperCase() + download.status.slice(1)
                      }
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
