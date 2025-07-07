// src/components/features/streaming/VideoPlayer.tsx
"use client";

import React, { useEffect, useRef } from 'react';

interface VideoPlayerProps {
  src: string;
  title: string;
}

export function VideoPlayer({ src, title }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.src = src;
    }
  }, [src]);

  return (
    <div className="w-full h-full bg-black">
      <video ref={videoRef} controls autoPlay className="w-full h-full" title={title}>
        Your browser does not support the video tag.
      </video>
    </div>
  );
}