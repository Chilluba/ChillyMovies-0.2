// src/contexts/WebTorrentContext.tsx
import React, { createContext, useContext, ReactNode, useCallback, useState, useEffect } from 'react';
import webTorrentService from '@/lib/webtorrent-service';
import type { Torrent, TorrentProgress, HistoryItem, TorrentFile } from '@/lib/webtorrent-service';

interface WebTorrentContextType {
  torrents: TorrentProgress[];
  history: HistoryItem[];
  addTorrent: (magnetURI: string, itemName?: string, itemId?: string | number) => Promise<Torrent | null>;
  removeTorrent: (infoHashOrMagnetURI: string) => void;
  pauseTorrent: (infoHashOrMagnetURI: string) => void;
  resumeTorrent: (infoHashOrMagnetURI: string) => void;
  getTorrentInstance: (infoHashOrMagnetURI: string) => Torrent | undefined;
  getLargestFileForStreaming: (infoHashOrMagnetURI: string) => Promise<{ file: TorrentFile, streamUrl: string } | null>;
  clearDownloadHistory: () => void;
  isClientReady: boolean;
}

const WebTorrentContext = createContext<WebTorrentContextType | undefined>(undefined);

export const useWebTorrent = (): WebTorrentContextType => {
  const context = useContext(WebTorrentContext);
  if (!context) {
    throw new Error('useWebTorrent must be used within a WebTorrentProvider');
  }
  return context;
};

interface WebTorrentProviderProps {
  children: ReactNode;
}

export const WebTorrentProvider: React.FC<WebTorrentProviderProps> = ({ children }) => {
  const [torrents, setTorrents] = useState<TorrentProgress[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isClientReady, setIsClientReady] = useState(false);

  const updateTorrentsProgress = useCallback(() => {
    if (!webTorrentService.getClient()) return;
    const torrents = webTorrentService.getTorrents();
    const progress = torrents.map((torrent: Torrent) => ({
      torrentId: torrent.infoHash,
      progress: torrent.progress,
      downloadSpeed: torrent.downloadSpeed,
      uploadSpeed: torrent.uploadSpeed,
      peers: torrent.numPeers,
      remainingTime: torrent.timeRemaining,
      downloaded: torrent.downloaded,
      length: torrent.length,
      customName: torrent.customName,
      addedDate: torrent.addedDate,
      itemId: torrent.itemId,
      status: torrent.done ? 'done' : torrent.paused ? 'paused' : 'downloading',
    }));
    setTorrents(progress);
  }, []);

  useEffect(() => {
    const checkClient = setInterval(() => {
      const client = webTorrentService.getClient();
      if (client) {
        setIsClientReady(true);
        clearInterval(checkClient);
      }
    }, 100);

    const progressInterval = setInterval(updateTorrentsProgress, 1000);
    setHistory(webTorrentService.getDownloadHistory());

    return () => {
      clearInterval(checkClient);
      clearInterval(progressInterval);
    };
  }, [updateTorrentsProgress]);

  const addTorrent = useCallback(async (magnetURI: string, itemName?: string, itemId?: string | number) => {
    if (!isClientReady) return null;
    try {
      const torrent = await webTorrentService.addTorrent(magnetURI, itemName, itemId);
      updateTorrentsProgress();
      setHistory(webTorrentService.getDownloadHistory());
      return torrent;
    } catch (error) {
      console.error(error);
      return null;
    }
  }, [isClientReady, updateTorrentsProgress]);

  const removeTorrent = useCallback((infoHashOrMagnetURI: string) => {
    if (!isClientReady) return;
    webTorrentService.removeTorrent(infoHashOrMagnetURI);
    updateTorrentsProgress();
    setHistory(webTorrentService.getDownloadHistory());
  }, [isClientReady, updateTorrentsProgress]);

  const pauseTorrent = useCallback((infoHashOrMagnetURI: string) => {
    if (!isClientReady) return;
    webTorrentService.pauseTorrent(infoHashOrMagnetURI);
    updateTorrentsProgress();
  }, [isClientReady, updateTorrentsProgress]);

  const resumeTorrent = useCallback((infoHashOrMagnetURI: string) => {
    if (!isClientReady) return;
    webTorrentService.resumeTorrent(infoHashOrMagnetURI);
    updateTorrentsProgress();
  }, [isClientReady, updateTorrentsProgress]);

  const getTorrentInstance = useCallback((infoHashOrMagnetURI: string) => {
    if (!isClientReady) return undefined;
    return webTorrentService.getTorrent(infoHashOrMagnetURI);
  }, [isClientReady]);

  const getLargestFileForStreaming = useCallback(async (infoHashOrMagnetURI: string) => {
    if (!isClientReady) return null;
    return webTorrentService.getLargestFileForStreaming(infoHashOrMagnetURI);
  }, [isClientReady]);

  const clearDownloadHistory = useCallback(() => {
    const HISTORY_STORAGE_KEY = 'chillymovies_download_history';
    localStorage.removeItem(HISTORY_STORAGE_KEY);
    setHistory([]);
  }, []);

  const value: WebTorrentContextType = {
    torrents,
    history,
    addTorrent,
    removeTorrent,
    pauseTorrent,
    resumeTorrent,
    getTorrentInstance,
    getLargestFileForStreaming,
    clearDownloadHistory,
    isClientReady,
  };

  return (
    <WebTorrentContext.Provider value={value}>
      {children}
    </WebTorrentContext.Provider>
  );
};