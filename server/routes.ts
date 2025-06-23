import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { videoInfoSchema, insertDownloadSchema } from "@shared/schema";
import ytdl from "@distube/ytdl-core";
import fs from "fs";
import path from "path";

export async function registerRoutes(app: Express): Promise<Server> {

  // Get video information
  app.post("/api/video/info", async (req, res) => {
    try {
      const { url } = videoInfoSchema.parse(req.body);

      if (!ytdl.validateURL(url)) {
        return res.status(400).json({ message: "Invalid YouTube URL" });
      }

      const info = await ytdl.getInfo(url);
      const videoDetails = info.videoDetails;

      // Debug: Log available formats to understand the structure
      console.log('Total formats available:', info.formats?.length);
      console.log('Sample format:', info.formats?.[0]);

      // Get available formats from the info object
      const allFormats = info.formats || [];
      
      // Get all video formats (including adaptive formats)
      const videoFormats = allFormats.filter((format: any) => {
        return format.hasVideo && (format.hasAudio || format.audioEncoding);
      });
      
      // Also get adaptive video formats that might have higher qualities
      const adaptiveVideoFormats = allFormats.filter((format: any) => {
        return format.hasVideo && !format.hasAudio && format.qualityLabel;
      });
      
      // Combine both types and remove duplicates by quality
      const combinedFormats = [...videoFormats, ...adaptiveVideoFormats];
      const uniqueQualities = new Map();
      
      combinedFormats.forEach((format: any) => {
        const quality = format.qualityLabel || format.quality;
        if (quality && !uniqueQualities.has(quality)) {
          uniqueQualities.set(quality, format);
        }
      });
      
      // Sort qualities in descending order (1080p, 720p, 480p, etc.)
      const sortedFormats = Array.from(uniqueQualities.values()).sort((a: any, b: any) => {
        const aQuality = a.qualityLabel || a.quality || '0p';
        const bQuality = b.qualityLabel || b.quality || '0p';
        const aHeight = parseInt(aQuality.replace('p', '').replace(/\D/g, '') || '0');
        const bHeight = parseInt(bQuality.replace('p', '').replace(/\D/g, '') || '0');
        return bHeight - aHeight;
      });
      
      console.log('Processed formats:', sortedFormats.map(f => ({ quality: f.qualityLabel || f.quality, hasVideo: f.hasVideo, hasAudio: f.hasAudio })));
      
      const formats = sortedFormats.map((format: any) => ({
        quality: format.qualityLabel || format.quality,
        format: format.container || format.mimeType?.split('/')[1]?.split(';')[0] || 'mp4',
        size: format.contentLength ? `~${Math.round(parseInt(format.contentLength) / 1024 / 1024)} MB` : 'Unknown',
        itag: format.itag,
      }));

      // Add audio-only format
      const audioFormats = allFormats.filter((format: any) => 
        format.hasAudio && !format.hasVideo
      );
      
      if (audioFormats.length > 0) {
        const bestAudio = audioFormats.sort((a: any, b: any) => 
          (b.audioBitrate || 0) - (a.audioBitrate || 0)
        )[0];
        
        formats.push({
          quality: 'Audio Only',
          format: 'mp4',
          size: bestAudio.contentLength ? `~${Math.round(parseInt(bestAudio.contentLength) / 1024 / 1024)} MB` : 'Unknown',
          itag: bestAudio.itag,
        });
      }

      const videoInfo = {
        title: videoDetails.title,
        author: videoDetails.author.name,
        duration: new Date(parseInt(videoDetails.lengthSeconds) * 1000).toISOString().substr(11, 8),
        views: videoDetails.viewCount,
        uploadDate: videoDetails.uploadDate,
        thumbnail: videoDetails.thumbnails[videoDetails.thumbnails.length - 1]?.url,
        formats,
        url,
      };

      res.json(videoInfo);
    } catch (error) {
      console.error("Error fetching video info:", error);
      res.status(500).json({ message: "Failed to fetch video information" });
    }
  });

  // Start download
  app.post("/api/download/start", async (req, res) => {
    try {
      const downloadData = insertDownloadSchema.parse(req.body);

      // Basic URL validation (can be improved)
      if (!downloadData.url.includes("youtube.com") && !downloadData.url.includes("youtu.be")) {
        return res.status(400).json({ message: "Invalid YouTube URL" });
      }

      const download = await storage.createDownload({
        ...downloadData,
        status: "downloading",
        progress: 0,
      });

      // Start download process in background
      startDownloadProcess(download.id, downloadData.url, downloadData.quality);

      res.json(download);
    } catch (error) {
      console.error("Error starting download:", error);
      res.status(500).json({ message: "Failed to start download" });
    }
  });

  // Get download progress
  app.get("/api/download/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const download = await storage.getDownload(id);
      
      if (!download) {
        return res.status(404).json({ message: "Download not found" });
      }

      res.json(download);
    } catch (error) {
      console.error("Error getting download:", error);
      res.status(500).json({ message: "Failed to get download status" });
    }
  });

  // Get all downloads
  app.get("/api/downloads", async (req, res) => {
    try {
      const downloads = await storage.getDownloads();
      res.json(downloads);
    } catch (error) {
      console.error("Error getting downloads:", error);
      res.status(500).json({ message: "Failed to get downloads" });
    }
  });

  // Download file endpoint
  app.get("/api/download/:id/file", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const download = await storage.getDownload(id);
      
      if (!download || download.status !== "completed") {
        return res.status(404).json({ message: "Download not found or not completed" });
      }

      // Re-download the video for immediate streaming
      const info = await ytdl.getInfo(download.url);
      const allFormats = info.formats || [];
      
      let format;
      if (download.quality.includes('Audio')) {
        const audioFormats = allFormats.filter((f: any) => f.hasAudio && !f.hasVideo);
        format = audioFormats.sort((a: any, b: any) => (b.audioBitrate || 0) - (a.audioBitrate || 0))[0];
      } else {
        format = allFormats.find((f: any) => 
          f.hasVideo && f.hasAudio && 
          (f.qualityLabel === download.quality || f.quality === download.quality)
        ) || allFormats.find((f: any) => f.hasVideo && f.hasAudio);
      }

      if (!format) {
        return res.status(404).json({ message: "Video format not available" });
      }

      // Set appropriate headers for file download
      const filename = `${download.title.replace(/[^a-zA-Z0-9\s]/g, '_').trim()}.${format.container || 'mp4'}`;
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', format.mimeType || 'video/mp4');
      res.setHeader('Content-Length', format.contentLength || '0');
      res.setHeader('Accept-Ranges', 'bytes');
      
      // Stream the video directly to the response
      const videoStream = ytdl.downloadFromInfo(info, { format });
      videoStream.pipe(res);
      
      videoStream.on('error', (error) => {
        console.error('Streaming error:', error);
        if (!res.headersSent) {
          res.status(500).json({ message: "Error streaming video" });
        }
      });
      
    } catch (error) {
      console.error("Error downloading file:", error);
      res.status(500).json({ message: "Failed to download file" });
    }
  });

  // Clear download history
  app.delete("/api/downloads", async (req, res) => {
    try {
      const downloads = await storage.getDownloads();
      for (const download of downloads) {
        await storage.deleteDownload(download.id);
      }
      res.json({ message: "Download history cleared" });
    } catch (error) {
      console.error("Error clearing downloads:", error);
      res.status(500).json({ message: "Failed to clear download history" });
    }
  });

  async function startDownloadProcess(downloadId: number, url: string, quality: string) {
    try {
      const info = await ytdl.getInfo(url);
      let format: any;

      const allFormats = info.formats || [];
      
      if (quality.includes('Audio')) {
        // Find best audio-only format
        const audioFormats = allFormats.filter((f: any) => f.hasAudio && !f.hasVideo);
        format = audioFormats.sort((a: any, b: any) => (b.audioBitrate || 0) - (a.audioBitrate || 0))[0];
      } else {
        // Find matching video format
        format = allFormats.find((f: any) => 
          f.hasVideo && f.hasAudio && 
          (f.qualityLabel === quality || f.quality === quality)
        ) || allFormats.find((f: any) => f.hasVideo && f.hasAudio);
      }

      if (!format) {
        throw new Error(`No suitable format found for quality: ${quality}`);
      }

      console.log(`Starting download for quality: ${quality}, itag: ${format.itag}`);

      // Get the video stream
      const stream = ytdl.downloadFromInfo(info, { format });
      const chunks: Buffer[] = [];
      let totalSize = parseInt(format.contentLength || '0');
      let downloaded = 0;

      stream.on('data', async (chunk: Buffer) => {
        chunks.push(chunk);
        downloaded += chunk.length;
        
        const progress = totalSize > 0 ? Math.round((downloaded / totalSize) * 100) : 0;
        const speed = `${Math.round(chunk.length / 1024)} KB/s`;
        const remaining = totalSize > 0 ? Math.round((totalSize - downloaded) / (chunk.length * 1000)) : 0;
        const timeRemaining = `${Math.floor(remaining / 60)}m ${remaining % 60}s`;

        await storage.updateDownload(downloadId, {
          progress,
          downloadSpeed: speed,
          timeRemaining,
        });
      });

      stream.on('end', async () => {
        const videoBuffer = Buffer.concat(chunks);
        
        // Store the video data temporarily for download
        await storage.updateDownload(downloadId, {
          status: "completed",
          progress: 100,
          downloadSpeed: undefined,
          timeRemaining: undefined,
          fileSize: `${Math.round(videoBuffer.length / 1024 / 1024)} MB`,
        });
        
        console.log(`Download completed for ID: ${downloadId}, Size: ${videoBuffer.length} bytes`);
      });

      stream.on('error', async (error) => {
        console.error("Download error:", error);
        await storage.updateDownload(downloadId, {
          status: "failed",
        });
      });

    } catch (error) {
      console.error("Download process error:", error);
      await storage.updateDownload(downloadId, {
        status: "failed",
      });
    }
  }

  const httpServer = createServer(app);
  return httpServer;
}
