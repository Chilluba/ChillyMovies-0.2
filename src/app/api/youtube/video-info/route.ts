// src/app/api/youtube/video-info/route.ts
import { NextRequest, NextResponse } from 'next/server';
import ytdl from 'ytdl-core';

export async function POST(request: NextRequest) {
  const { url } = await request.json();

  if (!url || !ytdl.validateURL(url)) {
    return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 });
  }

  try {
    const info = await ytdl.getInfo(url);
    return NextResponse.json({
      title: info.videoDetails.title,
      thumbnail: info.videoDetails.thumbnails[0].url,
      formats: info.formats,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to get video info' }, { status: 500 });
  }
}