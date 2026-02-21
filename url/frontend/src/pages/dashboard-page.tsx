import { CreateUrlForm } from "@/components/urls/create-url-form"
import { UrlTable } from "@/components/urls/url-table"

export function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Manage your shortened links and view analytics.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <CreateUrlForm />
        </div>
      </div>
      <UrlTable />
    </div>
  )
}
