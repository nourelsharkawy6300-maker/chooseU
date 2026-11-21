"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useStudent } from "@/context/StudentContext";
import { FACULTIES_DATABASE } from "@/data/faculties-db";
import { SCHOLARSHIPS_DATABASE } from "@/data/scholarships-db";
import {
  ApplicationStatus,
  DEFAULT_MVP_STATE,
  ExtendedStudentProfile,
  MvpUserState,
  ShortlistItem,
  loadMvpState,
  saveMvpState,
} from "@/lib/mvp-storage";
import {
  Award,
  Building2,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  FileCheck,
  Plus,
  Save,
  Trash2,
  UserCog,
} from "lucide-react";

const REQUIRED_DOCS = [
  { id: "doc-thanawiya", title: "أصل استمارة النجاح في الثانوية العامة + 3 صور" },
  { id: "doc-birth", title: "شهادة الميلاد المميكنة (الكمبيوتر الحديثة)" },
  { id: "doc-id", title: "صورة بطاقة الرقم القومي للطالب وولي الأمر" },
  { id: "doc-photos", title: "6 صور شخصية حديثة (4×6 خلفية بيضاء)" },
  { id: "doc-military", title: "نموذج 2 جند + 6 جند (للطلاب الذكور)" },
  { id: "doc-income", title: "مفردات مرتب / إثبات دخل أسري (مطلوب للمنح)" },
  { id: "doc-lang", title: "شهادة لغة (IELTS/TOEFL) أو إيصال اختبار القدرات" },
  { id: "doc-sop", title: "خطاب الدافع (Motivation Letter) للمنح والجامعات الدولية" },
];

const STATUS_META: Record<ApplicationStatus, { label: string; cls: string }> = {
  not_started: {
    label: "لم يبدأ بعد",
    cls: "bg-slate-100 text-slate-700 border-slate-200",
  },
  preparing_docs: {
    label: "جاري تجهيز الأوراق",
    cls: "bg-amber-50 text-amber-800 border-amber-200",
  },
  applied: {
    label: "تم التقديم",
    cls: "bg-blue-50 text-blue-700 border-blue-200",
  },
  accepted: {
    label: "تم القبول / الترشيح",
    cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
};

export default function ActionPlanPage() {
  const { authUser, stream } = useStudent();
  const [mvpState, setMvpState] = useState<MvpUserState>(DEFAULT_MVP_STATE);
  const [selectedFacultyId, setSelectedFacultyId] = useState(
    FACULTIES_DATABASE[0]?.id || ""
  );
  const [selectedScholarshipId, setSelectedScholarshipId] = useState(
    SCHOLARSHIPS_DATABASE[0]?.id || ""
  );
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

  const persist = async (next: MvpUserState, msg?: string) => {
    setMvpState(next);
    setSaving(true);
    await saveMvpState(authUser?.id ?? null, next);
    setSaving(false);
    if (msg) {
      setNotice(msg);
      setTimeout(() => setNotice(""), 3500);
    }
  };

  const streamFaculties = useMemo(
    () =>
      FACULTIES_DATABASE.filter(
        (f) => f.stream === "Both" || f.stream === stream || stream === "stem"
      ),
    [stream]
  );

  const addFacultyToShortlist = () => {
    const fac = FACULTIES_DATABASE.find((f) => f.id === selectedFacultyId);
    if (!fac) return;
    if (mvpState.shortlist.some((i) => i.id === `fac:${fac.id}`)) return;
    const item: ShortlistItem = {
      id: `fac:${fac.id}`,
      kind: "faculty",
      title: fac.name,
      subtitle: `${fac.university} — ${fac.type}`,
      deadline:
        fac.type === "جامعات دولية مختارة"
          ? "مايو – يوليو 2026"
          : "أغسطس – سبتمبر 2026 (التنسيق)",
      status: "not_started",
      addedAt: new Date().toISOString(),
    };
    void persist(
      { ...mvpState, shortlist: [item, ...mvpState.shortlist] },
      "تمت إضافة الكلية إلى قائمتك المختصرة."
    );
  };

  const addScholarshipToShortlist = () => {
    const sch = SCHOLARSHIPS_DATABASE.find((s) => s.id === selectedScholarshipId);
    if (!sch) return;
    if (mvpState.shortlist.some((i) => i.id === `sch:${sch.id}`)) return;
    const item: ShortlistItem = {
      id: `sch:${sch.id}`,
      kind: "scholarship",
      title: sch.name,
      subtitle: `${sch.provider} — ${sch.fundingCoverageLabel}`,
      deadline: sch.deadline,
      status: "not_started",
      addedAt: new Date().toISOString(),
    };
    void persist(
      { ...mvpState, shortlist: [item, ...mvpState.shortlist] },
      "تمت إضافة المنحة إلى قائمتك المختصرة."
    );
  };

  const updateItemStatus = (id: string, status: ApplicationStatus) => {
    const nextList = mvpState.shortlist.map((it) =>
      it.id === id ? { ...it, status } : it
    );
    void persist({ ...mvpState, shortlist: nextList });
  };

  const removeItem = (id: string) => {
    void persist({
      ...mvpState,
      shortlist: mvpState.shortlist.filter((it) => it.id !== id),
    });
  };

  const toggleDoc = (docId: string) => {
    const exists = mvpState.completedDocIds.includes(docId);
    const nextDocs = exists
      ? mvpState.completedDocIds.filter((d) => d !== docId)
      : [...mvpState.completedDocIds, docId];
    void persist({ ...mvpState, completedDocIds: nextDocs });
  };

  const updateExt = <K extends keyof ExtendedStudentProfile>(
    key: K,
    val: ExtendedStudentProfile[K]
  ) => {
    setMvpState((prev) => ({
      ...prev,
      extendedProfile: { ...prev.extendedProfile, [key]: val },
    }));
  };

  const docsPct = Math.round(
    (mvpState.completedDocIds.length / REQUIRED_DOCS.length) * 100
  );

  return (
    <div className="px-4 lg:px-8 py-8 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#377ef0] bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full">
              <ClipboardCheck className="w-3.5 h-3.5" />
              <span>Take Action & Track Your Journey</span>
            </div>
            <h1 className="text-[22px] font-extrabold text-slate-900">
              خطة التنفيذ ومتابعة التقديم والمستندات
            </h1>
            <p className="text-[13px] text-slate-600 max-w-2xl">
              حوّل نتائجك إلى خطوات فعلية: أضف الجامعات والمنح لقائمتك المختصرة (Shortlist)، راجع المستندات المطلوبة، وتابع المواعيد وحالة كل تقديم في مكان واحد.
            </p>
          </div>
          <Link
            href="/decision-report"
            className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-[12px] font-semibold inline-flex items-center gap-2 transition"
          >
            <FileCheck className="w-4 h-4" />
            <span>فتح تقرير القرار الشامل (PDF)</span>
          </Link>
        </div>

        {notice && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2.5 rounded-xl text-[12px] font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{notice}</span>
          </div>
        )}
      </div>

      {/* 1. Shortlist Builder & Application Tracker */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[16px] font-bold text-slate-900 flex items-center gap-2">
            <CalendarClock className="w-4 h-4 text-[#377ef0]" />
            <span>1. قائمتك المختصرة ومتابعة مواعيد وحالة التقديم ({mvpState.shortlist.length})</span>
          </h2>
        </div>

        {/* Add controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[12px]">
          <div className="flex gap-2">
            <select
              value={selectedFacultyId}
              onChange={(e) => setSelectedFacultyId(e.target.value)}
              className="flex-1 border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:border-[#377ef0]"
            >
              {streamFaculties.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} — {f.university}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={addFacultyToShortlist}
              className="bg-[#377ef0] hover:bg-[#2962be] text-white px-3.5 py-2 rounded-xl font-bold inline-flex items-center gap-1 shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة كلية</span>
            </button>
          </div>

          <div className="flex gap-2">
            <select
              value={selectedScholarshipId}
              onChange={(e) => setSelectedScholarshipId(e.target.value)}
              className="flex-1 border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:border-[#377ef0]"
            >
              {SCHOLARSHIPS_DATABASE.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.country})
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={addScholarshipToShortlist}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl font-bold inline-flex items-center gap-1 shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة منحة</span>
            </button>
          </div>
        </div>

        {mvpState.shortlist.length === 0 ? (
          <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-6 text-center text-[12px] text-slate-500">
            قائمتك المختصرة فارغة حالياً — اختر الكليات والمنح التي تنوي التقديم عليها من الأعلى لمتابعة مواعيدها وحالتها.
          </div>
        ) : (
          <div className="space-y-2.5">
            {mvpState.shortlist.map((item) => (
              <div
                key={item.id}
                className="border border-slate-200 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 bg-slate-50/40"
              >
                <div className="space-y-0.5 min-w-[220px] flex-1">
                  <div className="flex items-center gap-1.5">
                    {item.kind === "faculty" ? (
                      <Building2 className="w-3.5 h-3.5 text-[#377ef0]" />
                    ) : (
                      <Award className="w-3.5 h-3.5 text-emerald-600" />
                    )}
                    <span className="font-bold text-[13px] text-slate-900">
                      {item.title}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">{item.subtitle}</div>
                  <div className="text-[11px] text-amber-700 font-semibold">
                    الموعد المستهدف: {item.deadline}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={item.status}
                    onChange={(e) =>
                      updateItemStatus(item.id, e.target.value as ApplicationStatus)
                    }
                    className={`border rounded-lg px-2.5 py-1.5 text-[11px] font-bold cursor-pointer ${
                      STATUS_META[item.status].cls
                    }`}
                  >
                    <option value="not_started">لم يبدأ بعد</option>
                    <option value="preparing_docs">جاري تجهيز الأوراق</option>
                    <option value="applied">تم التقديم</option>
                    <option value="accepted">تم القبول / الترشيح</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 cursor-pointer"
                    title="حذف من القائمة"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Documents Checklist & Extended Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Required Documents Checklist */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-bold text-slate-900 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-600" />
              <span>2. قائمة المستندات المطلوبة للتقديم</span>
            </h2>
            <span className="text-[12px] font-extrabold text-emerald-700 tabular-nums">
              {docsPct}% جاهز
            </span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all"
              style={{ width: `${docsPct}%` }}
            />
          </div>
          <div className="space-y-2">
            {REQUIRED_DOCS.map((doc) => {
              const checked = mvpState.completedDocIds.includes(doc.id);
              return (
                <label
                  key={doc.id}
                  className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-[12px] cursor-pointer transition ${
                    checked
                      ? "bg-emerald-50/60 border-emerald-200 text-emerald-900"
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleDoc(doc.id)}
                    className="mt-0.5 rounded border-slate-300 text-emerald-600"
                  />
                  <span className={checked ? "line-through opacity-80" : ""}>
                    {doc.title}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Extended Student Profile (Stage 1 & 2 completeness) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
          <h2 className="text-[15px] font-bold text-slate-900 flex items-center gap-2">
            <UserCog className="w-4 h-4 text-[#377ef0]" />
            <span>3. استكمال ملف الطالب (النظام التعليمي، المدرسة، أسلوب التعلم والأهداف)</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[12px]">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">الدولة</label>
              <input
                type="text"
                value={mvpState.extendedProfile.country}
                onChange={(e) => updateExt("country", e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">العمر</label>
              <input
                type="number"
                min={14}
                max={30}
                value={mvpState.extendedProfile.age ?? ""}
                onChange={(e) =>
                  updateExt("age", e.target.value ? Number(e.target.value) : null)
                }
                className="w-full border border-slate-200 rounded-xl px-3 py-2 tabular-nums"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">النظام التعليمي</label>
              <select
                value={mvpState.extendedProfile.educationalSystem}
                onChange={(e) =>
                  updateExt(
                    "educationalSystem",
                    e.target.value as ExtendedStudentProfile["educationalSystem"]
                  )
                }
                className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-white"
              >
                <option value="ثانوية عامة مصرية">ثانوية عامة مصرية</option>
                <option value="أزهر">ثانوية أزهرية</option>
                <option value="STEM">مدارس المتفوقين STEM</option>
                <option value="IGCSE">IGCSE / بريطاني</option>
                <option value="American Diploma">American Diploma</option>
                <option value="أخرى">نظام آخر / معادلة</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">الصف الدراسي الحالي</label>
              <select
                value={mvpState.extendedProfile.currentGrade}
                onChange={(e) =>
                  updateExt(
                    "currentGrade",
                    e.target.value as ExtendedStudentProfile["currentGrade"]
                  )
                }
                className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-white"
              >
                <option value="الصف الثالث الثانوي">الصف الثالث الثانوي</option>
                <option value="الصف الثاني الثانوي">الصف الثاني الثانوي</option>
                <option value="خريج / إعادة تنسيق">خريج / إعادة تنسيق</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">نوع المدرسة</label>
              <select
                value={mvpState.extendedProfile.schoolType}
                onChange={(e) =>
                  updateExt(
                    "schoolType",
                    e.target.value as ExtendedStudentProfile["schoolType"]
                  )
                }
                className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-white"
              >
                <option value="حكومي">حكومي</option>
                <option value="تجريبي / رسمي لغات">تجريبي / رسمي لغات</option>
                <option value="خاص عربي">خاص عربي</option>
                <option value="خاص لغات / دولي">خاص لغات / دولي</option>
                <option value="STEM">مدارس STEM</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">أسلوب التعلم والعمل المفضّل</label>
              <select
                value={mvpState.extendedProfile.learningStyle}
                onChange={(e) =>
                  updateExt(
                    "learningStyle",
                    e.target.value as ExtendedStudentProfile["learningStyle"]
                  )
                }
                className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-white"
              >
                <option value="عملي وتطبيقي">عملي وتطبيقي (مشاريع ومعامل)</option>
                <option value="تحليلي وبحثي">تحليلي وبحثي (بيانات وحل مشكلات)</option>
                <option value="تواصلي وقيادي">تواصلي وقيادي (فرق وإدارة)</option>
                <option value="إبداعي وتصميمي">إبداعي وتصميمي (ابتكار وفنون)</option>
              </select>
            </div>
          </div>

          <div className="space-y-2.5 text-[12px]">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                اهتماماتك وهواياتك الأساسية
              </label>
              <input
                type="text"
                value={mvpState.extendedProfile.interestsText}
                onChange={(e) => updateExt("interestsText", e.target.value)}
                placeholder="مثال: الأمن السيبراني، البرمجة، الذكاء الاصطناعي، تصميم المنتجات..."
                className="w-full border border-slate-200 rounded-xl px-3 py-2"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                هدفك الأكاديمي والمهني خلال 5 سنوات
              </label>
              <textarea
                rows={2}
                value={mvpState.extendedProfile.goalsText}
                onChange={(e) => updateExt("goalsText", e.target.value)}
                placeholder="مثال: التخرج بمهارات قوية والعمل في شركة تقنية دولية أو الحصول على منحة..."
                className="w-full border border-slate-200 rounded-xl px-3 py-2"
              />
            </div>
          </div>

          <button
            type="button"
            disabled={saving}
            onClick={() =>
              void persist(
                mvpState,
                "تم حفظ بيانات الملف الموسّع وربطها بتقرير القرار الجامعي."
              )
            }
            className="w-full bg-[#377ef0] hover:bg-[#2962be] text-white py-2.5 rounded-xl text-[13px] font-bold inline-flex items-center justify-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "جاري الحفظ..." : "حفظ بيانات الملف الموسّع"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}