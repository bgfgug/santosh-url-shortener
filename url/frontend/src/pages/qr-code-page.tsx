import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { urlsApi } from "@/api/urls"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { ArrowLeft, Download } from "lucide-react"

export function QRCodePage() {
  const { id } = useParams<{ id: string }>()
  const [qrUrl, setQrUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadQr() {
      if (!id) return
      try {
        const url = await urlsApi.getQrCode(id)
        setQrUrl(url)
      } catch {
        setError("Failed to load QR code")
      } finally {
        setLoading(false)
      }
    }
    loadQr()
  }, [id])

  const handleDownload = () => {
    if (qrUrl) {
      const link = document.createElement('a')
      link.href = qrUrl
      link.download = `qr-${id}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  if (loading) return <div className="p-8 text-center">Loading QR Code...</div>
  if (error) return <div className="p-8 text-center text-destructive">{error}</div>

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
       <div className="self-start w-full max-w-md mx-auto">
        <Button variant="ghost" asChild className="mb-4">
            <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Link>
        </Button>
       </div>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>QR Code</CardTitle>
          <CardDescription>Scan to visit the short URL</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center p-6">
          {qrUrl && (
            <img 
                src={qrUrl} 
                alt="QR Code" 
                className="border rounded-lg" 
                width={250} 
                height={250} 
            />
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
            <Button onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" /> Download PNG
            </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
