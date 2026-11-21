"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useStudent } from "@/context/StudentContext";
import {
  CONSULTANTS_DATABASE,
  CONSULTANT_CATEGORY_LABELS,
  ConsultantCategory,
  ConsultantProfile,
} from "@/data/consultants-db";
import {
  ConsultationBooking,
  DEFAULT_MVP_STATE,
  MvpUserState,
  loadMvpState,
  saveMvpState,
} from "@/lib/mvp-storage";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Headphones,
  MessageCircle,
  Send,
  Star,
  UserCheck,
  Video,
  X,
} from "lucide-react";

export default function ConsultationsPage() {
  const { authUser, studentName, stream, scorePercentage } = useStudent();
  const [category, setCategory] = useState<ConsultantCategory | "all">("all");
  const [mvpState, setMvpState] = useState<MvpUserState>(DEFAULT_MVP_STATE);
  const [selectedConsultant, setSelectedConsultant] =
    useState<ConsultantProfile | null>(null);
  const [meetingFormat, setMeetingFormat] =
    useState<ConsultationBooking["meetingFormat"]>("جلسة فيديو أونلاين");
  const [preferredSlot, setPreferredSlot] = useState("غداً 7:00 مساءً");
  const [question, setQuestion] = useState("");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function init() {
      const state = await loadMvpState(authUser?.id ?? null);
      if (!cancelled) setMvpState(state);
    }
    void init();
    return () => {
      cancelled = true;
    };
  }, [authUser?.id]);

  const filtered = useMemo(
    () =>
      category === "all"
        ? CONSULTANTS_DATABASE
        : CONSULTANTS_DATABASE.filter((c) => c.category === category),
    [category]
  );

  const openBooking = (c: ConsultantProfile) => {
    setSelectedConsultant(c);
    setMeetingFormat(c.meetingFormats[0] || "جلسة فيديو أونلاين");
    setPreferredSlot(c.nextAvailable);
    setQuestion("");
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConsultant) return;
    setSaving(true);
    const newBooking: ConsultationBooking = {
      id: `bk-${Date.now()}`,
      consultantId: selectedConsultant.id,
      consultantName: selectedConsultant.name,
      consultantRole: selectedConsultant.roleTitle,
      meetingFormat,
      preferredSlot: preferredSlot.trim() || selectedConsultant.nextAvailable,
      studentQuestion: question.trim() || "مناقشة اختيار التخصص والجامعة الأنسب لملفي.",
      status: "requested",
      createdAt: new Date().toISOString(),
    };
    const next: MvpUserState = {
      ...mvpState,
      consultationBookings: [newBooking, ...mvpState.consultationBookings],
    };
    setMvpState(next);
    await saveMvpState(authUser?.id ?? null, next);
    setSaving(false);
    setSelectedConsultant(null);
    setNotice(
      `تم تسجيل طلب حجز الجلسة مع ${newBooking.consultantName} بنجاح وإضافته إلى تقريرك.`
    );
    setTimeout(() => setNotice(""), 5000);
  };

  return (
    <div className="px-4 lg:px-8 py-8 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
              <UserCheck className="w-3.5 h-3.5" />
              <span>Human Consultation — استشارة خبراء حقيقيين</span>
            </div>
            <h1 className="text-[22px] font-extrabold text-slate-900">
              تواصل مع مستشارين وخبراء وطلاب جامعات حقيقيين
            </h1>
            <p className="text-[13px] text-slate-600 max-w-2xl">
              ادمج دقة الذكاء الاصطناعي مع الخبرة البشرية الواقعية: اختر بين مرشدين مهنيين، مستشارين أكاديميين، ممثلي جامعات، خبراء منح، أو طلاب وخريجين عاشوا التجربة الفعلية.
            </p>
          </div>
          <Link
            href="/track-order"
            className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-[12px] font-semibold inline-flex items-center gap-2 transition"
          >
            <Headphones className="w-4 h-4" />
            <span>متابعة التقرير الصوتي المعتمد</span>
          </Link>
        </div>

        {notice && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2.5 rounded-xl text-[12px] font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{notice}</span>
          </div>
        )}
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 bg-white border border-slate-200 rounded-xl p-3.5">
        {(Object.keys(CONSULTANT_CATEGORY_LABELS) as Array<ConsultantCategory | "all">).map(
          (cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition cursor-pointer ${
                category === cat
                  ? "bg-[#FACC15] text-slate-950 shadow-xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {CONSULTANT_CATEGORY_LABELS[cat]}
            </button>
          )
        )}
      </div>

      {/* My Booked Sessions */}
      {mvpState.consultationBookings.length > 0 && (
        <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-[14px] font-bold text-slate-900">
              جلساتك المحجوزة ({mvpState.consultationBookings.length})
            </h2>
            <span className="text-[11px] text-slate-600">تظهر تلقائياً في تقرير القرار الشامل</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {mvpState.consultationBookings.map((bk) => {
              const waMsg = encodeURIComponent(
                `مرحباً ChooseU، قمت بحجز جلسة استشارة مع ${bk.consultantName} (${bk.meetingFormat}) — الموعد المقترح: ${bk.preferredSlot} — الطالب: ${studentName || "طالب ChooseU"} (${stream} - ${scorePercentage}%). سؤالي: ${bk.studentQuestion}`
              );
              return (
                <div
                  key={bk.id}
                  className="bg-white border border-amber-200 rounded-xl p-3.5 text-[12px] space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <strong className="text-slate-900">{bk.consultantName}</strong>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                      بانتظار التأكيد
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {bk.meetingFormat} • الموعد: {bk.preferredSlot}
                  </div>
                  <p className="text-slate-700 bg-slate-50 rounded-lg p-2 text-[11px]">
                    {bk.studentQuestion}
                  </p>
                  <a
                    href={`https://wa.me/201066594552?text=${waMsg}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-emerald-700 hover:text-emerald-800 font-bold text-[11px]"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>تأكيد الموعد فوراً عبر WhatsApp</span>
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Consultants Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((c) => (
          <div
            key={c.id}
            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs flex flex-col justify-between gap-4 hover:border-amber-300 transition"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 mb-1">
                    {CONSULTANT_CATEGORY_LABELS[c.category]}
                  </span>
                  <h2 className="text-[16px] font-bold text-slate-900">{c.name}</h2>
                  <p className="text-[12px] text-slate-600 font-medium">{c.roleTitle}</p>
                  <p className="text-[11px] text-slate-500">{c.affiliation}</p>
                </div>
                <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-xl text-[12px] font-bold text-amber-800 shrink-0 tabular-nums">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                  <span>{c.rating.toFixed(1)}</span>
                </div>
              </div>

              <p className="text-[12px] text-slate-600 leading-relaxed">{c.bio}</p>

              <div className="flex flex-wrap gap-1.5">
                {c.specialties.map((sp, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-medium"
                  >
                    {sp}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600">
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-700" />
                  أقرب موعد: <strong>{c.nextAvailable}</strong>
                </span>
                <span className="inline-flex items-center gap-1">
                  <Video className="w-3.5 h-3.5 text-emerald-600" />
                  {c.meetingFormats.join(" / ")}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="text-[12px] font-bold text-slate-900">{c.feeLabel}</span>
                <button
                  type="button"
                  onClick={() => openBooking(c)}
                  className="bg-[#FACC15] hover:bg-[#EAB308] text-slate-950 px-4 py-2 rounded-xl text-[12px] font-bold inline-flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>احجز جلسة الآن</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Booking Modal */}
      {selectedConsultant && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-[16px] font-bold text-slate-900">
                  حجز جلسة مع {selectedConsultant.name}
                </h3>
                <p className="text-[12px] text-slate-500">
                  {selectedConsultant.roleTitle} • {selectedConsultant.feeLabel}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedConsultant(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmBooking} className="space-y-3.5 text-[12px]">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  طريقة عقد الجلسة
                </label>
                <select
                  value={meetingFormat}
                  onChange={(e) =>
                    setMeetingFormat(
                      e.target.value as ConsultationBooking["meetingFormat"]
                    )
                  }
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:border-amber-500"
                >
                  {selectedConsultant.meetingFormats.map((fmt) => (
                    <option key={fmt} value={fmt}>
                      {fmt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  الموعد المناسب لك
                </label>
                <input
                  type="text"
                  value={preferredSlot}
                  onChange={(e) => setPreferredSlot(e.target.value)}
                  placeholder="مثال: غداً الساعة 8 مساءً"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  ما أهم سؤال أو حيرة تريد مناقشتها في الجلسة؟
                </label>
                <textarea
                  rows={3}
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="مثال: محتار بين حاسبات حكومي وهندسة خاصة، وعايز أعرف الأفضل لسوق العمل وميزانيتي..."
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-[#FACC15] hover:bg-[#EAB308] text-slate-950 py-2.5 rounded-xl text-[13px] font-bold inline-flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{saving ? "جاري الحجز..." : "تأكيد طلب الجلسة وحفظه بحسابي"}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}