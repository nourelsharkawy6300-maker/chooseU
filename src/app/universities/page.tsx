"use client";

import React from "react";
import { DirectoryView } from "@/components/PlatformPages";
import { useStudent } from "@/context/StudentContext";
import { useRouter } from "next/navigation";
import { Faculty } from "@/types/chooseu";

export default function UniversitiesPage() {
  const router = useRouter();
  const { comparedIds, toggleComparedId } = useStudent();

  return (
    <div className="w-full">
      <DirectoryView
        comparedIds={comparedIds}
        onToggleCompare={toggleComparedId}
        onSelectFutureCareer={(faculty: Faculty) => {
          router.push(`/future-me?faculty=${encodeURIComponent(faculty.id)}`);
        }}
        onOpenCompareTab={() => {
          router.push("/tco-matrix");
        }}
      />
    </div>
  );
}
