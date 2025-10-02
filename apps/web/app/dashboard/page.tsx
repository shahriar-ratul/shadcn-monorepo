import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@workspace/ui/components/table"
import { Badge } from "@workspace/ui/components/badge"

export default function DashboardPage() {
  const stats = [
    { title: "Total Revenue", value: "$45,231.89", change: "+20.1%", trend: "up" },
    { title: "Active Users", value: "2,350", change: "+180", trend: "up" },
    { title: "New Orders", value: "128", change: "+12%", trend: "up" },
    { title: "Pending Tasks", value: "23", change: "-4", trend: "down" },
  ]

  const recentOrders = [
    { id: "ORD-001", customer: "John Doe", status: "completed", amount: "$250.00", date: "2024-03-15" },
    { id: "ORD-002", customer: "Jane Smith", status: "pending", amount: "$150.00", date: "2024-03-14" },
    { id: "ORD-003", customer: "Bob Johnson", status: "processing", amount: "$320.00", date: "2024-03-14" },
    { id: "ORD-004", customer: "Alice Brown", status: "completed", amount: "$180.00", date: "2024-03-13" },
    { id: "ORD-005", customer: "Charlie Wilson", status: "cancelled", amount: "$90.00", date: "2024-03-13" },
  ]

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      completed: "default",
      pending: "secondary",
      processing: "outline",
      cancelled: "destructive",
    }
    return <Badge variant={variants[status] || "default"}>{status}</Badge>
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your business metrics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className={`text-xs ${stat.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                {stat.change} from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>A list of your recent customer orders</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>Recent orders from your store</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{order.customer}</TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell>{order.date}</TableCell>
                  <TableCell className="text-right">{order.amount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}