// src/app/[locale]/(main)/downloads/page.tsx
"use client";

import React, { useState, useEffect, useCallback, use } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
    DownloadCloudIcon, PlayCircleIcon, PauseCircleIcon, XCircleIcon, 
    FolderOpenIcon, Trash2Icon, RefreshCwIcon, HistoryIcon, 
    ListChecksIcon, FileTextIcon, Loader2Icon, CheckCircle2Icon, 
    AlertTriangleIcon, InfoIcon, ServerIcon, WifiOffIcon, PowerOffIcon
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
// import { useWebTorrent } from "@/contexts/WebTorrentContext"; // Stubbed out
// import type { TorrentProgress, HistoryItem, TorrentFile as WebTorrentTorrentFile, TorrentProgressStatus } from "@/lib/webtorrent-service"; // Stubbed out
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { formatBytes } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
// import type { ConceptualAria2Task, Aria2DownloadItemDisplay } from "@/types/download"; // Stubbed out
import type { Locale } from '@/config/i18n.config';
import { getDictionary } from '@/lib/getDictionary';

// --- Start: Types that would come from stubbed files ---
// These are simplified versions for the UI template
interface StubbedTorrentProgress {
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
  status: 'idle' | 'downloading' | 'seeding' | 'paused' | 'error' | 'connecting' | 'done' | 'metadata' | 'stalled' | 'no_peers';
  noPeersReason?: string;
}
interface StubbedHistoryItem {
  infoHash: string;
  magnetURI: string;
  name: string;
  itemId?: string | number;
  addedDate: string;
  completedDate?: string;
  status: 'completed' | 'failed' | 'removed' | 'active' | 'error' | 'stalled';
  size?: number;
  lastError?: string;
}
interface StubbedConceptualAria2Task {
  taskId: string;
  name: string;
  quality: string;
  addedTime: number;
  sourceUrlOrIdentifier: string;
  type: 'magnet' | 'imdb_id' | 'tv_episode' | 'tv_season_pack' | 'tv_season_pack_all';
}
interface StubbedAria2DownloadItemDisplay {
  taskId: string;
  name: string;
  status: 'active' | 'waiting' | 'paused' | 'error' | 'complete' | 'removed' | 'connecting';
  progress: number;
  downloadSpeed: number;
  uploadSpeed: number;
  totalLength?: number;
  completedLength?: number;
  connections?: number;
  downloadUrl?: string;
  errorCode?: string;
  errorMessage?: string;
  quality?: string;
  addedTime?: number;
}
// --- End: Types ---


// const ARIA2_TASKS_STORAGE_KEY = 'chillymovies-aria2-tasks'; // Stubbed

interface DownloadsPageProps {
  params: { locale: Locale };
}

export default function DownloadsPage(props: DownloadsPageProps) {
  const { locale } = use(props.params);
  const { toast } = useToast();

  const [activeWebTorrents, setActiveWebTorrents] = useState<StubbedTorrentProgress[]>([]);
  const [webTorrentHistory, setWebTorrentHistory] = useState<StubbedHistoryItem[]>([]);
  const [displayedAria2Downloads, setDisplayedAria2Downloads] = useState<StubbedAria2DownloadItemDisplay[]>([]);
  // const [isLoadingAria2, setIsLoadingAria2] = useState(false); // Stubbed
  const [dictionary, setDictionary] = useState<any>(null);

  useEffect(() => {
    const fetchDict = async () => {
      if (locale) {
        const dict = await getDictionary(locale);
        setDictionary(dict.downloadsPage);
      }
    };
    fetchDict();
  }, [locale]);

  // Stubbed: Data fetching logic removed, using placeholder/empty data
  useEffect(() => {
    if (dictionary) { // Simulate loading placeholder data once dictionary is ready
        setActiveWebTorrents([
            // { torrentId: 'webtorrent-1', customName: 'Example Movie (WebTorrent)', progress: 0.6, downloadSpeed: 1200000, uploadSpeed: 50000, peers: 10, downloaded: 600000000, length: 1000000000, status: 'downloading', addedDate: new Date() },
        ]);
        setWebTorrentHistory([
            // { infoHash: 'history-1', magnetURI: 'magnet:?xt=urn:btih:history1', name: 'Old Downloaded Movie', addedDate: new Date(Date.now() - 86400000 * 2).toISOString(), completedDate: new Date(Date.now() - 86400000).toISOString(), status: 'completed', size: 1500000000 },
        ]);
        setDisplayedAria2Downloads([
            // { taskId: 'aria2-1', name: 'Example Series S01E01 (Server)', status: 'active', progress: 75, downloadSpeed: 2500000, uploadSpeed: 100000, quality: '1080p', addedTime: Date.now() - 3600000, completedLength: 750000000, totalLength: 1000000000 },
        ]);
    }
  }, [dictionary]);


  const getStatusInfo = (status: StubbedTorrentProgress['status'] | StubbedHistoryItem['status'] | StubbedAria2DownloadItemDisplay['status'], noPeersReason?: string) => {
    const statusKey = status?.toLowerCase().replace(/_/g, '') || 'unknown';
    const label = dictionary?.statusLabels?.[statusKey] || `Unknown (${status})`;
    
    switch (status) {
      case "downloading": case "active": 
        return { badge: <Badge variant="default" className="bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30">{label}</Badge>, icon: <Loader2Icon className="h-4 w-4 text-blue-400 animate-spin" /> };
      case "paused":
        return { badge: <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/30">{label}</Badge>, icon: <PauseCircleIcon className="h-4 w-4 text-yellow-400" /> };
      case "completed": case "done": case "seeding": case "complete": 
        return { badge: <Badge variant="default" className="bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30">{label}</Badge>, icon: <CheckCircle2Icon className="h-4 w-4 text-green-400" /> };
      case "failed": case "error":
        return { badge: <Badge variant="destructive" className="bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30">{label}</Badge>, icon: <AlertTriangleIcon className="h-4 w-4 text-red-400" /> };
      case "connecting": case "metadata": case "waiting": 
        return { badge: <Badge variant="outline" className="animate-pulse">{label}</Badge>, icon: <Loader2Icon className="h-4 w-4 text-muted-foreground animate-spin" /> };
      case "stalled":
        return { badge: <Badge variant="outline" className="bg-orange-500/20 text-orange-400 border-orange-500/30 hover:bg-orange-500/30">{label}</Badge>, icon: <PowerOffIcon className="h-4 w-4 text-orange-400" /> };
      case "no_peers":
        return { badge: <Badge variant="outline" className="bg-gray-500/20 text-gray-400 border-gray-500/30 hover:bg-gray-500/30" title={noPeersReason}>{label}</Badge>, icon: <WifiOffIcon className="h-4 w-4 text-gray-400" /> };
      case "removed":
        return { badge: <Badge variant="outline">{label}</Badge>, icon: <Trash2Icon className="h-4 w-4 text-muted-foreground" /> };
      default:
        return { badge: <Badge variant="outline">{label}</Badge>, icon: <InfoIcon className="h-4 w-4 text-muted-foreground" /> };
    }
  };

  // STUBBED HANDLERS
  const showStubToast = (action: string, itemName?: string) => {
    toast({
      title: `${action} (Stubbed)`,
      description: `${action} for "${itemName || 'item'}" pressed. Feature to be fully implemented.`,
    });
  };
  const handlePlayWebTorrent = (torrentIdOrMagnet: string) => showStubToast('Play WebTorrent', torrentIdOrMagnet);
  const handleRetryWebTorrentDownload = (item: StubbedHistoryItem) => showStubToast('Retry WebTorrent', item.name);
  const handleRemoveWebTorrent = (torrentId: string) => showStubToast('Remove WebTorrent', torrentId);
  const handlePauseAria2 = (taskId: string) => showStubToast('Pause Server Download', taskId);
  const handleResumeAria2 = (taskId: string) => showStubToast('Resume Server Download', taskId);
  const handleRemoveAria2 = (taskId: string) => showStubToast('Remove Server Download', taskId);
  const handleOpenAria2File = (downloadUrl?: string) => showStubToast('Open Server File', downloadUrl || 'file');
  const clearDownloadHistory = () => {
    setWebTorrentHistory([]);
    showStubToast('Clear Download History');
  }
  const removeDownloadFromHistory = (infoHash: string) => {
    setWebTorrentHistory(prev => prev.filter(item => item.infoHash !== infoHash));
    showStubToast('Remove from History', infoHash);
  }


  if (!dictionary || !locale) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2Icon className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">{dictionary.mainTitle}</h1>
          <p className="text-muted-foreground mt-1">{dictionary.mainDescription}</p>
        </div>
        {/* Removed WebTorrent initializing badge as context is stubbed */}
      </div>

      <Tabs defaultValue="webtorrent_active" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 gap-x-1.5 rounded-lg p-1.5 bg-muted h-auto md:h-12 text-base">
          <TabsTrigger value="webtorrent_active" className="h-full py-2.5 px-2 md:px-3">{dictionary.tabs.webTorrents}</TabsTrigger>
          <TabsTrigger value="server_downloads" className="h-full py-2.5 px-2 md:px-3">{dictionary.tabs.serverDownloads}</TabsTrigger>
          <TabsTrigger value="history" className="h-full py-2.5 px-2 md:px-3 col-span-2 md:col-span-1">{dictionary.tabs.history}</TabsTrigger>
        </TabsList>

        <TabsContent value="webtorrent_active" className="mt-8">
          <Card className="shadow-lg border-border/40 overflow-hidden">
            <CardHeader><CardTitle>{dictionary.activeWebTorrents.title}</CardTitle></CardHeader>
            <CardContent className="p-0">
              {activeWebTorrents.length > 0 ? (
                <div className="divide-y divide-border/30">
                  {activeWebTorrents.map((download) => {
                    const { badge: statusBadge, icon: statusIcon } = getStatusInfo(download.status, download.noPeersReason);
                    return (
                      <div key={download.torrentId} className="p-4 md:p-6 hover:bg-muted/30">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                          <div className="flex-grow min-w-0">
                            <h3 className="font-semibold text-md md:text-lg truncate mb-1" title={download.customName || download.torrentId}>{download.customName || dictionary.fetchingName}</h3>
                            <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs md:text-sm text-muted-foreground">
                              <span className="flex items-center gap-1.5">{statusIcon}{statusBadge}</span>
                              <span>{formatBytes(download.downloaded)} / {download.length ? formatBytes(download.length) : dictionary.na}</span>
                              {(download.status === 'downloading' || download.status === 'connecting' || download.status === 'metadata') && download.downloadSpeed > 0 && (
                                <><span className="hidden sm:inline">&bull;</span><span>{formatBytes(download.downloadSpeed)}/s</span></>
                              )}
                              {download.status === 'downloading' && download.remainingTime !== undefined && Number.isFinite(download.remainingTime) && download.remainingTime > 0 && (
                                <><span className="hidden sm:inline">&bull;</span><span>{dictionary.etaLabel}: {new Date(download.remainingTime).toISOString().substr(11, 8)}</span></>
                              )}
                              <span className="hidden sm:inline">&bull;</span><span>{dictionary.peersLabel}: {download.peers}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0 mt-2 sm:mt-0 self-start sm:self-center">
                            {(download.status === 'downloading' || download.status === 'connecting' || download.status === 'metadata' || download.status === 'stalled' || download.status === 'no_peers') && (
                              <Button variant="ghost" size="icon" aria-label={dictionary.pauseLabel} onClick={() => showStubToast('Pause', download.customName)}><PauseCircleIcon className="h-5 w-5" /></Button>
                            )}
                            {download.status === 'paused' && (
                              <Button variant="ghost" size="icon" aria-label={dictionary.resumeLabel} onClick={() => showStubToast('Resume', download.customName)}><PlayCircleIcon className="h-5 w-5" /></Button>
                            )}
                            {(download.status === 'done' || download.status === 'seeding' || (download.status === 'downloading' && download.progress > 0.01)) && (
                              <Button variant="ghost" size="icon" aria-label={dictionary.playStreamLabel} onClick={() => handlePlayWebTorrent(download.torrentId)}><PlayCircleIcon className="h-5 w-5" /></Button>
                            )}
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/80" aria-label={dictionary.removeLabel} onClick={() => handleRemoveWebTorrent(download.torrentId)}><XCircleIcon className="h-5 w-5" /></Button>
                          </div>
                        </div>
                        <Progress value={download.progress * 100} className="mt-3 h-1.5 md:h-2" indicatorClassName={
                            download.status === 'paused' ? 'bg-yellow-500' : 
                            (download.status === 'error' || download.status === 'failed') ? 'bg-red-500' : 
                            (download.status === 'done' || download.status === 'seeding' ) ? 'bg-green-500' : 
                            (download.status === 'stalled' || download.status === 'no_peers') ? 'bg-orange-500' :
                            'bg-primary'} />
                        {download.status === 'no_peers' && download.noPeersReason && <p className="text-xs text-orange-400 mt-1">{download.noPeersReason}</p>}
                        {download.status === 'stalled' && <p className="text-xs text-orange-400 mt-1">{dictionary.downloadStalledMessage}</p>}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 px-6">
                  <DownloadCloudIcon className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
                  <h3 className="text-xl font-semibold text-muted-foreground">{dictionary.activeWebTorrents.noActiveTitle}</h3>
                  <p className="text-muted-foreground mt-2">{dictionary.activeWebTorrents.noActiveDescriptionStub || "Add downloads from movie or TV series pages."}</p> 
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="server_downloads" className="mt-8">
          <Card className="shadow-lg border-border/40 overflow-hidden">
            <CardHeader>
              <CardTitle>{dictionary.serverDownloads.title}</CardTitle>
              <CardDescription className="text-xs">{dictionary.serverDownloads.description}</CardDescription>
            </CardHeader>
             <CardContent className="p-0">
              {/* {isLoadingAria2 && displayedAria2Downloads.length === 0 && (
                <div className="text-center py-12 px-6"><Loader2Icon className="mx-auto h-12 w-12 text-primary animate-spin mb-4" /><p className="text-muted-foreground">{dictionary.serverDownloads.loadingStatus}</p></div>
              )} */}
              {/*!isLoadingAria2 &&*/ displayedAria2Downloads.length === 0 && (
                 <div className="text-center py-12 px-6">
                  <ServerIcon className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
                  <h3 className="text-xl font-semibold text-muted-foreground">{dictionary.serverDownloads.noActiveTitle}</h3>
                  <p className="text-muted-foreground mt-1">{dictionary.serverDownloads.noActiveDescription}</p>
                </div>
              )}
              {displayedAria2Downloads.length > 0 && (
                 <div className="divide-y divide-border/30">
                  {displayedAria2Downloads.map((download) => {
                     const { badge: statusBadge, icon: statusIcon } = getStatusInfo(download.status);
                     return (
                       <div key={download.taskId} className="p-4 md:p-6 hover:bg-muted/30">
                         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                           <div className="flex-grow min-w-0">
                             <h3 className="font-semibold text-md md:text-lg truncate mb-1" title={download.name}>{download.name}</h3>
                             <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs md:text-sm text-muted-foreground">
                               <span className="flex items-center gap-1.5">{statusIcon}{statusBadge}</span>
                               {download.quality && <span>{download.quality}</span>}
                               <span className="hidden sm:inline">&bull;</span>
                               <span>{formatBytes(download.completedLength || 0)} / {download.totalLength ? formatBytes(download.totalLength) : dictionary.na}</span>
                               {download.status === 'active' && download.downloadSpeed > 0 && <span>{formatBytes(download.downloadSpeed)}/s</span>}
                               {download.status === 'active' && download.connections !== undefined && <><span className="hidden sm:inline">&bull;</span>{dictionary.peersLabel}: {download.connections}</>}
                             </div>
                           </div>
                           <div className="flex items-center gap-1 flex-shrink-0 mt-2 sm:mt-0 self-start sm:self-center">
                             {download.status === 'active' && <Button variant="ghost" size="icon" title={dictionary.pauseLabel} onClick={() => handlePauseAria2(download.taskId)}><PauseCircleIcon className="h-5 w-5" /></Button>}
                             {download.status === 'paused' && <Button variant="ghost" size="icon" title={dictionary.resumeLabel} onClick={() => handleResumeAria2(download.taskId)}><PlayCircleIcon className="h-5 w-5" /></Button>}
                             {download.status === 'complete' && download.downloadUrl && <Button variant="ghost" size="icon" title={dictionary.downloadFileLabel} onClick={() => handleOpenAria2File(download.downloadUrl)}><FolderOpenIcon className="h-5 w-5" /></Button>}
                             <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/80" title={dictionary.removeTaskLabel} onClick={() => handleRemoveAria2(download.taskId)}><XCircleIcon className="h-5 w-5" /></Button>
                           </div>
                         </div>
                         <Progress value={download.progress} className="mt-3 h-1.5 md:h-2" indicatorClassName={download.status === 'paused' ? 'bg-yellow-500' : (download.status === 'error') ? 'bg-red-500' : (download.status === 'complete') ? 'bg-green-500' : 'bg-primary'}/>
                         {download.errorMessage && <p className="text-xs text-destructive mt-1">{download.errorMessage}</p>}
                       </div>
                     );
                  })}
                 </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-8">
          <Card className="shadow-lg border-border/40 overflow-hidden">
            <CardHeader className="flex flex-row justify-between items-center">
                <CardTitle>{dictionary.history.title}</CardTitle>
                {webTorrentHistory.length > 0 && (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm"><Trash2Icon className="mr-2 h-4 w-4"/> {dictionary.history.clearAllButton}</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader><AlertDialogTitle>{dictionary.history.alertTitle}</AlertDialogTitle><AlertDialogDescription>{dictionary.history.alertDescription}</AlertDialogDescription></AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>{dictionary.history.alertCancel}</AlertDialogCancel>
                                <AlertDialogAction onClick={clearDownloadHistory}>{dictionary.history.alertConfirm}</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </CardHeader>
            <CardContent className="p-0">
              {webTorrentHistory.length > 0 ? (
                <div className="divide-y divide-border/30">
                  {webTorrentHistory.map(item => {
                    const { badge: statusBadge, icon: statusIcon } = getStatusInfo(item.status);
                    return (
                      <div key={item.infoHash} className={`p-4 md:p-6 hover:bg-muted/30 ${item.status === 'failed' || item.status === 'error' || item.status === 'stalled' ? 'opacity-70' : ''}`}>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                          <div className="flex-grow min-w-0">
                            <h3 className="font-semibold text-md md:text-lg truncate mb-1" title={item.name}>{item.name}</h3>
                            <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs md:text-sm text-muted-foreground">
                              <span className="flex items-center gap-1.5">{statusIcon}{statusBadge}</span>
                              <span>{dictionary.history.addedLabel}: {new Date(item.addedDate).toLocaleDateString()}</span>
                              {item.completedDate && <><span className="hidden sm:inline">&bull;</span><span>{dictionary.history.finishedLabel}: {new Date(item.completedDate).toLocaleDateString()}</span></>}
                              {item.size && <><span className="hidden sm:inline">&bull;</span><span>{dictionary.history.sizeLabel}: {formatBytes(item.size)}</span></>}
                            </div>
                            {item.lastError && <p className="text-xs text-destructive mt-1">{dictionary.history.errorLabel}: {item.lastError}</p>}
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0 mt-2 sm:mt-0 self-start sm:self-center">
                            {(item.status === 'completed') && item.magnetURI && ( 
                                <Button variant="ghost" size="icon" title={dictionary.history.streamAgainLabel} onClick={() => handlePlayWebTorrent(item.magnetURI)}><PlayCircleIcon className="h-5 w-5" /></Button>
                            )}
                            {(item.status === 'failed' || item.status === 'error' || item.status === 'stalled') && item.magnetURI && (
                              <Button variant="ghost" size="icon" title={dictionary.history.retryLabel} onClick={() => handleRetryWebTorrentDownload(item)}><RefreshCwIcon className="h-5 w-5" /></Button>
                            )}
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/80" title={dictionary.history.removeFromHistoryLabel} onClick={() => removeDownloadFromHistory(item.infoHash)}><Trash2Icon className="h-5 w-5" /></Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 px-6">
                  <HistoryIcon className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
                  <h3 className="text-xl font-semibold text-muted-foreground">{dictionary.history.noHistoryTitle}</h3>
                  <p className="text-muted-foreground mt-1">{dictionary.history.noHistoryDescription}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
