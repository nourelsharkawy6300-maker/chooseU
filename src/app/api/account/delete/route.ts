import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function POST() {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: "إعدادات قاعدة البيانات غير مكتملة." },
        { status: 500 }
      );
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "يجب تسجيل الدخول أولاً." },
        { status: 401 }
      );
    }

    const admin = getSupabaseAdmin();

    // 1. Delete profile row explicitly (in case FK cascade is not enabled)
    await admin.from("profiles").delete().eq("id", user.id);

    // 2. Permanently delete user from Supabase Auth
    const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);
    if (deleteError) {
      return NextResponse.json(
        { success: false, error: "تعذّر حذف الحساب حالياً. حاول مرة أخرى." },
        { status: 500 }
      );
    }

    // 3. Clear session cookies
    await supabase.auth.signOut();

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: "حدث خطأ غير متوقع أثناء حذف الحساب." },
      { status: 500 }
    );
  }
}