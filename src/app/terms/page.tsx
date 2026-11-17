import React from "react";
import Link from "next/link";
import { FileText, ArrowRight, AlertCircle, CheckCircle2, ShieldCheck, Mail } from "lucide-react";

export const metadata = {
  title: "الشروط والأحكام | chooseU",
  description: "شروط وأحكام استخدام منصة chooseU الاستشارية",
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      {/* Top Legal Review Notice Banner */}
      <div className="bg-amber-50 border-2 border-amber-300 text-amber-950 px-5 py-4 rounded-2xl text-sm sm:text-base font-bold flex items-center gap-3 shadow-xs">
        <span className="text-xl">⚠️</span>
        <span>مسودة — تحتاج مراجعة قانونية قبل الإطلاق</span>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 shadow-xs space-y-8">
        <div className="border-b border-slate-200 pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-3">
            <FileText className="w-3.5 h-3.5" />
            <span>اتفاقية شروط الاستخدام</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-snug">
            الشروط والأحكام للاستخدام والاستشارات
          </h1>
          <p className="text-slate-600 text-sm mt-2 leading-relaxed">
            تحدد هذه الوثيقة ضوابط استخدام منصة chooseU وطبيعة الخدمات الاستشارية والتقارير الأكاديمية والمالية المقدمة للطلاب وأولياء الأمور.
          </p>
        </div>

        {/* Section 1: Nature of Service */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-blue-600" />
            <span>1. طبيعة الخدمة وحدود المسؤولية الأكاديمية</span>
          </h2>
          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 space-y-2 text-xs sm:text-sm text-slate-800 leading-relaxed">
            <p>
              <strong>تنبيه استرشادي:</strong> منصة chooseU هي منصة توجيه استشاري تحليلي مستقلة. المنصة <strong>ليست جهة حكومية</strong> ولا تمثل مكتب تنسيق القبول بالجامعات والمعاهد المصرية، ولا تُغني عن التسجيل الرسمي على بوابة التنسيق الحكومية المعتمدة.
            </p>
            <p>
              كافة معدلات القبول، الحدود الدنيا، ومصروفات الكليات والبرامج الأهلية والخاصة الواردة في المنصة هي <strong>أرقام استرشادية</strong> مبنية على إحصاءات السنوات السابقة واللوائح المعلنة، وتخضع للتحديث وفق القرارات الرسمية الصادرة عن المجلس الأعلى للجامعات ومكاتب التنسيق في العام الجامعي الجاري.
            </p>
          </div>
        </section>

        {/* Section 2: User Inputs */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
            <span>2. مسؤولية دقة المدخلات</span>
          </h2>
          <p className="text-sm text-slate-700 leading-relaxed">
            دقة التوصيات والمصفوفة المالية تعتمد كلياً على صحة البيانات التي يدخلها الطالب أو ولي أمره (المجموع، الشعبة، المحافظة، الميزانية، إجابات مقياس الميول). يتحمل المستخدم كامل المسؤولية عن أي خطأ في إدخال بياناته.
          </p>
        </section>

        {/* Section 3: Consultation & Orders */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>3. خدمات الاستشارة والتقارير المدفوعة</span>
          </h2>
          <ul className="list-disc list-inside space-y-1.5 text-sm text-slate-700 pr-2">
            <li>رسوم طلب التقرير الاستشاري المعتمد تغطي تكلفة الفحص البشري المتخصص من قِبل المستشار الأكاديمي وإعداد الملاحظات المخصصة والتسجيل الصوتي التوجيهي.</li>
            <li>يتم تأكيد الطلب بعد التحقق من إشعار التحويل المالي عبر المحافظ الإلكترونية المعتمدة (InstaPay).</li>
            <li>التقرير الاستشاري يقدم رؤية استرشادية تفصيلية ولا يقدم ضماناً ملزماً بالقبول النهائي في أي كلية أو برنامج جامعي.</li>
          </ul>
        </section>

        {/* Section 4: Term & Modification */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <span>4. مدة سريان الاتفاقية والتعديل</span>
          </h2>
          <p className="text-sm text-slate-700 leading-relaxed">
            تسري هذه الشروط فور بدء استخدامك للمنصة، ونحتفظ بالحق في تحديثها دورياً بما يتوافق مع الإجراءات التنظيمية. مدة سريان البنود: <span className="font-mono font-bold text-blue-700">[تُحدَّد]</span>.
          </p>
        </section>

        {/* Section 5: Contact */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Mail className="w-4 h-4 text-blue-600" />
            <span>5. الاستفسارات والشكاوى القانونية</span>
          </h2>
          <p className="text-sm text-slate-700 leading-relaxed">
            لأي استفسارات بخصوص شروط الاستخدام أو الاتفاقية، يرجى التواصل معنا عبر: <span className="font-mono font-bold text-blue-700">[تُحدَّد]</span>.
          </p>
        </section>

        <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-blue-600 transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة للرئيسية</span>
          </Link>
          <Link
            href="/privacy"
            className="text-xs font-bold text-blue-600 hover:underline"
          >
            عرض سياسة الخصوصية ←
          </Link>
        </div>
      </div>
    </div>
  );
}
