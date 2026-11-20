import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface IncomingHistoryItem {
  role: "user" | "assistant";
  text: string;
}

interface TopFacultySummary {
  name: string;
  university: string;
  sector?: string;
  cutoff?: number;
  fee?: number;
}

interface StudentContextPayload {
  studentName?: string;
  stream?: string;
  score?: number;
  budget?: number;
  governorate?: string;
  dominantTrack?: string | null;
  topFaculties?: TopFacultySummary[];
}

interface ChatRequestBody {
  message?: string;
  history?: IncomingHistoryItem[];
  context?: StudentContextPayload;
}

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, max-age=0",
  "X-Robots-Tag": "noindex, nofollow",
};

function buildSystemPrompt(ctx?: StudentContextPayload): string {
  const facultiesText =
    ctx?.topFaculties && ctx.topFaculties.length > 0
      ? ctx.topFaculties
          .slice(0, 6)
          .map(
            (f, i) =>
              `${i + 1}. ${f.name} - ${f.university}${f.sector ? ` (${f.sector})` : ""}${
                typeof f.cutoff === "number" ? ` | تنسيق استرشادي: ${f.cutoff}%` : ""
              }${typeof f.fee === "number" ? ` | مصروفات سنوية: ${f.fee.toLocaleString()} ج.م` : ""}`
          )
          .join("\n")
      : "لم يتم تمرير قائمة كليات محددة.";

  return `أنت مساعد ذكي ومستشار أكاديمي ومهني متكامل داخل منصة ChooseU في مصر.

قواعد أسلوبك وإجاباتك:
1. جاوب بحرية وذكاء على أي سؤال يطرحه المستخدم — سواء سؤال عادي/يومي، سؤال في المذاكرة أو البرمجة أو سوق العمل أو الحياة الجامعية، أو استشارة في التنسيق والجامعات المصرية والتكلفة الشاملة (TCO).
2. لا ترفض الأسئلة العادية ولا تكرر ردوداً محفوظة؛ تفاعل بشكل طبيعي ومباشر وودود بنفس لغة المستخدم (مصري طبيعي، عربي فصيح، فرانكو، أو إنجليزي).
3. لما السؤال يخص اختيار الكلية أو التنسيق أو الميزانية، اربط إجابتك ببيانات الطالب الموجودة أسفل الرسالة وكن عملياً وصادقاً.
4. اجعل ردودك منظمة، واضحة، ومختصرة بدون حشو طويل (إلا لو المستخدم طلب شرحاً مفصلاً).

بيانات الطالب الحالية في ChooseU:
- الاسم: ${ctx?.studentName || "طالب"}
- الشعبة: ${ctx?.stream || "غير محددة"}
- المجموع: ${typeof ctx?.score === "number" ? `${ctx.score}%` : "غير محدد"}
- الميزانية السنوية: ${typeof ctx?.budget === "number" ? `${ctx.budget.toLocaleString()} ج.م` : "غير محددة"}
- المحافظة: ${ctx?.governorate || "غير محددة"}
- المسار المفضّل من التقييم: ${ctx?.dominantTrack || "لم يُحدد بعد"}

أقرب الكليات المرشحة للطالب حالياً:
${facultiesText}`;
}

async function callGemini(
  apiKey: string,
  systemPrompt: string,
  history: IncomingHistoryItem[],
  message: string
): Promise<string> {
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    model
  )}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const contents = [
    ...history.map((item) => ({
      role: item.role === "user" ? "user" : "model",
      parts: [{ text: item.text }],
    })),
    {
      role: "user",
      parts: [{ text: message }],
    },
  ];

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Gemini HTTP ${res.status}: ${errText.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> };
    }>;
  };

  const reply = data.candidates?.[0]?.content?.parts
    ?.map((p) => p.text || "")
    .join("")
    .trim();

  if (!reply) {
    throw new Error("Empty response from Gemini");
  }
  return reply;
}

async function callGroq(
  apiKey: string,
  systemPrompt: string,
  history: IncomingHistoryItem[],
  message: string
): Promise<string> {
  const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.7,
      max_tokens: 1024,
      messages: [
        { role: "system", content: systemPrompt },
        ...history.map((item) => ({
          role: item.role,
          content: item.text,
        })),
        { role: "user", content: message },
      ],
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Groq HTTP ${res.status}: ${errText.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const reply = data.choices?.[0]?.message?.content?.trim();
  if (!reply) {
    throw new Error("Empty response from Groq");
  }
  return reply;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ChatRequestBody;
    const message = typeof body.message === "string" ? body.message.trim() : "";

    if (!message || message.length > 1500) {
      return NextResponse.json(
        {
          success: false,
          error: "يرجى كتابة سؤال صحيح (بحد أقصى 1500 حرف).",
        },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    const safeHistory: IncomingHistoryItem[] = Array.isArray(body.history)
      ? body.history
          .filter(
            (m): m is IncomingHistoryItem =>
              Boolean(m) &&
              (m.role === "user" || m.role === "assistant") &&
              typeof m.text === "string" &&
              m.text.trim().length > 0
          )
          .slice(-10)
          .map((m) => ({
            role: m.role,
            text: m.text.trim().slice(0, 1500),
          }))
      : [];

    const geminiKey = process.env.GEMINI_API_KEY?.trim();
    const groqKey = process.env.GROQ_API_KEY?.trim();

    if (!geminiKey && !groqKey) {
      return NextResponse.json(
        {
          success: false,
          error:
            "خدمة المساعد الذكي غير مفعّلة بعد على السيرفر (يرجى إضافة GEMINI_API_KEY في إعدادات البيئة).",
        },
        { status: 503, headers: NO_STORE_HEADERS }
      );
    }

    const systemPrompt = buildSystemPrompt(body.context);
    const reply = geminiKey
      ? await callGemini(geminiKey, systemPrompt, safeHistory, message)
      : await callGroq(groqKey as string, systemPrompt, safeHistory, message);

    return NextResponse.json(
      { success: true, reply },
      { status: 200, headers: NO_STORE_HEADERS }
    );
  } catch (err) {
    console.error("[ChooseU AI Chat Error]", err);
    return NextResponse.json(
      {
        success: false,
        error: "حصلت مشكلة مؤقتة في الاتصال بالمساعد الذكي. جرّب تاني بعد ثواني.",
      },
      { status: 502, headers: NO_STORE_HEADERS }
    );
  }
}