'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import PageLayout from '@/components/PageLayout';

function CustomContent() {
  const searchParams = useSearchParams();
  const category = searchParams.get('category');
  const subcategory = searchParams.get('subcategory');

  return (
    <PageLayout activePath="/custom">
      <div className="p-4">
        <h1 className="text-xl font-bold">Custom Videos</h1>
        <p>当前分类: {category || '全部'}</p>
        <p>子分类: {subcategory || '全部'}</p>
      </div>
    </PageLayout>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CustomContent />
    </Suspense>
  );
}
