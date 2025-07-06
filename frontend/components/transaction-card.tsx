"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Calendar, DollarSign, Mail, Clock, CheckCircle, AlertCircle } from "lucide-react"
import { format, isAfter, isBefore, addDays } from "date-fns"
import type { TrackedTransaction } from "@/types"

interface TransactionCardProps {
  transaction: TrackedTransaction
  onMarkPaid?: (transactionId: string, installmentId: string) => void
}

export function TransactionCard({ transaction, onMarkPaid }: TransactionCardProps) {
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
        return <CheckCircle className="h-4 w-4" />
      case "overdue":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const isOverdue = isBefore(transaction.nextPaymentDate, new Date()) && transaction.status === "active"
  const isDueSoon =
    isAfter(transaction.nextPaymentDate, new Date()) && isBefore(transaction.nextPaymentDate, addDays(new Date(), 7))

  return (
    <Card className={`${isOverdue ? "border-red-200 bg-red-50" : isDueSoon ? "border-yellow-200 bg-yellow-50" : ""}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Mail className="h-4 w-4" />
            {transaction.recipientEmail}
          </CardTitle>
          <Badge variant="outline" className={`${getStatusColor(transaction.status)} text-white border-0`}>
            <span className="flex items-center gap-1">
              {getStatusIcon(transaction.status)}
              {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
            </span>
          </Badge>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <DollarSign className="h-3 w-3" />
            {transaction.type === "lending" ? "Lending" : "Receiving"}
          </span>
          <span>Created {format(transaction.createdAt, "MMM dd, yyyy")}</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{progress.toFixed(0)}% complete</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>${(transaction.totalAmount - transaction.remainingAmount).toFixed(2)} paid</span>
            <span>${transaction.remainingAmount.toFixed(2)} remaining</span>
          </div>
        </div>

        {/* Next Payment */}
        {transaction.status === "active" && (
          <div
            className={`p-3 rounded-lg border ${isOverdue ? "border-red-200 bg-red-50" : isDueSoon ? "border-yellow-200 bg-yellow-50" : "border-gray-200 bg-gray-50"}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">
                  Next {transaction.type === "lending" ? "Payment Due" : "Payment to Send"}
                </p>
                <p className="text-lg font-bold">${transaction.nextPaymentAmount.toFixed(2)}</p>
                <p
                  className={`text-sm flex items-center gap-1 ${isOverdue ? "text-red-600" : isDueSoon ? "text-yellow-600" : "text-muted-foreground"}`}
                >
                  <Calendar className="h-3 w-3" />
                  {format(transaction.nextPaymentDate, "MMM dd, yyyy")}
                  {isOverdue && " (Overdue)"}
                  {isDueSoon && " (Due Soon)"}
                </p>
              </div>
              {transaction.type === "lending" && onMarkPaid && (
                <Button size="sm" variant={isOverdue ? "destructive" : "default"}>
                  Mark as Paid
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Recent Installments */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Recent Installments</h4>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {transaction.installments.slice(0, 3).map((installment) => (
              <div key={installment.id} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      installment.status === "paid"
                        ? "bg-green-500"
                        : installment.status === "overdue"
                          ? "bg-red-500"
                          : "bg-yellow-500"
                    }`}
                  />
                  <span>${installment.amount.toFixed(2)}</span>
                </div>
                <div className="text-muted-foreground">
                  {installment.paidDate
                    ? `Paid ${format(installment.paidDate, "MMM dd")}`
                    : `Due ${format(installment.dueDate, "MMM dd")}`}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
