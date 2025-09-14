import { NextResponse } from 'next/server';

interface Video {
  id: string;
  title: string;
  thumb: string;
  link: string;
}

// 模拟资源站数据
const MOCK_DATA: Record<string, Video[]> = {
  动作: [
    { id: '1', title: '动作片A', thumb: '/thumb1.jpg', link: '/video/1' },
    { id: '2', title: '动作片B', thumb: '/thumb2.jpg', link: '/video/2' },
  ],
  喜剧: [
    { id: '3', title: '喜剧片A', thumb: '/thumb3.jpg', link: '/video/3' },
    { id: '4', title: '喜剧片B', thumb: '/thumb4.jpg', link: '/video/4' },
  ],
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parent = url.searchParams.get('parent') || '';
  const videos = MOCK_DATA[parent] || [];

  return NextResponse.json({ videos });
}
