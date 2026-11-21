"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Bot, Send, Loader2 } from "lucide-react";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  time: string;
}

const SUGGESTIONS = [
  "ما هو التوزيع الاسترشادي للـ 75 رغبة؟",
  "أقارن إزاي بين الجامعات الحكومية والأهلية؟",
  "إيه أفضل الكليات المطلوبة في سوق العمل حالياً؟",
];

function formatTrack(track?: string | null) {
  if (track === "Math") return "علمي رياضة";
  if (track === "Arts") return "أدبي";
  if (track === "stem") return "STEM";
  return "علمي علوم";
}

function nowTime() {
  return new Date().toLocaleTimeString("ar-EG", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdvisorPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "أهلاً بك في المستشار الذكي من ChooseU! اسألني أي سؤال بخصوص التنسيق، الكليات، المصروفات، أو سوق العمل وأنا جاهز أساعدك.",
      time: nowTime(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [studentCtx, setStudentCtx] = useState<{
    studentName?: string;
    stream?: string;
    score?: number | null;
    budget?: number | null;
  }>({});
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadCtx() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user || cancelled) return;

        const { data: row } = await supabase
          .from("profiles")
          .select("full_name, track, score, annual_budget")
          .eq("id", user.id)
          .single();

        if (!cancelled && row) {
          setStudentCtx({
            studentName: row.full_name || "",
            stream: formatTrack(row.track),
            score: row.score ?? null,
            budget: row.annual_budget ?? null,
          });
        }
      } catch {
        // guest mode fallback
      }
    }
    void loadCtx();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(customText?: string) {
    const q = (customText ?? input).trim();
    if (!q || loading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      text: q,
      time: nowTime(),
    };

    const historyPayload = messages.slice(-8).map((m) => ({
      role: m.role,
      text: m.text,
    }));

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: q,
          history: historyPayload,
          context: studentCtx,
        }),
      });
      const data = await res.json();
      const replyText =
        data?.reply ||
        data?.answer ||
        data?.message ||
        data?.error ||
        "تعذّر الحصول على رد حالياً. حاول مرة أخرى.";

      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          text: String(replyText),
          time: nowTime(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `e-${Date.now()}`,
          role: "assistant",
          text: "حدث خطأ في الاتصال بالخادم. تأكد من الإنترنت وحاول مرة أخرى.",
          time: nowTime(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 flex flex-col h-[calc(100vh-5.5rem)]">
      {/* Header */}
      <div className="rounded-xl border border-[#dedad0] bg-white p-4 mb-4 flex items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[#FACC15]/10 text-amber-600 flex items-center justify-center shrink-0">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-[#1c1736]">
              المستشار الذكي (ChooseU AI)
            </h1>
            <p className="text-xs text-[#64748b]">
              اسأل في التنسيق، الكليات، المصروفات، أو مسارك الوظيفي
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 shrink-0">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span>متصل</span>
        </span>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto rounded-xl border border-[#dedad0] bg-[#faf8f5] p-4 space-y-3">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${
              m.role === "user" ? "justify-start" : "justify-end"
            }`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                m.role === "user"
                  ? "bg-[#FACC15] text-slate-950"
                  : "bg-white border border-[#dedad0] text-[#1c1736]"
              }`}
            >
              <p>{m.text}</p>
              <span
                className={`block mt-1.5 text-[10px] ${
                  m.role === "user" ? "text-blue-100" : "text-[#64748b]"
                }`}
              >
                {m.time}
              </span>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-end">
            <div className="rounded-2xl bg-white border border-[#dedad0] px-4 py-3 text-xs text-[#64748b] inline-flex items-center gap-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-600" />
              <span>جاري التفكير...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick Suggestions */}
      <div className="flex items-center gap-2 overflow-x-auto py-2.5 no-scrollbar">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            disabled={loading}
            onClick={() => void sendMessage(s)}
            className="shrink-0 rounded-lg border border-[#dedad0] bg-white hover:border-amber-500 hover:text-amber-600 px-3 py-1.5 text-xs font-medium text-[#48425f] transition-colors cursor-pointer"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <div className="rounded-xl border border-[#dedad0] bg-white p-2.5 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !loading) void sendMessage();
          }}
          placeholder="اكتب سؤالك هنا (كليات، تنسيق، مصروفات، سوق العمل)..."
          className="flex-1 min-w-0 bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-slate-900 text-sm focus:border-amber-500 focus:outline-none"
        />
        <button
          type="button"
          onClick={() => void sendMessage()}
          disabled={loading || !input.trim()}
          className="shrink-0 inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#FACC15] hover:bg-[#2a6ad6] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 text-xs font-semibold px-4 py-2.5 transition-all cursor-pointer"
        >
          <span>إرسال</span>
          <Send className="w-3.5 h-3.5 stroke-[2]" />
        </button>
      </div>
    </div>
  );
}