"use client"

import { useState, useMemo } from "react"
import type { Installment, TransactionData } from "@/types"

export function useTransactionForm() {
  const [isLendingMode, setIsLendingMode] = useState(true)
  const [recipientEmail, setRecipientEmail] = useState("")
  const [totalAmount, setTotalAmount] = useState("")
  const [installments, setInstallments] = useState<Installment[]>([{ id: "1", amount: 0, date: undefined }])

  const canProceed = useMemo(() => {
    return (
      recipientEmail.trim() !== "" &&
      totalAmount.trim() !== "" &&
      !isNaN(Number.parseFloat(totalAmount)) &&
      installments.every((inst) => inst.date && inst.amount > 0)
    )
  }, [recipientEmail, totalAmount, installments])

  const transactionData: TransactionData = useMemo(
    () => ({
      mode: isLendingMode ? "lending" : "scheduled_payments",
      recipientEmail,
      totalAmount: Number.parseFloat(totalAmount) || 0,
      installments: installments.filter((inst) => inst.date && inst.amount > 0),
    }),
    [isLendingMode, recipientEmail, totalAmount, installments],
  )

  return {
    // State
    isLendingMode,
    recipientEmail,
    totalAmount,
    installments,
    canProceed,
    transactionData,

    // Actions
    setIsLendingMode,
    setRecipientEmail,
    setTotalAmount,
    setInstallments,
  }
}
