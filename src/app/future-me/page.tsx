"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import { FutureMeView, CheckoutModal } from "@/components/PlatformPages";
import { useStudent } from "@/context/StudentContext";
import { evaluateAndRankFaculties, computeDominantTrackFromAnswers } from "@/lib/engine";
import { FACULTIES_DATABASE } from "@/data/faculties-db";
import { Faculty, PlatformView } from "@/types/chooseu";
import { useRouter, useSearchParams } from "next/navigation";

function FutureMeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const facultyParam = searchParams.get("faculty");

  const {
    studentName,
    setStudentName,
    stream,
    scorePercentage,
    annualBudgetEgp,
    governorate,
    assessmentAnswers,
  } = useStudent();

  const { topTrack, trackCounts } = useMemo(
    () => computeDominantTrackFromAnswers(assessmentAnswers),
    [assessmentAnswers]
  );

  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(() => {
    if (facultyParam) {
      const match = FACULTIES_DATABASE.find((f) => f.id === facultyParam);
      if (match) return match;
    }
    return FACULTIES_DATABASE[0] || null;
  });

  useEffect(() => {
    if (facultyParam) {
      const match = FACULTIES_DATABASE.find((f) => f.id === facultyParam);
      if (match) {
        setTimeout(() => {
          setSelectedFaculty(match);
        }, 0);
      }
    }
  }, [facultyParam]);

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
      trackCounts,
    });
  }, [stream, scorePercentage, annualBudgetEgp, governorate, trackCounts]);

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

export default function FutureMePage() {
  return (
    <Suspense fallback={<div className="w-full p-12 text-center text-slate-500 font-medium">جاري تحميل المسار الوظيفي...</div>}>
      <FutureMeContent />
    </Suspense>
  );
}
