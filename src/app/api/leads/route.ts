import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const payload = await request.json();
  const required = ["bride_name", "groom_name", "email", "phone", "wedding_date"];
  if (required.some((key) => !String(payload[key] ?? "").trim())) return NextResponse.json({ error: "Mohon lengkapi data wajib." }, { status: 400 });
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ ok: true, demo: true });
  const { error } = await supabase.from("leads").insert({
    bride_name: payload.bride_name, groom_name: payload.groom_name, email: payload.email,
    phone: payload.phone, whatsapp: payload.phone, wedding_date: payload.wedding_date,
    venue: payload.venue || null, guest_count: payload.guest_count ? Number(payload.guest_count) : null,
    package_interest: payload.package_interest || null, message: payload.message || null, source: "website", status: "new",
  });
  if (error) return NextResponse.json({ error: "Lead belum dapat disimpan. Coba kembali." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
