import { NextResponse } from 'next/server';

interface CustomParent {
  name: string;
  children: { name: string; type: string; query: string }[];
}

export const runtime = 'edge';

const RUNTIME_CONFIG: { CUSTOM_PARENT_CATEGORY?: CustomParent[] } = (globalThis as any).RUNTIME_CONFIG ?? {};

export async function GET(req: Request) {
  const url = new URL(req.url);
  const parentName = url.searchParams.get('parent');
  if (!parentName) return NextResponse.json({ videos: [] });

  const parent = RUNTIME_CONFIG.CUSTOM_PARENT_CATEGORY?.find(p => p.name === parentName);
  if (!parent) return NextResponse.json({ videos: [] });

  const videos: any[] = [];

  for (const child of parent.children) {
    try {
      // 假设子分类的 query 可以直接用于资源站 API
      const apiUrl = `https://example.com/api?type=${child.type}&query=${encodeURIComponent(child.query)}`;
      const res = await fetch(apiUrl);
      const data = await res.json();
      if (Array.isArray(data.videos)) videos.push(...data.videos);
    } catch (err) {
      console.error(err);
    }
  }

  return NextResponse.json({ videos });
}
