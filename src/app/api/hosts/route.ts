import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { caddyManager } from "@/lib/caddy/manager"
import { CaddyConfigGenerator } from "@/lib/caddy/config"
import { CaddyHost } from "@/lib/caddy/types"
import { caddyService } from "@/lib/services/caddy-service"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const config = await CaddyConfigGenerator.loadConfig()
    return NextResponse.json(config.hosts || [])
  } catch (error) {
    console.error("Error fetching hosts:", error)
    return NextResponse.json(
      { error: "Failed to fetch hosts" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Ensure Caddy is running
    const status = await caddyService.getStatus()
    if (!status.initialized) {
      await caddyService.initialize()
    }

    const data = await request.json()
    const { domain, targetHost, targetPort, ssl, forceSSL, enabled } = data

    if (!domain || !targetHost || !targetPort) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const config = await CaddyConfigGenerator.loadConfig()
    const newHost: CaddyHost = {
      id: crypto.randomUUID(),
      domain,
      targetHost,
      targetPort,
      ssl: ssl ?? true,
      forceSSL: forceSSL ?? true,
      enabled: enabled ?? true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    config.hosts = [...(config.hosts || []), newHost]
    await CaddyConfigGenerator.saveConfig(config)
    await caddyManager.reload()

    return NextResponse.json(newHost)
  } catch (error) {
    console.error("Error creating host:", error)
    return NextResponse.json(
      { error: "Failed to create host" },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Ensure Caddy is running
    const status = await caddyService.getStatus()
    if (!status.initialized) {
      await caddyService.initialize()
    }

    const data = await request.json()
    const { id, domain, targetHost, targetPort, ssl, forceSSL, enabled } = data

    if (!id || !domain || !targetHost || !targetPort) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const config = await CaddyConfigGenerator.loadConfig()
    const hostIndex = config.hosts?.findIndex(h => h.id === id)
    
    if (hostIndex === undefined || hostIndex === -1) {
      return NextResponse.json(
        { error: "Host not found" },
        { status: 404 }
      )
    }

    const existingHost = config.hosts[hostIndex]
    const updatedHost: CaddyHost = {
      ...existingHost,
      domain,
      targetHost,
      targetPort,
      ssl,
      forceSSL,
      enabled,
      updatedAt: new Date()
    }

    config.hosts[hostIndex] = updatedHost
    await CaddyConfigGenerator.saveConfig(config)
    await caddyManager.reload()

    return NextResponse.json(updatedHost)
  } catch (error) {
    console.error("Error updating host:", error)
    return NextResponse.json(
      { error: "Failed to update host" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Ensure Caddy is running
    const status = await caddyService.getStatus()
    if (!status.initialized) {
      await caddyService.initialize()
    }

    const url = new URL(request.url)
    const id = url.searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { error: "Host ID is required" },
        { status: 400 }
      )
    }

    const config = await CaddyConfigGenerator.loadConfig()
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
