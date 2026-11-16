"use client";

import React, { useState, useMemo } from "react";
import { SampleReportView, CheckoutModal } from "@/components/PlatformPages";
import { useStudent } from "@/context/StudentContext";
import { evaluateAndRankFaculties, computeDominantTrackFromAnswers } from "@/lib/engine";
import { useRouter } from "next/navigation";

export default function SampleReportPage() {
  const router = useRouter();
  const {
    studentName,
    setStudentName,
    stream,
    scorePercentage,
    annualBudgetEgp,
    governorate,
    livingMode,
    inflationScenario,
    assessmentAnswers,
  } = useStudent();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [whatsappPhone, setWhatsappPhone] = useState("");

  const { topTrack, trackCounts } = useMemo(
    () => computeDominantTrackFromAnswers(assessmentAnswers),
    [assessmentAnswers]
  );

  const evaluation = useMemo(() => {
    return evaluateAndRankFaculties({
      stream,
      score: scorePercentage,
      budget: annualBudgetEgp,
      gov: governorate,
      tansikShift: 0,
      sectorFilter: "all",
      trackCounts,
    });
  }, [stream, scorePercentage, annualBudgetEgp, governorate, trackCounts]);

  return (
    <div className="w-full">
      <SampleReportView
        studentName={studentName}
        stream={stream}
        score={scorePercentage}
        budget={annualBudgetEgp}
        gov={governorate}
        livingMode={livingMode}
        inflationScenario={inflationScenario}
        topTrack={topTrack}
        evaluation={evaluation}
        onOpenCheckout={() => setIsCheckoutOpen(true)}
      />
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        studentName={studentName}
        setStudentName={setStudentName}
        whatsappPhone={whatsappPhone}
        setWhatsappPhone={setWhatsappPhone}
        stream={stream}
        score={scorePercentage}
        budget={annualBudgetEgp}
        gov={governorate}
        topTrack={topTrack || "AI"}
        evaluation={evaluation}
        onOrderCreated={() => {}}
        onNavigateToTrackOrder={() => {
          setIsCheckoutOpen(false);
          router.push("/track-order");
        }}
      />
    </div>
  );
}
