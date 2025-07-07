// src/lib/webtorrent-service.ts
import type WebTorrent from 'webtorrent';
import { Buffer } from 'buffer';

if (typeof window !== 'undefined') {
  if (typeof (window as any).Buffer === 'undefined') {
    (window as any).Buffer = Buffer;
  }
}

export interface TorrentFile {
  name: string;
  length: number;
  path: string;
  createReadStream(opts?: any): any;
}

export interface Torrent extends WebTorrent.Torrent {
  customName?: string;
  addedDate?: Date;
  itemId?: string | number;
}

export type TorrentProgressStatus =
  | 'idle'
  | 'downloading'
  | 'seeding'
  | 'paused'
  | 'error'
  | 'connecting'
  | 'done'
  | 'metadata'
  | 'stalled';

export type TorrentProgress = {
  torrentId: string;
  progress: number;
  downloadSpeed: number;
  uploadSpeed: number;
  peers: number;
  remainingTime?: number;
  downloaded: number;
  length?: number;
  customName?: string;
  addedDate?: Date;
  itemId?: string | number;
  status: TorrentProgressStatus;
};

export interface HistoryItem {
  infoHash: string;
  magnetURI: string;
  name: string;
  itemId?: string | number;
  addedDate: string;
  completedDate?: string;
  status: 'completed' | 'failed' | 'removed';
  size?: number;
}

const HISTORY_STORAGE_KEY = 'chillymovies_download_history';

class WebTorrentService {
  private client: WebTorrent.Instance | null = null;
  private static instance: WebTorrentService;

  private constructor() {
    if (typeof window !== 'undefined') {
      import('webtorrent').then(WebTorrent => {
        this.client = new WebTorrent.default();
      });
    }
  }

  public static getInstance(): WebTorrentService {
    if (!WebTorrentService.instance) {
      WebTorrentService.instance = new WebTorrentService();
    }
    return WebTorrentService.instance;
  }

  public getClient(): WebTorrent.Instance | null {
    return this.client;
  }

  public addTorrent(magnetURI: string, itemName?: string, itemId?: string | number): Promise<Torrent> {
    return new Promise((resolve, reject) => {
      if (!this.client) {
        return reject(new Error('WebTorrent client is not initialized.'));
      }
      if (this.client.get(magnetURI)) {
        return reject(new Error('Torrent already added.'));
      }

      const torrent = this.client.add(magnetURI, (torrent: WebTorrent.Torrent) => {
        const extendedTorrent = torrent as Torrent;
        extendedTorrent.customName = itemName;
        extendedTorrent.itemId = itemId;
        extendedTorrent.addedDate = new Date();
        this.updateHistory(extendedTorrent, 'active');
        resolve(extendedTorrent);
      }) as Torrent;

      torrent.on('error', (err) => {
        this.updateHistory(torrent, 'failed');
        reject(err);
      });

      torrent.on('done', () => {
        this.updateHistory(torrent, 'completed');
      });
    });
  }

  public removeTorrent(infoHashOrMagnetURI: string) {
    const torrent = this.client?.get(infoHashOrMagnetURI) as Torrent;
    if (torrent) {
      this.updateHistory(torrent, 'removed');
      torrent.destroy();
    }
  }

  public pauseTorrent(infoHashOrMagnetURI: string) {
    const torrent = this.client?.get(infoHashOrMagnetURI) as Torrent;
    if (torrent) {
      torrent.pause();
    }
  }

  public resumeTorrent(infoHashOrMagnetURI: string) {
    const torrent = this.client?.get(infoHashOrMagnetURI) as Torrent;
    if (torrent) {
      torrent.resume();
    }
  }

  public getTorrent(infoHashOrMagnetURI: string): Torrent | undefined {
    return this.client?.get(infoHashOrMagnetURI) as Torrent;
  }

  public getTorrents(): Torrent[] {
    return this.client?.torrents as Torrent[] || [];
  }

  public getDownloadHistory(): HistoryItem[] {
    if (typeof window === 'undefined') return [];
    const history = localStorage.getItem(HISTORY_STORAGE_KEY);
    return history ? JSON.parse(history) : [];
  }

  private updateHistory(torrent: Torrent, status: HistoryItem['status']) {
    if (typeof window === 'undefined') return;
    const history = this.getDownloadHistory();
    const existingIndex = history.findIndex(item => item.infoHash === torrent.infoHash);

    if (existingIndex > -1) {
      history[existingIndex].status = status;
      if (status === 'completed') {
        history[existingIndex].completedDate = new Date().toISOString();
      }
    } else {
      history.push({
        infoHash: torrent.infoHash,
        magnetURI: torrent.magnetURI,
        name: torrent.customName || torrent.name,
        itemId: torrent.itemId,
        addedDate: (torrent.addedDate || new Date()).toISOString(),
        status,
        size: torrent.length,
      });
    }
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
  }

  public getLargestFileForStreaming(infoHashOrMagnetURI: string): Promise<{ file: TorrentFile; streamUrl: string } | null> {
    return new Promise((resolve) => {
      const torrent = this.getTorrent(infoHashOrMagnetURI);
      if (!torrent) {
        return resolve(null);
      }

      const file = torrent.files.reduce((a, b) => (a.length > b.length ? a : b));
      const streamUrl = `http://localhost:8000/${torrent.infoHash}/${file.path}`;
      resolve({ file: file as TorrentFile, streamUrl });
    });
  }
}

export default WebTorrentService.getInstance();
