import { downloads, type Download, type InsertDownload } from "@shared/schema";

export interface IStorage {
  // Downloads
  getDownload(id: number): Promise<Download | undefined>;
  getDownloads(): Promise<Download[]>;
  createDownload(download: InsertDownload): Promise<Download>;
  updateDownload(id: number, updates: Partial<Download>): Promise<Download | undefined>;
  deleteDownload(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private downloads: Map<number, Download>;
  private currentDownloadId: number;

  constructor() {
    this.downloads = new Map();
    this.currentDownloadId = 1;
  }

  async getDownload(id: number): Promise<Download | undefined> {
    return this.downloads.get(id);
  }

  async getDownloads(): Promise<Download[]> {
    return Array.from(this.downloads.values()).sort(
      (a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async createDownload(insertDownload: InsertDownload): Promise<Download> {
    const id = this.currentDownloadId++;
    const download: Download = {
      ...insertDownload,
      id,
      progress: insertDownload.progress ?? 0,
      author: insertDownload.author ?? null,
      duration: insertDownload.duration ?? null,
      thumbnail: insertDownload.thumbnail ?? null,
      fileSize: insertDownload.fileSize ?? null,
      status: insertDownload.status ?? "pending",
      downloadSpeed: insertDownload.downloadSpeed ?? null,
      timeRemaining: insertDownload.timeRemaining ?? null,
      createdAt: new Date(),
    };
    this.downloads.set(id, download);
    return download;
  }

  async updateDownload(id: number, updates: Partial<Download>): Promise<Download | undefined> {
    const download = this.downloads.get(id);
    if (!download) return undefined;

    const updatedDownload = { ...download, ...updates };
    this.downloads.set(id, updatedDownload);
    return updatedDownload;
  }

  async deleteDownload(id: number): Promise<boolean> {
    return this.downloads.delete(id);
  }
}

export const storage = new MemStorage();
