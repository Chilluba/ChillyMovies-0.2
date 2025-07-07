// src/app/api/torrents/tv/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Parser from 'rss-parser';

const parser = new Parser();
const EZTV_RSS_URL = 'https://eztv.re/ezrss.xml';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title');
  const season = searchParams.get('season');
  const episode = searchParams.get('episode');

  if (!title || !season || !episode) {
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
  }

  try {
    const feed = await parser.parseURL(EZTV_RSS_URL);
    const seasonNum = parseInt(season, 10);
    const episodeNum = parseInt(episode, 10);

    const episodeRegex = new RegExp(
      `${title.replace(/ /g, '.')}.*S${String(seasonNum).padStart(2, '0')}E${String(episodeNum).padStart(2, '0')}`,
      'i'
    );

    const entry = feed.items.find(item => episodeRegex.test(item.title || ''));

    if (entry && entry.enclosure && entry.enclosure.url) {
      return NextResponse.json({ magnet: entry.enclosure.url });
    } else {
      return NextResponse.json({ error: 'Magnet link not found' }, { status: 404 });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch or parse RSS feed' }, { status: 500 });
  }
}