"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RefreshCw, TrendingUp, TrendingDown, Clock, DollarSign } from "lucide-react"
import { MobileTransactionCard } from "./mobile-transaction-card"
import type { TrackedTransaction } from "@/types"

interface MobileTrackingProps {
  transactions: TrackedTransaction[]
  onRefresh: () => void
}

export function MobileTracking({ transactions, onRefresh }: MobileTrackingProps) {
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
    <div className="px-4 space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{lendingTransactions.length}</span>
            </div>
            <div className="text-lg font-bold">${totalLent.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground">Total Lent</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{receivingTransactions.length}</span>
            </div>
            <div className="text-lg font-bold">${totalReceiving.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground">Receiving</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-lg font-bold">${totalOutstanding.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground">Outstanding</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              {overdueCount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {overdueCount}
                </Badge>
              )}
            </div>
            <div className="text-lg font-bold text-red-600">{overdueCount}</div>
            <p className="text-xs text-muted-foreground">Overdue</p>
          </CardContent>
        </Card>
      </div>

      {/* Refresh Button */}
      <Button onClick={handleRefresh} disabled={isRefreshing} variant="outline" className="w-full bg-transparent">
        <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
        Refresh
      </Button>

      {/* Transactions */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="lending">Lending</TabsTrigger>
          <TabsTrigger value="receiving">Receiving</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-3">
          {transactions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No transactions yet</h3>
                <p className="text-muted-foreground text-center text-sm">
                  Create your first transaction to start tracking.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <MobileTransactionCard key={transaction.id} transaction={transaction} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="lending" className="space-y-3">
          <div className="space-y-3">
            {lendingTransactions.map((transaction) => (
              <MobileTransactionCard key={transaction.id} transaction={transaction} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="receiving" className="space-y-3">
          <div className="space-y-3">
            {receivingTransactions.map((transaction) => (
              <MobileTransactionCard key={transaction.id} transaction={transaction} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
