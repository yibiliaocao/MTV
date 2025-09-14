import { NextResponse } from 'next/server';

interface CustomChild {
  name: string;
  query: string;
  source: string;
}

interface CustomParent {
  name: string;
  children: CustomChild[];
}

interface RuntimeConfig {
  CUSTOM_PARENT_CATEGORY?: CustomParent[];
}

export const runtime = 'edge';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const parentName = url.searchParams.get('parent') ?? '';
  const runtimeConfig = (globalThis as any).RUNTIME_CONFIG as RuntimeConfig;
  const parents = runtimeConfig?.CUSTOM_PARENT_CATEGORY ?? [];

  const parent = parents.find((p) => p.name === parentName);
  if (!parent) return NextResponse.json({ videos: [] });

  // 遍历子分类，调用指定 source API 获取视频数据（示例使用 fetch）
  const videos: any[] = [];
  for (const child of parent.children) {
    try {
      const res = await fetch(`${child.source}?query=${encodeURIComponent(child.query)}`);
      const data = await res.json();
      if (Array.isArray(data.items)) {
        videos.push(...data.items.map((item: any) => ({
          id: item.id,
          title: item.title,
          cover: item.cover,
          source: child.source,
        })));
      }
    } catch (err) {
      console.error(err);
    }
  }

  return NextResponse.json({ videos });
}
