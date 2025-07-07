// src/components/features/tv-series/DownloadAllSeasonsWithOptionsButton.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ServerIcon, Loader2Icon } from "lucide-react"; 
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getTvSeriesDetails, getTvSeasonDetails, getEpisodeMagnetLink } from "@/lib/tmdb";
import { useWebTorrent } from "@/contexts/WebTorrentContext";

interface DownloadAllSeasonsWithOptionsButtonProps {
  seriesId: number | string;
  seriesName: string; 
  seriesTitle: string; 
}

const qualities = ["1080p (FHD)", "720p (HD)", "480p (SD)", "Any Available"];

export function DownloadAllSeasonsWithOptionsButton({
  seriesId,
  seriesName,
  seriesTitle,
}: DownloadAllSeasonsWithOptionsButtonProps) {
  const { toast } = useToast();
  const [selectedQuality, setSelectedQuality] = useState(qualities[0]);
  const [isLoading, setIsLoading] = useState(false);
  const { addTorrent } = useWebTorrent();

  const handleDownloadAllSeasons = async () => {
    setIsLoading(true);
    toast({
      title: "Downloading All Seasons",
      description: `Queueing all episodes for ${seriesTitle}. This may take a while.`,
    });

    try {
      const seriesDetails = await getTvSeriesDetails(seriesId);
      for (const season of seriesDetails.seasons) {
        const seasonDetails = await getTvSeasonDetails(seriesId, season.season_number);
        for (const episode of seasonDetails.episodes) {
          const magnet = await getEpisodeMagnetLink(seriesTitle, episode.season_number, episode.episode_number, selectedQuality);
          if (magnet) {
            await addTorrent(magnet, `${seriesTitle} - S${episode.season_number}E${episode.episode_number}`, episode.id);
          }
        }
      }
      toast({
        title: "All Seasons Queued",
        description: `All available episodes for ${seriesTitle} have been added to your downloads.`,
      });
    } catch (error) {
      toast({
        title: "Download Error",
        description: "An error occurred while trying to download all seasons.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <Select value={selectedQuality} onValueChange={setSelectedQuality} disabled={isLoading}>
        <SelectTrigger className="w-full h-11 text-sm" disabled={isLoading} asChild={false}>
         <span><SelectValue placeholder="Select download quality" /></span>
        </SelectTrigger>
        <SelectContent>
          {qualities.map((quality) => (
            <SelectItem key={quality} value={quality} className="text-sm">
              {quality}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        size="lg"
        className="w-full h-12"
        onClick={handleDownloadAllSeasons}
        disabled={isLoading}
        aria-label={`Download all seasons of ${seriesName} in ${selectedQuality} via Server`}
      >
        {isLoading ? <Loader2Icon className="animate-spin h-5 w-5"/> : <ServerIcon className="h-5 w-5" /> } 
        <span className="ml-2">Download All Seasons</span>
      </Button>
       <p className="text-xs text-muted-foreground text-center">Note: Downloads all available episodes.</p>
    </div>
  );
}

