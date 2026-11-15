"use client";

import React, { useState, useMemo } from "react";
import { FutureMeView, CheckoutModal } from "@/components/PlatformPages";
import { useStudent } from "@/context/StudentContext";
import { evaluateAndRankFaculties } from "@/lib/engine";
import { FACULTIES_DATABASE } from "@/data/faculties-db";
import { Faculty, PlatformView } from "@/types/chooseu";
import { useRouter } from "next/navigation";

export default function FutureMePage() {
  const router = useRouter();
  const {
    studentName,
    setStudentName,
    stream,
    scorePercentage,
    annualBudgetEgp,
    governorate,
  } = useStudent();
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(() => FACULTIES_DATABASE[0] || null);
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
      <FutureMeView
        selectedFaculty={selectedFaculty}
        setSelectedFaculty={setSelectedFaculty}
        evaluation={evaluation}
        setActiveView={(v: PlatformView) => {
          if (v === "landing") router.push("/");
          else if (v === "workspace") router.push("/workspace");
          else if (v === "directory") router.push("/universities");
          else if (v === "sample_report") router.push("/sample-report");
          else if (v === "track_order") router.push("/track-order");
        }}
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
