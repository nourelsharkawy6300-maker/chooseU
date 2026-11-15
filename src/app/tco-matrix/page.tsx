"use client";

import React, { useState, useMemo } from "react";
import { WorkspaceTabs } from "@/components/WorkspaceTabs";
import { CheckoutModal } from "@/components/PlatformPages";
import { useStudent } from "@/context/StudentContext";
import { evaluateAndRankFaculties, computePsychometricAffinities } from "@/lib/engine";
import { StreamType, TrackKey, WorkspaceSubTab } from "@/types/chooseu";
import { useRouter } from "next/navigation";

export default function TcoMatrixPage() {
  const router = useRouter();
  const {
    studentName,
    setStudentName,
    stream,
    setStream,
    scorePercentage,
    setScorePercentage,
    annualBudgetEgp,
    setAnnualBudgetEgp,
    governorate,
    setGovernorate,
    livingMode,
    setLivingMode,
    inflationScenario,
    setInflationScenario,
    comparedIds,
    toggleComparedId,
  } = useStudent();

  const [workspaceTab, setWorkspaceTab] = useState<WorkspaceSubTab>("tco_table");
  const [answersByStream, setAnswersByStream] = useState<Record<StreamType, Record<number, TrackKey>>>({
    Science: {},
    Math: {},
    Arts: {},
    stem: {},
  });
  const [tansikShift, setTansikShift] = useState<number>(0);
  const [sectorFilter, setSectorFilter] = useState<string>("all");
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [whatsappPhone, setWhatsappPhone] = useState("");

  const psych = useMemo(() => {
    return computePsychometricAffinities(stream, answersByStream);
  }, [stream, answersByStream]);

  const evaluation = useMemo(() => {
    return evaluateAndRankFaculties({
      stream,
      score: scorePercentage,
      budget: annualBudgetEgp,
      gov: governorate,
      tansikShift,
      sectorFilter,
      trackCounts: psych.trackCounts,
    });
  }, [stream, scorePercentage, annualBudgetEgp, governorate, tansikShift, sectorFilter, psych.trackCounts]);

  return (
    <div className="w-full">
      <WorkspaceTabs
        studentName={studentName}
        setStudentName={setStudentName}
        stream={stream}
        setStream={setStream}
        score={scorePercentage}
        setScore={setScorePercentage}
        budget={annualBudgetEgp}
        setBudget={setAnnualBudgetEgp}
        gov={governorate}
        setGov={setGovernorate}
        livingMode={livingMode}
        setLivingMode={setLivingMode}
        workspaceTab={workspaceTab}
        setWorkspaceTab={setWorkspaceTab}
        answersByStream={answersByStream}
        setAnswersByStream={setAnswersByStream}
        tansikShift={tansikShift}
        setTansikShift={setTansikShift}
        sectorFilter={sectorFilter}
        setSectorFilter={setSectorFilter}
        inflationScenario={inflationScenario}
        setInflationScenario={setInflationScenario}
        comparedIds={comparedIds}
        onToggleCompare={toggleComparedId}
        evaluation={evaluation}
        sortedAffinities={psych.sortedAffinities}
        topTrack={psych.topTrack}
        isReportUnlocked={true}
        onOpenCheckout={() => setIsCheckoutOpen(true)}
        onSelectFutureCareer={() => router.push("/future-me")}
        onResetParameters={() => {
          setTansikShift(0);
          setSectorFilter("all");
        }}
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
        topTrack={psych.topTrack}
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
