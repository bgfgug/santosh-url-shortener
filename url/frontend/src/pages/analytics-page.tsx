import { useEffect } from "react"
import { useParams } from "react-router-dom"
import { useUrlStore } from "@/store/url-store"
import { ClickChart } from "@/components/analytics/click-chart"
import { ClickTable } from "@/components/analytics/click-table"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { Link } from "react-router-dom"

export function AnalyticsPage() {
  const { id } = useParams<{ id: string }>()
  const { analytics, fetchAnalytics, loading } = useUrlStore()

  useEffect(() => {
    if (id) {
      fetchAnalytics(id)
    }
  }, [id, fetchAnalytics])

  if (!id) return <div>Invalid URL ID</div>

  if (loading && !analytics) {
    return <div className="p-8 text-center">Loading analytics...</div>
  }

  if (!analytics) {
    return <div className="p-8 text-center">Analytics not found</div>
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
          <p className="text-muted-foreground">
            Stats for <a href={analytics.short_url.short_url} target="_blank" rel="noreferrer" className="underline">{analytics.short_url.short_url}</a>
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
          <div className="text-sm font-medium leading-none text-muted-foreground">
            Total Clicks
          </div>
          <div className="mt-2 text-3xl font-bold">{analytics.click_count}</div>
        </div>
        {/* Add more summary cards here if backend provided unique visitors etc */}
      </div>

      <ClickChart clicks={analytics.recent_clicks} />
      <ClickTable clicks={analytics.recent_clicks} />
    </div>
  )
}
