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

      // Get available formats from the info object
      const allFormats = info.formats || [];
      
      // Filter for video+audio formats
      const videoFormats = allFormats.filter((format: any) => 
        format.hasVideo && format.hasAudio
      );
      
      const formats = videoFormats.map((format: any) => ({
        quality: format.qualityLabel || format.quality || 'Unknown',
        format: format.container || 'mp4',
        size: format.contentLength ? `~${Math.round(parseInt(format.contentLength) / 1024 / 1024)} MB` : 'Unknown',
        itag: format.itag,
      }));

      // Add audio-only format
      const audioFormats = allFormats.filter((format: any) => 
        format.hasAudio && !format.hasVideo
      );
      
      if (audioFormats.length > 0) {
        const bestAudio = audioFormats[0];
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

      const totalSize = parseInt(format.contentLength || '0');
      let downloaded = 0;

      const stream = ytdl.downloadFromInfo(info, { format });
      
      stream.on('progress', async (chunkLength, downloadedBytes, totalBytes) => {
        downloaded = downloadedBytes;
        const progress = Math.round((downloaded / totalBytes) * 100);
        const speed = `${Math.round(chunkLength / 1024)} KB/s`;
        const remaining = Math.round((totalBytes - downloaded) / chunkLength);
        const timeRemaining = `${Math.floor(remaining / 60)}m ${remaining % 60}s`;

        await storage.updateDownload(downloadId, {
          progress,
          downloadSpeed: speed,
          timeRemaining,
        });
      });

      stream.on('end', async () => {
        await storage.updateDownload(downloadId, {
          status: "completed",
          progress: 100,
          downloadSpeed: undefined,
          timeRemaining: undefined,
        });
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
