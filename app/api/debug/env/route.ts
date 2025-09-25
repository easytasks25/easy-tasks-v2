import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  try {
    // Zeige ENV-Variablen (ohne sensible Daten zu loggen)
    const envInfo = {
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      hasDirectUrl: !!process.env.DIRECT_URL,
      databaseUrlLength: process.env.DATABASE_URL?.length || 0,
      directUrlLength: process.env.DIRECT_URL?.length || 0,
      databaseUrlStart: process.env.DATABASE_URL?.substring(0, 20) || "NOT_SET",
      directUrlStart: process.env.DIRECT_URL?.substring(0, 20) || "NOT_SET",
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
      allEnvKeys: Object.keys(process.env).filter(key => 
        key.includes('DATABASE') || key.includes('DIRECT') || key.includes('SUPABASE')
      )
    };

    return NextResponse.json({ 
      ok: true, 
      env: envInfo 
    });
  } catch (e: any) {
    return NextResponse.json({ 
      ok: false, 
      error: String(e) 
    }, { status: 500 });
  }
}