import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { promises as fs } from "fs"
import path from "path"

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

    const config = await readConfig()
    return NextResponse.json({
      theme: config.globalSettings.theme || "system"
    })
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

    // Update config.json
    const config = await readConfig()
    config.globalSettings.theme = theme
    await writeConfig(config)

    return NextResponse.json({ message: "Theme settings updated successfully" })
  } catch (error) {
    console.error("Error updating theme settings:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
