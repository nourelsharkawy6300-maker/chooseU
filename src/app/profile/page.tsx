"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  User,
  Save,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";

const TRACK_OPTIONS = [
  { value: "Science", label: "علمي علوم" },
  { value: "Math", label: "علمي رياضة" },
  { value: "Arts", label: "أدبي" },
  { value: "stem", label: "مدارس المتفوقين (STEM)" },
];

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [track, setTrack] = useState("Science");
  const [score, setScore] = useState("");
  const [annualBudget, setAnnualBudget] = useState("");

  const [statusMsg, setStatusMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function loadProfile() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          window.location.assign("/login");
          return;
        }

        if (cancelled) return;
        setUserId(user.id);
        setEmail(user.email || "");

        const { data: row } = await supabase
          .from("profiles")
          .select("full_name, track, score, annual_budget")
          .eq("id", user.id)
          .single();

        if (cancelled) return;
        if (row) {
          setFullName(row.full_name || "");
          if (row.track) setTrack(row.track);
          if (row.score !== null && row.score !== undefined) {
            setScore(String(row.score));
          }
          if (row.annual_budget !== null && row.annual_budget !== undefined) {
            setAnnualBudget(String(row.annual_budget));
          }
        }
      } catch {
        setStatusMsg({ type: "error", text: "تعذّر تحميل بيانات الحساب." });
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void loadProfile();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;

    setSaving(true);
    setStatusMsg(null);

    try {
      const supabase = createClient();
      const parsedScore = score.trim() === "" ? null : Number(score);
      const parsedBudget =
        annualBudget.trim() === "" ? null : Number(annualBudget);

      if (
        parsedScore !== null &&
        (!Number.isFinite(parsedScore) || parsedScore < 0 || parsedScore > 100)
      ) {
        setStatusMsg({
          type: "error",
          text: "المجموع يجب أن يكون نسبة بين 0 و 100.",
        });
        setSaving(false);
        return;
      }

      if (
        parsedBudget !== null &&
        (!Number.isFinite(parsedBudget) || parsedBudget < 0)
      ) {
        setStatusMsg({
          type: "error",
          text: "الميزانية السنوية يجب أن تكون رقماً صحيحاً.",
        });
        setSaving(false);
        return;
      }

      const cleanName = fullName.trim();

      const { error: dbError } = await supabase
        .from("profiles")
        .update({
          full_name: cleanName,
          track,
          score: parsedScore,
          annual_budget: parsedBudget,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (dbError) {
        throw dbError;
      }

      await supabase.auth.updateUser({
        data: { full_name: cleanName },
      });

      setStatusMsg({
        type: "success",
        text: "تم حفظ بياناتك في قاعدة البيانات بنجاح.",
      });
    } catch {
      setStatusMsg({
        type: "error",
        text: "حدث خطأ أثناء الحفظ. حاول مرة أخرى.",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteAccount() {
    if (deleteConfirmText.trim() !== "حذف") return;
    setDeleting(true);
    setStatusMsg(null);

    try {
      const res = await fetch("/api/account/delete", { method: "POST" });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setStatusMsg({
          type: "error",
          text: data.error || "تعذّر حذف الحساب حالياً.",
        });
        setDeleting(false);
        return;
      }

      try {
        localStorage.clear();
      } catch {
        // ignore storage errors
      }
      window.location.assign("/");
    } catch {
      setStatusMsg({
        type: "error",
        text: "حدث خطأ في الاتصال بالخادم أثناء حذف الحساب.",
      });
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#377ef0]" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-xl bg-[#377ef0]/10 text-[#377ef0] flex items-center justify-center">
            <User className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#1c1736]">الملف الشخصي</h1>
            <p className="text-xs text-[#64748b]" dir="ltr">
              {email}
            </p>
          </div>
        </div>
        <Link
          href="/workspace"
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#dedad0] bg-white px-3 py-1.5 text-xs font-semibold text-[#1c1736] hover:bg-[#f2efe9] transition-colors"
        >
          <ArrowRight className="h-3.5 w-3.5" />
          <span>العودة للمنصة</span>
        </Link>
      </div>

      {statusMsg && (
        <div
          className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium ${
            statusMsg.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-rose-200 bg-rose-50 text-rose-800"
          }`}
        >
          {statusMsg.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <AlertTriangle className="h-4 w-4 shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Edit Profile Form */}
      <form
        onSubmit={handleSave}
        className="rounded-xl border border-[#dedad0] bg-white p-5 space-y-4 shadow-2xs"
      >
        <h2 className="text-sm font-bold text-[#1c1736]">بيانات الطالب</h2>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-[#48425f]">
            الاسم الكامل
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="اكتب اسمك"
            className="w-full rounded-lg border border-[#dedad0] bg-[#faf8f5] px-3.5 py-2.5 text-sm text-[#1c1736] focus:border-[#377ef0] focus:bg-white focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#48425f]">
              الشعبة الدراسية
            </label>
            <select
              value={track}
              onChange={(e) => setTrack(e.target.value)}
              className="w-full rounded-lg border border-[#dedad0] bg-[#faf8f5] px-3.5 py-2.5 text-sm text-[#1c1736] focus:border-[#377ef0] focus:bg-white focus:outline-none"
            >
              {TRACK_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#48425f]">
              المجموع (%)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              dir="ltr"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              placeholder="مثال: 90.5"
              className="w-full rounded-lg border border-[#dedad0] bg-[#faf8f5] px-3.5 py-2.5 text-sm text-[#1c1736] font-mono focus:border-[#377ef0] focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-[#48425f]">
            الميزانية السنوية المتاحة (ج.م)
          </label>
          <input
            type="number"
            min="0"
            step="1000"
            dir="ltr"
            value={annualBudget}
            onChange={(e) => setAnnualBudget(e.target.value)}
            placeholder="مثال: 60000"
            className="w-full rounded-lg border border-[#dedad0] bg-[#faf8f5] px-3.5 py-2.5 text-sm text-[#1c1736] font-mono focus:border-[#377ef0] focus:bg-white focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#377ef0] hover:bg-[#2a6ad6] active:scale-[0.985] disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 transition-all cursor-pointer"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          <span>{saving ? "جاري الحفظ..." : "حفظ التعديلات"}</span>
        </button>
      </form>

      {/* Danger Zone: Delete Account */}
      <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-5 space-y-3">
        <div className="flex items-center gap-2 text-rose-700">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <h2 className="text-sm font-bold">حذف الحساب نهائياً</h2>
        </div>
        <p className="text-xs text-rose-700/90 leading-relaxed">
          حذف حسابك سيقوم بمسح بياناتك الشخصية وملفك من قاعدة البيانات بشكل نهائي ولا يمكن التراجع عن هذا الإجراء.
        </p>

        {!showDeleteConfirm ? (
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-rose-300 bg-white hover:bg-rose-600 hover:text-white text-rose-700 text-xs font-semibold px-3.5 py-2 transition-colors cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>أريد حذف حسابي</span>
          </button>
        ) : (
          <div className="space-y-3 pt-1">
            <label className="block text-xs font-semibold text-rose-800">
              اكتب كلمة <span className="font-bold underline">حذف</span> للتأكيد:
            </label>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="حذف"
              className="w-full rounded-lg border border-rose-300 bg-white px-3 py-2 text-sm text-[#1c1736] focus:border-rose-600 focus:outline-none"
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleting || deleteConfirmText.trim() !== "حذف"}
                className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 transition-colors cursor-pointer"
              >
                {deleting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
                <span>{deleting ? "جاري الحذف..." : "تأكيد الحذف النهائي"}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteConfirmText("");
                }}
                className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}