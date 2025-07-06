import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { CreditCard } from "lucide-react"
import type { PaymentModeToggleProps } from "@/types"

export function PaymentModeToggle({ isLendingMode, onModeChange }: PaymentModeToggleProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Mode
            </CardTitle>
            <CardDescription>Choose between lending with repayment or scheduled payments</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Label htmlFor="mode-toggle" className="text-sm font-medium">
              {isLendingMode ? "Lending" : "Scheduled Payments"}
            </Label>
            <Switch id="mode-toggle" checked={isLendingMode} onCheckedChange={onModeChange} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="p-4 bg-slate-50 rounded-lg">
          <p className="text-sm text-slate-700">
            {isLendingMode
              ? "💰 Lending Mode: You'll lend money and receive it back in installments"
              : "📅 Scheduled Payments: You'll send money in multiple installments over time"}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
