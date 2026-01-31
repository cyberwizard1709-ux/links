import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const ALLOWED_KEYS = ["siteTitle", "siteDescription", "faviconUrl"];

interface Setting {
  id: string;
  key: string;
  value: string;
  updatedAt: Date;
}

export async function GET() {
  try {
    const settings = await db.settings.findMany({
      where: {
        key: { in: ALLOWED_KEYS },
      },
    });

    const settingsMap = (settings as Setting[]).reduce((acc: Record<string, string>, setting: Setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string>);

    return NextResponse.json({ settings: settingsMap });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}
