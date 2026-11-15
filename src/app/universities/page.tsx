"use client";

import React, { useState } from "react";
import { DirectoryView } from "@/components/PlatformPages";
import { useRouter } from "next/navigation";

export default function UniversitiesPage() {
  const router = useRouter();
  const [comparedIds, setComparedIds] = useState<string[]>([]);

  const handleToggleCompare = (id: string) => {
    setComparedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 4 ? [...prev, id] : prev
    );
  };

  return (
    <div className="w-full">
      <DirectoryView
        comparedIds={comparedIds}
        onToggleCompare={handleToggleCompare}
        onSelectFutureCareer={() => {
          router.push("/future-me");
        }}
        onOpenCompareTab={() => {
          router.push("/tco-matrix");
        }}
      />
    </div>
  );
}
