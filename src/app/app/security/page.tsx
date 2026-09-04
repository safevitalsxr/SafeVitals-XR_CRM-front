"use client"

import * as React from "react"
import { Shield, Key, Lock, Smartphone } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Switch } from "@/components/ui/Switch"
import { Label } from "@/components/ui/Label"
import { toast } from "sonner"

export default function SecurityPage() {
  const [mfa, setMfa] = React.useState(false)
  const [sessionTimeout, setSessionTimeout] = React.useState(true)

  const handleSave = () => {
    toast.success("Security settings updated successfully")
  }

  return (
    <div className="flex-1 space-y-6 max-w-4xl mx-auto w-full">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Security Center</h2>
        <p className="text-muted-foreground mt-1">Manage organizational security policies and access controls.</p>
      </div>

      <div className="grid gap-6">
        <Card className="bg-zinc-950 border-zinc-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Lock className="w-5 h-5 text-primary" /> Password Policy</CardTitle>
            <CardDescription>Enforce strong password requirements for all employees.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="flex flex-col gap-1">
                <span>Minimum Length</span>
                <span className="font-normal text-muted-foreground">Require passwords to be at least 12 characters long.</span>
              </Label>
              <Switch checked={true} disabled />
            </div>
            <div className="flex items-center justify-between">
              <Label className="flex flex-col gap-1">
                <span>Complexity</span>
                <span className="font-normal text-muted-foreground">Require uppercase, lowercase, numbers, and symbols.</span>
              </Label>
              <Switch checked={true} disabled />
            </div>
            <div className="flex items-center justify-between">
              <Label className="flex flex-col gap-1">
                <span>Expiration</span>
                <span className="font-normal text-muted-foreground">Require password change every 90 days.</span>
              </Label>
              <Switch checked={false} />
            </div>
          </CardContent>
          <CardFooter className="border-t border-zinc-800 pt-4 flex justify-end">
            <Button onClick={handleSave}>Save Changes</Button>
          </CardFooter>
        </Card>

        <Card className="bg-zinc-950 border-zinc-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Smartphone className="w-5 h-5 text-blue-500" /> Multi-Factor Authentication (MFA)</CardTitle>
            <CardDescription>Add an extra layer of security to employee accounts.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="flex flex-col gap-1">
                <span>Enforce MFA globally</span>
                <span className="font-normal text-muted-foreground">Require all users to set up two-factor authentication.</span>
              </Label>
              <Switch checked={mfa} onCheckedChange={setMfa} />
            </div>
          </CardContent>
          <CardFooter className="border-t border-zinc-800 pt-4 flex justify-end">
            <Button onClick={handleSave}>Save Changes</Button>
          </CardFooter>
        </Card>

        <Card className="bg-zinc-950 border-zinc-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5 text-blue-500" /> Session Management</CardTitle>
            <CardDescription>Control how long users stay logged in.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="flex flex-col gap-1">
                <span>Idle Timeout</span>
                <span className="font-normal text-muted-foreground">Automatically log out users after 30 minutes of inactivity.</span>
              </Label>
              <Switch checked={sessionTimeout} onCheckedChange={setSessionTimeout} />
            </div>
          </CardContent>
          <CardFooter className="border-t border-zinc-800 pt-4 flex justify-end">
            <Button onClick={handleSave}>Save Changes</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
