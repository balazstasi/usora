"use client"

import { Button } from "@/components/ui/button"
import type { ActionButtonsProps } from "@/types"

export function ActionButtons({ canProceed, isLendingMode, onConfirm, onSaveDraft }: ActionButtonsProps) {
  return (
    <div className="flex gap-4 justify-center">
      <Button variant="outline" size="lg" onClick={onSaveDraft}>
        Save Draft
      </Button>
      <Button size="lg" className="px-8" disabled={!canProceed} onClick={onConfirm}>
        {isLendingMode ? "Send Lending Request" : "Schedule Payments"}
      </Button>
    </div>
  )
}
