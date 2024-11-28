import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { caddyManager } from "@/lib/caddy/manager"
import { CaddyConfigGenerator } from "@/lib/caddy/config"
import type { CaddyConfig } from "@/lib/caddy/types"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const config = await CaddyConfigGenerator.loadConfig()

    return NextResponse.json({
      globalSettings: config.globalSettings || {
        defaultSNIHost: "",
        logLevel: "INFO"
      }
    })
  } catch (error) {
    console.error("Error fetching Caddy settings:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await request.json()
    const { globalSettings } = body as { globalSettings: CaddyConfig["globalSettings"] }

    // Load current config
    const currentConfig = await CaddyConfigGenerator.loadConfig()

    // Update global settings while preserving other config
    const newConfig: CaddyConfig = {
      ...currentConfig,
      globalSettings: {
        ...currentConfig.globalSettings,
        ...globalSettings
      }
    }

    // Save the updated config
    await CaddyConfigGenerator.saveConfig(newConfig)

    // Reload Caddy to apply changes
    await caddyManager.reload()

    return NextResponse.json({ message: "Settings updated successfully" })
  } catch (error) {
    console.error("Error updating Caddy settings:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
