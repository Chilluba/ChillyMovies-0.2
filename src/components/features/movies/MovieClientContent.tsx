// src/components/features/movies/MovieClientContent.tsx
"use client";

import type { TMDBMovie } from "@/types/tmdb";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { PlayCircleIcon, PlayIcon, Loader2Icon } from "lucide-react";
import { getFullImagePath } from "@/lib/tmdb";
import { useState } from "react";
import { VideoPlayer } from "@/components/features/streaming/VideoPlayer";
import { useToast } from "@/hooks/use-toast";
import { useWebTorrent } from "@/contexts/WebTorrentContext";

interface MovieClientContentProps {
  movie: TMDBMovie & { magnetLink?: string };
  trailerKey: string | null;
  children: React.ReactNode;
  dictionary: any; 
  locale: string; 
}

export function MovieClientContent({ movie, trailerKey, children, dictionary, locale }: MovieClientContentProps) {
  const { toast } = useToast();
  const { addTorrent, getLargestFileForStreaming } = useWebTorrent();
  const [isTrailerModalOpen, setIsTrailerModalOpen] = useState(false);
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [streamTitle, setStreamTitle] = useState<string>("");
  const [isPlayLoading, setIsPlayLoading] = useState(false);

  const handleWatchTrailer = () => {
    if (trailerKey) {
      setIsTrailerModalOpen(true);
    } else {
        toast({
            title: dictionary?.noTrailerToastTitle || "Trailer Unavailable",
            description: dictionary?.noTrailerToastDesc || "No trailer found for this movie.",
            variant: "default"
        })
    }
  };

  const handlePlayMovie = async () => {
    setIsPlayLoading(true);
    setStreamTitle(movie.title);

    if (!movie.magnetLink) {
      toast({ title: "Playback Not Available", description: "No streaming link found for this movie.", variant: "destructive" });
      setIsPlayLoading(false);
      return;
    }

    try {
      await addTorrent(movie.magnetLink, movie.title, movie.id);
      const streamData = await getLargestFileForStreaming(movie.magnetLink);
      if (streamData) {
        setStreamUrl(streamData.streamUrl);
        setIsPlayerModalOpen(true);
      } else {
        toast({ title: "Playback Error", description: "Could not get streaming information.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Playback Error", description: "Could not start streaming.", variant: "destructive" });
    } finally {
      setIsPlayLoading(false);
    }
  };


  return (
    <>
      <div className="relative h-[60vh] min-h-[300px] md:min-h-[400px] lg:min-h-[500px] rounded-xl overflow-hidden shadow-2xl group mb-8">
        <Image
          src={getFullImagePath(movie.backdrop_path, "original")}
          alt={`${movie.title} ${dictionary?.backdropAltText || 'backdrop'}`}
          fill
          className="object-cover object-top transition-transform duration-500 ease-in-out group-hover:scale-105"
          priority
          data-ai-hint="movie backdrop"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
        <div className="absolute bottom-0 left-0 p-6 md:p-10 z-10">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight shadow-black [text-shadow:_0_2px_4px_var(--tw-shadow-color)]">
            {movie.title}
          </h1>
          {movie.tagline && (
            <p className="text-lg md:text-xl text-muted-foreground italic mt-1 shadow-black [text-shadow:_0_1px_2px_var(--tw-shadow-color)]">
              {movie.tagline}
            </p>
          )}
          <div className="mt-4 flex flex-wrap gap-3 animate-fade-in-up animation-delay-200">
            <Button
              size="lg"
              className="h-12 px-6 sm:h-14 sm:px-8 text-base sm:text-lg group/button"
              onClick={handlePlayMovie}
              disabled={isPlayLoading || !movie.magnetLink} 
            >
              {isPlayLoading ? <Loader2Icon className="animate-spin h-5 w-5" /> : <PlayIcon className="h-5 w-5" />}
              <span className="ml-2">{dictionary?.playMovieButton || "Play Movie"}</span>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-12 px-6 sm:h-14 sm:px-8 text-base sm:text-lg group/button"
              onClick={handleWatchTrailer}
              disabled={!trailerKey}
            >
              <PlayCircleIcon className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6 transition-transform duration-300 group-hover/button:scale-110" />
              {dictionary?.watchTrailerButton || "Watch Trailer"}
            </Button>
          </div>
        </div>
      </div>

      {children}

      <Dialog open={isTrailerModalOpen} onOpenChange={setIsTrailerModalOpen}>
        <DialogContent className="sm:max-w-[90vw] md:max-w-[80vw] lg:max-w-[70vw] xl:max-w-[60vw] p-0 border-0 bg-black/90 backdrop-blur-md aspect-video rounded-lg overflow-hidden">
           <DialogTitle className="sr-only">{dictionary?.trailerModalTitle || "Movie Trailer"}</DialogTitle>
          {trailerKey && (
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0&modestbranding=1&showinfo=0`}
              title={dictionary?.trailerModalTitle || "Movie Trailer"}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            ></iframe>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isPlayerModalOpen} onOpenChange={setIsPlayerModalOpen}>
        <DialogContent className="sm:max-w-[90vw] md:max-w-[85vw] lg:max-w-[80vw] xl:max-w-[75vw] p-0 border-0 bg-black/95 backdrop-blur-md aspect-video rounded-lg overflow-hidden">
          <DialogTitle className="sr-only">{streamTitle || (dictionary?.streamingVideoTitle || "Streaming Video")}</DialogTitle>
          {streamUrl && <VideoPlayer src={streamUrl} title={streamTitle || movie.title} />}
        </DialogContent>
      </Dialog>

      <style jsx global>{`
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
          opacity: 0; 
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animation-delay-200 { animation-delay: 0.2s; }
      `}</style>
    </>
  );
}
