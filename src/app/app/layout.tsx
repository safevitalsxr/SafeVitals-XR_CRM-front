import { DashboardLayout } from "@/components/layout/DashboardLayout"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>
}
