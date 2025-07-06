import { Separator } from "@/components/ui/separator"
import type { TransactionSummaryProps } from "@/types"

export function TransactionSummary({ totalAmount, installments, isLendingMode }: TransactionSummaryProps) {
  const totalInstallmentAmount = installments.reduce((sum, inst) => sum + (inst.amount || 0), 0)

  return (
    <>
      <Separator />
      <div className="bg-slate-50 p-4 rounded-lg space-y-2">
        <div className="flex justify-between text-sm">
          <span>Total {isLendingMode ? "Lending" : "Sending"} Amount:</span>
          <span className="font-medium">${totalAmount || "0.00"}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Total Installment Amount:</span>
          <span className="font-medium">${totalInstallmentAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Number of Installments:</span>
          <span className="font-medium">{installments.length}</span>
        </div>
        {totalAmount && totalInstallmentAmount !== Number.parseFloat(totalAmount) && (
          <div className="flex justify-between text-sm text-amber-600">
            <span>Difference:</span>
            <span className="font-medium">
              ${Math.abs(totalInstallmentAmount - Number.parseFloat(totalAmount)).toFixed(2)}
            </span>
          </div>
        )}
      </div>
    </>
  )
}
