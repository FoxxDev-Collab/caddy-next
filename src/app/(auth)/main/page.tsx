'use client'

import { Globe, Shield, Clock, LineChart } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/app/components/ui/card"

export default function MainPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Proxy Hosts Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Proxy Hosts</CardTitle>
            <Globe className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Active proxy configurations</p>
          </CardContent>
        </Card>

        {/* SSL Certificates Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">SSL Certificates</CardTitle>
            <Shield className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Active certificates</p>
          </CardContent>
        </Card>

        {/* Jobs Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Jobs</CardTitle>
            <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Scheduled tasks</p>
          </CardContent>
        </Card>

        {/* Traffic Monitor Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Traffic Monitor</CardTitle>
            <LineChart className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Active connections</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Sections */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Proxy Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Proxy Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-[200px] border-2 border-dashed rounded-lg border-gray-200 dark:border-gray-700">
              <p className="text-gray-500 dark:text-gray-400">No recent activity</p>
            </div>
          </CardContent>
        </Card>

        {/* Traffic Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Traffic Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-[200px] border-2 border-dashed rounded-lg border-gray-200 dark:border-gray-700">
              <p className="text-gray-500 dark:text-gray-400">No traffic data available</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
