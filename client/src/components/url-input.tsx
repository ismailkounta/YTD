import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Search, Clipboard, X, AlertTriangle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface UrlInputProps {
  onVideoInfo: (info: any) => void;
}

export default function UrlInput({ onVideoInfo }: UrlInputProps) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const { toast } = useToast();

  const fetchVideoInfoMutation = useMutation({
    mutationFn: async (url: string) => {
      const response = await apiRequest("POST", "/api/video/info", { url });
      return response.json();
    },
    onSuccess: (data) => {
      onVideoInfo(data);
      setError("");
      toast({
        title: "Video information loaded",
        description: "Select a quality and start downloading",
      });
    },
    onError: (error: any) => {
      setError(error.message || "Failed to fetch video information");
      onVideoInfo(null);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) {
      setError("Please enter a YouTube URL");
      return;
    }
    fetchVideoInfoMutation.mutate(url);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
      setError("");
    } catch (error) {
      toast({
        title: "Clipboard access denied",
        description: "Please paste the URL manually",
        variant: "destructive",
      });
    }
  };

  const clearInput = () => {
    setUrl("");
    setError("");
    onVideoInfo(null);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Enter YouTube URL</h2>
        <p className="text-gray-600 text-sm">Paste the YouTube video URL you want to download</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Input
            type="url"
            placeholder="https://www.youtube.com/watch?v=..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="pr-12"
          />
          {url && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearInput}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-primary"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            type="submit"
            className="flex-1 bg-primary text-white hover:bg-blue-700"
            disabled={fetchVideoInfoMutation.isPending}
          >
            <Search className="mr-2 h-4 w-4" />
            {fetchVideoInfoMutation.isPending ? "Loading..." : "Get Video Info"}
          </Button>
          <Button 
            type="button"
            variant="outline"
            onClick={handlePaste}
            className="px-6"
          >
            <Clipboard className="mr-2 h-4 w-4" />
            Paste
          </Button>
        </div>
        
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </form>
    </div>
  );
}
