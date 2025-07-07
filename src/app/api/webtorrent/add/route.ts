// src/app/api/webtorrent/add/route.ts
import { NextRequest, NextResponse } from 'next/server';
import webTorrentManager from '@/server/webtorrentManager';

export async function POST(request: NextRequest) {
  const { torrentId } = await request.json();

  if (!torrentId) {
    return NextResponse.json({ error: 'torrentId is required' }, { status: 400 });
  }

  try {
    webTorrentManager.addTorrent(torrentId);
    return NextResponse.json({ message: 'Torrent added' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to add torrent' }, { status: 500 });
  }
}