"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CreditCard } from "lucide-react"
import { format } from "date-fns"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { ConfirmationDialogProps } from "@/types"

export function ConfirmationDialog({ isOpen, onClose, onConfirm, transactionData }: ConfirmationDialogProps) {
  const { mode, recipientEmail, totalAmount, installments } = transactionData
  const isLendingMode = mode === "lending"

  const handleConfirm = () => {
    onConfirm(transactionData)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Confirm {isLendingMode ? "Lending Request" : "Payment Schedule"}
          </DialogTitle>
          <DialogDescription>
            Please review the details below before proceeding with your transaction.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Transaction Summary */}
          <div className="bg-slate-50 p-4 rounded-lg space-y-3">
            <h3 className="font-semibold text-slate-900">Transaction Summary</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-600">Mode:</span>
                <p className="font-medium">{isLendingMode ? "Lending with Repayment" : "Scheduled Payments"}</p>
              </div>
              <div>
                <span className="text-slate-600">Recipient:</span>
                <p className="font-medium">{recipientEmail}</p>
              </div>
              <div>
                <span className="text-slate-600">Total Amount:</span>
                <p className="font-medium text-lg">${totalAmount.toFixed(2)}</p>
              </div>
              <div>
                <span className="text-slate-600">Installments:</span>
                <p className="font-medium">{installments.length} payments</p>
              </div>
            </div>
          </div>

          {/* Installment Details */}
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-900">
              {isLendingMode ? "Repayment Schedule" : "Payment Schedule"}
            </h3>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {installments.map((installment, index) => (
                <div key={installment.id} className="flex justify-between items-center p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">#{index + 1}</Badge>
                    <div>
                      <p className="font-medium">${installment.amount?.toFixed(2)}</p>
                      <p className="text-sm text-slate-600">
                        {installment.date ? format(installment.date, "MMM dd, yyyy") : "No date set"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-600">{isLendingMode ? "Expected" : "Sending"}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Warning/Info */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">!</span>
              </div>
              <div className="text-sm">
                <p className="font-medium text-amber-800">Important Notice</p>
                <p className="text-amber-700 mt-1">
                  {isLendingMode
                    ? "This will create a lending agreement. Make sure you trust the recipient and have clear repayment terms."
                    : "This will schedule multiple payments. Ensure you have sufficient funds for each installment date."}
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} className="px-6">
            Confirm & {isLendingMode ? "Send Request" : "Schedule Payments"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
