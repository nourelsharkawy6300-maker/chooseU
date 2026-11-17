"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { TrackOrderView } from "@/components/PlatformPages";
import { ConsultationOrderRow } from "@/types/chooseu";

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const queryParam = searchParams
    ? searchParams.get("q") || searchParams.get("code") || ""
    : "";

  const initialOrder: ConsultationOrderRow | null = queryParam
    ? ({ order_code: queryParam } as ConsultationOrderRow)
    : null;

  return (
    <div className="w-full">
      <TrackOrderView initialOrder={initialOrder} />
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full p-12 text-center text-slate-500 font-medium">
          جاري تحميل بيانات الطلب...
        </div>
      }
    >
      <TrackOrderContent />
    </Suspense>
  );
}
