"use client"

import * as React from "react"
import { Settings, Building, Globe, Mail } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { toast } from "sonner"

export default function SettingsPage() {
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success("Settings saved successfully")
  }

  return (
    <div className="flex-1 space-y-6 max-w-4xl mx-auto w-full">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Global Settings</h2>
        <p className="text-muted-foreground mt-1">Configure system-wide preferences and integrations.</p>
      </div>

      <form onSubmit={handleSave} className="grid gap-6">
        <Card className="bg-zinc-950 border-zinc-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Building className="w-5 h-5 text-primary" /> Organization Details</CardTitle>
            <CardDescription>Basic information about your company.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>Company Name</Label>
              <Input defaultValue="SafeVitals XR" className="bg-zinc-900 border-zinc-800" />
            </div>
            <div className="grid gap-2">
              <Label>Contact Email</Label>
              <Input defaultValue="admin@safevitals.com" type="email" className="bg-zinc-900 border-zinc-800" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-950 border-zinc-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Globe className="w-5 h-5 text-blue-500" /> Localization</CardTitle>
            <CardDescription>Configure timezone and currency.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>Timezone</Label>
              <select className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm">
                <option value="IST">Indian Standard Time (IST)</option>
                <option value="UTC">Coordinated Universal Time (UTC)</option>
                <option value="PST">Pacific Standard Time (PST)</option>
                <option value="EST">Eastern Standard Time (EST)</option>
              </select>
            </div>
            <div className="grid gap-2">
              <Label>Currency</Label>
              <select className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm">
                <option value="INR">Indian Rupee (₹)</option>
                <option value="USD">US Dollar ($)</option>
                <option value="EUR">Euro (€)</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-950 border-zinc-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Mail className="w-5 h-5 text-blue-500" /> Email Notifications</CardTitle>
            <CardDescription>Configure system email templates and sender addresses.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>Sender Name</Label>
              <Input defaultValue="SafeVitals HR" className="bg-zinc-900 border-zinc-800" />
            </div>
            <div className="grid gap-2">
              <Label>Reply-To Email</Label>
              <Input defaultValue="hr@safevitals.com" type="email" className="bg-zinc-900 border-zinc-800" />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" size="lg">Save All Settings</Button>
        </div>
      </form>
    </div>
  )
}
