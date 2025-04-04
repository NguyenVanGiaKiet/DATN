import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Download, FileText, Plus, Search, SlidersHorizontal } from "lucide-react"

export default function ContractsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Contracts & Agreements</h1>
        <Link href="/dashboard/contracts/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Contract
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Contracts List</CardTitle>
          <CardDescription>Manage all supplier contracts and agreements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 w-full max-w-sm">
              <Search className="h-4 w-4 text-muted-foreground absolute ml-2" />
              <Input placeholder="Search contracts..." className="pl-8" />
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
                  <TableHead>Contract ID</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">CNT-2023-0012</TableCell>
                  <TableCell>Luminance Creations</TableCell>
                  <TableCell>2023-01-15</TableCell>
                  <TableCell>2024-01-14</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                      Active
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Link href="/dashboard/contracts/view/CNT-2023-0012">
                      <Button variant="ghost" size="icon">
                        <FileText className="h-4 w-4" />
                        <span className="sr-only">View</span>
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">CNT-2023-0011</TableCell>
                  <TableCell>HydraClean Solutions</TableCell>
                  <TableCell>2023-02-01</TableCell>
                  <TableCell>2025-01-31</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                      Active
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Link href="/dashboard/contracts/view/CNT-2023-0011">
                      <Button variant="ghost" size="icon">
                        <FileText className="h-4 w-4" />
                        <span className="sr-only">View</span>
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">CNT-2022-0010</TableCell>
                  <TableCell>GreenGrowth Designers</TableCell>
                  <TableCell>2022-11-15</TableCell>
                  <TableCell>2023-11-14</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                      Expiring Soon
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Link href="/dashboard/contracts/view/CNT-2022-0010">
                      <Button variant="ghost" size="icon">
                        <FileText className="h-4 w-4" />
                        <span className="sr-only">View</span>
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">CNT-2022-0009</TableCell>
                  <TableCell>FreshTech Appliances</TableCell>
                  <TableCell>2022-10-01</TableCell>
                  <TableCell>2023-09-30</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                      Expiring Soon
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Link href="/dashboard/contracts/view/CNT-2022-0009">
                      <Button variant="ghost" size="icon">
                        <FileText className="h-4 w-4" />
                        <span className="sr-only">View</span>
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">CNT-2022-0008</TableCell>
                  <TableCell>Vitality Gear Co.</TableCell>
                  <TableCell>2022-08-15</TableCell>
                  <TableCell>2023-02-14</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
                      Expired
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Link href="/dashboard/contracts/view/CNT-2022-0008">
                      <Button variant="ghost" size="icon">
                        <FileText className="h-4 w-4" />
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

