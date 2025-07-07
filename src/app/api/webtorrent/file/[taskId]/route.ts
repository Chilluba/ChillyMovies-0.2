// src/app/api/webtorrent/file/[taskId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import webTorrentManager from '@/server/webtorrentManager';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest, { params }: { params: { taskId: string } }) {
  const { taskId } = params;
  const torrent = webTorrentManager.getTorrent(taskId);

  if (!torrent || !torrent.done) {
    return NextResponse.json({ error: 'Torrent not found or not finished' }, { status: 404 });
  }

  const file = torrent.files[0]; // Assuming the largest file is the one we want
  if (!file) {
    return NextResponse.json({ error: 'File not found in torrent' }, { status: 404 });
  }

  const filePath = path.join(torrent.path, file.path);
  const stat = fs.statSync(filePath);

  const headers = new Headers();
  headers.set('Content-Disposition', `attachment; filename="${file.name}"`);
  headers.set('Content-Length', stat.size.toString());
  headers.set('Content-Type', 'application/octet-stream');


  const stream = fs.createReadStream(filePath);

  return new NextResponse(stream as any, { headers });
}