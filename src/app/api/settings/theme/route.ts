import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { promises as fs } from "fs"
import path from "path"

interface ThemeSettings {
  theme: "light" | "dark" | "system"
}

const THEME_SETTINGS_PATH = path.join(process.cwd(), "config", "theme-settings.json")

async function loadThemeSettings(): Promise<ThemeSettings> {
  try {
    const data = await fs.readFile(THEME_SETTINGS_PATH, "utf-8")
    return JSON.parse(data)
  } catch (error) {
    // Return default settings if file doesn't exist
    return {
      theme: "system"
    }
  }
}

async function saveThemeSettings(settings: ThemeSettings): Promise<void> {
  await fs.writeFile(THEME_SETTINGS_PATH, JSON.stringify(settings, null, 2))
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const settings = await loadThemeSettings()
    return NextResponse.json(settings)
  } catch (error) {
    console.error("Error fetching theme settings:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { theme } = await request.json()

    // Validate theme value
    if (!["light", "dark", "system"].includes(theme)) {
      return new NextResponse("Invalid theme value", { status: 400 })
    }

    const settings: ThemeSettings = { theme }
    await saveThemeSettings(settings)

    return NextResponse.json({ message: "Theme settings updated successfully" })
  } catch (error) {
    console.error("Error updating theme settings:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
