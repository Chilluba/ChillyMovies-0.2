// src/app/api/webtorrent/status/[taskId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import webTorrentManager from '@/server/webtorrentManager';

export async function GET(request: NextRequest, { params }: { params: { taskId: string } }) {
  const { taskId } = params;
  const torrent = webTorrentManager.getTorrent(taskId);

  if (!torrent) {
    return NextResponse.json({ error: 'Torrent not found' }, { status: 404 });
  }

  return NextResponse.json({
    progress: torrent.progress,
    downloadSpeed: torrent.downloadSpeed,
    uploadSpeed: torrent.uploadSpeed,
    peers: torrent.numPeers,
    done: torrent.done,
  });
}