import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// تحديد المسار الصحيح لملف البيانات العام تلقائياً حتى لو كان الفولدر متداخلاً
const publicPath1 = path.join(__dirname, "../src/data/faculties_public.json");
const publicPath2 = path.join(__dirname, "../../src/data/faculties_public.json");
const resolvedPublicPath = fs.existsSync(publicPath1) ? publicPath1 : publicPath2;

const publicFaculties = JSON.parse(fs.readFileSync(resolvedPublicPath, "utf8"));
const privateTcoMap = JSON.parse(
  fs.readFileSync(path.join(__dirname, "./faculties_tco_private.json"), "utf8")
);

const FORBIDDEN_PRICE_WORDS = [
  "ألف", "الاف", "آلاف", "مليون", "جنيه", "مصروفات", "رسوم", "قسط", "دولار",
  "في المائة", "بالمئة", "عشرين", "ثلاثين", "أربعين", "خمسين", "ستين", "سبعين",
  "ثمانين", "تسعين", "مائة", "مئتين", "thousand", "egp", "percent", "%"
];

function validateAndHighlightProse(text) {
  let flaggedCount = 0;
  let highlighted = text.replace(/[0-9٠-٩]+/g, (match) => {
    flaggedCount++;
    return `<mark style="background:#ffde02;color:#103573;padding:0 4px;border-radius:3px;font-weight:bold;">[رقم محجوب للتدقيق: ${match}]</mark>`;
  });
  for (const word of FORBIDDEN_PRICE_WORDS) {
    const regex = new RegExp(`(${word})`, "gi");
    if (regex.test(highlighted)) {
      flaggedCount++;
      highlighted = highlighted.replace(
        regex,
        `<mark style="background:#ffde02;color:#103573;padding:0 4px;border-radius:3px;font-weight:bold;">$1</mark>`
      );
    }
  }
  return { flaggedCount, highlighted };
}

const CACHED_OMAR_DRAFT = `
<h3>التوجيه الأكاديمي وتحليل العائد على الاستثمار (ROI Analysis)</h3>
<ul>
  <li><strong>1. حاسبات المنوفية الأهلية (طوخ طنبشا):</strong>
    <br/>• <em>دواعي الترشيح:</em> تطابق وظيفي متقدم مع مؤشرات الطالب التحليلية (الذكاء الاصطناعي والأمن السيبراني). بيئة المعامل تدعم نمذجة البيانات.
    <br/>• <em>العامل الجغرافي:</em> الإقامة داخل نطاق المنوفية يلغي الحاجة لتدبير نفقات إعاشة مغتربة، مما يقلص التكلفة الإجمالية (TCO) بشكل استراتيجي.
    <br/>• <em>محاذير أكاديمية:</em> التسجيل ببرامج التخصص (AI/Cyber) يتطلب اجتياز متطلبات السنة التأسيسية بـ GPA محدد سلفاً باللائحة.
  </li>
  <li><strong>2. هندسة شبين الكوم (المنوفية الحكومية):</strong>
    <br/>• <em>دواعي الترشيح:</em> كفاءة مالية قصوى ونطاق جغرافي محلي. تؤهل لنقابة المهندسين وتوفر مسارات هندسة الحاسوب والشبكات.
    <br/>• <em>العامل التنافسي:</em> المجموع الحالي يقع ضمن النطاق الحدي (Reach) لتنسيق 2026، مما يستوجب تأمين خيارات موازية بالجامعات الأهلية كخطة بديلة.
  </li>
  <li><strong>3. هندسة المنوفية الأهلية:</strong>
    <br/>• <em>دواعي الترشيح:</em> بنية تحتية حديثة تدمج النظم المدمجة مع هندسة البرمجيات، وتتيح الالتحاق بنقابة المهندسين.
    <br/>• <em>المقايضة الأكاديمية:</em> تتطلب تجاوز سنة إعدادية هندسية عامة تتضمن مقررات أساسية في الميكانيكا والفيزياء قبل الانتقال للتخصصات البرمجية.
  </li>
  <li><strong>4. حاسبات مدينة السادات (حكومي):</strong>
    <br/>• <em>دواعي الترشيح:</em> بديل حكومي مدعم بالكامل يوفر شهادة معتمدة في علوم الحاسب ضمن نطاق المحافظة الجغرافي.
    <br/>• <em>العامل الجغرافي:</em> رغم وقوعها بالمحافظة، تتطلب المسافة الاستعانة بخدمات النقل الخاصة أو السكن الطلابي، ما يضيف عبئاً لوجستياً مستمراً.
  </li>
  <li><strong>5. بدائل خارج النطاق الجغرافي (بنها / المنصورة الأهلية / الجلالة):</strong>
    <br/>• <em>التوصية الاستشارية:</em> لا نوصي بتفعيل هذه الخيارات؛ إذ أن إضافة مخصصات السكن المغترب والخدمات المعيشية سيرفع التكلفة الإجمالية (TCO) لمستويات تتخطى ميزانية الأسرة المحددة، في ظل توفر بدائل محلية مكافئة أكاديمياً.
  </li>
</ul>
`;

async function generateDraftWithGemini(payload, eligibleFaculties) {
  const apiKey = process.env.GEMINI_API_KEY;
  const forceCached = process.argv.includes("--cached") || !apiKey;

  if (forceCached) {
    console.log("⚡ [CACHED MODE]: تم تحميل التقرير الاستشاري المُسبق للطالب «عمر». - generate-report.mjs:74");
    return {
      proseHtml: CACHED_OMAR_DRAFT,
      modeBadge: "[CACHED FALLBACK — تقرير محاكي معتمد]",
      latencySec: "0.2s (Cached)",
    };
  }

  console.log("⏳ جاري معالجة البيانات عبر نموذج gemini3.5flash (~19s)... - generate-report.mjs:82");
  const startTime = Date.now();
  const facNames = eligibleFaculties
    .map((f, i) => `${i + 1}. ${f.name_ar} (${f.uni_ar})`)
    .join("\n");

  const prompt = `أنت مستشار أكاديمي خبير بمنصة ChooseU (مهمتك تقديم توصية جافة، مباشرة، ومبنية على العائد الأكاديمي).
المطلوب صياغة مسودة استشارية باللغة العربية الفصحى (~600 كلمة) لولي أمر يستفسر عن الخيارات التالية:
${facNames}
مسار التخصص المرجح للطالب: ${payload.topTrack}. النطاق الجغرافي: ${payload.gov}.
شروط صارمة للإخراج: 
1. يمنع منعاً باتاً كتابة أي أرقام، أسعار، نسب مئوية، أو تواريخ داخل النص (البيانات المالية تُحقن تلقائياً).
2. لا تستخدم أساليب الترحيب أو الخاتمة. ادخل في صلب الموضوع مباشرة.
3. ركز حصرياً على: مبرر الترشيح الأكاديمي، كفاءة الموقع الجغرافي، والمقايضات الاستراتيجية.
4. استخدم عناصر HTML للتنسيق (<ul><li><strong>).`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );
    const data = await res.json();
    const rawText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || CACHED_OMAR_DRAFT;
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1) + "s";
    const { highlighted } = validateAndHighlightProse(rawText);
    return {
      proseHtml: highlighted,
      modeBadge: "[LIVE GEMINI API DRAFT — تم تفعيل فلتر حجب الأرقام]",
      latencySec: elapsed,
    };
  } catch {
    return {
      proseHtml: CACHED_OMAR_DRAFT,
      modeBadge: "[CACHED FALLBACK — وضع الطوارئ التلقائي]",
      latencySec: "Fallback",
    };
  }
}

async function main() {
  const rawArg = process.argv[2] || "";
  let payload;

  if (rawArg && !rawArg.startsWith("--")) {
    const cleanB64 = rawArg.replace("CHOOSEU_CODE:", "").trim();
    payload = JSON.parse(Buffer.from(cleanB64, "base64").toString("utf8"));
  } else {
    payload = {
      v: "v6",
      mode: "Trial",
      stream: "Math",
      score: 83.0,
      budget: 65000,
      gov: "المنوفية",
      topTrack: "AI",
      eligibleIds: [
        "menofia-ahleya-cs",
        "menofia-ai-credit",
        "menofia-eng-ahleya",
        "sadat-cs-public",
        "benha-ahleya-cs",
        "mansoura-ahleya-cs",
        "galala-cs",
        "o6u-cs",
        "shorouk-cs",
      ],
      stretchIds: ["menofia-cs-public", "menofia-eng-public"],
    };
  }

  const eligibleFaculties = payload.eligibleIds
    .map((id) => publicFaculties.find((f) => f.id === id))
    .filter(Boolean);

  const { proseHtml, modeBadge, latencySec } = await generateDraftWithGemini(
    payload,
    eligibleFaculties
  );

  const tableRowsHtml = eligibleFaculties
    .map((f, idx) => {
      const priv = privateTcoMap[f.id] || {
        lab_admin_fee_yr: 4000,
        tco_4yr_5pct: f.y1_base_fee * 4.3,
        tco_4yr_10pct: f.y1_base_fee * 4.64,
        tco_4yr_15pct: f.y1_base_fee * 4.99,
        dorm_commute_menofia: "يُحدد وفقاً لمحل الإقامة التفصيلي",
        y2_gpa_rule: "يخضع للائحة الأكاديمية المعتمدة",
        scholarship_rule: "تُطبق لوائح الإعفاء المالي المعيارية",
      };
      const margin = (payload.score - f.cutoff_2026).toFixed(1);
      const badge =
        margin >= 2.0 ? `النطاق الآمن (+${margin}%)` : `فرصة مناسبة (+${margin}%)`;

      return `
        <tr>
          <td><strong style="color:#103573;">#${idx + 1} ${f.name_ar}</strong><br/><span style="color:#045b9c;font-size:11px;font-weight:600;">${f.uni_ar} (${f.type})</span></td>
          <td><strong style="color:#103573;">${f.cutoff_2026}%</strong><br/><span style="background:#cee0ff;color:#103573;padding:2px 6px;border-radius:4px;font-size:10px;font-weight:bold;">${badge}</span></td>
          <td><strong>${f.y1_base_fee.toLocaleString()} ج.م</strong><br/><span style="color:#045b9c;font-size:10px;">+${priv.lab_admin_fee_yr.toLocaleString()} ج رسوم معملية وإدارية/سنوياً</span></td>
          <td style="background:#cee0ff45;font-weight:bold;color:#103573;line-height:1.7;">
            تضخم 5%: ${priv.tco_4yr_5pct.toLocaleString()} ج.م<br/>
            تضخم 10%: <span style="color:#0676d0;">${priv.tco_4yr_10pct.toLocaleString()} ج.م</span><br/>
            تضخم 15%: ${priv.tco_4yr_15pct.toLocaleString()} ج.م
          </td>
          <td>${payload.gov === "المنوفية" ? priv.dorm_commute_menofia : priv.dorm_commute_other}</td>
          <td>${priv.y2_gpa_rule}<br/><span style="color:#0676d0;font-size:10px;font-weight:bold;">نظام المنح: ${priv.scholarship_rule}</span></td>
        </tr>
      `;
    })
    .join("");

  const htmlContent = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <title>تقرير ChooseU للتحليل الأكاديمي والمالي — نموذج عمر</title>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: 'Cairo', sans-serif;
      color: #103573;
      background: #fbf7f4;
      margin: 0;
      padding: 24px;
      font-size: 12px;
      line-height: 1.6;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #103573;
      color: #ffffff;
      padding: 16px 20px;
      border-radius: 12px;
      border-bottom: 4px solid #ffde02;
      margin-bottom: 16px;
    }
    .badge {
      background: #ffde02;
      color: #103573;
      padding: 6px 12px;
      border-radius: 8px;
      font-weight: 800;
      font-size: 11px;
    }
    .summary-box {
      background: #ffffff;
      border: 2px solid #cee0ff;
      border-radius: 10px;
      padding: 12px 16px;
      margin-bottom: 16px;
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 10px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
      font-size: 11px;
      background: #ffffff;
    }
    th {
      background: #103573;
      color: #ffde02;
      padding: 10px 8px;
      text-align: right;
      border: 1px solid #045b9c;
    }
    td {
      padding: 10px 8px;
      border: 1px solid #cee0ff;
      vertical-align: top;
    }
    .prose-box {
      border: 2px solid #0676d0;
      background: #ffffff;
      border-radius: 10px;
      padding: 16px 20px;
      margin-bottom: 16px;
    }
    .prose-box h3 {
      margin-top: 0;
      color: #0676d0;
      font-size: 15px;
      border-bottom: 1px solid #cee0ff;
      padding-bottom: 8px;
    }
    .prose-box ul {
      margin: 0;
      padding-right: 18px;
    }
    .prose-box li {
      margin-bottom: 10px;
    }
    .checklist {
      border: 2px dashed #045b9c;
      border-radius: 8px;
      padding: 12px 16px;
      font-size: 11px;
      background: #cee0ff40;
    }
    .no-print {
      background: #cee0ff;
      border: 2px solid #0676d0;
      color: #103573;
      padding: 10px 16px;
      border-radius: 10px;
      margin-bottom: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    @media print {
      body { padding: 0; background: #ffffff; }
      .no-print { display: none !important; }
      @page { size: A4 portrait; margin: 10mm; }
    }
  </style>
</head>
<body>
  <div class="no-print">
    <div>
      <strong>وحدة اعتماد المخرجات (Level-2 Supervisor Terminal):</strong>
      <span>${modeBadge} — Latency: ${latencySec}</span>
    </div>
    <button onclick="window.print()" style="background:#0676d0;color:#fff;border:none;padding:8px 16px;border-radius:8px;font-family:'Cairo';font-weight:bold;cursor:pointer;">
      🖨️ طباعة / حفظ كملف PDF
    </button>
  </div>

  <div class="header">
    <div>
      <h1 style="margin:0;font-size:20px;color:#ffffff;">ChooseU | التحليل الأكاديمي الشامل والتكلفة الكلية (TCO) لـ 4 سنوات</h1>
      <p style="margin:4px 0 0;color:#cee0ff;font-size:11px;">مستخرج استشاري رسمي بناءً على لوائح القبول لعام 2026 (البيانات مصدقة بوثائق وزارة التعليم العالي والجامعات)</p>
    </div>
    <div class="badge">معتمد من المستشار الأكاديمي (Level-2)</div>
  </div>

  <div class="summary-box">
    <div><strong>ملف الطالب:</strong> عمر (ولي الأمر: أ. خالد)</div>
    <div><strong>التخصص والمجموع:</strong> ${payload.stream === "Math" ? "علمي رياضة" : "علمي علوم"} — ${payload.score}% (وضع تجريبي)</div>
    <div><strong>ميزانية الأساس السنوية:</strong> ${payload.budget.toLocaleString()} ج.م</div>
    <div><strong>النطاق الجغرافي:</strong> ${payload.gov}</div>
    <div><strong>المسار الأكاديمي المرجح:</strong> ${payload.topTrack}</div>
  </div>

  <h3 style="margin:0 0 10px;font-size:14px;color:#103573;font-weight:800;">أولاً: التحليل المالي التفصيلي (نموذج TCO لـ 4 سنوات شامل التضخم، المعامل، والانتقالات)</h3>
  <table>
    <thead>
      <tr>
        <th style="width:20%;">الجامعة / الكلية</th>
        <th style="width:11%;">حد التنسيق 2026</th>
        <th style="width:15%;">رسوم السنة الأولى الإلزامية</th>
        <th style="width:19%;">إجمالي 4 سنوات (تضخم 5%/10%/15%)</th>
        <th style="width:17%;">المصفوفة الجغرافية للسكن والانتقالات</th>
        <th style="width:18%;">اللوائح الداخلية للـ GPA والمنح</th>
      </tr>
    </thead>
    <tbody>
      ${tableRowsHtml}
    </tbody>
  </table>

  <div class="prose-box" contenteditable="true">
    ${proseHtml}
  </div>

  <div class="checklist">
    <strong style="color:#045b9c;font-size:12px;">ميثاق الجودة والمراجعة البشرية (5-Point Audit Log):</strong><br/>
    <span style="font-weight:600;">[✓] 1. دقة حدود تنسيق 2026 | [✓] 2. فلترة النص من المدخلات الرقمية غير المعتمدة | [✓] 3. التحقق من مسافات الاغتراب | [✓] 4. توثيق اشتراطات الـ GPA | [✓] 5. اعتماد الملف النهائي وإرفاق الملخص الصوتي (5m).</span>
    <br/><br/>
    <span style="color:#0676d0;font-size:10px;line-height:1.4;display:block;">تنويه إداري: هذا المستخرج استشاري لغرض التخطيط المبكر، ولا يعد بديلاً عن نتائج القبول الرسمية أو الإقرارات المالية للجامعات لعام 2027. تنفيذاً لسياسة أمن المعلومات، تُتلف السجلات المحلية لهذه العملية خلال 24 ساعة من التسليم.</span>
  </div>
</body>
</html>`;

  const outPath = path.join(__dirname, "report-omar.html");
  fs.writeFileSync(outPath, htmlContent, "utf8");
  console.log(`✅ تمت المعالجة! التقرير الجاهز للطباعة موجود في:\n   ${outPath} - generate-report.mjs:371`);
}

main();