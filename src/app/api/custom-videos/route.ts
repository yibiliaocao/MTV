import { NextRequest, NextResponse } from 'next/server';

interface VideoItem {
  id: string;
  title: string;
  url: string;
}

const VIDEO_DB: Record<string, Record<string, VideoItem[]>> = {
  '父分类1': {
    'A': [
      { id: '1', title: '视频1', url: 'https://example.com/1' },
      { id: '2', title: '视频2', url: 'https://example.com/2' },
    ],
    'B': [
      { id: '3', title: '视频3', url: 'https://example.com/3' },
    ],
  },
  '父分类2': {
    'C': [
      { id: '4', title: '视频4', url: 'https://example.com/4' },
    ],
  },
};

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const parent = url.searchParams.get('parent') || '';
  const child = url.searchParams.get('child') || '';

  const videos = VIDEO_DB[parent]?.[child] || [];

  return NextResponse.json({ videos });
}
