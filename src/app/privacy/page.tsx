import React from "react";
import Link from "next/link";
import { Shield, ArrowRight, Lock, Database, Clock, Mail } from "lucide-react";

export const metadata = {
  title: "سياسة الخصوصية | chooseU",
  description: "سياسة الخصوصية وحماية بيانات الطلاب في منصة chooseU",
};

export default function PrivacyPage() {
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
            <Shield className="w-3.5 h-3.5" />
            <span>وثيقة الخصوصية وحماية البيانات الشخصية</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-snug">
            سياسة الخصوصية وحماية بيانات الطلاب
          </h1>
          <p className="text-slate-600 text-sm mt-2 leading-relaxed">
            نحن في منصة chooseU نلتزم باحترام خصوصيتك وحماية بياناتك الأكاديمية والشخصية أثناء استخدامك لأدوات التوجيه الجامعي.
          </p>
        </div>

        {/* Section 1: Collected Data */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Lock className="w-4 h-4 text-blue-600" />
            <span>1. ما هي البيانات التي نجمعها؟</span>
          </h2>
          <p className="text-sm text-slate-700 leading-relaxed">
            عند استخدامك للمنصة أو طلب تقرير استشاري، قد نقوم بجمع البيانات التالية فقط لغرض تقديم الخدمة:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-sm text-slate-700 pr-2">
            <li><strong>اسم الطالب:</strong> لتخصيص بطاقة الرغبات والتقرير الاستشاري.</li>
            <li><strong>المحافظة:</strong> لحساب النطاقات الجغرافية للتنسيق (أ، ب، ج) وتكاليف الانتقال والسكن.</li>
            <li><strong>النسبة المئوية للمجموع:</strong> لمطابقة الكليات والبرامج الأكاديمية المناسبة.</li>
            <li><strong>الميزانية التقديرية:</strong> لحساب التكلفة الإجمالية (TCO) وتحديد البدائل المناسبة للأسرة.</li>
            <li><strong>إجابات مقياس الميول والاهتمامات:</strong> لتحليل المسار الأكاديمي والمهني المتوافق مع شخصية الطالب.</li>
            <li><strong>رقم الهاتف / الواتساب:</strong> لإرسال التقرير المعتمد والتواصل مع المستشار الأكاديمي.</li>
            <li><strong>مرجع عملية الدفع (InstaPay):</strong> للتحقق من سداد رسوم الاستشارة في حال طلبها.</li>
          </ul>
        </section>

        {/* Section 2: Why We Collect Data */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-600" />
            <span>2. لماذا نجمع هذه البيانات؟</span>
          </h2>
          <p className="text-sm text-slate-700 leading-relaxed">
            تُستخدم هذه البيانات حصرياً في:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-sm text-slate-700 pr-2">
            <li>توليد قوائم الكليات المؤهلة وحساب مصفوفة التكاليف وسيناريوهات التضخم المالي.</li>
            <li>تزويد المستشار الأكاديمي بالسياق الكامل لمراجعة رغبات الطالب وتقديم التوصية المخصصة.</li>
            <li>تحديث ومتابعة حالة الطلبات عبر بوابة الاستعلام.</li>
            <li>لا نقوم ببيع أو تأجير أو مشاركة بياناتك الشخصية مع أي أطراف إعلانية أو تجارية خارجية.</li>
          </ul>
        </section>

        {/* Section 3: Where Data is Stored */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Database className="w-4 h-4 text-blue-600" />
            <span>3. أين تُخزن البيانات؟</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
              <strong className="text-sm text-slate-900 block">التخزين المحلي (Local Storage)</strong>
              <p className="text-xs text-slate-600 leading-relaxed">
                تُحفظ مدخلاتك الحالية ومقارنات الكليات وإجابات المقياس محلياً داخل متصفح جهازك لتمكينك من استكمال جلستك دون فقدان بياناتك.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
              <strong className="text-sm text-slate-900 block">قاعدة البيانات السحابية (Supabase)</strong>
              <p className="text-xs text-slate-600 leading-relaxed">
                في حال تقديم طلب استشارة رسمي، تُحفظ بيانات الطلب في قاعدة بيانات مشفرة ومؤمنة بسياسات أمان مشددة على مستوى الصفوف (RLS).
              </p>
            </div>
          </div>
        </section>

        {/* Section 4: Retention */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>4. مدة الاحتفاظ بالبيانات</span>
          </h2>
          <p className="text-sm text-slate-700 leading-relaxed">
            المدة المحددة لحفظ سجلات الطلبات واسترجاعها: <span className="font-mono font-bold text-blue-700">[تُحدَّد]</span>.
          </p>
        </section>

        {/* Section 5: Contact */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Mail className="w-4 h-4 text-blue-600" />
            <span>5. طلب حذف البيانات والتواصل</span>
          </h2>
          <p className="text-sm text-slate-700 leading-relaxed">
            يحق لك في أي وقت طلب مسح بياناتك أو الاستفسار عن تفاصيل الحفظ عبر التواصل معنا على: <span className="font-mono font-bold text-blue-700">[تُحدَّد]</span>.
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
            href="/terms"
            className="text-xs font-bold text-blue-600 hover:underline"
          >
            عرض الشروط والأحكام ←
          </Link>
        </div>
      </div>
    </div>
  );
}
