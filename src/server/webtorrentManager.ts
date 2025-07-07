// src/server/webtorrentManager.ts
import WebTorrent from 'webtorrent';
import path from 'path';
import fs from 'fs';

const DOWNLOAD_PATH = process.env.DOWNLOAD_BASE_PATH || './chillymovies_downloads';

if (!fs.existsSync(DOWNLOAD_PATH)) {
  fs.mkdirSync(DOWNLOAD_PATH, { recursive: true });
}

class WebTorrentManager {
  private client: WebTorrent.Instance;

  constructor() {
    this.client = new WebTorrent();
  }

  addTorrent(torrentId: string, onProgress?: (progress: number) => void) {
    console.log(`Adding torrent: ${torrentId}`);
    this.client.add(torrentId, { path: DOWNLOAD_PATH }, (torrent) => {
      console.log(`Torrent added: ${torrent.infoHash}`);

      torrent.on('download', (bytes) => {
        if (onProgress) {
          onProgress(torrent.progress);
        }
      });

      torrent.on('done', () => {
        console.log(`Torrent download finished: ${torrent.name}`);
      });

      torrent.on('error', (err) => {
        console.error(`Torrent error: ${err}`);
      });
    });
  }

  getTorrent(torrentId: string) {
    return this.client.get(torrentId);
  }

  getTorrents() {
    return this.client.torrents;
  }
}

const webTorrentManager = new WebTorrentManager();
export default webTorrentManager;