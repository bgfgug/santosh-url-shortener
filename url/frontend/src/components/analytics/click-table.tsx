import { format, parseISO } from "date-fns"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ClickEvent } from "@/types/api"

interface ClickTableProps {
  clicks: ClickEvent[]
}

export function ClickTable({ clicks }: ClickTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date & Time</TableHead>
              <TableHead>IP Address</TableHead>
              <TableHead>User Agent</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clicks.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground h-24">
                        No clicks recorded yet.
                    </TableCell>
                </TableRow>
            ) : (
                clicks.slice(0, 50).map((click) => (
                <TableRow key={click.id}>
                    <TableCell className="whitespace-nowrap">
                    {format(parseISO(click.created_at), "MMM d, yyyy HH:mm")}
                    </TableCell>
                    <TableCell>{click.ip_address}</TableCell>
                    <TableCell className="max-w-[200px] truncate" title={click.user_agent}>
                    {click.user_agent}
                    </TableCell>
                </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
