import { useNavigate } from "react-router-dom"
import { Copy, MoreHorizontal, QrCode, Trash, BarChart2, ExternalLink } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useUrlStore } from "@/store/url-store"
import type { ShortURL } from "@/types/api"

interface UrlActionsProps {
  url: ShortURL
}

export function UrlActions({ url }: UrlActionsProps) {
  const navigate = useNavigate()
  const { deleteUrl } = useUrlStore()

  const handleCopy = () => {
    // Construct full URL using current origin + short key
    // Or use the `short_url` field if backend provides absolute URL
    // Backend `short_url` is likely absolute or relative. 
    // Let's assume absolute or relative to domain.
    const fullUrl = url.short_url.startsWith('http') 
        ? url.short_url 
        : `${window.location.origin}/${url.short_key}`;
        
    navigator.clipboard.writeText(fullUrl)
    toast.success("Copied to clipboard")
  }

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this URL?")) {
      try {
        await deleteUrl(url.id)
        toast.success("URL deleted")
      } catch {
        toast.error("Failed to delete URL")
      }
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem onClick={handleCopy}>
          <Copy className="mr-2 h-4 w-4" /> Copy Short Link
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => window.open(url.original_url, '_blank')}>
          <ExternalLink className="mr-2 h-4 w-4" /> Visit Original
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate(`/urls/${url.id}/analytics`)}>
          <BarChart2 className="mr-2 h-4 w-4" /> Analytics
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate(`/urls/${url.id}/qr`)}>
          <QrCode className="mr-2 h-4 w-4" /> QR Code
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
          <Trash className="mr-2 h-4 w-4" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
