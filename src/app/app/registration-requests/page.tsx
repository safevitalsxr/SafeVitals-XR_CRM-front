"use client"

import * as React from "react"
import { useAppStore } from "@/stores/appStore"
import { ApproveRegistrationModal } from "@/components/employees/ApproveRegistrationModal"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { CheckCircle2, Search, UserCircle } from "lucide-react"

export default function RegistrationRequestsPage() {
  const { pendingUsers, fetchPendingUsers } = useAppStore()
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedUser, setSelectedUser] = React.useState<any>(null)
  const [modalOpen, setModalOpen] = React.useState(false)

  React.useEffect(() => {
    fetchPendingUsers()
  }, [fetchPendingUsers])

  const filteredUsers = (pendingUsers || []).filter(u => 
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.lastName?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Registration Requests</h2>
          <p className="text-muted-foreground text-sm mt-1">Review and approve self-registered candidates.</p>
        </div>
      </div>

      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
        <input
          type="text"
          placeholder="Search candidates..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full bg-zinc-950 border border-zinc-800 rounded-md pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        />
      </div>

      {filteredUsers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-zinc-800 rounded-lg">
          <UserCircle className="h-12 w-12 text-zinc-600 mb-4" />
          <h3 className="text-lg font-medium text-zinc-300">No Pending Requests</h3>
          <p className="text-sm text-zinc-500 max-w-sm text-center mt-1">
            There are currently no pending registration requests.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map((user) => (
            <div key={user._id || user.id} className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/50 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 font-medium">
                      {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-zinc-100">{user.firstName} {user.lastName}</h4>
                      <p className="text-xs text-zinc-500">{user.email}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-500">Firebase UID</span>
                    <code className="text-zinc-300 bg-zinc-900 px-1.5 py-0.5 rounded">{user.firebaseUid || "N/A"}</code>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-500">Registered</span>
                    <span className="text-zinc-400">{new Date(user.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-500">Status</span>
                    <Badge variant="outline" className="text-[10px] uppercase bg-amber-500/10 text-amber-500 border-amber-500/20">
                      Pending Approval
                    </Badge>
                  </div>
                </div>
              </div>
              
              <Button 
                onClick={() => { setSelectedUser(user); setModalOpen(true); }}
                className="w-full mt-4 bg-zinc-100 text-zinc-900 hover:bg-zinc-200 text-xs font-semibold h-8"
              >
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                Review & Approve
              </Button>
            </div>
          ))}
        </div>
      )}

      {selectedUser && (
        <ApproveRegistrationModal
          user={selectedUser}
          open={modalOpen}
          onOpenChange={setModalOpen}
        />
      )}
    </div>
  )
}

