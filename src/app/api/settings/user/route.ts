import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import fs from 'fs/promises'
import path from 'path'

const CONFIG_PATH = path.join(process.cwd(), 'config', 'config.json')

async function readConfig() {
  const configData = await fs.readFile(CONFIG_PATH, 'utf-8')
  return JSON.parse(configData)
}

async function writeConfig(config: any) {
  await fs.writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8')
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await request.json()
    const { username, currentPassword, newPassword } = body

    // Read current config
    const config = await readConfig()
    const currentUsername = config.globalSettings.admin.username
    const currentPasswordHash = config.globalSettings.admin.password

    // Verify current password
    if (currentPassword !== currentPasswordHash) {
      return new NextResponse("Invalid current password", { status: 400 })
    }

    // Update credentials
    if (username) {
      config.globalSettings.admin.username = username
    }

    if (newPassword) {
      config.globalSettings.admin.password = newPassword
    }

    // Save updated config
    await writeConfig(config)

    // Update environment variables for immediate effect
    if (username) {
      process.env.ADMIN_USERNAME = username
    }
    if (newPassword) {
      process.env.ADMIN_PASSWORD = newPassword
    }

    return NextResponse.json({ message: "Settings updated successfully" })
  } catch (error) {
    console.error("Error updating user settings:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
