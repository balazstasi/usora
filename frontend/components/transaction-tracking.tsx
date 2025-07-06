"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RefreshCw, TrendingUp, TrendingDown, Clock, DollarSign } from "lucide-react"
import { TransactionCard } from "./transaction-card"
import type { TransactionTrackingProps } from "@/types"

export function TransactionTracking({ transactions, onRefresh }: TransactionTrackingProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await onRefresh()
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  const lendingTransactions = transactions.filter((t) => t.type === "lending")
  const receivingTransactions = transactions.filter((t) => t.type === "receiving")

  const totalLent = lendingTransactions.reduce((sum, t) => sum + t.totalAmount, 0)
  const totalReceiving = receivingTransactions.reduce((sum, t) => sum + t.totalAmount, 0)
  const totalOutstanding = transactions.reduce((sum, t) => sum + t.remainingAmount, 0)
  const overdueCount = transactions.filter((t) => t.status === "overdue").length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Payment Tracking</h1>
          <p className="text-slate-600">Monitor your lending and payment schedules</p>
        </div>
        <Button onClick={handleRefresh} disabled={isRefreshing} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Lent</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalLent.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{lendingTransactions.length} active loans</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Receiving</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalReceiving.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{receivingTransactions.length} scheduled payments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalOutstanding.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Pending payments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overdueCount}</div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions */}
      <Tabs defaultValue="all" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">All Transactions</TabsTrigger>
            <TabsTrigger value="lending">Lending</TabsTrigger>
            <TabsTrigger value="receiving">Receiving</TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            {overdueCount > 0 && <Badge variant="destructive">{overdueCount} Overdue</Badge>}
          </div>
        </div>

        <TabsContent value="all" className="space-y-4">
          {transactions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No transactions yet</h3>
                <p className="text-muted-foreground text-center">
                  Create your first lending or payment schedule to start tracking.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {transactions.map((transaction) => (
                <TransactionCard key={transaction.id} transaction={transaction} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="lending" className="space-y-4">
          <div className="grid gap-4">
            {lendingTransactions.map((transaction) => (
              <TransactionCard key={transaction.id} transaction={transaction} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="receiving" className="space-y-4">
          <div className="grid gap-4">
            {receivingTransactions.map((transaction) => (
              <TransactionCard key={transaction.id} transaction={transaction} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
