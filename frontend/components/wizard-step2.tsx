"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, ArrowRight, ArrowLeft } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import type { Step1Data, Step2Data } from "@/types"

interface WizardStep2Props {
  step1Data: Step1Data
  data: Step2Data
  onDataChange: (data: Step2Data) => void
  onNext: () => void
  onBack: () => void
  isTransitioning: boolean
}

export function WizardStep2({ step1Data, data, onDataChange, onNext, onBack, isTransitioning }: WizardStep2Props) {
  const [showPreview, setShowPreview] = useState(false)

  const canProceed = data.numberOfInstallments > 0 && data.startDate !== undefined

  const installmentAmount = step1Data.totalAmount
    ? (Number.parseFloat(step1Data.totalAmount) / data.numberOfInstallments).toFixed(2)
    : "0.00"

  const handleInstallmentSelect = (number: number) => {
    const button = document.activeElement as HTMLElement
    button?.classList.add("selection-active")

    setTimeout(() => {
      button?.classList.remove("selection-active")
    }, 200)

    onDataChange({ ...data, numberOfInstallments: number })

    // Show preview with animation
    if (!showPreview) {
      setShowPreview(true)
    }
  }

  const handleFrequencySelect = (frequency: "weekly" | "monthly") => {
    const button = document.activeElement as HTMLElement
    button?.classList.add("btn-press")

    setTimeout(() => {
      button?.classList.remove("btn-press")
    }, 150)

    onDataChange({ ...data, frequency })
  }

  const handleNext = () => {
    if (!canProceed) return

    const button = document.activeElement as HTMLElement
    button?.classList.add("btn-press")

    setTimeout(() => {
      button?.classList.remove("btn-press")
      onNext()
    }, 150)
  }

  const handleBack = () => {
    const button = document.activeElement as HTMLElement
    button?.classList.add("btn-press")

    setTimeout(() => {
      button?.classList.remove("btn-press")
      onBack()
    }, 150)
  }

  return (
    <div className="px-4 space-y-6">
      <Card className="interactive-hover">
        <CardHeader>
          <CardTitle className="text-xl">Payment Schedule</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Number of Installments */}
          <div className="space-y-2">
            <Label className="text-base font-medium">
              Number of {step1Data.isLendingMode ? "Repayments" : "Payments"}
            </Label>
            <div className="grid grid-cols-6 gap-1.5">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((number) => (
                <Button
                  key={number}
                  variant={data.numberOfInstallments === number ? "default" : "outline"}
                  className={`h-10 text-sm font-medium smooth-transition interactive-hover ${
                    data.numberOfInstallments === number
                      ? "bg-blue-500 text-white border-blue-500"
                      : "bg-white hover:bg-gray-50"
                  }`}
                  onClick={() => handleInstallmentSelect(number)}
                >
                  {number}
                </Button>
              ))}
            </div>
          </div>

          {/* Frequency */}
          <div className="space-y-2">
            <Label className="text-base font-medium">Payment Frequency</Label>
            <div className="flex rounded-lg border overflow-hidden">
              <Button
                variant={data.frequency === "weekly" ? "default" : "ghost"}
                className={`flex-1 h-10 rounded-none border-0 text-sm font-medium smooth-transition ${
                  data.frequency === "weekly" ? "bg-blue-500 text-white" : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
                onClick={() => handleFrequencySelect("weekly")}
              >
                Weekly
              </Button>
              <Button
                variant={data.frequency === "monthly" ? "default" : "ghost"}
                className={`flex-1 h-10 rounded-none border-0 text-sm font-medium smooth-transition ${
                  data.frequency === "monthly" ? "bg-blue-500 text-white" : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
                onClick={() => handleFrequencySelect("monthly")}
              >
                Monthly
              </Button>
            </div>
          </div>

          {/* Start Date */}
          <div className="space-y-2">
            <Label className="text-base font-medium">
              {step1Data.isLendingMode ? "First Repayment Date" : "First Payment Date"}
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full h-12 justify-start text-left font-normal interactive-hover smooth-transition",
                    !data.startDate && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                  {data.startDate ? format(data.startDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={data.startDate}
                  onSelect={(date) => onDataChange({ ...data, startDate: date })}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Preview */}
          {data.numberOfInstallments > 0 && (
            <div className={`p-3 bg-slate-50 rounded-lg space-y-2 ${showPreview ? "content-reveal" : ""}`}>
              <h4 className="font-medium">Payment Preview</h4>
              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span>Amount per payment:</span>
                  <span className="font-medium">${installmentAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total payments:</span>
                  <span className="font-medium">{data.numberOfInstallments}</span>
                </div>
                <div className="flex justify-between">
                  <span>Frequency:</span>
                  <span className="font-medium capitalize">{data.frequency}</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={isTransitioning}
          className="flex-1 h-12 bg-transparent interactive-hover smooth-transition"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={!canProceed || isTransitioning}
          className={`flex-1 h-12 smooth-transition ${canProceed && !isTransitioning ? "interactive-hover" : ""}`}
        >
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
