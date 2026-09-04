"use client"

import * as React from "react"
import { Activity, Search, Shield, RefreshCw } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { useAppStore } from "@/stores/appStore"

export default function AuditLogsPage() {
  const { auditLogs, employees, fetchAuditLogs } = useAppStore()
  const [search, setSearch] = React.useState("")
  const [isRefreshing, setIsRefreshing] = React.useState(false)

  React.useEffect(() => {
    fetchAuditLogs()
  }, [fetchAuditLogs])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchAuditLogs()
    setIsRefreshing(false)
  }

  const filteredLogs = auditLogs.filter(log => 
    (log.action && log.action.toLowerCase().includes(search.toLowerCase())) || 
    (log.details && log.details.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="flex-1 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Security Audit Trail</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Immutable, server-recorded security and administrative actions.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing} className="h-9">
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} /> Refresh Trail
        </Button>
      </div>

      <Card className="bg-card/70 border-border/80 shadow-xs">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base font-semibold">System Audit Events</CardTitle>
              <CardDescription>Chronological ledger of security and data events</CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search audit trail..." 
                className="pl-9 h-9 text-xs"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border/60 hover:bg-transparent">
                <TableHead className="text-xs">Timestamp</TableHead>
                <TableHead className="text-xs">Actor / User</TableHead>
                <TableHead className="text-xs">Action Type</TableHead>
                <TableHead className="text-xs">Event Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map(log => {
                const emp = employees.find(e => e.id === log.userId || (e as any)._id === log.userId)
                return (
                  <TableRow key={log.id} className="border-border/60">
                    <TableCell className="text-muted-foreground whitespace-nowrap text-xs font-mono">
                      {log.timestamp ? new Date(log.timestamp).toLocaleString() : "N/A"}
                    </TableCell>
                    <TableCell className="font-medium text-xs">
                      {emp ? `${emp.firstName} ${emp.lastName}` : (log.userId || "System Administrator")}
                    </TableCell>
                    <TableCell className="text-xs font-semibold">{log.action}</TableCell>
                    <TableCell className="text-muted-foreground text-xs max-w-[300px] truncate">
                      {log.details}
                    </TableCell>
                  </TableRow>
                )
              })}
              {filteredLogs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12 text-muted-foreground text-xs">
                    <Activity className="w-8 h-8 mx-auto mb-3 opacity-40 text-blue-500" />
                    No audit logs recorded yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
