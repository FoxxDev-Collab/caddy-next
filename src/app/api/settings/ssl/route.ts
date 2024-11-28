import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { promises as fs } from "fs"
import path from "path"

interface SSLSettings {
  cloudflare: {
    enabled: boolean
    apiToken: string
  }
  autoRenewal: {
    enabled: boolean
    daysBeforeExpiry: number
  }
}

const SSL_SETTINGS_PATH = path.join(process.cwd(), "config", "ssl", "settings.json")

async function loadSSLSettings(): Promise<SSLSettings> {
  try {
    const data = await fs.readFile(SSL_SETTINGS_PATH, "utf-8")
    return JSON.parse(data)
  } catch (error) {
    // Return default settings if file doesn't exist
    return {
      cloudflare: {
        enabled: false,
        apiToken: ""
      },
      autoRenewal: {
        enabled: true,
        daysBeforeExpiry: 30
      }
    }
  }
}

async function saveSSLSettings(settings: SSLSettings): Promise<void> {
  // Ensure the ssl directory exists
  await fs.mkdir(path.join(process.cwd(), "config", "ssl"), { recursive: true })
  await fs.writeFile(SSL_SETTINGS_PATH, JSON.stringify(settings, null, 2))
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const settings = await loadSSLSettings()
    return NextResponse.json(settings)
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

    await saveSSLSettings(settings)

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
