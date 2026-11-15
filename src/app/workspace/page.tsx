"use client";

import React from "react";
import { FourStationJourney } from "@/components/FourStationJourney";
import { useStudent } from "@/context/StudentContext";
import { useRouter } from "next/navigation";

export default function WorkspacePage() {
  const router = useRouter();
  const {
    studentName,
    stream,
    scorePercentage,
    annualBudgetEgp,
    governorate,
    livingMode,
  } = useStudent();

  return (
    <div className="w-full">
      <FourStationJourney
        initialStudentName={studentName}
        initialStream={stream}
        initialScore={scorePercentage}
        initialBudget={annualBudgetEgp}
        initialGov={governorate}
        initialLivingMode={livingMode}
        onSelectView={(view: string) => {
          if (view === "tco" || view === "tco_table") router.push("/tco-matrix");
          else if (view === "directory" || view === "universities") router.push("/universities");
          else if (view === "future_me" || view === "future-me") router.push("/future-me");
          else if (view === "sample_report" || view === "sample-report") router.push("/sample-report");
          else if (view === "track_order" || view === "track-order") router.push("/track-order");
        }}
      />
    </div>
  );
}
