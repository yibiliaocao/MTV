'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

interface Video {
  id: string;
  title: string;
  cover: string;
  source: string;
}

const CustomPage = () => {
  const searchParams = useSearchParams();
  const parent = searchParams.get('parent') ?? '';
  const [videos, setVideos] = useState<Video[]>([]);

  useEffect(() => {
    if (!parent) return;
    fetch(`/api/custom-videos?parent=${encodeURIComponent(parent)}`)
      .then(res => res.json())
      .then(data => setVideos(data.videos ?? []))
      .catch(console.error);
  }, [parent]);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">{parent}</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {videos.map(video => (
          <div key={video.id} className="rounded overflow-hidden shadow-lg">
            <img src={video.cover} alt={video.title} className="w-full h-40 object-cover" />
            <div className="p-2">
              <h2 className="text-sm font-medium">{video.title}</h2>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomPage;
