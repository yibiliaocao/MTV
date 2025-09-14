"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import PageLayout from "@/components/PageLayout";

// 🔹 内部 Client 子组件，安全使用 useSearchParams
function PageContent() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category") || "";
  const subcategory = searchParams.get("subcategory") || "";

  return (
    <PageLayout sidebar={<Sidebar />}>
      <div className="p-4">
        <h1 className="text-xl font-bold">Custom Videos</h1>
        <p>当前分类: {category || "全部"}</p>
        <p>子分类: {subcategory || "全部"}</p>
      </div>
    </PageLayout>
  );
}

// 🔹 外层用 Suspense 包裹，避免 Vercel 构建报错
export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PageContent />
    </Suspense>
  );
}
