'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Video {
  id: string;
  title: string;
  thumb: string;
  link: string;
}

export default function CustomPage() {
  const searchParams = useSearchParams();
  const parent = searchParams.get('parent') || '';

  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!parent) return;
    setLoading(true);
    fetch(`/api/custom-videos?parent=${encodeURIComponent(parent)}`)
      .then(res => res.json())
      .then(data => {
        setVideos(data.videos || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [parent]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{parent}</h1>
      {loading && <p>加载中...</p>}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {videos.map(video => (
          <a key={video.id} href={video.link} className="block border rounded overflow-hidden hover:shadow-lg">
            <img src={video.thumb} alt={video.title} className="w-full" />
            <p className="p-2 text-sm">{video.title}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
