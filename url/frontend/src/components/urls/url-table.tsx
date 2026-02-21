import { useEffect } from "react"
import { ExternalLink } from "lucide-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useUrlStore } from "@/store/url-store"
import { UrlActions } from "./url-actions"

export function UrlTable() {
  const { urls, loading, fetchUrls } = useUrlStore()

  useEffect(() => {
    fetchUrls()
  }, [fetchUrls])

  if (loading && (!urls || urls.length === 0)) {
    return <div className="text-center py-10">Loading URLs...</div>
  }

  if (!urls || urls.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        No URLs created yet.
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Original URL</TableHead>
            <TableHead className="w-[150px]">Short Key</TableHead>
            <TableHead className="w-[100px]">Clicks</TableHead>
            <TableHead className="w-[150px]">Created</TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {urls.map((url) => (
            <TableRow key={url.id}>
              <TableCell className="max-w-[300px] truncate font-medium">
                <a 
                    href={url.original_url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center hover:underline"
                >
                    {url.original_url}
                    <ExternalLink className="ml-2 h-3 w-3 opacity-50" />
                </a>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                    <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                        {url.short_key}
                    </span>
                </div>
              </TableCell>
              <TableCell>{url.click_count}</TableCell>
              <TableCell>
                {/* Ensure date format matches API string or parse it */}
                {/* API returns ISO string usually. date-fns handles it or new Date() */}
                {new Date(url.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <UrlActions url={url} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
