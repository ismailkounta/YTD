import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Search, Loader2, AlertCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isValidYouTubeUrl } from "@/lib/utils";

interface UrlInputProps {
  onVideoInfo: (info: any) => void;
}

export default function UrlInput({ onVideoInfo }: UrlInputProps) {
  const [url, setUrl] = useState("");
  const { toast } = useToast();

  const fetchVideoInfoMutation = useMutation({
    mutationFn: async (url: string) => {
      const response = await apiRequest("POST", "/api/video/info", { url });
      return response.json();
    },
    onSuccess: (data) => {
      onVideoInfo({ ...data, url });
      toast({
        title: "Video loaded successfully",
        description: `Found "${data.title}"`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Unable to load video",
        description: error.message || "Please check the URL and try again",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      toast({
        title: "URL required",
        description: "Please enter a YouTube URL",
        variant: "destructive",
      });
      return;
    }

    if (!isValidYouTubeUrl(url)) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid YouTube URL",
        variant: "destructive",
      });
      return;
    }

    fetchVideoInfoMutation.mutate(url);
  };

  return (
    <Card className="glass shadow-anthropic-lg border-border/40">
      <CardContent className="p-8">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-medium text-foreground">
              Paste YouTube URL
            </h2>
            <p className="text-muted-foreground">
              Enter any YouTube video URL to get started
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Input
                type="url"
                placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="h-14 pl-4 pr-12 text-base border-border/60 focus:border-primary/50 bg-background/50"
                disabled={fetchVideoInfoMutation.isPending}
              />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            </div>
            
            <Button 
              type="submit" 
              disabled={fetchVideoInfoMutation.isPending}
              className="w-full h-12 text-base font-medium shadow-anthropic hover:shadow-anthropic-lg transition-all duration-200"
              size="lg"
            >
              {fetchVideoInfoMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Analyzing video...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-5 w-5" />
                  Analyze Video
                </>
              )}
            </Button>
          </form>
          
          {fetchVideoInfoMutation.isError && (
            <Alert variant="destructive" className="border-destructive/30 bg-destructive/5">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Unable to load video information. Please verify the URL and try again.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
