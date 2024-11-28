import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs"
import { UserSettingsForm } from "./components/UserSettingsForm"
import { CaddySettingsForm } from "./components/CaddySettingsForm"
import { SSLSettingsForm } from "./components/SSLSettingsForm"
import { ThemeSettingsForm } from "./components/ThemeSettingsForm"

export default function SettingsPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your application preferences</p>
      </div>

      <Tabs defaultValue="user" className="space-y-4">
        <TabsList>
          <TabsTrigger value="user">User Account</TabsTrigger>
          <TabsTrigger value="caddy">Caddy</TabsTrigger>
          <TabsTrigger value="ssl">SSL Certificates</TabsTrigger>
          <TabsTrigger value="theme">Theme</TabsTrigger>
        </TabsList>

        <TabsContent value="user">
          <Card>
            <CardHeader>
              <CardTitle>User Settings</CardTitle>
              <CardDescription>
                Manage your account credentials
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserSettingsForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="caddy">
          <Card>
            <CardHeader>
              <CardTitle>Caddy Settings</CardTitle>
              <CardDescription>
                Configure Caddy server behavior
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CaddySettingsForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ssl">
          <Card>
            <CardHeader>
              <CardTitle>SSL Certificate Settings</CardTitle>
              <CardDescription>
                Configure SSL certificate providers and options
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SSLSettingsForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="theme">
          <Card>
            <CardHeader>
              <CardTitle>Theme Settings</CardTitle>
              <CardDescription>
                Customize the application appearance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ThemeSettingsForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
