"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Calendar, DollarSign, Mail, Clock, CheckCircle, AlertCircle } from "lucide-react"
import { format, isBefore, addDays } from "date-fns"
import type { TrackedTransaction } from "@/types"

interface MobileTransactionCardProps {
  transaction: TrackedTransaction
}

export function MobileTransactionCard({ transaction }: MobileTransactionCardProps) {
  const progress = ((transaction.totalAmount - transaction.remainingAmount) / transaction.totalAmount) * 100

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500"
      case "active":
        return "bg-blue-500"
      case "overdue":
        return "bg-red-500"
      case "pending":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-3 w-3" />
      case "overdue":
        return <AlertCircle className="h-3 w-3" />
      default:
        return <Clock className="h-3 w-3" />
    }
  }

  const isOverdue = isBefore(transaction.nextPaymentDate, new Date()) && transaction.status === "active"
  const isDueSoon = isBefore(transaction.nextPaymentDate, addDays(new Date(), 7)) && !isOverdue

  return (
    <Card className={`${isOverdue ? "border-red-200 bg-red-50" : isDueSoon ? "border-yellow-200 bg-yellow-50" : ""}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <p className="font-medium truncate">{transaction.recipientEmail}</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <DollarSign className="h-3 w-3" />
              <span>{transaction.type === "lending" ? "Lending" : "Receiving"}</span>
            </div>
          </div>
          <Badge
            variant="outline"
            className={`${getStatusColor(transaction.status)} text-white border-0 flex-shrink-0`}
          >
            <span className="flex items-center gap-1">
              {getStatusIcon(transaction.status)}
              {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
            </span>
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{progress.toFixed(0)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>${(transaction.totalAmount - transaction.remainingAmount).toFixed(2)} paid</span>
            <span>${transaction.remainingAmount.toFixed(2)} left</span>
          </div>
        </div>

        {/* Next Payment */}
        {transaction.status === "active" && (
          <div
            className={`p-3 rounded-lg border ${isOverdue ? "border-red-200 bg-red-50" : isDueSoon ? "border-yellow-200 bg-yellow-50" : "border-gray-200 bg-gray-50"}`}
          >
            <p className="text-sm font-medium mb-1">
              Next {transaction.type === "lending" ? "Payment Due" : "Payment"}
            </p>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-lg">${transaction.nextPaymentAmount.toFixed(2)}</p>
                <p
                  className={`text-xs flex items-center gap-1 ${isOverdue ? "text-red-600" : isDueSoon ? "text-yellow-600" : "text-muted-foreground"}`}
                >
                  <Calendar className="h-3 w-3" />
                  {format(transaction.nextPaymentDate, "MMM dd")}
                  {isOverdue && " (Overdue)"}
                  {isDueSoon && " (Soon)"}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
