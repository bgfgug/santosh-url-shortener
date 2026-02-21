import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useUrlStore } from "@/store/url-store"

const createUrlSchema = z.object({
  original_url: z.string().url({ message: "Please enter a valid URL" }),
  custom_key: z.string().optional().or(z.literal("")),
  expires_at: z.string().optional().or(z.literal("")),
})

type CreateUrlValues = z.infer<typeof createUrlSchema>

export function CreateUrlForm() {
  const [open, setOpen] = useState(false)
  const { createUrl, loading } = useUrlStore()
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateUrlValues>({
    resolver: zodResolver(createUrlSchema),
  })

  const onSubmit = async (data: CreateUrlValues) => {
    try {
        // Clean empty string optional values
      const payload = {
        original_url: data.original_url,
        custom_key: data.custom_key || undefined,
        expires_at: data.expires_at || null,
      }
      
      await createUrl(payload)
      toast.success("Short URL created!")
      setOpen(false)
      reset()
    } catch {
      // Error handled in store, but we can show specific if needed
      // Store sets error state, but toast here is good immediate feedback
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Create New URL
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Short URL</DialogTitle>
          <DialogDescription>
            Paste your long URL below to shorten it.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="original_url">Original URL</Label>
              <Input
                id="original_url"
                placeholder="https://example.com/very/long/url"
                {...register("original_url")}
              />
              {errors.original_url && (
                <p className="text-sm text-destructive">{errors.original_url.message}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="custom_key">Custom Key (Optional)</Label>
              <Input
                id="custom_key"
                placeholder="my-custom-link"
                {...register("custom_key")}
              />
               {errors.custom_key && (
                <p className="text-sm text-destructive">{errors.custom_key.message}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Short Link"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
