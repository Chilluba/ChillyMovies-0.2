// src/app/api/youtube/playlist-info/route.ts
import { NextRequest, NextResponse } from 'next/server';
import ytpl from 'ytpl';

export async function POST(request: NextRequest) {
  const { url } = await request.json();

  if (!url) {
    return NextResponse.json({ error: 'Invalid YouTube Playlist URL' }, { status: 400 });
  }

  try {
    const playlist = await ytpl(url, { limit: Infinity });
    return NextResponse.json({
      title: playlist.title,
      author: playlist.author.name,
      itemCount: playlist.estimatedItemCount,
      items: playlist.items.map(item => ({
        id: item.id,
        title: item.title,
        thumbnail: item.bestThumbnail.url,
        duration: item.duration,
        author: item.author.name,
      })),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to get playlist info' }, { status: 500 });
  }
}
