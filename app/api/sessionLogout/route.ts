import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  // apaga o cookie (usa os defaults do Next)
  res.cookies.delete("__session");
  // se você tiver usado outro nome, apague também:
  // res.cookies.delete("session");
  return res;
}
