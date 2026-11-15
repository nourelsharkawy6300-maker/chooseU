"use client";

import React from "react";
import { DirectoryView } from "@/components/PlatformPages";
import { useStudent } from "@/context/StudentContext";
import { useRouter } from "next/navigation";

export default function UniversitiesPage() {
  const router = useRouter();
  const { comparedIds, toggleComparedId } = useStudent();

  return (
    <div className="w-full">
      <DirectoryView
        comparedIds={comparedIds}
        onToggleCompare={toggleComparedId}
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
