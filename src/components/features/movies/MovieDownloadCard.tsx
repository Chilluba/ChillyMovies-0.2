// src/components/features/movies/MovieDownloadCard.tsx
"use client";

import { useState, useEffect } from "react";
import type { TMDBMovie } from "@/types/tmdb";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DownloadIcon, ExternalLinkIcon, Loader2Icon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getFullImagePath } from "@/lib/tmdb";
import { useWebTorrent } from "@/contexts/WebTorrentContext";
import { useToast } from "@/hooks/use-toast";

interface MovieDownloadCardProps {
  movie: TMDBMovie & { magnetLink?: string; torrentQuality?: string }; 
}

export function MovieDownloadCard({ movie }: MovieDownloadCardProps) {
  const { toast } = useToast();
  const { addTorrent, isClientReady } = useWebTorrent();
  const [isWebTorrentLoading, setIsWebTorrentLoading] = useState(false);

  const handleWebTorrentDownload = async () => {
    if (!isClientReady) {
      toast({ title: "WebTorrent Not Ready", description: "Please wait for the WebTorrent client to initialize.", variant: "destructive" });
      return;
    }
    if (!movie.magnetLink) {
      toast({ title: "Download Not Available", description: `No WebTorrent link found for ${movie.title}.`, variant: "destructive" });
      return;
    }
    setIsWebTorrentLoading(true);
    console.log(`[MovieDownloadCard] Adding WebTorrent for ${movie.title}, Magnet: ${movie.magnetLink ? movie.magnetLink.substring(0,50) + '...' : 'N/A'}`);
    
    try {
      const torrent = await addTorrent(movie.magnetLink, movie.title, movie.id);
      if (torrent) {
        toast({ title: "Download Queued (WebTorrent)", description: `${movie.title} is being added to your active downloads.` });
      } else {
        toast({ title: "WebTorrent Issue", description: `${movie.title} might already be in downloads or failed to add. Check for existing torrents or try again.`, variant: "default" });
      }
    } catch (error) {
        console.error("[MovieDownloadCard] Error adding WebTorrent:", error);
        toast({ title: "WebTorrent Error", description: `Could not start WebTorrent download: ${error instanceof Error ? error.message : "Unknown error"}`, variant: "destructive" });
    } finally {
        setIsWebTorrentLoading(false);
    }
  };

  return (
    <Card className="overflow-hidden shadow-xl sticky top-24">
      <div className="aspect-[2/3] relative w-full bg-muted">
        <Image
          src={getFullImagePath(movie.poster_path, "w500")}
          alt={`${movie.title} poster`}
          fill
          className="object-cover"
          data-ai-hint="movie poster"
          sizes="(max-width: 767px) 100vw, (max-width: 1023px) 33vw, 25vw"
          priority
        />
      </div>
      <CardContent className="p-4 space-y-3">
        <div className="space-y-2">
          <h3 className="text-base font-semibold mb-1">Download Options</h3>
          <p className="text-xs text-muted-foreground">
            {movie.magnetLink ? `WebTorrent available (Quality: ${movie.torrentQuality || 'Unknown'})` : 'WebTorrent link not found.'}
          </p>
          <Button 
            size="lg" 
            className="w-full h-11 text-sm" 
            onClick={handleWebTorrentDownload} 
            disabled={isWebTorrentLoading || !movie.magnetLink || !isClientReady}
          >
            {isWebTorrentLoading ? <Loader2Icon className="animate-spin h-5 w-5" /> : <DownloadIcon className="h-5 w-5" />}
            <span className="ml-2">{isClientReady ? 'Download' : 'WebTorrent Loading...'}</span>
          </Button>
        </div>

        {movie.homepage && (
          <Button variant="outline" className="w-full h-10 text-sm mt-2" asChild>
            <Link href={movie.homepage} target="_blank" rel="noopener noreferrer">
              <ExternalLinkIcon className="h-4 w-4 mr-2" /> Visit Homepage
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

