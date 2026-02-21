import { useAuthStore } from "@/store/auth-store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

export function ProfilePage() {
  const { user } = useAuthStore()

  if (!user) return null

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Profile</h2>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>
            Your basic profile details.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                    <AvatarFallback className="text-2xl">{user.username[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                    <h3 className="font-semibold text-lg">{user.username}</h3>
                    <p className="text-muted-foreground">{user.email}</p>
                </div>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" value={user.username} readOnly />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={user.email} readOnly />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="joined">Date Joined</Label>
                    <Input id="joined" value={new Date(user.date_joined).toLocaleDateString()} readOnly />
                </div>
            </div>
        </CardContent>
      </Card>
    </div>
  )
}
