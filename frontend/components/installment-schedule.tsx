"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, Plus, Trash2, DollarSign, Clock } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import type { InstallmentScheduleProps, Installment } from "@/types"

export function InstallmentSchedule({
  installments,
  totalAmount,
  isLendingMode,
  onInstallmentsChange,
}: InstallmentScheduleProps) {
  const addInstallment = () => {
    const newInstallment: Installment = {
      id: Date.now().toString(),
      amount: 0,
      date: undefined,
    }
    onInstallmentsChange([...installments, newInstallment])
  }

  const removeInstallment = (id: string) => {
    if (installments.length > 1) {
      onInstallmentsChange(installments.filter((inst) => inst.id !== id))
    }
  }

  const updateInstallment = (id: string, field: "amount" | "date", value: number | Date | undefined) => {
    onInstallmentsChange(installments.map((inst) => (inst.id === id ? { ...inst, [field]: value } : inst)))
  }

  const distributeAmountEvenly = () => {
    const amount = Number.parseFloat(totalAmount) || 0
    const perInstallment = amount / installments.length
    onInstallmentsChange(installments.map((inst) => ({ ...inst, amount: perInstallment })))
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              {isLendingMode ? "Repayment Schedule" : "Payment Schedule"}
            </CardTitle>
            <CardDescription>Configure when and how much for each installment</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={distributeAmountEvenly} disabled={!totalAmount}>
              Distribute Evenly
            </Button>
            <Button onClick={addInstallment} size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Installment
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {installments.map((installment, index) => (
          <div key={installment.id} className="p-4 border rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="secondary">Installment {index + 1}</Badge>
              {installments.length > 1 && (
                <Button variant="ghost" size="sm" onClick={() => removeInstallment(installment.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Amount</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <Input
                    type="number"
                    placeholder="0.00"
                    className="pl-10"
                    value={installment.amount || ""}
                    onChange={(e) =>
                      updateInstallment(installment.id, "amount", Number.parseFloat(e.target.value) || 0)
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Due Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !installment.date && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {installment.date ? format(installment.date, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={installment.date}
                      onSelect={(date) => updateInstallment(installment.id, "date", date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
