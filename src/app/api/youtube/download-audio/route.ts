// src/app/api/youtube/download-audio/route.ts
import { NextRequest, NextResponse } from 'next/server';
import ytdl from 'ytdl-core';

export async function POST(request: NextRequest) {
  const { url } = await request.json();

  if (!url || !ytdl.validateURL(url)) {
    return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 });
  }

  try {
    const info = await ytdl.getInfo(url);
    const format = ytdl.chooseFormat(info.formats, { quality: 'highestaudio' });

    const headers = new Headers();
    headers.set('Content-Disposition', `attachment; filename="${info.videoDetails.title}.mp3"`);
    headers.set('Content-Type', 'audio/mpeg');

    const stream = ytdl(url, { format });

    return new NextResponse(stream as any, { headers });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to download audio' }, { status: 500 });
  }
}