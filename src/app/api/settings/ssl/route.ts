import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { promises as fs } from "fs"
import path from "path"
import { CaddyConfigGenerator } from "@/lib/caddy/config"
import type { SSLSettings } from "@/lib/caddy/types"

const CONFIG_PATH = path.join(process.cwd(), "config", "config.json")

async function readConfig() {
  const configData = await fs.readFile(CONFIG_PATH, 'utf-8')
  return JSON.parse(configData)
}

async function writeConfig(config: any) {
  await fs.writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8')
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const config = await CaddyConfigGenerator.loadConfig()
    return NextResponse.json(config.globalSettings.ssl || {
      cloudflare: {
        enabled: false,
        apiToken: ""
      },
      autoRenewal: {
        enabled: true,
        daysBeforeExpiry: 30
      }
    })
  } catch (error) {
    console.error("Error fetching SSL settings:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const settings = await request.json() as SSLSettings

    // Validate settings
    if (typeof settings.cloudflare?.enabled !== "boolean" ||
        typeof settings.autoRenewal?.enabled !== "boolean" ||
        typeof settings.autoRenewal?.daysBeforeExpiry !== "number" ||
        settings.autoRenewal.daysBeforeExpiry < 1 ||
        settings.autoRenewal.daysBeforeExpiry > 90) {
      return new NextResponse("Invalid settings format", { status: 400 })
    }

    // Load current config
    const config = await CaddyConfigGenerator.loadConfig()

    // Update SSL settings while preserving other settings
    config.globalSettings.ssl = settings

    // Save the updated config
    await CaddyConfigGenerator.saveConfig(config)

    return NextResponse.json({ message: "Settings updated successfully" })
  } catch (error) {
    console.error("Error updating SSL settings:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

// Handle custom certificate upload
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const formData = await request.formData()
    const certificate = formData.get("certificate") as File
    
    if (!certificate) {
      return new NextResponse("No certificate file provided", { status: 400 })
    }

    // Ensure the certificates directory exists
    const certsDir = path.join(process.cwd(), "config", "ssl", "certificates")
    await fs.mkdir(certsDir, { recursive: true })

    // Save the certificate
    const certPath = path.join(certsDir, certificate.name)
    const buffer = Buffer.from(await certificate.arrayBuffer())
    await fs.writeFile(certPath, buffer)

    return NextResponse.json({ 
      message: "Certificate uploaded successfully",
      path: certPath
    })
  } catch (error) {
    console.error("Error uploading certificate:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
