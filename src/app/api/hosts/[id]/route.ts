import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { caddyManager } from "@/lib/caddy/manager"
import { CaddyConfigGenerator } from "@/lib/caddy/config"

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params
    if (!id) {
      return NextResponse.json(
        { error: "Host ID is required" },
        { status: 400 }
      )
    }

    const config = await CaddyConfigGenerator.loadConfig()
    const hostExists = config.hosts?.some(h => h.id === id)
    
    if (!hostExists) {
      return NextResponse.json(
        { error: "Host not found" },
        { status: 404 }
      )
    }

    config.hosts = config.hosts?.filter(h => h.id !== id) || []
    await CaddyConfigGenerator.saveConfig(config)
    await caddyManager.reload()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting host:", error)
    return NextResponse.json(
      { error: "Failed to delete host" },
      { status: 500 }
    )
  }
}
