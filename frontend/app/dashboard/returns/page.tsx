import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Download, Eye, Plus, Search, SlidersHorizontal } from "lucide-react"

export default function ReturnsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Returns to Supplier</h1>
        <Link href="/dashboard/returns/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Return
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Returns List</CardTitle>
          <CardDescription>Manage all returns to suppliers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 w-full max-w-sm">
              <Search className="h-4 w-4 text-muted-foreground absolute ml-2" />
              <Input placeholder="Search returns..." className="pl-8" />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Return ID</TableHead>
                  <TableHead>Purchase Order</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Return Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">RTN-2023-0018</TableCell>
                  <TableCell>PO-2023-0124</TableCell>
                  <TableCell>FreshTech Appliances</TableCell>
                  <TableCell>2023-06-12</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                      Pending
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Link href="/dashboard/returns/view/RTN-2023-0018">
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View</span>
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">RTN-2023-0017</TableCell>
                  <TableCell>PO-2023-0122</TableCell>
                  <TableCell>HydraClean Solutions</TableCell>
                  <TableCell>2023-06-08</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                      Completed
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Link href="/dashboard/returns/view/RTN-2023-0017">
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View</span>
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">RTN-2023-0016</TableCell>
                  <TableCell>PO-2023-0120</TableCell>
                  <TableCell>Luminance Creations</TableCell>
                  <TableCell>2023-06-05</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                      Completed
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Link href="/dashboard/returns/view/RTN-2023-0016">
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View</span>
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">RTN-2023-0015</TableCell>
                  <TableCell>PO-2023-0118</TableCell>
                  <TableCell>GreenGrowth Designers</TableCell>
                  <TableCell>2023-06-02</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
                      Rejected
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Link href="/dashboard/returns/view/RTN-2023-0015">
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View</span>
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">RTN-2023-0014</TableCell>
                  <TableCell>PO-2023-0115</TableCell>
                  <TableCell>Vitality Gear Co.</TableCell>
                  <TableCell>2023-05-28</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                      Completed
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Link href="/dashboard/returns/view/RTN-2023-0014">
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View</span>
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-end space-x-2 py-4">
            <Button variant="outline" size="sm">
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button variant="outline" size="sm">
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

