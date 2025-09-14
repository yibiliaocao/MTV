'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import PageLayout from '../../components/PageLayout';
import Sidebar, { CustomParent } from '../../components/Sidebar';

interface VideoItem {
  id: string;
  title: string;
  url: string;
}

// 自定义父子分类
const CUSTOM_CONFIG: CustomParent[] = [
  {
    name: '父分类1',
    children: [
      { name: '子分类A', type: 'A' },
      { name: '子分类B', type: 'B' },
    ],
  },
  {
    name: '父分类2',
    children: [{ name: '子分类C', type: 'C' }],
  },
];

export default function CustomPage() {
  const searchParams = useSearchParams();
  const parent = searchParams.get('parent') || '';
  const child = searchParams.get('child') || '';

  const [videos, setVideos] = useState<VideoItem[]>([]);

  useEffect(() => {
    if (parent && child) {
      fetch(`/api/custom-videos?parent=${encodeURIComponent(parent)}&child=${encodeURIComponent(child)}`)
        .then(res => res.json())
        .then(data => setVideos(data.videos || []));
    }
  }, [parent, child]);

  const activePath = `/custom?parent=${parent}&child=${child}`;

  return (
    <PageLayout activePath={activePath}>
      <div className="flex">
        <Sidebar config={CUSTOM_CONFIG} activeParent={parent} activeChild={child} />
        <main className="flex-1 p-4 md:ml-64">
          <h1 className="text-xl font-bold mb-4">{child ? `分类: ${child}` : '请选择分类'}</h1>
          {parent && child ? (
            videos.length > 0 ? (
              <ul className="space-y-2">
                {videos.map(v => (
                  <li key={v.id}>
                    <a href={v.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                      {v.title}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <div>暂无视频</div>
            )
          ) : (
            <div>请选择左侧分类</div>
          )}
        </main>
      </div>
    </PageLayout>
  );
}
