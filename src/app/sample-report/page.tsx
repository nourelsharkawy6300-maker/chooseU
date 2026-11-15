"use client";

import React, { useState, useMemo } from "react";
import { SampleReportView, CheckoutModal } from "@/components/PlatformPages";
import { useStudent } from "@/context/StudentContext";
import { evaluateAndRankFaculties } from "@/lib/engine";
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
  } = useStudent();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [whatsappPhone, setWhatsappPhone] = useState("");

  const evaluation = useMemo(() => {
    return evaluateAndRankFaculties({
      stream,
      score: scorePercentage,
      budget: annualBudgetEgp,
      gov: governorate,
      tansikShift: 0,
      sectorFilter: "all",
      trackCounts: {},
    });
  }, [stream, scorePercentage, annualBudgetEgp, governorate]);

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
        topTrack="AI"
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
        topTrack="AI"
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
